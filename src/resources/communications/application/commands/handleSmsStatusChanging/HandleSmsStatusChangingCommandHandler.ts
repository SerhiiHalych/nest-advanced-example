import { Inject, Injectable, Scope } from '@nestjs/common';
import * as twilio from 'twilio';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType, DomainServiceType, ServiceType } from '../../../../../common/diTokens';
import { SegmentEvents } from '../../../../contacts/application/enum/SegmentEvents';
import { ISegmentService } from '../../../../contacts/application/services/ISegmentService';
import { CommunicationItemType } from '../../enum/CommunicationItemType';
import { SmsState } from '../../enum/SmsState';
import { TwilioMessageStatus } from '../../enum/TwilioMessageStatus';
import { CommunicationObserver } from '../../observers/CommunicationObserver';
import { IMmsMediaStorageService } from '../../services/IMmsMediaStorageService';
import type { HandleSmsStatusChangingCommandInput } from './HandleSmsStatusChangingCommandInput';
import type { IHandleSmsStatusChangingCommandHandler } from './IHandleSmsStatusChangingCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class HandleSmsStatusChangingCommandHandler
  extends AbstractCommandHandler<HandleSmsStatusChangingCommandInput, void>
  implements IHandleSmsStatusChangingCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  constructor(
    private communicationObserver: CommunicationObserver,
    @Inject(DomainServiceType.SEGMENT_SERVICE) private segmentService: ISegmentService,
    @Inject(ServiceType.MMS_MEDIA_STORAGE_SERVICE) private mmsMediaStorageService: IMmsMediaStorageService
  ) {
    super();
  }

  protected async implementation(input: HandleSmsStatusChangingCommandInput): Promise<void> {
    const { twilioSignature, body } = input;

    const twilioClient: twilio.Twilio = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    if (
      ![
        TwilioMessageStatus.failed,
        TwilioMessageStatus.undelivered,
        TwilioMessageStatus.sent,
        TwilioMessageStatus.delivered,
      ].includes(body.MessageStatus)
    ) {
      return;
    }

    const smsCommunicationItem = await this._dbContext.communicationRepository.findSmsByExternalId(body.MessageSid);

    if (!smsCommunicationItem) {
      return;
    }

    if (smsCommunicationItem.type === CommunicationItemType.INCOMING_SMS) {
      return;
    }

    if (smsCommunicationItem.payload.state !== SmsState.PENDING) {
      return;
    }

    const communication = await this._dbContext.communicationRepository.findById(smsCommunicationItem.communicationId);

    const contact = await this._dbContext.contactRepository.findById(communication.contactId);

    const validationResult = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      twilioSignature,
      `${process.env.APP_URL}/v1/communications/sms/status`,
      body
    );

    if (!validationResult) {
      throw new ApplicationError(`Twilio validation of request failed.`);
    }

    const media = await twilioClient.messages(body.MessageSid).media.list();

    const fileS3KeysToRemove = smsCommunicationItem.payload.media.map(({ s3Key }) => s3Key);

    if ([TwilioMessageStatus.failed, TwilioMessageStatus.undelivered].includes(body.MessageStatus)) {
      smsCommunicationItem.payload.state = SmsState.FAILED;
      smsCommunicationItem.payload.errorCode = body.ErrorCode;
      smsCommunicationItem.acknowledgement = smsCommunicationItem.acknowledgement.map(({ employeeId }) => ({
        acknowledged: false,
        employeeId,
      }));
      smsCommunicationItem.payload.media = smsCommunicationItem.payload.media.map(({ contentType }) => ({
        contentType,
        mediaId: null,
        s3Key: null,
        url: null,
      }));

      this.addCommitHandler(() =>
        this.communicationObserver.dispatchCommunicationItem(smsCommunicationItem, contact.id)
      );
    } else {
      smsCommunicationItem.payload.state = SmsState.SENT;
      smsCommunicationItem.payload.media = await Promise.all(
        media.map(async ({ uri, contentType, sid }) => {
          const uriParts = uri.split('.');

          const mediaSource = uriParts.slice(0, -1).join('.');

          return {
            mediaId: sid,
            s3Key: null,
            url: `https://api.twilio.com${mediaSource}`,
            contentType,
          };
        })
      );

      const sender = await this._dbContext.employeeRepository.findById(smsCommunicationItem.payload.senderId);

      const senderUser = await this._dbContext.userRepository.findById(sender.userId);

      this.addCommitHandler(async () => {
        await this.segmentService.track({
          userId: contact.externalId,
          anonymousId: contact.id,
          event: SegmentEvents.SMS_SENT,
          properties: {
            text: smsCommunicationItem.payload.text,
            media: smsCommunicationItem.payload.media.map(({ url }) => url),
            sender: {
              crmEmployeeId: sender.id,
              firstName: senderUser.givenName,
              lastName: senderUser.familyName,
              roles: sender.roles,
            },
          },
        });
      });
    }

    await this._dbContext.communicationRepository.updateItem(smsCommunicationItem);

    await this.mmsMediaStorageService.delete(fileS3KeysToRemove);
  }
}

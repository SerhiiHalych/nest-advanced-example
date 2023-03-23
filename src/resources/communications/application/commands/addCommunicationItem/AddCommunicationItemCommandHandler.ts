/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/naming-convention */
import { Inject, Injectable, Scope } from '@nestjs/common';
import * as _ from 'lodash';
import * as twilio from 'twilio';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType, ServiceType } from '../../../../../common/diTokens';
import type { ContactDto } from '../../../../contacts/application/dataStructures/ContactDto';
import type { EmployeeDto } from '../../../../employees/application/dataStructures/EmployeeDto';
import { EmployeeRole } from '../../../../employees/application/enums/EmployeeRole';
import { GoogleGmailService } from '../../../infrastructure/services/GoogleGmailService';
import type { CommunicationDto } from '../../dataStructures/CommunicationDto';
import type { CommunicationItemCreateDto } from '../../dataStructures/CommunicationItemCreateDto';
import type {
  CommunicationItemDto,
  IncomingEmailCommunicationItemDto,
  OutgoingEmailCommunicationItemDto,
} from '../../dataStructures/CommunicationItemDto';
import { CommunicationItemType } from '../../enum/CommunicationItemType';
import { SmsState } from '../../enum/SmsState';
import { CommunicationObserver } from '../../observers/CommunicationObserver';
import { IMmsMediaStorageService } from '../../services/IMmsMediaStorageService';
import type { IAddCommunicationItemCommandHandler } from './IАddCommunicationItemCommandHandler';
import type { AddCommunicationItemCommandInput } from './АddCommunicationItemCommandInput';
import type { AddCommunicationItemCommandResult } from './АddCommunicationItemCommandResult';

@Injectable({ scope: Scope.REQUEST })
export class AddCommunicationItemCommandHandler
  extends AbstractCommandHandler<AddCommunicationItemCommandInput, AddCommunicationItemCommandResult>
  implements IAddCommunicationItemCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  private _fetchedData: {
    contact: ContactDto;
    employee: EmployeeDto;
    communication: CommunicationDto;
  };

  constructor(
    private communicationObserver: CommunicationObserver,
    @Inject(ServiceType.MMS_MEDIA_STORAGE_SERVICE) private mmsMediaStorageService: IMmsMediaStorageService,
    private googleGmailService: GoogleGmailService
  ) {
    super();
  }

  protected async implementation(input: AddCommunicationItemCommandInput): Promise<AddCommunicationItemCommandResult> {
    const { type } = input;

    await this.fetchData();

    const { contact } = this._fetchedData;

    let newMessage: CommunicationItemDto | null = null;

    switch (type) {
      case CommunicationItemType.OUTGOING_SMS:
        newMessage = await this.sendSms();

        break;

      case CommunicationItemType.OUTGOING_EMAIL:
        newMessage = await this.sendEmail();

        break;

      case CommunicationItemType.PRIVATE_NOTES:
        newMessage = await this.sendPrivateMessage();

        break;
    }

    this.addCommitHandler(() => this.communicationObserver.dispatchCommunicationItem(newMessage, contact.id));

    return {
      id: newMessage.id,
    };
  }

  private async fetchData(): Promise<void> {
    const { contactId } = this._inputData;

    const contact = await this._dbContext.contactRepository.findById(contactId);

    if (!contact) {
      throw new ApplicationError('Contact not found');
    }

    const identity = this._identityContext.getIdentity();

    const employee = await this._dbContext.employeeRepository.findByUserId(identity.id);

    const communication = await this._dbContext.communicationRepository.findByContactId(contact.id);

    this._fetchedData = {
      contact,
      employee,
      communication,
    };
  }

  private async sendPrivateMessage(): Promise<CommunicationItemDto> {
    const { payload } = this._inputData;
    const { communication, employee, contact } = this._fetchedData;

    const identity = this._identityContext.getIdentity();

    const allowedRolesToSendPrivateNotes: EmployeeRole[] = [
      EmployeeRole.ADMINISTRATORS,
      EmployeeRole.DISPATCHERS,
      EmployeeRole.LIGHTKEEPERS,
      EmployeeRole.COLLABORATORS,
    ];

    if (!identity.roles.some(identityRole => allowedRolesToSendPrivateNotes.includes(identityRole))) {
      throw new ApplicationError(`You have no permissions to send this type of message.`);
    }

    // search of user ids by placeholder ${}
    const employeeIdMatches = payload.text.replace(/\s/g, '').match(/\${(.*?)}/g) || [];

    const employeeIds = _(employeeIdMatches)
      .map(id => id.replace(/[${}]/g, ''))
      .uniq()
      .value();

    const employees = await this._dbContext.employeeRepository.listByIds(employeeIds);

    if (employees.length < employeeIds.length) {
      throw new ApplicationError('Some users were not found');
    }

    const employeeIdsForAcknowledgement = _([contact.ownerId, contact.assigneeId, ...employeeIds])
      .uniq()
      .value();

    const newMessage = await this._dbContext.communicationRepository.createItem({
      communicationId: communication.id,
      payload: {
        senderId: employee.id,
        text: payload.text,
      },
      type: CommunicationItemType.PRIVATE_NOTES,
      acknowledgement: employeeIdsForAcknowledgement.map(employeeId => ({
        acknowledged: false,
        employeeId,
      })),
    });

    return newMessage;
  }

  private async sendSms(): Promise<CommunicationItemDto> {
    let uploadedMedia: {
      url: string;
      key: string;
      contentType: string;
    }[] = [];

    try {
      const { payload } = this._inputData;

      const { communication, contact, employee } = this._fetchedData;

      if (!contact.phone) {
        throw new ApplicationError('User does not have phone number');
      }

      uploadedMedia = await this.mmsMediaStorageService.uploadMedia(
        payload.attachments.map(({ fileData, fileExtension, fileName }) => ({
          fileData,
          fileName: `${fileName}.${fileExtension}`,
        }))
      );

      const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      const response = await twilioClient.messages.create({
        body: payload.text,
        from: process.env.TWILIO_PHONE,
        to: contact.phone,
        statusCallback: `${process.env.APP_URL}/v1/communications/sms/status`,
        mediaUrl: uploadedMedia.map(({ url }) => url),
      });

      const employeeIdsForAcknowledgement = _([contact.ownerId, contact.assigneeId]).uniq().value();

      const newMessage = await this._dbContext.communicationRepository.createItem({
        communicationId: communication.id,
        payload: {
          state: SmsState.PENDING,
          externalId: response.sid,
          errorCode: null,
          senderId: employee.id,
          text: payload.text,
          media: uploadedMedia.map(({ contentType, key, url }) => ({
            mediaId: null,
            s3Key: key,
            url,
            contentType,
          })),
        },
        type: CommunicationItemType.OUTGOING_SMS,
        acknowledgement: employeeIdsForAcknowledgement.map(employeeId => ({
          acknowledged: false,
          employeeId,
        })),
      });

      return newMessage;
    } catch (e) {
      if (uploadedMedia.length > 0) {
        await this.mmsMediaStorageService.delete(uploadedMedia.map(({ key }) => key));
      }

      throw new ApplicationError(e.message);
    }
  }

  private async sendEmail(): Promise<OutgoingEmailCommunicationItemDto> {
    try {
      const settings = await this._dbContext.settingsRepository.get();

      if (!settings.google.communicationEmail) {
        throw new ApplicationError('No communication email specified in settings');
      }

      const { payload } = this._inputData;

      const { communication, contact, employee } = this._fetchedData;

      if (!contact.email) {
        throw new ApplicationError('User does not have email address');
      }

      let messageToReply: OutgoingEmailCommunicationItemDto | IncomingEmailCommunicationItemDto | null = null;

      if (payload.replyTo) {
        const possibleMessageToReply = await this._dbContext.communicationRepository.findItemById(payload.replyTo);

        if (
          possibleMessageToReply.type !== CommunicationItemType.OUTGOING_EMAIL &&
          possibleMessageToReply.type !== CommunicationItemType.INCOMING_EMAIL
        ) {
          throw new ApplicationError('You can reply only on email messages');
        }

        messageToReply = possibleMessageToReply;
      }

      const messageId = await this.googleGmailService.sendEmail({
        attachments: payload.attachments.map(({ fileName, fileData, fileExtension }) => ({
          fileName,
          fileData,
          fileExtension,
        })),
        fromEmail: settings.google.communicationEmail,
        fromName: 'Foobar CRM',
        replyTo: messageToReply
          ? {
              headerMessageId: messageToReply.payload.headerMessageId,
              threadId: messageToReply.payload.threadId,
            }
          : null,
        subject: messageToReply ? messageToReply.payload.subject : payload.subject,
        text: payload.text,
        to: contact.email,
        bcc: payload.bcc,
        cc: payload.cc,
      });

      const email = await this.googleGmailService.getEmailById(settings.google.communicationEmail, messageId);

      const employeeIdsForAcknowledgement = _([contact.ownerId, contact.assigneeId]).uniq().value();

      const communicationItemCreateDto: CommunicationItemCreateDto = {
        communicationId: communication.id,
        payload: {
          headerMessageId: email.headerMessageId,
          senderId: employee.id,
          text: payload.text,
          extenalEmailId: email.id,
          subject: payload.subject,
          threadId: email.threadId,
          cc: payload.cc,
          bcc: payload.bcc,
          emailAttachments: email.attachments.map(attachment => ({
            attachmentId: attachment.attachmentId,
            extension: attachment.extension,
            filename: attachment.filename,
            size: attachment.size,
          })),
        },
        type: CommunicationItemType.OUTGOING_EMAIL,
        acknowledgement: employeeIdsForAcknowledgement.map(employeeId => ({
          acknowledged: false,
          employeeId,
        })),
      };

      const newMessage = (await this._dbContext.communicationRepository.createItem(
        communicationItemCreateDto
      )) as OutgoingEmailCommunicationItemDto;

      return newMessage;
    } catch (e) {
      throw new ApplicationError(e.message);
    }
  }
}

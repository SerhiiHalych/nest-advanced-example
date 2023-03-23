import { Inject, Injectable, Scope } from '@nestjs/common';
import * as _ from 'lodash';
import * as path from 'path';
import * as twilio from 'twilio';
import { URL } from 'url';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType, DomainServiceType } from '../../../../../common/diTokens';
import type { ContactCreateDto } from '../../../../contacts/application/dataStructures/ContactCreateDto';
import type { ContactDto } from '../../../../contacts/application/dataStructures/ContactDto';
import { AcquisitionChannel } from '../../../../contacts/application/enum/AcquisitionChannel';
import { SegmentEvents } from '../../../../contacts/application/enum/SegmentEvents';
import { NewContactCreatedEvent } from '../../../../contacts/application/events/NewContactCreatedEvent';
import { ISegmentService } from '../../../../contacts/application/services/ISegmentService';
import { EmployeeRole } from '../../../../employees/application/enums/EmployeeRole';
import type { IncomingSmsCommunicationItemDto } from '../../dataStructures/CommunicationItemDto';
import { CommunicationItemType } from '../../enum/CommunicationItemType';
import { CommunicationObserver } from '../../observers/CommunicationObserver';
import type { HandleGettingOfIncomingSmsCommandInput } from './HandleGettingOfIncomingSmsCommandInput';
import type { IHandleGettingOfIncomingSmsCommandHandler } from './IHandleGettingOfIncomingSmsCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class HandleGettingOfIncomingSmsCommandHandler
  extends AbstractCommandHandler<HandleGettingOfIncomingSmsCommandInput, void>
  implements IHandleGettingOfIncomingSmsCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  constructor(
    private communicationObserver: CommunicationObserver,
    @Inject(DomainServiceType.SEGMENT_SERVICE) private segmentService: ISegmentService
  ) {
    super();
  }

  protected async implementation(input: HandleGettingOfIncomingSmsCommandInput): Promise<void> {
    const { twilioSignature, body } = input;

    if (process.env.TWILIO_PHONE !== body.To) {
      return;
    }

    const result = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      twilioSignature,
      `${process.env.APP_URL}/v1/communications/sms`,
      body
    );

    if (!result) {
      throw new ApplicationError(`Twilio validation of request failed.`);
    }

    let contact = await this._dbContext.contactRepository.findByEmailOrPhone({ phone: body.From });

    if (!contact) {
      contact = await this.createContact(body.From);
    }

    const communication = await this._dbContext.communicationRepository.findByContactId(contact.id);

    const employeeIdsForAcknowledgement = _([contact.ownerId, contact.assigneeId]).uniq().value();

    const newMessage: IncomingSmsCommunicationItemDto = (await this._dbContext.communicationRepository.createItem({
      communicationId: communication.id,
      payload: {
        externalId: body.MessageSid,
        text: body.Body,
        media: [...new Array(body.NumMedia)].map((_value, index) => {
          const url = body[`MediaUrl${index}`];
          const contentType = body[`MediaContentType${index}`];
          const mediaId = path.basename(new URL(url).pathname);

          return {
            contentType,
            mediaId,
            url,
          };
        }),
      },
      type: CommunicationItemType.INCOMING_SMS,
      acknowledgement: employeeIdsForAcknowledgement.map(employeeId => ({
        acknowledged: false,
        employeeId,
      })),
    })) as IncomingSmsCommunicationItemDto;

    this.addCommitHandler(async () => {
      await this.segmentService.track({
        userId: contact.externalId,
        anonymousId: contact.id,
        event: SegmentEvents.SMS_RECEIVED,
        properties: {
          text: newMessage.payload.text,
          media: newMessage.payload.media.map(({ url }) => url),
        },
      });
    });

    this.addCommitHandler(() => this.communicationObserver.dispatchCommunicationItem(newMessage, contact.id));
  }

  private async createContact(phone: string): Promise<ContactDto> {
    const employee = await this._dbContext.employeeRepository.findRandomByRole(EmployeeRole.DISPATCHERS);

    if (!employee) {
      throw new ApplicationError('No dispatcher found in system');
    }

    const contactToSave: ContactCreateDto = {
      phone,
      firstName: null,
      lastName: null,
      acquisitionData: null,
      email: null,
      emailIsConfirmed: false,
      phoneIsConfirmed: false,
      externalId: null,
      assigneeId: employee.id,
      ownerId: employee.id,
      cameFrom: AcquisitionChannel.DEFAULT,
      contactStyle: [],
    };

    const contact = await this._dbContext.contactRepository.create(contactToSave);

    const newContactCreatedEvent = new NewContactCreatedEvent({
      contactId: contact.id,
    });

    this._eventDispatcher.registerEvent(newContactCreatedEvent);

    await this._dbContext.communicationRepository.create(contact.id);

    return contact;
  }
}

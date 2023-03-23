import { Inject, Injectable, Scope } from '@nestjs/common';
import * as _ from 'lodash';

import { AbstractEventHandler } from '../../../../common/application/AbstractEventHandler';
import { EventType } from '../../../../common/application/EventType';
import { IGlobalDBContext } from '../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../common/diTokens';
import type { NewContactCreatedEvent } from '../../../contacts/application/events/NewContactCreatedEvent';
import type { CommunicationItemCreateDto } from '../dataStructures/CommunicationItemCreateDto';
import { CommunicationItemType } from '../enum/CommunicationItemType';
import { CommunicationObserver } from '../observers/CommunicationObserver';

@Injectable({ scope: Scope.REQUEST })
export class SendSystemMessageOnNewContactCreated extends AbstractEventHandler<NewContactCreatedEvent> {
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  constructor(private communicationObserver: CommunicationObserver) {
    super();
  }

  protected async implementation(event: NewContactCreatedEvent): Promise<void> {
    const { payload } = event;

    const contact = await this._dbContext.contactRepository.findById(payload.contactId);

    const communication = await this._dbContext.communicationRepository.findByContactId(contact.id);

    const employeeIdsForAcknowledgement = _([contact.ownerId, contact.assigneeId]).uniq().value();

    const communicationItemCreateDto: CommunicationItemCreateDto = {
      communicationId: communication.id,
      payload: {
        eventType: EventType.NEW_CONTACT_CREATED,
        eventPayload: {
          contactId: payload.contactId,
        },
      },
      type: CommunicationItemType.SYSTEM_MESSAGE,
      acknowledgement: employeeIdsForAcknowledgement.map(employeeId => ({
        acknowledged: false,
        employeeId,
      })),
    };

    const createdCommunicationItem = await this._dbContext.communicationRepository.createItem(
      communicationItemCreateDto
    );

    this.addCommitHandler(() =>
      this.communicationObserver.dispatchCommunicationItem(createdCommunicationItem, contact.id)
    );
  }
}

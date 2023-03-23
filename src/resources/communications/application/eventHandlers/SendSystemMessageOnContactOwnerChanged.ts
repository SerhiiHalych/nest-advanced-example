import { Inject, Injectable, Scope } from '@nestjs/common';
import * as _ from 'lodash';

import { AbstractEventHandler } from '../../../../common/application/AbstractEventHandler';
import { EventType } from '../../../../common/application/EventType';
import { IGlobalDBContext } from '../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../common/diTokens';
import type { ContactOwnerChangedEvent } from '../../../contacts/application/events/ContactOwnerChangedEvent';
import type { CommunicationItemCreateDto } from '../dataStructures/CommunicationItemCreateDto';
import { CommunicationItemType } from '../enum/CommunicationItemType';
import { CommunicationObserver } from '../observers/CommunicationObserver';

@Injectable({ scope: Scope.REQUEST })
export class SendSystemMessageOnContactOwnerChanged extends AbstractEventHandler<ContactOwnerChangedEvent> {
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  constructor(private communicationObserver: CommunicationObserver) {
    super();
  }

  protected async implementation(event: ContactOwnerChangedEvent): Promise<void> {
    const { payload } = event;

    const contact = await this._dbContext.contactRepository.findById(payload.contactId);

    const communication = await this._dbContext.communicationRepository.findByContactId(contact.id);

    const employeeIdsForAcknowledgement = _([
      contact.ownerId,
      contact.assigneeId,
      payload.previousOwnerId,
      payload.previousAssigneeId,
    ])
      .uniq()
      .value();

    const communicationItemCreateDto: CommunicationItemCreateDto = {
      communicationId: communication.id,
      payload: {
        eventType: EventType.CONTACT_OWNER_CHANGED,
        eventPayload: {
          contactId: payload.contactId,
          newOwnerId: payload.newOwnerId,
          previousOwnerId: payload.previousOwnerId,
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

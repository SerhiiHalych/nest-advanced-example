import { Inject, Injectable, Scope } from '@nestjs/common';
import * as _ from 'lodash';

import { AbstractEventHandler } from '../../../../common/application/AbstractEventHandler';
import { EventType } from '../../../../common/application/EventType';
import { IGlobalDBContext } from '../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../common/diTokens';
import { ContactAssigneeChangedEvent } from '../../../contacts/application/events/ContactAssigneeChangedEvent';
import { CommunicationItemCreateDto } from '../dataStructures/CommunicationItemCreateDto';
import { CommunicationItemType } from '../enum/CommunicationItemType';
import { CommunicationObserver } from '../observers/CommunicationObserver';

@Injectable({ scope: Scope.REQUEST })
export class SendSystemMessageOnContactAssigneeChanged extends AbstractEventHandler<ContactAssigneeChangedEvent> {
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;
  constructor(private communicationObserver: CommunicationObserver) {
    super();
  }
  protected async implementation(event: ContactAssigneeChangedEvent): Promise<void> {
    const { payload } = event;
    let oldAssigneeId: string | null = null;
    const contact = await this._dbContext.contactRepository.findById(payload.contactId);

    if (!_.isNull(payload.previousAssigneeId)) {
      const oldAssignee = await this._dbContext.employeeRepository.findById(payload.previousAssigneeId);
      oldAssigneeId = oldAssignee?.id || null;
    }

    const communication = await this._dbContext.communicationRepository.findByContactId(contact.id);
    const employeeIdsForAcknowledgement = _([contact.ownerId, contact.assigneeId, oldAssigneeId])
      .uniq()
      .filter(id => !_.isNull(id))
      .value();
    const communicationItemCreateDto: CommunicationItemCreateDto = {
      communicationId: communication.id,
      payload: {
        eventType: EventType.CONTACT_ASSIGNEE_CHANGED,
        eventPayload: {
          contactId: payload.contactId,
          newAssigneeId: payload.newAssigneeId,
          previousAssigneeId: payload.previousAssigneeId,
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

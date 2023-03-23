import { AbstractEvent } from '../../../../common/application/AbstractEvent';
import { EventType } from '../../../../common/application/EventType';

interface ContactAssigneeChangedEventPayload {
  contactId: string;
  previousAssigneeId: string;
  newAssigneeId: string;
}

export class ContactAssigneeChangedEvent extends AbstractEvent<ContactAssigneeChangedEventPayload> {
  eventType = EventType.CONTACT_ASSIGNEE_CHANGED;
}

import { AbstractEvent } from '../../../../common/application/AbstractEvent';
import { EventType } from '../../../../common/application/EventType';

interface ContactOwnerChangedEventPayload {
  contactId: string;
  previousOwnerId: string;
  previousAssigneeId: string;
  newOwnerId: string;
}

export class ContactOwnerChangedEvent extends AbstractEvent<ContactOwnerChangedEventPayload> {
  eventType = EventType.CONTACT_OWNER_CHANGED;
}

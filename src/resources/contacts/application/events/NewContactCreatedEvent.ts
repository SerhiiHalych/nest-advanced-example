import { AbstractEvent } from '../../../../common/application/AbstractEvent';
import { EventType } from '../../../../common/application/EventType';

interface NewContactCreatedEventPayload {
  contactId: string;
}

export class NewContactCreatedEvent extends AbstractEvent<NewContactCreatedEventPayload> {
  eventType = EventType.NEW_CONTACT_CREATED;
}

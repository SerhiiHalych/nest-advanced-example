import { AbstractEvent } from '../../../../common/application/AbstractEvent';
import { EventType } from '../../../../common/application/EventType';

interface ContactExternalIdChangedEventPayload {
  contactId: string;
}

export class ContactExternalIdChangedEvent extends AbstractEvent<ContactExternalIdChangedEventPayload> {
  eventType = EventType.CONTACT_EXTERNAL_ID_CHANGED;
}

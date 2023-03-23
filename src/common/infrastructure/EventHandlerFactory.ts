import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { SendSystemMessageOnContactAssigneeChanged } from '../../resources/communications/application/eventHandlers/SendSystemMessageOnContactAssigneeChanged';
import { SendSystemMessageOnContactOwnerChanged } from '../../resources/communications/application/eventHandlers/SendSystemMessageOnContactOwnerChanged';
import { SendSystemMessageOnNewContactCreated } from '../../resources/communications/application/eventHandlers/SendSystemMessageOnNewContactCreated';
import { CreateSegmentOnContactExternalIdChanged } from '../../resources/contacts/application/eventHandlers/CreateSegmentOnContactExternalIdChanged';
import { CreateSegmentOnContactOwnerChanged } from '../../resources/contacts/application/eventHandlers/CreateSegmentOnContactOwnerChanged';
import { CreateSegmentOnNewContactCreated } from '../../resources/contacts/application/eventHandlers/CreateSegmentOnNewContactCreated';
import type { AbstractEvent } from '../application/AbstractEvent';
import type { AbstractEventHandler } from '../application/AbstractEventHandler';
import { EventType } from '../application/EventType';

const eventHandlerMap: Record<EventType, Array<new (...args: any) => AbstractEventHandler<AbstractEvent<any>>>> = {
  [EventType.NEW_CONTACT_CREATED]: [SendSystemMessageOnNewContactCreated, CreateSegmentOnNewContactCreated],
  [EventType.CONTACT_EXTERNAL_ID_CHANGED]: [CreateSegmentOnContactExternalIdChanged],
  [EventType.CONTACT_OWNER_CHANGED]: [SendSystemMessageOnContactOwnerChanged, CreateSegmentOnContactOwnerChanged],
  [EventType.CONTACT_ASSIGNEE_CHANGED]: [SendSystemMessageOnContactAssigneeChanged],
};

@Injectable()
export class EventHandlerFactory {
  constructor(private moduleRef: ModuleRef) {}

  async getHandlers(event: AbstractEvent<any>): Promise<Array<AbstractEventHandler<AbstractEvent<any>>>> {
    const eventName = event.eventType;

    const eventHandlers = eventHandlerMap[eventName] ?? [];

    return Promise.all(eventHandlers.map(ctor => this.moduleRef.resolve(ctor, undefined)));
  }
}

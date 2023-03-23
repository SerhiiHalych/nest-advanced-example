import { Global, Module } from '@nestjs/common';

import { SendSystemMessageOnContactAssigneeChanged } from '../resources/communications/application/eventHandlers/SendSystemMessageOnContactAssigneeChanged';
import { SendSystemMessageOnContactOwnerChanged } from '../resources/communications/application/eventHandlers/SendSystemMessageOnContactOwnerChanged';
import { SendSystemMessageOnNewContactCreated } from '../resources/communications/application/eventHandlers/SendSystemMessageOnNewContactCreated';
import { BuildingChatAcknowledgementObserver } from '../resources/communications/application/observers/BuildingChatAcknowledgementObserver';
import { BuildingChatObserver } from '../resources/communications/application/observers/BuildingChatObserver';
import { CommunicationAcknowledgementObserver } from '../resources/communications/application/observers/CommunicationAcknowledgementObserver';
import { CommunicationObserver } from '../resources/communications/application/observers/CommunicationObserver';
import { GoogleGmailService } from '../resources/communications/infrastructure/services/GoogleGmailService';
import { CreateSegmentOnContactExternalIdChanged } from '../resources/contacts/application/eventHandlers/CreateSegmentOnContactExternalIdChanged';
import { CreateSegmentOnContactOwnerChanged } from '../resources/contacts/application/eventHandlers/CreateSegmentOnContactOwnerChanged';
import { CreateSegmentOnNewContactCreated } from '../resources/contacts/application/eventHandlers/CreateSegmentOnNewContactCreated';
import { SegmentService } from '../resources/contacts/application/services/SegmentService';
import { BaseType, DomainServiceType } from './diTokens';
import { EventHandlerFactory } from './infrastructure/EventHandlerFactory';
import { NestIdentityContext } from './infrastructure/identity/NestIdentityContext';
import { InProcessEventDispatcher } from './infrastructure/InProcessEventDispatcher';
import { GlobalDBContext } from './infrastructure/persistance/GlobalDBContext';
import { GlobalReadDBContext } from './infrastructure/persistance/GlobalReadDBContext';

@Global()
@Module({
  providers: [
    {
      provide: DomainServiceType.SEGMENT_SERVICE,
      useClass: SegmentService,
    },
    {
      provide: BaseType.GLOBAL_DB_CONTEXT,
      useClass: GlobalDBContext,
    },
    {
      provide: BaseType.GLOBAL_READ_DB_CONTEXT,
      useClass: GlobalReadDBContext,
    },
    {
      provide: BaseType.IDENTITY_CONTEXT,
      useClass: NestIdentityContext,
    },
    {
      provide: BaseType.EVENT_DISPATCHER,
      useClass: InProcessEventDispatcher,
    },
    GoogleGmailService,
    EventHandlerFactory,
    CommunicationObserver,
    CommunicationAcknowledgementObserver,
    BuildingChatAcknowledgementObserver,
    BuildingChatObserver,

    // events
    SendSystemMessageOnNewContactCreated,
    SendSystemMessageOnContactOwnerChanged,
    SendSystemMessageOnContactAssigneeChanged,

    CreateSegmentOnNewContactCreated,
    CreateSegmentOnContactExternalIdChanged,
    CreateSegmentOnContactOwnerChanged,
    CreateSegmentOnContactExternalIdChanged,
  ],
  exports: [
    {
      provide: BaseType.GLOBAL_DB_CONTEXT,
      useClass: GlobalDBContext,
    },
    {
      provide: BaseType.GLOBAL_READ_DB_CONTEXT,
      useClass: GlobalReadDBContext,
    },
    {
      provide: BaseType.IDENTITY_CONTEXT,
      useClass: NestIdentityContext,
    },
    {
      provide: BaseType.EVENT_DISPATCHER,
      useClass: InProcessEventDispatcher,
    },
    {
      provide: DomainServiceType.SEGMENT_SERVICE,
      useClass: SegmentService,
    },
    EventHandlerFactory,
    CommunicationObserver,
    CommunicationAcknowledgementObserver,
    BuildingChatAcknowledgementObserver,
    BuildingChatObserver,
    GoogleGmailService,

    // events
    SendSystemMessageOnNewContactCreated,
    SendSystemMessageOnContactOwnerChanged,
    SendSystemMessageOnContactAssigneeChanged,

    CreateSegmentOnNewContactCreated,
    CreateSegmentOnContactExternalIdChanged,
    CreateSegmentOnContactOwnerChanged,
    CreateSegmentOnContactExternalIdChanged,
  ],
})
export class CommonModule {}

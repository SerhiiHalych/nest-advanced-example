/* eslint-disable max-len */
import { Module } from '@nestjs/common';

import { CommandHandlerType, DomainServiceType, ProviderType, QueryHandlerType } from '../../common/diTokens';
import { FoobarBuildingProvider } from '../buildings/infrastructure/providers/FoobarBuildingProvider';
import { ChangeContactAssigneeCommandHandler } from './application/commands/changeContactAssignee/ChangeContactAssigneeCommandHandler';
import { ChangeContactOwnerCommandHandler } from './application/commands/changeContactOwner/ChangeContactOwnerCommandHandler';
import { CreateNewContactCommandHandler } from './application/commands/createNewContact/CreateNewContactCommandHandler';
import { CreateNewContactFromExternalSourceCommandHandler } from './application/commands/createNewContactFromExternalSource/CreateNewContactFromExternalSourceCommandHandler';
import { EditContactCommandHandler } from './application/commands/editContact/EditContactCommandHandler';
import { EditContactBuildingCommandHandler } from './application/commands/editContactBuilding/EditContactBuildingCommandHandler';
import { EditContactFromExternalSourceCommandHandler } from './application/commands/editContactFromExternalSource/EditContactFromExternalSourceCommandHandler';
import { ImportContactsCommandHandler } from './application/commands/importContacts/ImportContactsCommandHandler';
import { ImportContactsFromFoobarCommandHandler } from './application/commands/importContactsFromFoobar/ImportContactsFromFoobarCommandHandler';
import { ListContactsQueryHandler } from './application/queries/listContacts/ListContactsQueryHandler';
import { SearchContentQueryHandler } from './application/queries/searchContent/SearchContentQueryHandler';
import { SegmentService } from './application/services/SegmentService';
import { ContactController } from './infrastructure/api/ContactController';
import { ContactIntegrationController } from './infrastructure/api/ContactIntegrationController';
import { FoobarCoreContactSource } from './infrastructure/services/foobarCoreContactSource/FoobarCoreContactSource';

@Module({
  controllers: [ContactController, ContactIntegrationController],
  providers: [
    // Queries
    {
      provide: QueryHandlerType.LIST_CONTACTS,
      useClass: ListContactsQueryHandler,
    },
    {
      provide: QueryHandlerType.SEARCH_CONTENT,
      useClass: SearchContentQueryHandler,
    },

    // Commands
    {
      provide: CommandHandlerType.CREATE_NEW_CONTACT,
      useClass: CreateNewContactCommandHandler,
    },
    {
      provide: CommandHandlerType.EDIT_CONTACT,
      useClass: EditContactCommandHandler,
    },
    {
      provide: CommandHandlerType.CHANGE_CONTACT_ASSIGNEE,
      useClass: ChangeContactAssigneeCommandHandler,
    },
    {
      provide: CommandHandlerType.CHANGE_CONTACT_OWNER,
      useClass: ChangeContactOwnerCommandHandler,
    },
    {
      provide: CommandHandlerType.CREATE_NEW_CONTACT_FROM_EXTERNAL_SOURCE,
      useClass: CreateNewContactFromExternalSourceCommandHandler,
    },
    {
      provide: CommandHandlerType.EDIT_CONTACT_FROM_EXTERNAL_SOURCE,
      useClass: EditContactFromExternalSourceCommandHandler,
    },
    {
      provide: CommandHandlerType.EDIT_CONTACT_BUILDING,
      useClass: EditContactBuildingCommandHandler,
    },
    {
      provide: CommandHandlerType.IMPORT_CONTACTS_COMMAND_HANDLER,
      useClass: ImportContactsCommandHandler,
    },
    {
      provide: CommandHandlerType.IMPORT_CONTACTS_FROM_LIGHTHOUSE_COMMAND_HANDLER,
      useClass: ImportContactsFromFoobarCommandHandler,
    },

    // Domain services
    {
      provide: DomainServiceType.SEGMENT_SERVICE,
      useClass: SegmentService,
    },

    // Providers
    {
      provide: ProviderType.EXTERNAL_BUILDING_PROVIDER,
      useClass: FoobarBuildingProvider,
    },
    {
      provide: ProviderType.EXTERNAL_CONTACT_PROVIDER,
      useClass: FoobarCoreContactSource,
    },
  ],
})
export class ContactsModule {}

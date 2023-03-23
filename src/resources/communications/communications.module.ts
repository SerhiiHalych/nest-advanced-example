import { Module } from '@nestjs/common';

import {
  CommandHandlerType,
  DomainServiceType,
  ProviderType,
  QueryHandlerType,
  ServiceType,
} from '../../common/diTokens';
import { FoobarBuildingProvider } from '../buildings/infrastructure/providers/FoobarBuildingProvider';
import { SegmentService } from '../contacts/application/services/SegmentService';
import { FoobarCoreContactSource } from '../contacts/infrastructure/services/foobarCoreContactSource/FoobarCoreContactSource';
import { AcknowledgeBuildingChatItemsCommandHandler } from './application/commands/acknowledgeBuildingChatItems/AcknowledgeBuildingChatItemsCommandHandler';
import { AcknowledgeCommunicationItemsCommandHandler } from './application/commands/acknowledgeCommunicationItems/AcknowledgeCommunicationItemsCommandHandler';
import { AddBuildingChatItemCommandHandler } from './application/commands/addBuildingChatItem/AddBuildingChatItemCommandHandler';
import { AddCommunicationItemCommandHandler } from './application/commands/addCommunicationItem/AddCommunicationItemCommandHandler';
import { HandleGettingOfIncomingBuildingChatItemCommandHandler } from './application/commands/handleGettingOfIncomingBuildingChatItem/HandleGettingOfIncomingBuildingChatItemCommandHandler';
import { HandleGettingOfIncomingSmsCommandHandler } from './application/commands/handleGettingOfIncomingSms/HandleGettingOfIncomingSmsCommandHandler';
import { HandleSmsStatusChangingCommandHandler } from './application/commands/handleSmsStatusChanging/HandleSmsStatusChangingCommandHandler';
import { ImportCommunicationsCommandHandler } from './application/commands/importCommunications/ImportCommunicationsCommandHandler';
import { DownloadAttachmentQueryHandler } from './application/queries/downloadAttachment/DownloadAttachmentQueryHandler';
import { GetBuildingChatItemsInfoQueryHandler } from './application/queries/getBuildingChatItemsInfo/GetBuildingChatItemsInfoQueryHandler';
import { GetCommunicationItemsInfoQueryHandler } from './application/queries/getCommunicationItemsInfo/GetCommunicationItemsInfoQueryHandler';
import { ListBuildingChatsQueryHandler } from './application/queries/listBuildingChats/ListBuildingChatsQueryHandler';
import { CommunicationController } from './infrastructure/api/CommunicationController';
import { CommunicationIntegrationController } from './infrastructure/api/CommunicationIntegrationController';
import { CommunicationGateway } from './infrastructure/gateways/communicationStream/CommunicationStreamGateway';
import { S3MmsMediaStorageService } from './infrastructure/services/S3Client';

@Module({
  controllers: [CommunicationController, CommunicationIntegrationController],
  providers: [
    CommunicationGateway,

    // Queries
    {
      provide: QueryHandlerType.GET_COMMUNICATION_ITEMS_INFO,
      useClass: GetCommunicationItemsInfoQueryHandler,
    },
    {
      provide: QueryHandlerType.GET_BUILDING_CHAT_ITEMS_INFO,
      useClass: GetBuildingChatItemsInfoQueryHandler,
    },
    {
      provide: QueryHandlerType.LIST_BUILDING_CHATS,
      useClass: ListBuildingChatsQueryHandler,
    },
    {
      provide: QueryHandlerType.DOWNLOAD_ATTACHMENT,
      useClass: DownloadAttachmentQueryHandler,
    },

    // Commands
    {
      provide: CommandHandlerType.ADD_COMMUNICATION_ITEM,
      useClass: AddCommunicationItemCommandHandler,
    },
    {
      provide: CommandHandlerType.ADD_BUILDING_CHAT_ITEM,
      useClass: AddBuildingChatItemCommandHandler,
    },
    {
      provide: CommandHandlerType.HANDLE_GETTING_OF_INCOMING_SMS,
      useClass: HandleGettingOfIncomingSmsCommandHandler,
    },
    {
      provide: CommandHandlerType.HANDLE_GETTING_OF_INCOMING_BUILDING_CHAT_ITEM,
      useClass: HandleGettingOfIncomingBuildingChatItemCommandHandler,
    },
    {
      provide: CommandHandlerType.HANDLE_SMS_STATUS_CHANGING_COMMAND_HANDLER,
      useClass: HandleSmsStatusChangingCommandHandler,
    },
    {
      provide: CommandHandlerType.ACKNOWLEDGE_COMMUNICATION_ITEMS,
      useClass: AcknowledgeCommunicationItemsCommandHandler,
    },
    {
      provide: CommandHandlerType.ACKNOWLEDGE_BUILDING_CHAT_ITEMS,
      useClass: AcknowledgeBuildingChatItemsCommandHandler,
    },
    {
      provide: CommandHandlerType.IMPORT_COMMUNICATIONS_COMMAND_HANDLER,
      useClass: ImportCommunicationsCommandHandler,
    },

    // Services
    {
      provide: ServiceType.MMS_MEDIA_STORAGE_SERVICE,
      useClass: S3MmsMediaStorageService,
    },
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
export class CommunicationsModule {}

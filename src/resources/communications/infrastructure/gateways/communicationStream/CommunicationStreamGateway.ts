/* eslint-disable no-console */
import { Inject, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import type { OnGatewayDisconnect } from '@nestjs/websockets';
import { ConnectedSocket, SubscribeMessage } from '@nestjs/websockets';
import { MessageBody } from '@nestjs/websockets';
import { WebSocketGateway } from '@nestjs/websockets';
import type { Socket } from 'socket.io';

import { EventType } from '../../../../../common/application/EventType';
import { IGlobalReadDBContext } from '../../../../../common/application/IGlobalReadDBContext';
import { BaseType, CommandHandlerType } from '../../../../../common/diTokens';
import { WebsocketExceptionsFilter } from '../../../../../common/infrastructure/api/filters/WebsocketExceptionsFilter';
import {
  AuthorizedSocket,
  GatewayJwtAuthGuard,
} from '../../../../../common/infrastructure/api/guards/gateway-jwt-auth.guard';
import { validateWSMessage } from '../../../../../common/infrastructure/validation/joi/validateWSMessage';
import type { IAcknowledgeBuildingChatItemsCommandHandler } from '../../../application/commands/acknowledgeBuildingChatItems/IAcknowledgeBuildingChatItemsCommandHandler';
import type { IAcknowledgeCommunicationItemsCommandHandler } from '../../../application/commands/acknowledgeCommunicationItems/IAcknowledgeCommunicationItemsCommandHandler';
import type {
  BuildingChatItemDto,
  IncomingBuildingChatItemDto,
  OutgoingBuildingChatItemDto,
  PrivateNotesBuildingChatItemDto,
} from '../../../application/dataStructures/BuildingChatItemDto';
import type {
  CommunicationItemDto,
  ContactAssigneeChangedSystemMessageCommunicationItemDto,
  ContactOwnerChangedSystemMessageCommunicationItemDto,
  IncomingEmailCommunicationItemDto,
  IncomingSmsCommunicationItemDto,
  NewContactCreatedSystemMessageCommunicationItemDto,
  OutgoingEmailCommunicationItemDto,
  OutgoingSmsCommunicationItemDto,
  PrivateNotesCommunicationItemDto,
  SystemMessageCommunicationItemDto,
} from '../../../application/dataStructures/CommunicationItemDto';
import { BuildingChatItemType } from '../../../application/enum/BuildingChatItemType';
import { CommunicationItemType } from '../../../application/enum/CommunicationItemType';
import { BuildingChatAcknowledgementObserver } from '../../../application/observers/BuildingChatAcknowledgementObserver';
import { BuildingChatObserver } from '../../../application/observers/BuildingChatObserver';
import { CommunicationAcknowledgementObserver } from '../../../application/observers/CommunicationAcknowledgementObserver';
import { CommunicationObserver } from '../../../application/observers/CommunicationObserver';
import {
  BuildingChatSubscribeAcknowledgeMessagesBody,
  buildingChatSubscribeAcknowledgeMessagesBodySchema,
} from './BuildingChatSubscribeAcknowledgeMessagesBody';
import {
  CommunicationSubscribeAcknowledgeMessagesBody,
  communicationSubscribeAcknowledgeMessagesBodySchema,
} from './CommunicationSubscribeAcknowledgeMessagesBody';
import {
  CommunicationSubscribeMessageBody,
  communicationSubscribeMessageBodySchema,
} from './CommunicationSubscribeMessageBody';
import type {
  NewBuildingChatItemMessage,
  NewBuildingChatItemMessageIncomingMessage,
  NewBuildingChatItemMessageOutgoingMessage,
  NewBuildingChatItemMessagePrivateNotes,
  NewCommunicationItemMessage,
  NewCommunicationItemMessageContactAssigneeChangedSystemMessageCommunicationItem,
  NewCommunicationItemMessageContactOwnerChangedSystemMessageCommunicationItem,
  NewCommunicationItemMessageIncomingEmailCommunicationItem,
  NewCommunicationItemMessageIncomingSmsCommunicationItem,
  NewCommunicationItemMessageNewContactCreatedSystemMessageCommunicationItem,
  NewCommunicationItemMessageOutgoingEmailCommunicationItem,
  NewCommunicationItemMessageOutgoingSmsCommunicationItem,
  NewCommunicationItemMessagePrivateNotesCommunicationItem,
  NewCommunicationItemMessageSystemMessageCommunicationItem,
} from './NewCommunicationItemMessage';

@UseFilters(new WebsocketExceptionsFilter())
@WebSocketGateway({
  namespace: 'communication-stream',
})
export class CommunicationGateway implements OnGatewayDisconnect {
  constructor(
    private communicationObserver: CommunicationObserver,
    private communicationAcknowledgementObserver: CommunicationAcknowledgementObserver,
    private buildingChatAcknowledgementObserver: BuildingChatAcknowledgementObserver,
    private buildingChatObserver: BuildingChatObserver,
    private moduleRef: ModuleRef,
    @Inject(BaseType.GLOBAL_READ_DB_CONTEXT) private globalReadDbContext: IGlobalReadDBContext
  ) {}

  @UseGuards(GatewayJwtAuthGuard)
  @UseInterceptors(validateWSMessage(communicationSubscribeMessageBodySchema))
  @SubscribeMessage('stream')
  async listenForMessages(
    @MessageBody() data: CommunicationSubscribeMessageBody,
    @ConnectedSocket() socket: AuthorizedSocket
  ): Promise<void> {
    this.communicationObserver.subscribe(socket.id, async ({ communicationItem, contactId }) => {
      if (contactId !== data.contactId) {
        return;
      }

      try {
        if (communicationItem.acknowledgement.some(({ employeeId }) => employeeId === socket.employeeId)) {
          const unacknowledgedCommunicationItemsForEmployeeByContacts =
            await this.globalReadDbContext.communicationRepository.countUnacknowledgedItemsForEmployeeForContact(
              socket.employeeId,
              data.contactId
            );

          socket.emit('general-chat-counter-updated', {
            count: unacknowledgedCommunicationItemsForEmployeeByContacts,
          });
        }

        const dataToReturn: NewCommunicationItemMessage = await this.mapCommunicationItem(communicationItem);

        socket.emit('new-communication-item', dataToReturn);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    });

    this.buildingChatObserver.subscribe(socket.id, async ({ buildingChatItem, contactId }) => {
      if (contactId !== data.contactId) {
        return;
      }

      try {
        if (buildingChatItem.acknowledgement.some(({ employeeId }) => employeeId === socket.employeeId)) {
          const unacknowledgedBuildingChatItemsForEmployeeByContacts =
            await this.globalReadDbContext.buildingChatRepository.countUnacknowledgedItemsForEmployeeForContact(
              socket.employeeId,
              data.contactId
            );

          socket.emit('building-chats-counter-updated', {
            count: unacknowledgedBuildingChatItemsForEmployeeByContacts,
          });
        }

        const dataToReturn: NewBuildingChatItemMessage = await this.mapBuildingChatItem(buildingChatItem);

        socket.emit('new-building-chat-item', dataToReturn);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    });

    this.communicationAcknowledgementObserver.subscribe(socket.id, async ({ contactId, employeeId }) => {
      if (contactId !== data.contactId) {
        return;
      }

      if (employeeId !== socket.employeeId) {
        return;
      }

      try {
        const unacknowledgedCommunicationItemsForEmployeeByContacts =
          await this.globalReadDbContext.communicationRepository.countUnacknowledgedItemsForEmployeeForContact(
            socket.employeeId,
            data.contactId
          );

        socket.emit('general-chat-counter-updated', {
          count: unacknowledgedCommunicationItemsForEmployeeByContacts,
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    });

    this.buildingChatAcknowledgementObserver.subscribe(socket.id, async ({ contactId, employeeId }) => {
      if (contactId !== data.contactId) {
        return;
      }

      if (employeeId !== socket.employeeId) {
        return;
      }

      try {
        const unacknowledgedBuildingChatItemsForEmployeeByContacts =
          await this.globalReadDbContext.buildingChatRepository.countUnacknowledgedItemsForEmployeeForContact(
            socket.employeeId,
            data.contactId
          );

        socket.emit('building-chats-counter-updated', {
          count: unacknowledgedBuildingChatItemsForEmployeeByContacts,
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    });
  }

  @UseGuards(GatewayJwtAuthGuard)
  @UseInterceptors(validateWSMessage(communicationSubscribeAcknowledgeMessagesBodySchema))
  @SubscribeMessage('acknowledge-communication-items')
  async acknowledgeGeneralChatMessages(
    @MessageBody() data: CommunicationSubscribeAcknowledgeMessagesBody,
    @ConnectedSocket() socket: AuthorizedSocket
  ): Promise<void> {
    const acknowledgeCommunicationItemsCommandHandler: IAcknowledgeCommunicationItemsCommandHandler =
      await this.moduleRef.resolve(CommandHandlerType.ACKNOWLEDGE_COMMUNICATION_ITEMS);

    await acknowledgeCommunicationItemsCommandHandler.execute({
      communicationItemIds: data.communicationItemIds,
      employeeId: socket.employeeId,
    });
  }

  @UseGuards(GatewayJwtAuthGuard)
  @UseInterceptors(validateWSMessage(buildingChatSubscribeAcknowledgeMessagesBodySchema))
  @SubscribeMessage('acknowledge-building-chat-items')
  async acknowledgeBuildingChatMessages(
    @MessageBody() data: BuildingChatSubscribeAcknowledgeMessagesBody,
    @ConnectedSocket() socket: AuthorizedSocket
  ): Promise<void> {
    const acknowledgeCommunicationItemsCommandHandler: IAcknowledgeBuildingChatItemsCommandHandler =
      await this.moduleRef.resolve(CommandHandlerType.ACKNOWLEDGE_BUILDING_CHAT_ITEMS);

    await acknowledgeCommunicationItemsCommandHandler.execute({
      buildingChatItemIds: data.buildingChatItemIds,
      employeeId: socket.employeeId,
    });
  }

  handleDisconnect(client: Socket): any {
    this.communicationObserver.unsubscribe(client.id);
    this.buildingChatObserver.unsubscribe(client.id);
    this.communicationAcknowledgementObserver.unsubscribe(client.id);
    this.buildingChatAcknowledgementObserver.unsubscribe(client.id);
  }

  private async mapBuildingChatItem(buildingChatItem: BuildingChatItemDto): Promise<NewBuildingChatItemMessage> {
    switch (buildingChatItem.type) {
      case BuildingChatItemType.INCOMING_MESSAGE:
        return this.mapToIncomingBuildingChatMessage(buildingChatItem);

      case BuildingChatItemType.OUTGOING_MESSAGE:
        return this.mapToOutgoingBuildingChatMessage(buildingChatItem);

      case BuildingChatItemType.PRIVATE_NOTES:
        return this.mapToBuildingPrivateNotes(buildingChatItem);
    }
  }

  private async mapToIncomingBuildingChatMessage(
    buildingChatItem: IncomingBuildingChatItemDto
  ): Promise<NewBuildingChatItemMessageIncomingMessage> {
    const buildingChat = await this.globalReadDbContext.buildingChatRepository.findById(
      buildingChatItem.buildingChatId
    );
    const contactBuilding = await this.globalReadDbContext.contactBuildingRepository.findById(
      buildingChat.contactBuildingId
    );

    return {
      id: buildingChatItem.id,
      createdAt: buildingChatItem.createdAt,
      acknowledged: false,
      buildingId: contactBuilding.buildingId,
      type: BuildingChatItemType.INCOMING_MESSAGE,
      payload: {
        text: buildingChatItem.payload.text,
      },
    };
  }

  private async mapToOutgoingBuildingChatMessage(
    buildingChatItem: OutgoingBuildingChatItemDto
  ): Promise<NewBuildingChatItemMessageOutgoingMessage> {
    const sender = await this.globalReadDbContext.employeeRepository.findById(buildingChatItem.payload.senderId);
    const user = await this.globalReadDbContext.userRepository.findById(sender.userId);
    const buildingChat = await this.globalReadDbContext.buildingChatRepository.findById(
      buildingChatItem.buildingChatId
    );
    const contactBuilding = await this.globalReadDbContext.contactBuildingRepository.findById(
      buildingChat.contactBuildingId
    );

    return {
      id: buildingChatItem.id,
      createdAt: buildingChatItem.createdAt,
      acknowledged: false,
      buildingId: contactBuilding.buildingId,
      type: BuildingChatItemType.OUTGOING_MESSAGE,
      payload: {
        sender: {
          id: sender.id,
          firstName: user.givenName,
          lastName: user.familyName,
          photoUrl: user.picture,
        },
        text: buildingChatItem.payload.text,
      },
    };
  }

  private async mapToBuildingPrivateNotes(
    buildingChatItem: PrivateNotesBuildingChatItemDto
  ): Promise<NewBuildingChatItemMessagePrivateNotes> {
    const sender = await this.globalReadDbContext.employeeRepository.findById(buildingChatItem.payload.senderId);
    const user = await this.globalReadDbContext.userRepository.findById(sender.userId);
    const buildingChat = await this.globalReadDbContext.buildingChatRepository.findById(
      buildingChatItem.buildingChatId
    );
    const contactBuilding = await this.globalReadDbContext.contactBuildingRepository.findById(
      buildingChat.contactBuildingId
    );

    return {
      id: buildingChatItem.id,
      createdAt: buildingChatItem.createdAt,
      acknowledged: false,
      buildingId: contactBuilding.buildingId,
      type: BuildingChatItemType.PRIVATE_NOTES,
      payload: {
        sender: {
          id: sender.id,
          firstName: user.givenName,
          lastName: user.familyName,
          photoUrl: user.picture,
        },
        text: buildingChatItem.payload.text,
      },
    };
  }

  private async mapCommunicationItem(communicationItem: CommunicationItemDto): Promise<NewCommunicationItemMessage> {
    switch (communicationItem.type) {
      case CommunicationItemType.INCOMING_SMS:
        return this.mapToIncomingSms(communicationItem);

      case CommunicationItemType.OUTGOING_SMS:
        return this.mapToOutgoingSms(communicationItem);

      case CommunicationItemType.OUTGOING_EMAIL:
        return this.mapToOutgoingEmail(communicationItem);

      case CommunicationItemType.INCOMING_EMAIL:
        return this.mapToIncomingEmail(communicationItem);

      case CommunicationItemType.PRIVATE_NOTES:
        return this.mapToPrivateNotes(communicationItem);

      case CommunicationItemType.SYSTEM_MESSAGE:
        return this.mapToSystemMessagePayload(communicationItem);
    }
  }

  private mapToSystemMessagePayload(
    communicationItem: SystemMessageCommunicationItemDto
  ): Promise<NewCommunicationItemMessageSystemMessageCommunicationItem> {
    switch (communicationItem.payload.eventType) {
      case EventType.CONTACT_OWNER_CHANGED:
        return this.mapContactOwnerChangedSystemMessage(
          communicationItem as ContactOwnerChangedSystemMessageCommunicationItemDto
        );

      case EventType.CONTACT_ASSIGNEE_CHANGED:
        return this.mapContactAssigneeChangedSystemMessage(
          communicationItem as ContactAssigneeChangedSystemMessageCommunicationItemDto
        );

      case EventType.NEW_CONTACT_CREATED:
        return this.mapNewContactCreatedSystemMessage(
          communicationItem as NewContactCreatedSystemMessageCommunicationItemDto
        );
    }
  }

  private async mapContactOwnerChangedSystemMessage(
    raw: ContactOwnerChangedSystemMessageCommunicationItemDto
  ): Promise<NewCommunicationItemMessageContactOwnerChangedSystemMessageCommunicationItem> {
    const {
      payload: { eventPayload },
    } = raw;

    const newOwner = await this.globalReadDbContext.employeeRepository.findById(eventPayload.newOwnerId);

    const contact = await this.globalReadDbContext.contactRepository.findById(eventPayload.contactId);

    const oldOwner = await this.globalReadDbContext.employeeRepository.findById(eventPayload.previousOwnerId);

    const newUser = await this.globalReadDbContext.userRepository.findById(newOwner.userId);

    const oldUser = await this.globalReadDbContext.userRepository.findById(oldOwner.userId);

    return {
      id: raw.id,
      createdAt: raw.createdAt,
      acknowledged: false,
      type: CommunicationItemType.SYSTEM_MESSAGE,
      payload: {
        eventType: EventType.CONTACT_OWNER_CHANGED,
        eventPayload: {
          contactId: contact.id,
          newOwner: {
            id: newOwner.id,
            firstName: newUser.givenName,
            lastName: newUser.familyName,
          },
          oldOwner: {
            id: oldOwner.id,
            firstName: oldUser.givenName,
            lastName: oldUser.familyName,
          },
        },
      },
    };
  }

  private async mapContactAssigneeChangedSystemMessage(
    raw: ContactAssigneeChangedSystemMessageCommunicationItemDto
  ): Promise<NewCommunicationItemMessageContactAssigneeChangedSystemMessageCommunicationItem> {
    const {
      payload: { eventPayload },
    } = raw;

    const contact = await this.globalReadDbContext.contactRepository.findById(eventPayload.contactId);

    let newAssignee = null;
    let oldAssignee = null;

    if (eventPayload.newAssigneeId) {
      const assignee = await this.globalReadDbContext.employeeRepository.findById(eventPayload.newAssigneeId);
      const user = await this.globalReadDbContext.userRepository.findById(assignee.userId);

      newAssignee = {
        id: assignee.id,
        firstName: user.givenName,
        lastName: user.familyName,
      };
    }

    if (eventPayload.previousAssigneeId) {
      const assignee = await this.globalReadDbContext.employeeRepository.findById(eventPayload.previousAssigneeId);
      const user = await this.globalReadDbContext.userRepository.findById(assignee.userId);

      oldAssignee = {
        id: assignee.id,
        firstName: user.givenName,
        lastName: user.familyName,
      };
    }

    return {
      id: raw.id,
      createdAt: raw.createdAt,
      acknowledged: false,
      type: CommunicationItemType.SYSTEM_MESSAGE,
      payload: {
        eventType: EventType.CONTACT_ASSIGNEE_CHANGED,
        eventPayload: {
          contactId: contact.id,
          newAssignee,
          oldAssignee,
        },
      },
    };
  }

  private async mapNewContactCreatedSystemMessage(
    raw: NewContactCreatedSystemMessageCommunicationItemDto
  ): Promise<NewCommunicationItemMessageNewContactCreatedSystemMessageCommunicationItem> {
    const {
      payload: { eventPayload },
    } = raw;
    const contact = await this.globalReadDbContext.contactRepository.findById(eventPayload.contactId);

    return {
      id: raw.id,
      createdAt: raw.createdAt,
      acknowledged: false,
      type: CommunicationItemType.SYSTEM_MESSAGE,
      payload: {
        eventType: EventType.NEW_CONTACT_CREATED,
        eventPayload: {
          contactId: eventPayload.contactId,
          firstName: contact.firstName,
          lastName: contact.lastName,
        },
      },
    };
  }

  private mapToIncomingSms(
    communicationItem: IncomingSmsCommunicationItemDto
  ): NewCommunicationItemMessageIncomingSmsCommunicationItem {
    return {
      id: communicationItem.id,
      createdAt: communicationItem.createdAt,
      acknowledged: false,
      type: CommunicationItemType.INCOMING_SMS,
      payload: {
        text: communicationItem.payload.text,
        media: communicationItem.payload.media.map(({ contentType, url }) => ({
          contentType,
          url,
        })),
      },
    };
  }

  private async mapToOutgoingSms(
    communicationItem: OutgoingSmsCommunicationItemDto
  ): Promise<NewCommunicationItemMessageOutgoingSmsCommunicationItem> {
    const sender = await this.globalReadDbContext.employeeRepository.findById(communicationItem.payload.senderId);
    const user = await this.globalReadDbContext.userRepository.findById(sender.userId);

    return {
      id: communicationItem.id,
      createdAt: communicationItem.createdAt,
      acknowledged: false,
      type: CommunicationItemType.OUTGOING_SMS,
      payload: {
        sender: {
          id: sender.id,
          firstName: user.givenName,
          lastName: user.familyName,
          photoUrl: user.picture,
        },
        text: communicationItem.payload.text,
        media: communicationItem.payload.media.map(({ contentType, url }) => ({
          contentType,
          url,
        })),
        errorCode: communicationItem.payload.errorCode,
        state: communicationItem.payload.state,
      },
    };
  }

  private async mapToPrivateNotes(
    communicationItem: PrivateNotesCommunicationItemDto
  ): Promise<NewCommunicationItemMessagePrivateNotesCommunicationItem> {
    const sender = await this.globalReadDbContext.employeeRepository.findById(communicationItem.payload.senderId);
    const user = await this.globalReadDbContext.userRepository.findById(sender.userId);

    return {
      id: communicationItem.id,
      createdAt: communicationItem.createdAt,
      acknowledged: false,
      type: CommunicationItemType.PRIVATE_NOTES,
      payload: {
        sender: {
          id: sender.id,
          firstName: user.givenName,
          lastName: user.familyName,
          photoUrl: user.picture,
        },
        text: communicationItem.payload.text,
      },
    };
  }

  private async mapToIncomingEmail(
    communicationItem: IncomingEmailCommunicationItemDto
  ): Promise<NewCommunicationItemMessageIncomingEmailCommunicationItem> {
    const threadMessages = await this.globalReadDbContext.communicationRepository.findThreadForEmail(
      communicationItem.id
    );

    // const extensionsToPreview = ['tif', 'tiff', 'jpg', 'jpeg', 'gif', 'png', 'heic', 'dng'];

    // const attachments = await Promise.all(
    //   communicationItem.payload.emailAttachments
    //     .filter(({ extension }) => extensionsToPreview.includes(extension))
    //     .map(async attachment => ({
    //       attachmentId: attachment.attachmentId,
    //       data: await this.googleGmailService.getAttachment(
    //         null,
    //         communicationItem.payload.extenalEmailId,
    //         attachment.attachmentId
    //       ),
    //     }))
    // );

    return {
      id: communicationItem.id,
      createdAt: communicationItem.createdAt,
      acknowledged: false,
      type: CommunicationItemType.INCOMING_EMAIL,
      payload: {
        text: communicationItem.payload.text,
        cc: communicationItem.payload.cc,
        bcc: communicationItem.payload.bcc,
        subject: communicationItem.payload.subject,
        threadMessages: threadMessages.map(threadMessage => threadMessage.payload.text),
        emailAttachments: communicationItem.payload.emailAttachments.map(attachment => ({
          attachmentId: attachment.attachmentId,
          filename: attachment.filename,
          extension: attachment.extension,
          size: attachment.size,
          // data: attachments.find(({ attachmentId }) => attachment.attachmentId === attachmentId)?.data ?? null,
          data: null,
        })),
      },
    };
  }

  private async mapToOutgoingEmail(
    communicationItem: OutgoingEmailCommunicationItemDto
  ): Promise<NewCommunicationItemMessageOutgoingEmailCommunicationItem> {
    const threadMessages = await this.globalReadDbContext.communicationRepository.findThreadForEmail(
      communicationItem.id
    );

    const sender = await this.globalReadDbContext.employeeRepository.findById(communicationItem.payload.senderId);
    const user = await this.globalReadDbContext.userRepository.findById(sender.userId);

    // const extensionsToPreview = ['tif', 'tiff', 'jpg', 'jpeg', 'gif', 'png', 'heic', 'dng'];

    // const attachments = await Promise.all(
    //   communicationItem.payload.emailAttachments
    //     .filter(({ extension }) => extensionsToPreview.includes(extension))
    //     .map(async attachment => ({
    //       attachmentId: attachment.attachmentId,
    //       data: await this.googleGmailService.getAttachment(
    //         null,
    //         communicationItem.payload.extenalEmailId,
    //         attachment.attachmentId
    //       ),
    //     }))
    // );

    return {
      id: communicationItem.id,
      createdAt: communicationItem.createdAt,
      acknowledged: false,
      type: CommunicationItemType.OUTGOING_EMAIL,
      payload: {
        text: communicationItem.payload.text,
        cc: communicationItem.payload.cc,
        bcc: communicationItem.payload.bcc,
        subject: communicationItem.payload.subject,
        sender: {
          id: sender.id,
          firstName: user.givenName,
          lastName: user.familyName,
          photoUrl: user.picture,
        },
        threadMessages: threadMessages.map(threadMessage => threadMessage.payload.text),
        emailAttachments: communicationItem.payload.emailAttachments.map(attachment => ({
          attachmentId: attachment.attachmentId,
          filename: attachment.filename,
          extension: attachment.extension,
          size: attachment.size,
          // data: attachments.find(({ attachmentId }) => attachment.attachmentId === attachmentId)?.data ?? null,
          data: null,
        })),
      },
    };
  }
}

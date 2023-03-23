/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-case-declarations */
import { Injectable, Scope } from '@nestjs/common';
import * as _ from 'lodash';

import { AbstractQueryHandler } from '../../../../../common/application/AbstractQueryHandler';
import { EventType } from '../../../../../common/application/EventType';
import type { HashMap } from '../../../../../common/utils/createHashMap';
import { createHashMap } from '../../../../../common/utils/createHashMap';
import { runSequentially } from '../../../../../common/utils/runSequentially';
import type { BuildingDto } from '../../../../buildings/application/dataStructures/BuildingDto';
import type { ContactBuildingDto } from '../../../../contacts/application/dataStructures/ContactBuildingDto';
import type { EmployeeDto } from '../../../../employees/application/dataStructures/EmployeeDto';
import type { UserDto } from '../../../../users/application/dataStructures/UserDto';
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
} from '../../dataStructures/CommunicationItemDto';
import { CommunicationItemType } from '../../enum/CommunicationItemType';
import type { GetCommunicationItemsInfoQueryInput } from './GetCommunicationItemsInfoQueryInput';
import type {
  GetCommunicationItemsInfoQueryResult,
  GetCommunicationItemsInfoQueryResultContactAssigneeChangedSystemMessageCommunicationItem,
  GetCommunicationItemsInfoQueryResultContactOwnerChangedSystemMessageCommunicationItem,
  GetCommunicationItemsInfoQueryResultIncomingEmailCommunicationItem,
  GetCommunicationItemsInfoQueryResultIncomingSmsCommunicationItem,
  GetCommunicationItemsInfoQueryResultMessage,
  GetCommunicationItemsInfoQueryResultNewContactCreatedSystemMessageCommunicationItem,
  GetCommunicationItemsInfoQueryResultOutgoingEmailCommunicationItem,
  GetCommunicationItemsInfoQueryResultOutgoingSmsCommunicationItem,
  GetCommunicationItemsInfoQueryResultPrivateNotesCommunicationItem,
  GetCommunicationItemsInfoQueryResultSystemMessageCommunicationItem,
} from './GetCommunicationItemsInfoQueryResult';
import type { IGetCommunicationItemsInfoQueryHandler } from './IGetCommunicationItemsInfoQueryHandler';

@Injectable({ scope: Scope.REQUEST })
export class GetCommunicationItemsInfoQueryHandler
  extends AbstractQueryHandler<GetCommunicationItemsInfoQueryInput, GetCommunicationItemsInfoQueryResult>
  implements IGetCommunicationItemsInfoQueryHandler
{
  private _hashMaps: {
    userHashMap: HashMap<UserDto>;
    senderHashMap: HashMap<EmployeeDto>;
  };

  private _fetchedData: {
    contactBuildingMap: Map<string, ContactBuildingDto>;
    buildingMap: Map<string, BuildingDto>;
  };

  constructor() {
    super();

    this._fetchedData = {
      buildingMap: new Map(),
      contactBuildingMap: new Map(),
    };
  }

  protected async implementation(
    input: GetCommunicationItemsInfoQueryInput
  ): Promise<GetCommunicationItemsInfoQueryResult> {
    const identity = this._identityContext.getIdentity();

    const communicationItems = await this._dbContext.communicationRepository.listItemsByContactId(
      input.contactId,
      input.targetMessageId,
      input.direction,
      identity.employeeId,
      {
        sources: input.sources,
      }
    );

    const senderIds = _(communicationItems)
      .map(communicationItem => {
        if (
          communicationItem.type === CommunicationItemType.OUTGOING_SMS ||
          communicationItem.type === CommunicationItemType.PRIVATE_NOTES ||
          communicationItem.type === CommunicationItemType.OUTGOING_EMAIL
        ) {
          return communicationItem.payload.senderId;
        }

        return null;
      })
      .filter(Boolean)
      .uniq()
      .value();

    const senders = await this._dbContext.employeeRepository.listByIds(senderIds);

    const users = await this._dbContext.userRepository.listByIds(
      _(senders)
        .map(({ userId }) => userId)
        .uniq()
        .value()
    );

    const senderHashMap = createHashMap(senders, ({ id }) => id);
    const userHashMap = createHashMap(users, ({ id }) => id);

    this._hashMaps = {
      senderHashMap,
      userHashMap,
    };

    return {
      messages: await runSequentially<CommunicationItemDto, GetCommunicationItemsInfoQueryResultMessage>(
        communicationItems,
        async communicationItem => {
          let mappedCommunicationItem:
            | GetCommunicationItemsInfoQueryResultIncomingSmsCommunicationItem
            | GetCommunicationItemsInfoQueryResultOutgoingSmsCommunicationItem
            | GetCommunicationItemsInfoQueryResultPrivateNotesCommunicationItem
            | GetCommunicationItemsInfoQueryResultOutgoingEmailCommunicationItem
            | GetCommunicationItemsInfoQueryResultIncomingEmailCommunicationItem
            | GetCommunicationItemsInfoQueryResultSystemMessageCommunicationItem;

          switch (communicationItem.type) {
            case CommunicationItemType.INCOMING_SMS:
              mappedCommunicationItem = this.mapToIncomingSms(communicationItem);

              break;

            case CommunicationItemType.OUTGOING_SMS:
              mappedCommunicationItem = this.mapToOutgoingSms(communicationItem);

              break;

            case CommunicationItemType.OUTGOING_EMAIL:
              mappedCommunicationItem = await this.mapToOutgoingEmail(communicationItem);

              break;

            case CommunicationItemType.INCOMING_EMAIL:
              mappedCommunicationItem = await this.mapToIncomingEmail(communicationItem);

              break;

            case CommunicationItemType.PRIVATE_NOTES:
              mappedCommunicationItem = this.mapToPrivateNotes(communicationItem);

              break;

            case CommunicationItemType.SYSTEM_MESSAGE:
              mappedCommunicationItem = await this.mapToSystemMessagePayload(communicationItem);

              break;
          }

          const employeeAcknowledgement = communicationItem.acknowledgement.find(
            ({ employeeId }) => identity.employeeId === employeeId
          );

          const acknowledged = employeeAcknowledgement?.acknowledged ?? true;

          return {
            ...mappedCommunicationItem,
            acknowledged,
          };
        }
      ),
    };
  }

  private mapToSystemMessagePayload(
    communicationItem: SystemMessageCommunicationItemDto
  ): Promise<GetCommunicationItemsInfoQueryResultSystemMessageCommunicationItem> {
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
  ): Promise<GetCommunicationItemsInfoQueryResultContactOwnerChangedSystemMessageCommunicationItem> {
    const {
      payload: { eventPayload },
    } = raw;

    const newOwner = await this._dbContext.employeeRepository.findById(eventPayload.newOwnerId);

    const contact = await this._dbContext.contactRepository.findById(eventPayload.contactId);

    const oldOwner = await this._dbContext.employeeRepository.findById(eventPayload.previousOwnerId);

    const newUser = await this._dbContext.userRepository.findById(newOwner.userId);

    const oldUser = await this._dbContext.userRepository.findById(oldOwner.userId);

    return {
      id: raw.id,
      createdAt: raw.createdAt,
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
  ): Promise<GetCommunicationItemsInfoQueryResultContactAssigneeChangedSystemMessageCommunicationItem> {
    const {
      payload: { eventPayload },
    } = raw;

    const newAssignee = await this._dbContext.employeeRepository.findById(eventPayload.newAssigneeId);

    const contact = await this._dbContext.contactRepository.findById(eventPayload.contactId);

    const oldAssignee = await this._dbContext.employeeRepository.findById(eventPayload.previousAssigneeId);

    const newUser = await this._dbContext.userRepository.findById(newAssignee.userId);

    const oldUser = await this._dbContext.userRepository.findById(oldAssignee.userId);

    return {
      id: raw.id,
      createdAt: raw.createdAt,
      type: CommunicationItemType.SYSTEM_MESSAGE,
      payload: {
        eventType: EventType.CONTACT_ASSIGNEE_CHANGED,
        eventPayload: {
          contactId: contact.id,
          newAssignee: {
            id: newAssignee.id,
            firstName: newUser.givenName,
            lastName: newUser.familyName,
          },
          oldAssignee: {
            id: oldAssignee.id,
            firstName: oldUser.givenName,
            lastName: oldUser.familyName,
          },
        },
      },
    };
  }

  private async mapNewContactCreatedSystemMessage(
    raw: NewContactCreatedSystemMessageCommunicationItemDto
  ): Promise<GetCommunicationItemsInfoQueryResultNewContactCreatedSystemMessageCommunicationItem> {
    const {
      payload: { eventPayload },
    } = raw;

    const contact = await this._dbContext.contactRepository.findById(eventPayload.contactId);

    return {
      id: raw.id,
      createdAt: raw.createdAt,
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
  ): GetCommunicationItemsInfoQueryResultIncomingSmsCommunicationItem {
    return {
      id: communicationItem.id,
      createdAt: communicationItem.createdAt,
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

  private mapToOutgoingSms(
    communicationItem: OutgoingSmsCommunicationItemDto
  ): GetCommunicationItemsInfoQueryResultOutgoingSmsCommunicationItem {
    const { userHashMap, senderHashMap } = this._hashMaps;

    const sender = senderHashMap[communicationItem.payload.senderId];
    const user = userHashMap[sender.userId];

    return {
      id: communicationItem.id,
      createdAt: communicationItem.createdAt,
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

  private mapToPrivateNotes(
    communicationItem: PrivateNotesCommunicationItemDto
  ): GetCommunicationItemsInfoQueryResultPrivateNotesCommunicationItem {
    const { userHashMap, senderHashMap } = this._hashMaps;

    const sender = senderHashMap[communicationItem.payload.senderId];
    const user = userHashMap[sender.userId];

    return {
      id: communicationItem.id,
      createdAt: communicationItem.createdAt,
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
  ): Promise<GetCommunicationItemsInfoQueryResultIncomingEmailCommunicationItem> {
    const threadMessages = await this._dbContext.communicationRepository.findThreadForEmail(communicationItem.id);

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
  ): Promise<GetCommunicationItemsInfoQueryResultOutgoingEmailCommunicationItem> {
    const threadMessages = await this._dbContext.communicationRepository.findThreadForEmail(communicationItem.id);

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

    const { userHashMap, senderHashMap } = this._hashMaps;

    const sender = senderHashMap[communicationItem.payload.senderId];
    const user = userHashMap[sender.userId];

    return {
      id: communicationItem.id,
      createdAt: communicationItem.createdAt,
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

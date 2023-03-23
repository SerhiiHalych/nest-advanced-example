/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-case-declarations */
import { Injectable, Scope } from '@nestjs/common';
import * as _ from 'lodash';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractQueryHandler } from '../../../../../common/application/AbstractQueryHandler';
import { createHashMap } from '../../../../../common/utils/createHashMap';
import type { IListBuildingChatsQueryHandler } from './IListBuildingChatsQueryHandler';
import type { ListBuildingChatsQueryInput } from './ListBuildingChatsQueryInput';
import type { ListBuildingChatsQueryResult } from './ListBuildingChatsQueryResult';

@Injectable({ scope: Scope.REQUEST })
export class ListBuildingChatsQueryHandler
  extends AbstractQueryHandler<ListBuildingChatsQueryInput, ListBuildingChatsQueryResult>
  implements IListBuildingChatsQueryHandler
{
  protected async implementation(input: ListBuildingChatsQueryInput): Promise<ListBuildingChatsQueryResult> {
    const { contactId } = input;

    const contact = await this._dbContext.contactRepository.findById(contactId);

    if (!contact) {
      throw new ApplicationError('Contact not found');
    }

    const buildingChats = await this._dbContext.buildingChatRepository.listBuildingChatsByContactId(contactId);

    if (buildingChats.length === 0) {
      return {
        buildingChats: [],
        unreadMessages: 0,
      };
    }

    const contactBuildings = await this._dbContext.contactBuildingRepository.listByIds(
      buildingChats.map(({ buildingChat: { contactBuildingId } }) => contactBuildingId)
    );

    const buildings = await this._dbContext.buildingRepository.listByIds(
      contactBuildings.map(({ buildingId }) => buildingId)
    );

    const contactBuildingHashMap = createHashMap(contactBuildings, ({ id }) => id);
    const buildingHashMap = createHashMap(buildings, ({ id }) => id);

    const identity = this._identityContext.getIdentity();

    const employee = await this._dbContext.employeeRepository.findByUserId(identity.id);

    const unreadMessagesCountByBuildingChats =
      await this._dbContext.buildingChatRepository.countUnreadMessagesForBuildingChats(
        buildingChats.map(({ buildingChat: { id } }) => id),
        employee.id
      );

    const unreadMessagesCountByBuildingChatsHashMap = createHashMap(
      unreadMessagesCountByBuildingChats,
      ({ buildingChatId }) => buildingChatId
    );

    const totalUnreadMessages =
      await this._dbContext.buildingChatRepository.countUnacknowledgedItemsForEmployeeForContact(
        employee.id,
        contactId
      );

    return {
      buildingChats: _(buildingChats)
        .orderBy(({ latestMessage }) => latestMessage.createdAt, 'desc')
        .map(({ buildingChat, latestMessage }) => {
          const contactBuilding = contactBuildingHashMap[buildingChat.contactBuildingId];
          const building = buildingHashMap[contactBuilding.buildingId];
          const unreadMessages = unreadMessagesCountByBuildingChatsHashMap[buildingChat.id];

          return {
            building: {
              id: building.id,
              name: building.name,
              photo: building.data.photo,
              source: contactBuilding.source,
            },
            lastMessage: {
              createdAt: latestMessage.createdAt,
              id: latestMessage.id,
              text: latestMessage.payload.text,
            },
            unreadMessages: unreadMessages?.unreadMessagesCount ?? 0,
          };
        })
        .value(),
      unreadMessages: totalUnreadMessages,
    };
  }
}

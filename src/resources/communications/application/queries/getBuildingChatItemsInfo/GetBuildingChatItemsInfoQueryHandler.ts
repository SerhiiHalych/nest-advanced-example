/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-case-declarations */
import { Injectable, Scope } from '@nestjs/common';
import * as _ from 'lodash';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractQueryHandler } from '../../../../../common/application/AbstractQueryHandler';
import type { HashMap } from '../../../../../common/utils/createHashMap';
import { createHashMap } from '../../../../../common/utils/createHashMap';
import { runSequentially } from '../../../../../common/utils/runSequentially';
import type { EmployeeDto } from '../../../../employees/application/dataStructures/EmployeeDto';
import type { UserDto } from '../../../../users/application/dataStructures/UserDto';
import type {
  BuildingChatItemDto,
  IncomingBuildingChatItemDto,
  OutgoingBuildingChatItemDto,
  PrivateNotesBuildingChatItemDto,
} from '../../dataStructures/BuildingChatItemDto';
import { BuildingChatItemType } from '../../enum/BuildingChatItemType';
import type { GetBuildingChatItemsInfoQueryInput } from './GetBuildingChatItemsInfoQueryInput';
import type {
  GetBuildingChatItemsInfoQueryResult,
  GetBuildingChatItemsInfoQueryResultIncomingMessageBuildingChatItem,
  GetBuildingChatItemsInfoQueryResultMessage,
  GetBuildingChatItemsInfoQueryResultOutgoingMessageBuildingChatItem,
  GetBuildingChatItemsInfoQueryResultPrivateNotesBuildingChatItem,
} from './GetBuildingChatItemsInfoQueryResult';
import type { IGetBuildingChatItemsInfoQueryHandler } from './IGetBuildingChatItemsInfoQueryHandler';

@Injectable({ scope: Scope.REQUEST })
export class GetBuildingChatItemsInfoQueryHandler
  extends AbstractQueryHandler<GetBuildingChatItemsInfoQueryInput, GetBuildingChatItemsInfoQueryResult>
  implements IGetBuildingChatItemsInfoQueryHandler
{
  private _hashMaps: {
    userHashMap: HashMap<UserDto>;
    senderHashMap: HashMap<EmployeeDto>;
  };

  protected async implementation(
    input: GetBuildingChatItemsInfoQueryInput
  ): Promise<GetBuildingChatItemsInfoQueryResult> {
    const identity = this._identityContext.getIdentity();

    const contactBuilding = await this._dbContext.contactBuildingRepository.findByContactAndBuildingId(
      input.contactId,
      input.buildingId
    );

    if (!contactBuilding) {
      throw new ApplicationError('There is no building chat for this building within this contact');
    }

    const buildingChatItems = await this._dbContext.buildingChatRepository.listItemsByContactBuildingId(
      contactBuilding.id,
      input.targetMessageId,
      identity.employeeId,
      input.direction
    );

    const senderIds = _(buildingChatItems)
      .map(buildingChatItem => {
        if (
          buildingChatItem.type === BuildingChatItemType.PRIVATE_NOTES ||
          buildingChatItem.type === BuildingChatItemType.OUTGOING_MESSAGE
        ) {
          return buildingChatItem.payload.senderId;
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
      messages: await runSequentially<BuildingChatItemDto, GetBuildingChatItemsInfoQueryResultMessage>(
        buildingChatItems,
        async buildingChatItem => {
          let mappedBuildingChatItem:
            | GetBuildingChatItemsInfoQueryResultIncomingMessageBuildingChatItem
            | GetBuildingChatItemsInfoQueryResultOutgoingMessageBuildingChatItem
            | GetBuildingChatItemsInfoQueryResultPrivateNotesBuildingChatItem;

          switch (buildingChatItem.type) {
            case BuildingChatItemType.INCOMING_MESSAGE:
              mappedBuildingChatItem = this.mapToIncomingMessage(buildingChatItem);

              break;

            case BuildingChatItemType.OUTGOING_MESSAGE:
              mappedBuildingChatItem = this.mapToOutgoingMessage(buildingChatItem);

              break;

            case BuildingChatItemType.PRIVATE_NOTES:
              mappedBuildingChatItem = this.mapToPrivateNotes(buildingChatItem);

              break;
          }

          const employeeAcknowledgement = buildingChatItem.acknowledgement.find(
            ({ employeeId }) => identity.employeeId === employeeId
          );

          const acknowledged = employeeAcknowledgement?.acknowledged ?? true;

          return {
            ...mappedBuildingChatItem,
            acknowledged,
          };
        }
      ),
    };
  }

  private mapToIncomingMessage(
    buildingChatItem: IncomingBuildingChatItemDto
  ): GetBuildingChatItemsInfoQueryResultIncomingMessageBuildingChatItem {
    return {
      id: buildingChatItem.id,
      createdAt: buildingChatItem.createdAt,
      type: BuildingChatItemType.INCOMING_MESSAGE,
      payload: {
        text: buildingChatItem.payload.text,
      },
    };
  }

  private mapToOutgoingMessage(
    buildingChatItem: OutgoingBuildingChatItemDto
  ): GetBuildingChatItemsInfoQueryResultOutgoingMessageBuildingChatItem {
    const { userHashMap, senderHashMap } = this._hashMaps;

    const sender = senderHashMap[buildingChatItem.payload.senderId];
    const user = userHashMap[sender.userId];

    return {
      id: buildingChatItem.id,
      createdAt: buildingChatItem.createdAt,
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

  private mapToPrivateNotes(
    buildingChatItem: PrivateNotesBuildingChatItemDto
  ): GetBuildingChatItemsInfoQueryResultPrivateNotesBuildingChatItem {
    const { userHashMap, senderHashMap } = this._hashMaps;

    const sender = senderHashMap[buildingChatItem.payload.senderId];
    const user = userHashMap[sender.userId];

    return {
      id: buildingChatItem.id,
      createdAt: buildingChatItem.createdAt,
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
}

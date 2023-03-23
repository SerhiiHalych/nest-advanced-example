/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/naming-convention */
import { Inject, Injectable, Scope } from '@nestjs/common';
import * as _ from 'lodash';

import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../../common/diTokens';
import { createGroupHashMap } from '../../../../../common/utils/createGroupHashMap';
import { createHashMap } from '../../../../../common/utils/createHashMap';
import { BuildingChatAcknowledgementObserver } from '../../observers/BuildingChatAcknowledgementObserver';
import type { AcknowledgeBuildingChatItemsCommandInput } from './AcknowledgeBuildingChatItemsCommandInput';
import type { IAcknowledgeBuildingChatItemsCommandHandler } from './IAcknowledgeBuildingChatItemsCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class AcknowledgeBuildingChatItemsCommandHandler
  extends AbstractCommandHandler<AcknowledgeBuildingChatItemsCommandInput, void>
  implements IAcknowledgeBuildingChatItemsCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  constructor(private buildingChatAcknowledgementObserver: BuildingChatAcknowledgementObserver) {
    super();
  }

  protected async implementation(input: AcknowledgeBuildingChatItemsCommandInput): Promise<void> {
    const { employeeId, buildingChatItemIds } = input;

    const buildingChatItems = await this._dbContext.buildingChatRepository.listItemsByIds(buildingChatItemIds);

    const buildingChatIds = _(buildingChatItems)
      .map(({ buildingChatId }) => buildingChatId)
      .uniq()
      .value();

    const buildingChatGroupHashMapByBuildingChatId = createGroupHashMap(
      buildingChatItems,
      ({ buildingChatId }) => buildingChatId
    );

    const buildingChats = await this._dbContext.buildingChatRepository.listByIds(buildingChatIds);

    const buildingChatHashMapByContactBuildingId = createHashMap(
      buildingChats,
      ({ contactBuildingId }) => contactBuildingId
    );

    const contactBuildings = await this._dbContext.contactBuildingRepository.listByIds(
      buildingChats.map(({ contactBuildingId }) => contactBuildingId)
    );

    buildingChatItems.forEach(item => {
      item.acknowledgement.forEach(itemAcknowledger => {
        if (itemAcknowledger.employeeId === employeeId) {
          itemAcknowledger.acknowledged = true;
        }
      });
    });

    await this._dbContext.buildingChatRepository.bulkUpdateItems(buildingChatItems);

    this.addCommitHandler(() =>
      Promise.all(
        contactBuildings.map(async ({ contactId, id }) => {
          const buildingChat = buildingChatHashMapByContactBuildingId[id];

          const acknowledgedMessages = buildingChatGroupHashMapByBuildingChatId[buildingChat.id];

          await this.buildingChatAcknowledgementObserver.dispatchAcknowledgedBuildingChatItems(
            acknowledgedMessages,
            contactId,
            employeeId
          );
        })
      )
    );
  }
}

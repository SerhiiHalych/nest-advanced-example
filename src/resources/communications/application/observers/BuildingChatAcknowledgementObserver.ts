import { Injectable } from '@nestjs/common';

import { AbstractObserver } from '../../../../common/application/AbstractObserver';
import type { BuildingChatItemDto } from '../dataStructures/BuildingChatItemDto';

type BuildingChatAcknowledgementObserverSubscriptionActionType = (args: {
  buildingChatItems: BuildingChatItemDto[];
  contactId: string;
  employeeId: string;
}) => Promise<void> | void;

@Injectable()
export class BuildingChatAcknowledgementObserver extends AbstractObserver<BuildingChatAcknowledgementObserverSubscriptionActionType> {
  async dispatchAcknowledgedBuildingChatItems(
    buildingChatItems: BuildingChatItemDto[],
    contactId: string,
    employeeId: string
  ): Promise<void> {
    await this.notify({ buildingChatItems, contactId, employeeId });
  }
}

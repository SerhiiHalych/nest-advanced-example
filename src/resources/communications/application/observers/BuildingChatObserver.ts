import { Injectable } from '@nestjs/common';

import { AbstractObserver } from '../../../../common/application/AbstractObserver';
import type { BuildingChatItemDto } from '../dataStructures/BuildingChatItemDto';

type BuildingChatObserverSubscriptionActionType = (args: {
  buildingChatItem: BuildingChatItemDto;
  contactId: string;
}) => Promise<void> | void;

@Injectable()
export class BuildingChatObserver extends AbstractObserver<BuildingChatObserverSubscriptionActionType> {
  async dispatchBuildingChatItem(buildingChatItem: BuildingChatItemDto, contactId: string): Promise<void> {
    await this.notify({ buildingChatItem, contactId });
  }
}

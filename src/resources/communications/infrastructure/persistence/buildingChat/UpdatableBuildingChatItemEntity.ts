import type { OmitTyped } from '../../../../../common/types/OmitTyped';
import type { NewBuildingChatItemAcknowledgementEntity } from './buildingChatItemAcknowledgement/NewBuildingChatItemAcknowledgementEntity';
import type { BuildingChatItemEntity } from './BuildingChatItemEntity';

export type UpdatableBuildingChatItemEntity = OmitTyped<
  BuildingChatItemEntity,
  'createdAt' | 'buildingChat' | 'sender' | 'updatedAt' | 'acknowledgement'
> & {
  acknowledgement: NewBuildingChatItemAcknowledgementEntity[];
};

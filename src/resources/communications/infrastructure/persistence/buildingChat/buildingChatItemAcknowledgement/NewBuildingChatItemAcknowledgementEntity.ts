import type { OmitTyped } from '../../../../../../common/types/OmitTyped';
import type { BuildingChatItemAcknowledgementEntity } from './BuildingChatItemAcknowledgementEntity';

export type NewBuildingChatItemAcknowledgementEntity = OmitTyped<
  BuildingChatItemAcknowledgementEntity,
  'buildingChatItem' | 'buildingChatItemId' | 'employee'
>;

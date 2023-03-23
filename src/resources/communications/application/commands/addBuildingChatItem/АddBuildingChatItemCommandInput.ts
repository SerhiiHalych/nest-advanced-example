import type { BuildingChatItemType } from '../../enum/BuildingChatItemType';

export interface AddBuildingChatItemCommandInput {
  buildingId: string;
  contactId: string;
  payload: {
    text: string;
  };
  type: BuildingChatItemType.OUTGOING_MESSAGE | BuildingChatItemType.PRIVATE_NOTES;
}

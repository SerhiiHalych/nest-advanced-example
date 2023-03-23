import type { BuildingChatItemType } from '../enum/BuildingChatItemType';

export type BuildingChatItemDto =
  | IncomingBuildingChatItemDto
  | OutgoingBuildingChatItemDto
  | PrivateNotesBuildingChatItemDto;

interface BaseBuildingChatItemDto {
  id: string;
  createdAt: Date;
  buildingChatId: string;
  acknowledgement: Array<{
    employeeId: string;
    acknowledged: boolean;
  }>;
}

export interface IncomingBuildingChatItemDto extends BaseBuildingChatItemDto {
  payload: {
    text: string;
  };
  type: BuildingChatItemType.INCOMING_MESSAGE;
}

export interface OutgoingBuildingChatItemDto extends BaseBuildingChatItemDto {
  payload: {
    text: string;
    senderId: string;
  };
  type: BuildingChatItemType.OUTGOING_MESSAGE;
}

export interface PrivateNotesBuildingChatItemDto extends BaseBuildingChatItemDto {
  payload: {
    text: string;
    senderId: string;
  };
  type: BuildingChatItemType.PRIVATE_NOTES;
}

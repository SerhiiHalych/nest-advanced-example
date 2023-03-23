import type { BuildingChatItemType } from '../../../application/enum/BuildingChatItemType';

export class GetBuildingChatMessagesInfoResponse {
  messages: {
    id: string;
    type: BuildingChatItemType;
    payload: any;
    createdAt: Date;
    acknowledged: boolean;
  }[];
}

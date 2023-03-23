import type { BuildingSource } from '../../../../buildings/application/enum/BuildingSource';

export interface ListBuildingChatsQueryResult {
  buildingChats: Array<{
    building: {
      id: string;
      name: string;
      photo: string;
      source: BuildingSource;
    };
    unreadMessages: number;
    lastMessage: {
      id: string;
      text: string;
      createdAt: Date;
    };
  }>;
  unreadMessages: number;
}

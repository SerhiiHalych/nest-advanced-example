import { ApiProperty } from '@nestjs/swagger';

import { BuildingSource } from '../../../../buildings/application/enum/BuildingSource';

class ListBuildingChatsResponseLastMessage {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  createdAt: Date;
}

class ListBuildingChatsResponseBuilding {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  photo: string;

  @ApiProperty({ enum: BuildingSource })
  source: BuildingSource;
}

class ListBuildingChatsResponseBuildingChat {
  @ApiProperty({ type: ListBuildingChatsResponseBuilding })
  building: ListBuildingChatsResponseBuilding;

  @ApiProperty()
  unreadMessages: number;

  @ApiProperty({ type: ListBuildingChatsResponseLastMessage })
  lastMessage: ListBuildingChatsResponseLastMessage;
}

export class ListBuildingChatsResponse {
  @ApiProperty({ type: [ListBuildingChatsResponseBuildingChat] })
  buildingChats: Array<ListBuildingChatsResponseBuildingChat>;

  @ApiProperty()
  unreadMessages: number;
}

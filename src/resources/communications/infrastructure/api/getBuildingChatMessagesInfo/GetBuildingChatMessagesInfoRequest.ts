import { ApiProperty } from '@nestjs/swagger';

export class GetBuildingChatMessagesInfoRequestQuery {
  @ApiProperty()
  contactId: string;

  @ApiProperty()
  buildingId: string;

  @ApiProperty({ default: null })
  targetMessageId: string | null;

  @ApiProperty({ default: null })
  direction: 'UP' | 'DOWN' | null;
}

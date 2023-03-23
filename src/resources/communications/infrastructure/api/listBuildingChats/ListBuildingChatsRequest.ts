import { ApiProperty } from '@nestjs/swagger';

export class ListBuildingChatsRequestQuery {
  @ApiProperty()
  contactId: string;
}

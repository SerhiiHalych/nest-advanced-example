import { ApiProperty } from '@nestjs/swagger';

export class ImportContactsResponse {
  @ApiProperty()
  created: number;

  @ApiProperty()
  updated: number;
}

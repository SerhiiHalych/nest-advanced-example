import { ApiProperty } from '@nestjs/swagger';

export class ImportContactsFromFoobarResponse {
  @ApiProperty()
  created: number;

  @ApiProperty()
  updated: number;
}

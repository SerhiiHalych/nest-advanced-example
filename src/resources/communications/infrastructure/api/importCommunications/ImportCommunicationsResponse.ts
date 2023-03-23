import { ApiProperty } from '@nestjs/swagger';

export class ImportCommunicationsResponse {
  @ApiProperty()
  newContacts: number;

  @ApiProperty()
  smsImported: number;
}

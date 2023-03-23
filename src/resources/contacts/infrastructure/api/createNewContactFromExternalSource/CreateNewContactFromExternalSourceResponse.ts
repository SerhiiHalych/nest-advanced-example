import { ApiProperty } from '@nestjs/swagger';

export class CreateNewContactFromExternalSourceResponse {
  @ApiProperty()
  id: string;
}

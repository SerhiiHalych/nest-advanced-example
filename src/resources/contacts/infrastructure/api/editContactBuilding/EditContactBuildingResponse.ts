import { ApiProperty } from '@nestjs/swagger';

export class EditContactBuildingResponse {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  notes: string | null;
}

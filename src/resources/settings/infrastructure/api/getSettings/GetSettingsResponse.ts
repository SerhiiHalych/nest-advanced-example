import { ApiProperty } from '@nestjs/swagger';

export class GetSettingsResponse {
  @ApiProperty({ nullable: true })
  communicationEmail: string | null;
}

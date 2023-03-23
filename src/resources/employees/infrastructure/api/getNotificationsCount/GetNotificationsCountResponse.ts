import { ApiProperty } from '@nestjs/swagger';

export class GetNotificationsCountResponse {
  @ApiProperty()
  notificationCount: number;
}

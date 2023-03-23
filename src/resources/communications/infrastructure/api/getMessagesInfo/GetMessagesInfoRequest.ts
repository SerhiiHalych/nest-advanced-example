import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CommunicationItemType } from '../../../application/enum/CommunicationItemType';

export class GetMessagesInfoRequestQuery {
  @ApiProperty()
  contactId: string;

  @ApiProperty({ default: null })
  targetMessageId: string | null;

  @ApiProperty({ default: null })
  direction: 'UP' | 'DOWN' | null;

  @ApiPropertyOptional({ enum: CommunicationItemType, isArray: true })
  sources?: Array<CommunicationItemType>;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';
import { CommunicationItemType } from '../../../application/enum/CommunicationItemType';

class AddCommunicationItemRequestBodyPayload {
  @ApiPropertyOptional()
  text?: string;

  @ApiPropertyOptional()
  cc?: string[];

  @ApiPropertyOptional()
  bcc?: string[];

  @ApiPropertyOptional()
  subject?: string;

  @ApiPropertyOptional()
  replyTo?: string;
}

export class AddCommunicationItemRequestBody {
  @ApiProperty()
  contactId: string;

  @ApiProperty({ type: AddCommunicationItemRequestBodyPayload })
  payload: AddCommunicationItemRequestBodyPayload;

  @ApiProperty({ enum: CommunicationItemType })
  type: CommunicationItemType.OUTGOING_SMS | CommunicationItemType.PRIVATE_NOTES;
}

export const addCommunicationItemRequestSchema = createRequestSchema({
  body: createObjectSchema<AddCommunicationItemRequestBody>({
    contactId: extendedJoi.string().uuid(),
    payload: extendedJoi.any().custom(value => JSON.parse(value)) as any,
    type: extendedJoi.string().valid(...Object.values(CommunicationItemType)),
  }),
});

import { ApiProperty } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

class ChangeContactOwnerRequestParams {
  @ApiProperty()
  contactId: string;
}

export class ChangeContactOwnerRequestBody {
  @ApiProperty({ nullable: true })
  ownerId: string | null;
}

export const changeContactOwnerRequestSchema = createRequestSchema({
  params: createObjectSchema<ChangeContactOwnerRequestParams>({
    contactId: extendedJoi.string().uuid(),
  }),
  body: createObjectSchema<ChangeContactOwnerRequestBody>({
    ownerId: extendedJoi.string().uuid().allow(null),
  }),
});

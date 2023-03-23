import { ApiProperty } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

class RemoveBuildingFromWishlistRequestBody {
  @ApiProperty()
  contactId: string;

  @ApiProperty()
  buildingId: string;
}

export const removeBuildingFromWishlistRequestSchema = createRequestSchema({
  body: createObjectSchema<RemoveBuildingFromWishlistRequestBody>({
    contactId: extendedJoi.string().uuid(),
    buildingId: extendedJoi.string().uuid(),
  }),
});

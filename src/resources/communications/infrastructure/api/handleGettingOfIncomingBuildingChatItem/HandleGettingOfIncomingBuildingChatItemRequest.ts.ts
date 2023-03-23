import { ApiProperty } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

export class HandleGettingOfIncomingBuildingChatItemRequestBody {
  @ApiProperty()
  text: string;

  @ApiProperty()
  foobarBuildingId: string;

  @ApiProperty()
  foobarContactId: string;
}

export const handleGettingOfIncomingBuildingChatItemRequestSchema = createRequestSchema({
  body: createObjectSchema<HandleGettingOfIncomingBuildingChatItemRequestBody>({
    foobarBuildingId: extendedJoi.string().uuid(),
    foobarContactId: extendedJoi.string().uuid(),
    text: extendedJoi.string(),
  }),
});

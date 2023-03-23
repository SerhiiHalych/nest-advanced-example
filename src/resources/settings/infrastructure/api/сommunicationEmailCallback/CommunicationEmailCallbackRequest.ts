import { ApiProperty } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

class CommunicationEmailCallbackRequestQuery {
  @ApiProperty()
  code: string;

  @ApiProperty()
  state: string;
}

export const communicationEmailCallbackRequestSchema = createObjectSchema({
  query: createObjectSchema<CommunicationEmailCallbackRequestQuery>({
    code: extendedJoi.string(),
    state: extendedJoi.string(),
  }),
});

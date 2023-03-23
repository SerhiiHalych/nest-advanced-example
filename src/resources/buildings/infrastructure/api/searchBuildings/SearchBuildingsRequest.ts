import { ApiProperty } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

class SearchBuildingsRequestQuery {
  @ApiProperty()
  search: string;
}

export const searchBuildingsRequestSchema = createRequestSchema({
  query: createObjectSchema<SearchBuildingsRequestQuery>({
    search: extendedJoi.string(),
  }),
});

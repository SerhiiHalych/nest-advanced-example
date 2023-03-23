import { ApiPropertyOptional } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

export class ListEmployeesRequestQuery {
  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  limit?: number;

  @ApiPropertyOptional()
  ownersOnly?: string;
}

export const listEmployeesRequestSchema = createRequestSchema({
  query: createObjectSchema<ListEmployeesRequestQuery>({
    page: extendedJoi.number().optional(),
    limit: extendedJoi.number().optional(),
    ownersOnly: extendedJoi.string().allow('true', 'false').optional(),
  }),
});

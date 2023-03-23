import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import Joi from 'joi';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

export class ListContactsRequestQuery {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiPropertyOptional()
  ownerId?: string;

  @ApiPropertyOptional()
  search?: string;

  @ApiPropertyOptional()
  filterId?: string;
}

export const listContactsRequestSchema = createRequestSchema({
  query: createObjectSchema<ListContactsRequestQuery>({
    page: extendedJoi.number(),
    limit: extendedJoi.number(),
    ownerId: extendedJoi.string().allow('unassigned').uuid().optional(),
    search: extendedJoi.string().optional(),
    filterId: extendedJoi.string().uuid().optional(),
  }),
});

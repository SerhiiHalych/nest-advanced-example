import { ApiProperty } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

export class ImportContactsRequestBody {
  @ApiProperty()
  assigneeEmail: string;
}

export const importContactsRequestBodySchema = createRequestSchema({
  body: createObjectSchema<ImportContactsRequestBody>({
    assigneeEmail: extendedJoi.string().email(),
  }),
});

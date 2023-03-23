import { ApiProperty } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

export class ImportContactsFromFoobarRequestBody {
  @ApiProperty()
  assigneeEmail: string;
}

export const importContactsFromFoobarRequestBodySchema = createRequestSchema({
  body: createObjectSchema<ImportContactsFromFoobarRequestBody>({
    assigneeEmail: extendedJoi.string().email(),
  }),
});

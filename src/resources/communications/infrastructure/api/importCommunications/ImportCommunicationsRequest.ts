import { ApiProperty } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

export class ImportCommunicationsRequestBody {
  @ApiProperty()
  assigneeEmail: string;
}

export const importCommunicationsRequestBodySchema = createRequestSchema({
  body: createObjectSchema<ImportCommunicationsRequestBody>({
    assigneeEmail: extendedJoi.string().email(),
  }),
});

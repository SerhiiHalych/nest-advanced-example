import { ApiProperty } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

class EditContactBuildingRequestParams {
  @ApiProperty()
  contactId: string;

  buildingId: string;
}

export class EditContactBuildingRequestBody {
  @ApiProperty({ nullable: true })
  notes: string | null;
}

export const editContactBuildingRequestSchema = createRequestSchema({
  params: createObjectSchema<EditContactBuildingRequestParams>({
    buildingId: extendedJoi.string().uuid(),
    contactId: extendedJoi.string().uuid(),
  }),
  body: createObjectSchema<EditContactBuildingRequestBody>({
    notes: extendedJoi
      .string()
      .max(1000)
      .pattern(new RegExp(/^([a-zA-Z 0-9\s[!#$%&‘*'@:;<>^()_+-/=?`{|}~.,\]]|[\t\n])*$/))
      .allow(null),
  }),
});

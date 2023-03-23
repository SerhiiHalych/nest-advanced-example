import { ApiProperty } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

class ChangeContactAssigneeRequestParams {
  @ApiProperty()
  contactId: string;
}

export class ChangeContactAssigneeRequestBody {
  @ApiProperty({ nullable: true })
  assigneeId: string | null;
}

export const changeContactAssigneeRequestSchema = createRequestSchema({
  params: createObjectSchema<ChangeContactAssigneeRequestParams>({
    contactId: extendedJoi.string().uuid(),
  }),
  body: createObjectSchema<ChangeContactAssigneeRequestBody>({
    assigneeId: extendedJoi.string().uuid().allow(null),
  }),
});

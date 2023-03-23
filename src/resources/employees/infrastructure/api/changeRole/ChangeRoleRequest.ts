import { ApiProperty } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';
import { EmployeeRole } from '../../../application/enums/EmployeeRole';

export class ChangeRoleRequest {
  @ApiProperty()
  employeeId: string;

  @ApiProperty({ enum: EmployeeRole })
  roles: EmployeeRole[];
}

export const changeRoleRequestSchema = createRequestSchema({
  body: createObjectSchema<ChangeRoleRequest>({
    employeeId: extendedJoi.string().uuid(),
    roles: extendedJoi.array().items(extendedJoi.string().valid(...Object.values(EmployeeRole))),
  }),
});

import { ApiProperty } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';
import { EmployeeRole } from '../../../application/enums/EmployeeRole';

export class ChangeTeamRequest {
  @ApiProperty()
  employeeId: string;

  @ApiProperty({ enum: EmployeeRole || null })
  teamName: EmployeeRole | null;
}

export const changeTeamRequestSchema = createRequestSchema({
  body: createObjectSchema<ChangeTeamRequest>({
    employeeId: extendedJoi.string().uuid(),
    teamName: extendedJoi
      .string()
      .valid(...Object.values(EmployeeRole))
      .allow(null),
  }),
});

import type { EmployeeRole } from '../../enums/EmployeeRole';

export interface ChangeRoleCommandInput {
  employeeId: string;
  roles: EmployeeRole[];
}

import type { EmployeeRole } from '../../../resources/employees/application/enums/EmployeeRole';

export enum IdentityType {
  USER = 'USER',
  ROBOT = 'ROBOT',
}

export interface DSIdentity {
  id: string;
  employeeId: string;
  roles: EmployeeRole[];
  type: IdentityType;
}

import type { EmployeeRole } from '../../../resources/employees/application/enums/EmployeeRole';
import type { IdentityType } from '../../application/identity/DSIdentity';

export interface DSRequestUser {
  id: string;
  employeeId: string | null;
  roles: EmployeeRole[];
  type: IdentityType;
}

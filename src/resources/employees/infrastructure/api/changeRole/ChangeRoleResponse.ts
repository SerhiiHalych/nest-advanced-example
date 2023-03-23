import type { EmployeeRole } from '../../../application/enums/EmployeeRole';

export class ChangeRoleResponse {
  id: string;
  isAvailable: boolean;
  isArchived: boolean;
  roles: EmployeeRole[];
  userId: string;
  teamId: string | null;
}

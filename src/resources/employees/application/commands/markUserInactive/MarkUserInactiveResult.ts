import type { EmployeeRole } from '../../enums/EmployeeRole';

export interface MarkUserInactiveResult {
  id: string;
  isAvailable: boolean;
  isArchived: boolean;
  roles: EmployeeRole[];
  userId: string;
  teamId: string | null;
}

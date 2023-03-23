import type { EmployeeTeamEntity } from '../../infrastructure/persistence/EmployeeTeamEntity';
import type { EmployeeRole } from '../enums/EmployeeRole';

export interface EmployeeDto {
  id: string;
  isAvailable: boolean;
  isArchived: boolean;
  roles: EmployeeRole[];
  userId: string;
  teamId: string | null;
  team: EmployeeTeamEntity;
  createdAt: Date;
}

import type { EmployeeRole } from '../enums/EmployeeRole';

export interface EmployeeTeamDto {
  id: string;
  name: string;
  role: EmployeeRole;
  createdAt: Date;
  updatedAt: Date;
}

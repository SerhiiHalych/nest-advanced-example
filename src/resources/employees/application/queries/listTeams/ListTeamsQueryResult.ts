import type { EmployeeRole } from '../../enums/EmployeeRole';

export interface ListTeamsQueryResult {
  items: Array<{
    id: string;
    name: string;
    role: EmployeeRole;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

import type { EmployeeRole } from '../../enums/EmployeeRole';

export interface ListEmployeesQueryResult {
  items: Array<{
    id: string;
    roles: EmployeeRole[];
    team: string;
    isAvailable: boolean;
    user: {
      id: string;
      givenName: string;
      familyName: string | null;
      picture: string;
      email: string;
    };
    createdAt: Date;
  }>;
  totalCount: number;
}

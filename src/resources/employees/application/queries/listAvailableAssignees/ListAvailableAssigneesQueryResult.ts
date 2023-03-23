import type { EmployeeRole } from '../../enums/EmployeeRole';

export interface ListAvailableAssigneesQueryResult {
  items: Array<{
    id: string;
    roles: EmployeeRole[];
    user: {
      id: string;
      givenName: string;
      familyName: string | null;
      picture: string;
    };
  }>;
}

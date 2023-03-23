import type { EmployeeRole } from '../../../../employees/application/enums/EmployeeRole';

export interface AuthorizeUserCommandResult {
  user: {
    id: string;
    givenName: string;
    familyName: string | null;
    picture: string;
  };
  employee: {
    id: string;
    roles: EmployeeRole[];
  };
  accessToken: string;
}

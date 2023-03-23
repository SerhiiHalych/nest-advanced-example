import type { EmployeeRole } from '../../../../employees/application/enums/EmployeeRole';

interface Assignee {
  id: string;
  roles: EmployeeRole[];
  user: {
    id: string;
    givenName: string;
    familyName: string | null;
    picture: string;
  };
}

interface Owner {
  id: string;
  roles: EmployeeRole[];
  user: {
    id: string;
    givenName: string;
    familyName: string | null;
    picture: string;
  };
}

export interface ChangeContactOwnerCommandResult {
  assignee: Assignee | null;
  owner: Owner | null;
}

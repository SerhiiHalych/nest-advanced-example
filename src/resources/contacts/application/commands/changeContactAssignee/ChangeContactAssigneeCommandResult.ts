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

export interface ChangeContactAssigneeCommandResult {
  assignee: Assignee | null;
}

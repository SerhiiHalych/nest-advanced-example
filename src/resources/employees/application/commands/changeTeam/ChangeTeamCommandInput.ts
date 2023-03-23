import type { EmployeeRole } from '../../enums/EmployeeRole';

export interface ChangeTeamCommandInput {
  employeeId: string;
  teamName: EmployeeRole;
}

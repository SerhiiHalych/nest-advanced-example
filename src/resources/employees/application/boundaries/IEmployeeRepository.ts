import type { EmployeeCreateDto } from '../dataStructures/EmployeeCreateDto';
import type { EmployeeDto } from '../dataStructures/EmployeeDto';
import type { EmployeeTeamDto } from '../dataStructures/EmployeeTeamDto';
import type { EmployeeRole } from '../enums/EmployeeRole';

export interface IEmployeeRepository {
  create(data: EmployeeCreateDto): Promise<EmployeeDto>;

  findById(id: string): Promise<EmployeeDto | null>;

  findEmployeeTeamByRoleName(role: EmployeeRole): Promise<EmployeeTeamDto>;

  findByUserId(userId: string): Promise<EmployeeDto | null>;

  listByIds(ids: string[]): Promise<EmployeeDto[]>;

  listAll({ skip, take }: { skip: number; take: number; roles?: EmployeeRole[] }): Promise<{
    employees: EmployeeDto[];
    totalCount: number;
  }>;

  listAssignees(): Promise<EmployeeDto[]>;

  listAllTeams(): Promise<EmployeeTeamDto[]>;

  findRandomByTeamId(teamId: string): Promise<EmployeeDto | null>;

  findRandomByRole(role: EmployeeRole): Promise<EmployeeDto | null>;

  updateEmployee(data: EmployeeDto): Promise<void>;

  getEmployeeWithTheLowestAssignedItemsByRole(role: EmployeeRole, employeeIdToOmit?: string): Promise<string>;
}

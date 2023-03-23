import type { ListEmployeesQueryInput } from './ListEmployeesQueryInput';
import type { ListEmployeesQueryResult } from './ListEmployeesQueryResult';

export interface IListEmployeesQueryHandler {
  execute(input: ListEmployeesQueryInput): Promise<ListEmployeesQueryResult>;
}

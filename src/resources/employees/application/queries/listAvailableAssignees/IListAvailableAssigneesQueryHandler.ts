import type { ListAvailableAssigneesQueryResult } from './ListAvailableAssigneesQueryResult';

export interface IListAvailableAssigneesQueryHandler {
  execute(): Promise<ListAvailableAssigneesQueryResult>;
}

import type { ListTeamsQueryResult } from './ListTeamsQueryResult';

export interface IListTeamsQueryHandler {
  execute(): Promise<ListTeamsQueryResult>;
}

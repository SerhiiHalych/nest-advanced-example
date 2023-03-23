import type { ListContactsQueryInput } from './ListContactsQueryInput';
import type { ListContactsQueryResult } from './ListContactsQueryResult';

export interface IListContactsQueryHandler {
  execute(input: ListContactsQueryInput): Promise<ListContactsQueryResult>;
}

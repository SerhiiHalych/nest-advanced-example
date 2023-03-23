import type { ListBuildingChatsQueryInput } from './ListBuildingChatsQueryInput';
import type { ListBuildingChatsQueryResult } from './ListBuildingChatsQueryResult';

export interface IListBuildingChatsQueryHandler {
  execute(input: ListBuildingChatsQueryInput): Promise<ListBuildingChatsQueryResult>;
}

import type { SearchContentQueryInput } from './SearchContentQueryInput';
import type { SearchContentQueryResult } from './SearchContentQueryResult';

export interface ISearchContentQueryHandler {
  execute(input: SearchContentQueryInput): Promise<SearchContentQueryResult>;
}

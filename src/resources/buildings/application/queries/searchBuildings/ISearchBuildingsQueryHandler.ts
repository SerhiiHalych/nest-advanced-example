import type { SearchBuildingsQueryInput } from './SearchBuildingsQueryInput';
import type { SearchBuildingsQueryResult } from './SearchBuildingsQueryResult';

export interface ISearchBuildingsQueryHandler {
  execute(input: SearchBuildingsQueryInput): Promise<SearchBuildingsQueryResult>;
}

export interface SearchBuildingsQueryResult {
  items: Array<{
    id: string;
    name: string;
    address: string;
    city: string;
  }>;
}

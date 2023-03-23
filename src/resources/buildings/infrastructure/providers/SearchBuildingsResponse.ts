export interface SearchBuildingsResponse {
  properties: Array<{
    id: string;
    name: string;
    address: string;
    city: string;
  }>;
  count: number;
}

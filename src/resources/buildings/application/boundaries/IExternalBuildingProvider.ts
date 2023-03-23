import type { ExternalBuildingDto } from '../dataStructures/ExternalBuildingDto';

export interface IExternalBuildingProvider {
  getBuildingByExternalId(externalId: string): Promise<ExternalBuildingDto>;

  listBuildingsByPropertyIds(propertyIds: string[]): Promise<ExternalBuildingDto[]>;

  searchBuildings(params: { search: string }): Promise<
    Array<{
      id: string;
      name: string;
      address: string;
      city: string;
    }>
  >;
}

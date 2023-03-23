import type { BuildingCreateDto } from '../dataStructures/BuildingCreateDto';
import type { BuildingDto } from '../dataStructures/BuildingDto';

export interface IBuildingRepository {
  findById(id: string): Promise<BuildingDto | null>;

  listByIds(ids: string[]): Promise<BuildingDto[]>;

  findByExternalId(externalId: string): Promise<BuildingDto | null>;

  listByExternalIds(externalIds: string[]): Promise<BuildingDto[]>;

  create(data: BuildingDto | BuildingCreateDto): Promise<BuildingDto>;

  bulkCreate(data: BuildingCreateDto[]): Promise<string[]>;
}

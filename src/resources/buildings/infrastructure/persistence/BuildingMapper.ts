import type { BuildingCreateDto } from '../../application/dataStructures/BuildingCreateDto';
import type { BuildingDto } from '../../application/dataStructures/BuildingDto';
import type { BuildingEntity } from './BuildingEntity';
import type { NewBuildingEntity } from './NewBuildingEntity';

export class BuildingMapper {
  static toDto(entity: BuildingEntity): BuildingDto {
    return {
      address: entity.address,
      data: entity.data,
      externalId: entity.externalId,
      id: entity.id,
      name: entity.name,
    };
  }

  static toNewEntity(entity: BuildingCreateDto): NewBuildingEntity {
    return {
      address: entity.address,
      data: entity.data,
      externalId: entity.externalId,
      name: entity.name,
    };
  }
}

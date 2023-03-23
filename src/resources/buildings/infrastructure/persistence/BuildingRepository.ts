import { AbstractRepository, EntityRepository, In } from 'typeorm';
import { runChunksSequentiallyAndFlatten } from '../../../../common/utils/runChunksSequentiallyAndFlatten';

import type { IBuildingRepository } from '../../application/boundaries/IBuildingRepository';
import type { BuildingCreateDto } from '../../application/dataStructures/BuildingCreateDto';
import type { BuildingDto } from '../../application/dataStructures/BuildingDto';
import { BuildingEntity } from './BuildingEntity';
import { BuildingMapper } from './BuildingMapper';

@EntityRepository(BuildingEntity)
export class BuildingRepository extends AbstractRepository<BuildingEntity> implements IBuildingRepository {
  async findById(id: string): Promise<BuildingDto | null> {
    const buildingEntity = await this.repository.findOne({
      where: {
        id,
      },
    });

    if (!buildingEntity) {
      return null;
    }

    return BuildingMapper.toDto(buildingEntity);
  }

  async listByIds(ids: string[]): Promise<BuildingDto[]> {
    if (ids.length === 0) {
      return [];
    }

    const buildingEntities = await this.repository.find({
      where: {
        id: In(ids),
      },
    });

    return buildingEntities.map(BuildingMapper.toDto);
  }

  async findByExternalId(externalId: string): Promise<BuildingDto | null> {
    const buildingEntity = await this.repository.findOne({
      where: {
        externalId,
      },
    });

    if (!buildingEntity) {
      return null;
    }

    return BuildingMapper.toDto(buildingEntity);
  }

  async listByExternalIds(externalIds: string[]): Promise<BuildingDto[]> {
    if (externalIds.length === 0) {
      return [];
    }

    const buildingEntities = await this.repository.find({
      where: {
        externalId: In(externalIds),
      },
    });

    return buildingEntities.map(BuildingMapper.toDto);
  }

  async create(data: BuildingCreateDto): Promise<BuildingDto> {
    const buildingEntityToSave = BuildingMapper.toNewEntity(data);

    const savedBuildingEntity = await this.repository.save(buildingEntityToSave);

    const buildingEntity = await this.repository.findOneOrFail({
      where: {
        id: savedBuildingEntity.id,
      },
    });

    return BuildingMapper.toDto(buildingEntity);
  }

  async bulkCreate(data: BuildingCreateDto[]): Promise<string[]> {
    if (data.length === 0) {
      return [];
    }

    const buildingEntityToSave = data.map(BuildingMapper.toNewEntity);

    const identifiers = await runChunksSequentiallyAndFlatten(buildingEntityToSave, 500, async chunk => {
      const result = await this.repository.insert(chunk);

      return result.identifiers;
    });

    return identifiers.map(object => Object.values(object)[0]);
  }
}

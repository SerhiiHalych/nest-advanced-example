import type { BuildingChatDto } from '../../../application/dataStructures/BuildingChatDto';
import type { BuildingChatItemCreateDto } from '../../../application/dataStructures/BuildingChatItemCreateDto';
import type { BuildingChatItemDto } from '../../../application/dataStructures/BuildingChatItemDto';
import type { BuildingChatEntity } from './BuildingChatEntity';
import type { BuildingChatItemEntity } from './BuildingChatItemEntity';
import type { NewBuildingChatItemEntity } from './NewBuildingChatItemEntity';
import type { UpdatableBuildingChatItemEntity } from './UpdatableBuildingChatItemEntity';

export class BuildingChatMapper {
  static toDto(entity: BuildingChatEntity): BuildingChatDto {
    return {
      contactBuildingId: entity.contactBuildingId,
      id: entity.id,
    };
  }

  static toItemDto(entity: BuildingChatItemEntity): BuildingChatItemDto {
    return {
      acknowledgement: entity.acknowledgement.map(({ acknowledged, employeeId }) => ({
        acknowledged,
        employeeId,
      })),
      buildingChatId: entity.buildingChatId,
      createdAt: entity.createdAt,
      id: entity.id,
      payload: entity.senderId
        ? {
            ...entity.payload,
            senderId: entity.senderId,
          }
        : entity.payload,
      type: entity.type as any,
    };
  }

  static toNewItemEntity(entity: BuildingChatItemCreateDto): NewBuildingChatItemEntity {
    const { senderId, ...payload } = entity.payload as {
      senderId?: string;
      [key: string]: any;
    };

    return {
      buildingChatId: entity.buildingChatId,
      payload: payload as any,
      senderId,
      type: entity.type,
      acknowledgement: entity.acknowledgement.map(({ acknowledged, employeeId }) => ({
        acknowledged,
        employeeId,
      })),
    };
  }

  static toUpdateItemEntity(entity: BuildingChatItemDto): UpdatableBuildingChatItemEntity {
    const { senderId, ...payload } = entity.payload as {
      senderId?: string;
      [key: string]: any;
    };

    return {
      buildingChatId: entity.buildingChatId,
      id: entity.id,
      payload: payload as any,
      senderId,
      type: entity.type,
      acknowledgement: entity.acknowledgement.map(({ acknowledged, employeeId }) => ({
        acknowledged,
        employeeId,
      })),
    };
  }
}

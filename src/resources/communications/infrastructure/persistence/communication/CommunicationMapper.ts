import type { CommunicationDto } from '../../../application/dataStructures/CommunicationDto';
import type { CommunicationItemCreateDto } from '../../../application/dataStructures/CommunicationItemCreateDto';
import type { CommunicationItemDto } from '../../../application/dataStructures/CommunicationItemDto';
import type { CommunicationEntity } from './CommunicationEntity';
import type { CommunicationItemEntity } from './CommunicationItemEntity';
import type { NewCommunicationItemEntity } from './NewCommunicationItemEntity';
import type { UpdatableCommunicationItemEntity } from './UpdatableCommunicationItemEntity';

export class CommunicationMapper {
  static toDto(entity: CommunicationEntity): CommunicationDto {
    return {
      contactId: entity.contactId,
      id: entity.id,
    };
  }

  static toItemDto(entity: CommunicationItemEntity): CommunicationItemDto {
    return {
      acknowledgement: entity.acknowledgement.map(({ acknowledged, employeeId }) => ({
        acknowledged,
        employeeId,
      })),
      communicationId: entity.communicationId,
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

  static toNewItemEntity(entity: CommunicationItemCreateDto): NewCommunicationItemEntity {
    const { senderId, ...payload } = entity.payload as {
      senderId?: string;
      [key: string]: any;
    };

    return {
      communicationId: entity.communicationId,
      payload: payload as any,
      senderId,
      type: entity.type,
      createdAt: entity.createdAt,
      acknowledgement: entity.acknowledgement.map(({ acknowledged, employeeId }) => ({
        acknowledged,
        employeeId,
      })),
    };
  }

  static toUpdateItemEntity(entity: CommunicationItemDto): UpdatableCommunicationItemEntity {
    const { senderId, ...payload } = entity.payload as {
      senderId?: string;
      [key: string]: any;
    };

    return {
      communicationId: entity.communicationId,
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

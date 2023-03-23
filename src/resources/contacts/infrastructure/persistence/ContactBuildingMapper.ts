import type { ContactBuildingCreateDto } from '../../application/dataStructures/ContactBuildingCreateDto';
import type { ContactBuildingDto } from '../../application/dataStructures/ContactBuildingDto';
import type { ContactBuildingUpdateDto } from '../../application/dataStructures/ContactBuildingUpdateDto';
import type { ContactBuildingEntity } from './ContactBuildingEntity';
import type { NewContactBuildingEntity } from './NewContactBuildingEntity';
import type { UpdatableContactBuildingEntity } from './UpdatableContactBuildingEntity';

export class ContactBuildingMapper {
  static toDto(entity: ContactBuildingEntity): ContactBuildingDto {
    return {
      buildingId: entity.buildingId,
      contactId: entity.contactId,
      createdAt: entity.createdAt,
      id: entity.id,
      notes: entity.notes,
      source: entity.source,
    };
  }

  static toNewEntity(entity: ContactBuildingCreateDto): NewContactBuildingEntity {
    return {
      buildingId: entity.buildingId,
      contactId: entity.contactId,
      notes: entity.notes,
      source: entity.source,
    };
  }

  static toUpdateEntity(entity: ContactBuildingUpdateDto): UpdatableContactBuildingEntity {
    return {
      id: entity.id,
      buildingId: entity.buildingId,
      contactId: entity.contactId,
      notes: entity.notes,
      source: entity.source,
    };
  }
}

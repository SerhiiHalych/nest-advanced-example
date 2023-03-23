import type { ContactCreateDto } from '../../application/dataStructures/ContactCreateDto';
import type { ContactDto } from '../../application/dataStructures/ContactDto';
import type { ContactUpdateDto } from '../../application/dataStructures/ContactUpdateDto';
import type { ContactEntity } from './ContactEntity';
import type { NewContactEntity } from './NewContactEntity';
import type { UpdatableContactEntity } from './UpdatableContactEntity';

export class ContactMapper {
  static toDto(entity: ContactEntity): ContactDto {
    return {
      acquisitionData: entity.acquisitionData,
      assigneeId: entity.assigneeId,
      cameFrom: entity.cameFrom,
      contactStyle: entity.contactStyle,
      createdAt: entity.createdAt,
      email: entity.email,
      emailIsConfirmed: entity.emailIsConfirmed,
      externalId: entity.externalId,
      firstName: entity.firstName,
      id: entity.id,
      lastName: entity.lastName,
      ownerId: entity.ownerId,
      phone: entity.phone,
      phoneIsConfirmed: entity.phoneIsConfirmed,
    };
  }

  static toNewEntity(entity: ContactCreateDto): NewContactEntity {
    return {
      acquisitionData: entity.acquisitionData,
      assigneeId: entity.assigneeId,
      cameFrom: entity.cameFrom,
      contactStyle: entity.contactStyle,
      email: entity.email,
      emailIsConfirmed: entity.emailIsConfirmed,
      externalId: entity.externalId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      ownerId: entity.ownerId,
      phone: entity.phone,
      phoneIsConfirmed: entity.phoneIsConfirmed,
      createdAt: entity.createdAt,
    };
  }

  static toUpdateEntity(entity: ContactUpdateDto): UpdatableContactEntity {
    return {
      id: entity.id,
      acquisitionData: entity.acquisitionData,
      assigneeId: entity.assigneeId,
      cameFrom: entity.cameFrom,
      contactStyle: entity.contactStyle,
      email: entity.email,
      emailIsConfirmed: entity.emailIsConfirmed,
      externalId: entity.externalId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      ownerId: entity.ownerId,
      phone: entity.phone,
      phoneIsConfirmed: entity.phoneIsConfirmed,
    };
  }
}

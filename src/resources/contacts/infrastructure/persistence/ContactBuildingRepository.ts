import { In } from 'typeorm';
import { AbstractRepository, EntityRepository } from 'typeorm';

import { runChunksSequentiallyAndFlatten } from '../../../../common/utils/runChunksSequentiallyAndFlatten';
import type { IContactBuildingRepository } from '../../application/boundaries/IContactBuildingRepository';
import type { ContactBuildingCreateDto } from '../../application/dataStructures/ContactBuildingCreateDto';
import type { ContactBuildingDto } from '../../application/dataStructures/ContactBuildingDto';
import type { ContactBuildingUpdateDto } from '../../application/dataStructures/ContactBuildingUpdateDto';
import { ContactBuildingEntity } from './ContactBuildingEntity';
import { ContactBuildingMapper } from './ContactBuildingMapper';

@EntityRepository(ContactBuildingEntity)
export class ContactBuildingRepository
  extends AbstractRepository<ContactBuildingEntity>
  implements IContactBuildingRepository
{
  async findByContactIdAndNotes(contactId: string, content: string): Promise<ContactBuildingDto[]> {
    const contactBuildingItemEntities = await this.repository
      .createQueryBuilder('contactBuilding')
      .where(`"contactBuilding"."notes" LIKE :content`, { content: `%${content}%` })
      .andWhere(`"contactBuilding"."contactId" = :contactId`, { contactId })
      .getMany();

    return contactBuildingItemEntities.map(ContactBuildingMapper.toDto);
  }

  async findByContactAndBuildingId(contactId: string, buildingId: string): Promise<ContactBuildingDto | null> {
    const contactEntity = await this.repository.findOne({
      where: {
        contactId,
        buildingId,
      },
    });

    if (!contactEntity) {
      return null;
    }

    return ContactBuildingMapper.toDto(contactEntity);
  }

  async listByContactAndBuildingIds(contactId: string, buildingIds: string[]): Promise<ContactBuildingDto[]> {
    const contactEntities = await this.repository.find({
      where: {
        contactId,
        buildingId: In(buildingIds),
      },
    });

    return contactEntities.map(ContactBuildingMapper.toDto);
  }

  async listByBuildingIds(buildingIds: string[]): Promise<ContactBuildingDto[]> {
    if (buildingIds.length === 0) {
      return [];
    }

    const contactBuildingEntities = await runChunksSequentiallyAndFlatten(buildingIds, 500, chunk =>
      this.repository.find({
        where: {
          buildingId: In(chunk),
        },
      })
    );

    return contactBuildingEntities.map(ContactBuildingMapper.toDto);
  }

  async listByContactBuildingsAndContactId(buildingIds: string[], contactId: string): Promise<ContactBuildingDto[]> {
    if (buildingIds.length === 0) {
      return [];
    }

    const contactEntities = await this.repository.find({
      where: {
        id: In(buildingIds),
        contactId,
      },
    });

    return contactEntities.map(ContactBuildingMapper.toDto);
  }

  async listByIds(ids: string[]): Promise<ContactBuildingDto[]> {
    if (ids.length === 0) {
      return [];
    }

    const contactEntities = await this.repository.find({
      where: {
        id: In(ids),
      },
    });

    return contactEntities.map(ContactBuildingMapper.toDto);
  }

  async findById(id: string): Promise<ContactBuildingDto | null> {
    const contactEntity = await this.repository.findOne({
      where: {
        id,
      },
    });

    if (!contactEntity) {
      return null;
    }

    return ContactBuildingMapper.toDto(contactEntity);
  }

  async update(contact: ContactBuildingUpdateDto): Promise<void> {
    const applyInquiryEntityToSave = ContactBuildingMapper.toUpdateEntity(contact);

    await this.repository.save(applyInquiryEntityToSave);
  }

  async create(data: ContactBuildingCreateDto): Promise<ContactBuildingDto> {
    const applyInquiryEntityToSave = ContactBuildingMapper.toNewEntity(data);

    const savedContactBuildingEntity = await this.repository.save(applyInquiryEntityToSave);

    const applyInquiryEntity = await this.repository.findOneOrFail({
      where: {
        id: savedContactBuildingEntity.id,
      },
    });

    return ContactBuildingMapper.toDto(applyInquiryEntity);
  }

  async createBulk(data: ContactBuildingCreateDto[]): Promise<string[]> {
    if (data.length === 0) {
      return;
    }

    const buildingEntityToSave = data.map(ContactBuildingMapper.toNewEntity);

    const identifiers = await runChunksSequentiallyAndFlatten(buildingEntityToSave, 500, async chunk => {
      const result = await this.repository.insert(chunk);

      return result.identifiers;
    });

    return identifiers.map(object => Object.values(object)[0]);
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

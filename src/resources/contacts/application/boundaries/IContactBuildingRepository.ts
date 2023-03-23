import type { ContactBuildingCreateDto } from '../dataStructures/ContactBuildingCreateDto';
import type { ContactBuildingDto } from '../dataStructures/ContactBuildingDto';

export interface IContactBuildingRepository {
  findById(id: string): Promise<ContactBuildingDto | null>;

  findByContactAndBuildingId(contactId: string, buildingId: string): Promise<ContactBuildingDto | null>;

  findByContactIdAndNotes(contactId: string, content): Promise<ContactBuildingDto[] | null>;

  listByContactAndBuildingIds(contactId: string, buildingIds: string[]): Promise<ContactBuildingDto[]>;

  listByContactBuildingsAndContactId(contactBuildingIds: string[], contactId: string): Promise<ContactBuildingDto[]>;

  create(data: ContactBuildingCreateDto): Promise<ContactBuildingDto>;

  createBulk(data: ContactBuildingCreateDto[]): Promise<string[]>;

  update(data: ContactBuildingDto): Promise<void>;

  listByIds(ids: string[]): Promise<ContactBuildingDto[]>;

  deleteById(id: string): Promise<void>;

  listByBuildingIds(buildingIds: string[]): Promise<ContactBuildingDto[]>;
}

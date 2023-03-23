import type { ContactCreateDto } from '../dataStructures/ContactCreateDto';
import type { ContactDto } from '../dataStructures/ContactDto';
import type { ContactUpdateDto } from '../dataStructures/ContactUpdateDto';

export interface IContactRepository {
  findById(id: string): Promise<ContactDto | null>;

  findByEmailOrPhone(params: { email?: string; phone?: string; omitContactId?: string }): Promise<ContactDto | null>;

  update(contact: ContactDto): Promise<void>;

  create(data: ContactCreateDto): Promise<ContactDto>;

  checkAreExistsByExternalId(externalIds: string[]): Promise<Record<string, string>>;

  checkAreExistsByEmail(emails: string[]): Promise<Record<string, string>>;

  checkAreExistsByPhone(phones: string[]): Promise<Record<string, string>>;

  bulkCreate(data: ContactCreateDto[]): Promise<string[]>;

  bulkUpdate(contacts: ContactUpdateDto[]): Promise<void>;

  listContacts(params: {
    ids: string[] | null;
    searchString?: string;
    ownerId?: string;
    skip: number;
    take: number;
  }): Promise<{
    items: ContactDto[];
    totalCount: number;
  }>;

  listContactsByIds(ids: string[]): Promise<ContactDto[]>;

  findByExternalId(externalId: string): Promise<ContactDto | null>;

  listContactIdsByLatestMessages(
    employeeId: string,
    filterOptions?: {
      targetContactId?: string;
      source?: 'SMS' | 'EMAIL' | 'PRIVATE_NOTES' | 'BUILDING_CHATS' | 'REQUEST_MESSAGES' | 'OTHER_SYSTEM_MESSAGES';
      search?: string;
    }
  ): Promise<string[]>;

  findByEmployeeId(employeeId: string): Promise<ContactDto[]>;

  listByIds(ids: string[]): Promise<ContactDto[]>;
}

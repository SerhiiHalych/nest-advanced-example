import type { EventType } from '../../../../common/application/EventType';
import type { CommunicationDto } from '../dataStructures/CommunicationDto';
import type { CommunicationItemCreateDto } from '../dataStructures/CommunicationItemCreateDto';
import type {
  CommunicationItemDto,
  IncomingEmailCommunicationItemDto,
  IncomingSmsCommunicationItemDto,
  OutgoingEmailCommunicationItemDto,
  OutgoingSmsCommunicationItemDto,
} from '../dataStructures/CommunicationItemDto';
import type { CommunicationItemType } from '../enum/CommunicationItemType';

export interface ICommunicationRepository {
  create(contactId: string): Promise<CommunicationDto>;

  bulkCreate(contactIds: string[]): Promise<void>;

  findByContactId(id: string): Promise<CommunicationDto | null>;

  listByContactIds(ids: string[]): Promise<Record<string, string>>;

  findItemById(id: string): Promise<CommunicationItemDto | null>;

  findById(id: string): Promise<CommunicationDto | null>;

  findByCommunicationIdAndContent(communicationId: string, content: string): Promise<CommunicationItemDto[]>;

  createItem(data: CommunicationItemCreateDto): Promise<CommunicationItemDto>;

  bulkCreateItems(data: CommunicationItemCreateDto[]): Promise<void>;

  updateItem(data: CommunicationItemDto): Promise<void>;

  bulkUpdateItems(data: CommunicationItemDto[]): Promise<void>;

  listItemsByContactId(
    contactId: string,
    targetMessageId: string | null,
    direction: 'UP' | 'DOWN' | null,
    acknowledgerId: string,
    filterOptions?: {
      sources?: Array<CommunicationItemType>;
    }
  ): Promise<CommunicationItemDto[]>;

  listItemsByIds(ids: string[]): Promise<CommunicationItemDto[]>;

  listEmailsByExternaiId(
    emailExternalIds: string[]
  ): Promise<Array<OutgoingEmailCommunicationItemDto | IncomingEmailCommunicationItemDto>>;

  findThreadForEmail(
    emailId: string
  ): Promise<Array<OutgoingEmailCommunicationItemDto | IncomingEmailCommunicationItemDto>>;

  countUnacknowledgedItemsForEmployeeGrouped(employeeId: string): Promise<
    Array<{
      communicationItemType: CommunicationItemType;
      systemMessageType: EventType | null;
      unacknowledgedItemsCount: number;
    }>
  >;

  listUnacknowledgedItemsForEmployeeByContacts(
    employeeId: string,
    contactIds: string[]
  ): Promise<Record<string, CommunicationItemDto[]>>;

  listUnacknowledgedItemsForEmployeeByContact(employeeId: string, contactId: string): Promise<CommunicationItemDto[]>;

  listLastItemByContacts(contactIds: string[]): Promise<Record<string, CommunicationItemDto>>;

  getLastItemByContact(contactId: string): Promise<CommunicationItemDto | null>;

  findSmsByExternalId(
    externalId: string
  ): Promise<IncomingSmsCommunicationItemDto | OutgoingSmsCommunicationItemDto | null>;

  countUnacknowledgedItemsForEmployeeForContact(employeeId: string, contactId: string): Promise<number>;

  countUnacknowledgedItemsForEmployee(employeeId: string): Promise<number>;

  findEmailByAttachmentId(
    attachmentId: string
  ): Promise<OutgoingEmailCommunicationItemDto | IncomingEmailCommunicationItemDto | null>;
}

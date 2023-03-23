import type { BuildingChatDto } from '../dataStructures/BuildingChatDto';
import type { BuildingChatItemCreateDto } from '../dataStructures/BuildingChatItemCreateDto';
import type { BuildingChatItemDto } from '../dataStructures/BuildingChatItemDto';
import type { BuildingChatItemType } from '../enum/BuildingChatItemType';

export interface IBuildingChatRepository {
  create(contactBuildingId: string): Promise<BuildingChatDto>;

  findById(id: string): Promise<BuildingChatDto | null>;

  listByIds(ids: string[]): Promise<BuildingChatDto[]>;

  findByContactBuildingId(id: string): Promise<BuildingChatDto | null>;

  createItem(data: BuildingChatItemCreateDto): Promise<BuildingChatItemDto>;

  updateItem(data: BuildingChatItemDto): Promise<void>;

  listItemsByContactBuildingId(
    contactBuildingId: string,
    targetMessageId: string | null,
    acknowledgerId: string,
    direction: 'UP' | 'DOWN' | null
  ): Promise<BuildingChatItemDto[]>;

  listBuildingChatsByContactId(contactId: string): Promise<
    Array<{
      buildingChat: BuildingChatDto;
      latestMessage: BuildingChatItemDto;
    }>
  >;

  countUnreadMessagesForBuildingChats(
    buildingChatIds: string[],
    acknowledgerId: string
  ): Promise<
    Array<{
      buildingChatId: string;
      unreadMessagesCount: number;
    }>
  >;

  countUnacknowledgedItemsForEmployeeGrouped(employeeId: string): Promise<
    Array<{
      buildingChatItemType: BuildingChatItemType;
      unacknowledgedItemsCount: number;
    }>
  >;

  countUnacknowledgedItemsForEmployee(employeeId: string): Promise<number>;

  listUnacknowledgedItemsForEmployeeByContacts(
    employeeId: string,
    contactIds: string[]
  ): Promise<Record<string, BuildingChatItemDto[]>>;

  listUnacknowledgedItemsForEmployeeByContact(employeeId: string, contactId: string): Promise<BuildingChatItemDto[]>;

  listLastItemByContacts(contactIds: string[]): Promise<Record<string, BuildingChatItemDto>>;

  getLastItemByContact(contactId: string): Promise<BuildingChatItemDto | null>;

  countUnacknowledgedItemsForEmployeeForContact(employeeId: string, contactId: string): Promise<number>;

  bulkUpdateItems(data: BuildingChatItemDto[]): Promise<void>;

  listItemsByIds(ids: string[]): Promise<BuildingChatItemDto[]>;
}

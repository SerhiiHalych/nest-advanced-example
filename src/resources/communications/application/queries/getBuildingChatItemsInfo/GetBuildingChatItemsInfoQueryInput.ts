export interface GetBuildingChatItemsInfoQueryInput {
  contactId: string;
  buildingId: string;
  targetMessageId: string | null;
  direction: 'UP' | 'DOWN' | null;
}

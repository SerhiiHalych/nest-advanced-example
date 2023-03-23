import type { CommunicationItemType } from '../../enum/CommunicationItemType';

export interface GetCommunicationItemsInfoQueryInput {
  contactId: string;
  targetMessageId: string | null;
  direction: 'UP' | 'DOWN' | null;
  sources?: Array<CommunicationItemType>;
}

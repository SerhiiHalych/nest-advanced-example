import type { CommunicationItemType } from '../../../../communications/application/enum/CommunicationItemType';

export interface SearchContentQueryResult {
  messages: {
    id: string;
    payload: any;
    type: CommunicationItemType;
  }[];
}

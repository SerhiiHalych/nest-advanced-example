import type { CommunicationItemType } from '../../../../communications/application/enum/CommunicationItemType';

export class SearchContentResponse {
  messages: {
    id: string;
    payload: any;
    type: CommunicationItemType;
  }[];
}

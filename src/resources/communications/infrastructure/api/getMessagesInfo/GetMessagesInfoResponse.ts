import type { CommunicationItemType } from '../../../application/enum/CommunicationItemType';

export class GetMessagesInfoResponse {
  messages: {
    id: string;
    type: CommunicationItemType;
    payload: any;
    createdAt: Date;
    acknowledged: boolean;
  }[];
}

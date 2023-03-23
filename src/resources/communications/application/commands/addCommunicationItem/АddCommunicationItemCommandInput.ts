import type { CommunicationItemType } from '../../enum/CommunicationItemType';

export interface AddCommunicationItemCommandInput {
  contactId: string;
  payload: {
    text?: string;
    cc?: string[];
    bcc?: string[];
    subject?: string;
    attachments?: Array<{
      fileData: Buffer;
      fileExtension: string;
      fileSize: number;
      fileName: string;
    }>;
    replyTo?: string;
  };
  type: CommunicationItemType.OUTGOING_SMS | CommunicationItemType.OUTGOING_EMAIL | CommunicationItemType.PRIVATE_NOTES;
}

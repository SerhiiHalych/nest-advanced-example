export interface CommunicationFileRawData {
  From: string;
  To: string;
  Body: string | null;
  Status: 'delivered' | 'received' | 'sent' | 'undelivered';
  SentDate: string;
  ApiVersion: string;
  NumSegments: number;
  ErrorCode: any;
  AccountSid: string;
  Sid: string;
  Direction: 'outbound-api' | 'inbound';
  Price: string;
  PriceUnit: string;
}

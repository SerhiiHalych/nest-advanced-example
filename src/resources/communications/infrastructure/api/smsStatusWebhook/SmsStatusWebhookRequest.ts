import type { TwilioMessageStatus } from '../../../application/enum/TwilioMessageStatus';

/* eslint-disable @typescript-eslint/naming-convention */
export interface SmsStatusWebhookRequestBody {
  ErrorCode?: string;
  SmsSid: string;
  SmsStatus: TwilioMessageStatus;
  MessageStatus: TwilioMessageStatus;
  To: string;
  MessageSid: string;
  AccountSid: string;
  From: string;
  ApiVersion: string;
}

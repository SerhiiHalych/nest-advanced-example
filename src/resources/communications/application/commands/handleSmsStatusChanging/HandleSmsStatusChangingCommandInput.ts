import type { TwilioMessageStatus } from '../../enum/TwilioMessageStatus';

export interface HandleSmsStatusChangingCommandInput {
  twilioSignature: string;
  body: {
    ErrorCode?: string;
    SmsSid: string;
    SmsStatus: TwilioMessageStatus;
    MessageStatus: TwilioMessageStatus;
    To: string;
    MessageSid: string;
    AccountSid: string;
    From: string;
    ApiVersion: string;
  };
}

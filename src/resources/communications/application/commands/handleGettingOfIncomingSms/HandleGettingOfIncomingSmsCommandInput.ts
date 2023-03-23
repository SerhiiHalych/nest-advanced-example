export interface HandleGettingOfIncomingSmsCommandInput {
  twilioSignature: string;
  body: {
    ToCountry: string;
    ToState: string;
    SmsMessageSid: string;
    NumMedia: number;
    ToCity: string;
    FromZip: string;
    SmsSid: string;
    FromState: string;
    SmsStatus: string;
    FromCity: string;
    Body: string;
    FromCountry: string;
    To: string;
    ToZip: string;
    NumSegments: number;
    ReferralNumMedia: number;
    MessageSid: string;
    AccountSid: string;
    From: string;
    ApiVersion: string;
  };
}

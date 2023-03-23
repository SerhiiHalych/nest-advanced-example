interface TwilioConfiguration {
  accountSid: string;
  authToken: string;
  phone: string;
}

const twilioConfig = (): { twilio: TwilioConfiguration } => ({
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phone: process.env.TWILIO_PHONE,
  },
});

export default twilioConfig;

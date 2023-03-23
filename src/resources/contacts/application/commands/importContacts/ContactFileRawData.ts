export interface ContactFileRawData {
  id: string;
  campaign: string;
  created_at: number;
  device: string;
  email: string;
  emailVerified: 'false' | 'true';
  firstName: string;
  gaUser: string;
  gclid: string;
  lastName: string;
  medium: string;
  phone: string;
  phoneVerified: 'false' | 'true';
  referredBy: string;
  referredbyID: string;
  source: string;
  stytchId: string;
  term: string;
  unsubscribed: 'true';
}

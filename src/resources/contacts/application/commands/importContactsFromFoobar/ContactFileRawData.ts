export interface ContactFileRawData {
  id: string;
  createdAt: number;
  email: string;
  emailVerified: 'false' | 'true';
  givenName: string;
  familyName: string;
  phoneNumber: string;
  phoneVerified: 'false' | 'true';
  referredBy: string;
  stytchId: string;

  referralCode: any;
  updatedAt: any;
  signedUp: any;
  typeformSubmitted: any;
  emailCode: any;
  role: any;
  markForDeletion: any;
  fbToken: any;
  featureFlags: any;
}

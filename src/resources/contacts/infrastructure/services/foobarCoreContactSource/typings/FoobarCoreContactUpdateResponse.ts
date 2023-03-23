export interface FoobarCoreContactUpdateResponse {
  data: {
    id: string;
    stytchId: string;
    givenName: string | null;
    familyName: string | null;
    email: string | null;
    signedUp: boolean;
    referredBy: string | null;
    referralCode: string;
    typeformSubmitted: boolean;
    emailVerified: boolean;
    emailCode: string;
    phoneNumber: string | null;
    phoneVerified: boolean;
    role: string | null;
    fbToken: string | null;
    markForDeletion: boolean | null;
    featureFlags: string[];
    createdAt: Date;
    updatedAt: Date;
  };
}

import { ContactCreateDto } from '../dataStructures/ContactCreateDto';
import { ContactDto } from '../dataStructures/ContactDto';

export interface IContactExternalSource {
  create(data: ContactCreateDto): Promise<{
    externalId: string;
    stytchId: string;
    givenName: string | null;
    familyName: string | null;
    email: string | null;
    referredBy: string | null;
    referralCode: string;
    emailVerified: boolean;
    phoneNumber: string | null;
    phoneVerified: boolean;
  }>;

  update(
    externalId: string,
    data: ContactDto
  ): Promise<{
    externalId: string;
    stytchId: string;
    givenName: string | null;
    familyName: string | null;
    email: string | null;
    referredBy: string | null;
    referralCode: string;
    emailVerified: boolean;
    phoneNumber: string | null;
    phoneVerified: boolean;
  }>;
}

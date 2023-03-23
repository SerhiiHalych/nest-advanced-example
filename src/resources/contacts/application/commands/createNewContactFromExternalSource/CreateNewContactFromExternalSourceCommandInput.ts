import type { AcquisitionChannel } from '../../enum/AcquisitionChannel';
import type { CommunicationPreference } from '../../enum/CommunicationPreference';

export interface CreateNewContactFromExternalSourceCommandInput {
  externalContactId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  contactStyle?: CommunicationPreference[];
  cameFrom?: AcquisitionChannel | null;
  phoneIsConfirmed: boolean;
  emailIsConfirmed: boolean;
  acquisitionData: {
    signUpLink?: string;
    acquisitionChannel?: string;
    foobarId: string;
    stytchId?: string;
    referredBy?: string;
    gAId?: string;
    source?: string;
    campaign?: string;
    term?: string;
    medium?: string;
    userIP?: string;
    device?: string;
    gclId?: string;
  };
}

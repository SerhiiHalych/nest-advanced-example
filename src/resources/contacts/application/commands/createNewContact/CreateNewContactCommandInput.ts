import type { AcquisitionChannel } from '../../enum/AcquisitionChannel';
import type { CommunicationPreference } from '../../enum/CommunicationPreference';

export interface CreateNewContactCommandInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  contactStyle: CommunicationPreference[];
  cameFrom: AcquisitionChannel | null;
}

import type { AcquisitionChannel } from '../enum/AcquisitionChannel';
import type { CommunicationPreference } from '../enum/CommunicationPreference';
import type { AcquisitionDataDto } from './AcquisitionDataDto';

export interface ContactDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  phoneIsConfirmed: boolean;
  emailIsConfirmed: boolean;
  contactStyle: CommunicationPreference[];
  cameFrom: AcquisitionChannel | null;
  ownerId: string | null;
  assigneeId: string | null;
  acquisitionData: AcquisitionDataDto | null;
  createdAt: Date;
  externalId: string | null;
}

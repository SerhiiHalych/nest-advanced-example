import type { OmitTyped } from '../../../../../common/types/OmitTyped';
import type { NewCommunicationItemAcknowledgementEntity } from './communicationItemAcknowledgement/NewCampaignContactBuildingEntity';
import type { CommunicationItemEntity } from './CommunicationItemEntity';

export type NewCommunicationItemEntity = OmitTyped<
  CommunicationItemEntity,
  'id' | 'communication' | 'sender' | 'updatedAt' | 'acknowledgement'
> & {
  acknowledgement: NewCommunicationItemAcknowledgementEntity[];
  createdAt?: Date;
};

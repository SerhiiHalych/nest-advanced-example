import type { OmitTyped } from '../../../../../common/types/OmitTyped';
import type { NewCommunicationItemAcknowledgementEntity } from './communicationItemAcknowledgement/NewCampaignContactBuildingEntity';
import type { CommunicationItemEntity } from './CommunicationItemEntity';

export type UpdatableCommunicationItemEntity = OmitTyped<
  CommunicationItemEntity,
  'createdAt' | 'communication' | 'sender' | 'updatedAt' | 'acknowledgement'
> & {
  acknowledgement: NewCommunicationItemAcknowledgementEntity[];
};

import type { OmitTyped } from '../../../../../../common/types/OmitTyped';
import type { CommunicationItemAcknowledgementEntity } from './CommunicationItemAcknowledgementEntity';

export type NewCommunicationItemAcknowledgementEntity = OmitTyped<
  CommunicationItemAcknowledgementEntity,
  'communicationItem' | 'communicationItemId' | 'employee'
>;

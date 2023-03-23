import type { OmitTyped } from '../../../../common/types/OmitTyped';
import type { CommunicationItemDto } from './CommunicationItemDto';

export type CommunicationItemCreateDto = OmitTyped<CommunicationItemDto, 'id' | 'createdAt'> & {
  createdAt?: Date;
};

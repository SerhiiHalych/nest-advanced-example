import type { OmitTyped } from '../../../../common/types/OmitTyped';
import type { ContactDto } from './ContactDto';

export type ContactCreateDto = OmitTyped<ContactDto, 'id' | 'createdAt'> & {
  createdAt?: Date;
};

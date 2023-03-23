import type { OmitTyped } from '../../../../common/types/OmitTyped';
import type { ContactDto } from './ContactDto';

export type ContactUpdateDto = OmitTyped<ContactDto, 'createdAt'>;

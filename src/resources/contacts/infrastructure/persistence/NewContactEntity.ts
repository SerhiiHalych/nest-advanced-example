import type { OmitTyped } from '../../../../common/types/OmitTyped';
import type { ContactEntity } from './ContactEntity';

export type NewContactEntity = OmitTyped<ContactEntity, 'id' | 'updatedAt' | 'assignee' | 'owner'>;

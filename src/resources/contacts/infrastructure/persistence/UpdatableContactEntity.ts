import type { OmitTyped } from '../../../../common/types/OmitTyped';
import type { ContactEntity } from './ContactEntity';

export type UpdatableContactEntity = OmitTyped<ContactEntity, 'createdAt' | 'updatedAt' | 'assignee' | 'owner'>;

import type { OmitTyped } from '../../../../common/types/OmitTyped';
import type { ContactBuildingEntity } from './ContactBuildingEntity';

export type UpdatableContactBuildingEntity = OmitTyped<
  ContactBuildingEntity,
  'createdAt' | 'updatedAt' | 'building' | 'contact'
>;

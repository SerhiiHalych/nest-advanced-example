import type { OmitTyped } from '../../../../common/types/OmitTyped';
import type { ContactBuildingEntity } from './ContactBuildingEntity';

export type NewContactBuildingEntity = OmitTyped<
  ContactBuildingEntity,
  'id' | 'createdAt' | 'updatedAt' | 'building' | 'contact'
>;

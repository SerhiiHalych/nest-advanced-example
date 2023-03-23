import type { OmitTyped } from '../../../../common/types/OmitTyped';
import type { BuildingEntity } from './BuildingEntity';

export type NewBuildingEntity = OmitTyped<BuildingEntity, 'id' | 'createdAt' | 'updatedAt'>;

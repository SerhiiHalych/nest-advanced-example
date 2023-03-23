import type { OmitTyped } from '../../../../common/types/OmitTyped';
import type { BuildingDto } from './BuildingDto';

export type BuildingCreateDto = OmitTyped<BuildingDto, 'id'>;

import type { OmitTyped } from '../../../../common/types/OmitTyped';
import type { ContactBuildingDto } from './ContactBuildingDto';

export type ContactBuildingCreateDto = OmitTyped<ContactBuildingDto, 'id' | 'createdAt'>;

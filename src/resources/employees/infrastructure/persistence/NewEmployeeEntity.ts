import type { OmitTyped } from '../../../../common/types/OmitTyped';
import type { EmployeeEntity } from './EmployeeEntity';

export type NewEmployeeEntity = OmitTyped<EmployeeEntity, 'id' | 'createdAt' | 'updatedAt' | 'team' | 'user'>;

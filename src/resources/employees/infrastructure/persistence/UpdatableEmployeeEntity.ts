import type { OmitTyped } from '../../../../common/types/OmitTyped';
import type { EmployeeEntity } from './EmployeeEntity';

export type UpdatableEmployeeEntity = OmitTyped<EmployeeEntity, 'createdAt' | 'updatedAt' | 'team' | 'user'>;

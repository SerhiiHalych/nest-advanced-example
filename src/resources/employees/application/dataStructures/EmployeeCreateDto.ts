import type { OmitTyped } from '../../../../common/types/OmitTyped';
import type { EmployeeDto } from './EmployeeDto';

export type EmployeeCreateDto = OmitTyped<EmployeeDto, 'id' | 'team' | 'createdAt'>;

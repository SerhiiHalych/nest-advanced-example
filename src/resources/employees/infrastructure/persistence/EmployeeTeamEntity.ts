import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../../../common/infrastructure/persistance/base.entity';
import { EmployeeRole } from '../../application/enums/EmployeeRole';

/**
 * This entity purpose is to cover Employee functions
 * such as:
 * - capacity management
 * - roles management
 * - any other function that is unrelated
 *   to User but should be handled
 */
@Entity({ name: 'employee_team' })
export class EmployeeTeamEntity extends BaseEntity {
  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'enum', enum: EmployeeRole })
  role: EmployeeRole;
}

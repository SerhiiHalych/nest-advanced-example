import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { BaseEntity } from '../../../../common/infrastructure/persistance/base.entity';
import { UserEntity } from '../../../users/infrastructure/persistence/UserEntity';
import { EmployeeRole } from '../../application/enums/EmployeeRole';
import { EmployeeTeamEntity } from './EmployeeTeamEntity';

/**
 * This entity purpose is to cover Employee functions
 * such as:
 * - capacity management
 * - roles management
 * - any other function that is unrelated
 *   to User but should be handled
 */
@Entity({ name: 'employee' })
export class EmployeeEntity extends BaseEntity {
  @Column({ type: 'boolean' })
  isAvailable: boolean;

  @Column({ type: 'boolean' })
  isArchived: boolean;

  @Column({
    type: 'enum',
    enum: EmployeeRole,
    default: [EmployeeRole.COLLABORATORS],
    array: true,
  })
  roles: EmployeeRole[];

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'uuid', nullable: true })
  teamId: string | null;

  @ManyToOne(() => EmployeeTeamEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'teamId' })
  team: EmployeeTeamEntity | null;
}

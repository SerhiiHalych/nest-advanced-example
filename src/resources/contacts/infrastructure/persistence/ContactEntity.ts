import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../../common/infrastructure/persistance/base.entity';
import { EmployeeEntity } from '../../../employees/infrastructure/persistence/EmployeeEntity';
import type { AcquisitionDataDto } from '../../application/dataStructures/AcquisitionDataDto';
import { AcquisitionChannel } from '../../application/enum/AcquisitionChannel';
import { CommunicationPreference } from '../../application/enum/CommunicationPreference';

@Entity({ name: 'contact' })
export class ContactEntity extends BaseEntity {
  @Column({ type: 'text', nullable: true })
  firstName: string | null;

  @Column({ type: 'text', nullable: true })
  lastName: string | null;

  @Column({ type: 'text', nullable: true })
  email: string | null;

  @Column({ default: false })
  emailIsConfirmed: boolean;

  @Column({ type: 'text', nullable: true })
  phone: string | null;

  @Column({ default: false })
  phoneIsConfirmed: boolean;

  @Column({ type: 'uuid', nullable: true })
  externalId: string | null;

  @Column({
    type: 'enum',
    enum: CommunicationPreference,
    default: [],
    array: true,
  })
  contactStyle: CommunicationPreference[];

  @Column({
    type: 'enum',
    enum: AcquisitionChannel,
    nullable: true,
  })
  cameFrom: AcquisitionChannel | null;

  @Column({
    type: 'json',
    nullable: true,
  })
  acquisitionData: AcquisitionDataDto | null;

  @Column({ type: 'uuid', nullable: true })
  ownerId: string | null;

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn({ name: 'ownerId' })
  owner: EmployeeEntity;

  @Column({ type: 'uuid', nullable: true })
  assigneeId: string;

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn({ name: 'assigneeId' })
  assignee: EmployeeEntity;
}

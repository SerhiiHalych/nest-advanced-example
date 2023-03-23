import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { EmployeeEntity } from '../../../../../employees/infrastructure/persistence/EmployeeEntity';
import { CommunicationItemEntity } from '../CommunicationItemEntity';

@Entity({ name: 'communication_item_acknowledgement' })
export class CommunicationItemAcknowledgementEntity {
  @PrimaryColumn('uuid')
  communicationItemId: string;

  @ManyToOne(() => CommunicationItemEntity, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'communicationItemId' })
  communicationItem: CommunicationItemEntity;

  @PrimaryColumn('uuid')
  employeeId: string;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'employeeId' })
  employee: EmployeeEntity;

  @Column({ type: 'boolean', default: false })
  acknowledged: boolean;
}

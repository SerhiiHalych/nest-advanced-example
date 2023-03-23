import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { EmployeeEntity } from '../../../../../employees/infrastructure/persistence/EmployeeEntity';
import { BuildingChatItemEntity } from '../BuildingChatItemEntity';

@Entity({ name: 'building_chat_item_acknowledgement' })
export class BuildingChatItemAcknowledgementEntity {
  @PrimaryColumn('uuid')
  buildingChatItemId: string;

  @ManyToOne(() => BuildingChatItemEntity, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'buildingChatItemId' })
  buildingChatItem: BuildingChatItemEntity;

  @PrimaryColumn('uuid')
  employeeId: string;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'employeeId' })
  employee: EmployeeEntity;

  @Column({ type: 'boolean', default: false })
  acknowledged: boolean;
}

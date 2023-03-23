import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../../../common/infrastructure/persistance/base.entity';
import { EmployeeEntity } from '../../../../employees/infrastructure/persistence/EmployeeEntity';
import { BuildingChatItemType } from '../../../application/enum/BuildingChatItemType';
import { BuildingChatEntity } from './BuildingChatEntity';
import { BuildingChatItemAcknowledgementEntity } from './buildingChatItemAcknowledgement/BuildingChatItemAcknowledgementEntity';

@Entity({ name: 'building_chat_item' })
export class BuildingChatItemEntity extends BaseEntity {
  @Column('uuid')
  buildingChatId: string;

  @ManyToOne(() => BuildingChatEntity)
  @JoinColumn({ name: 'buildingChatId' })
  buildingChat: BuildingChatEntity;

  @Column('uuid', { nullable: true })
  senderId: string | null;

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn({ name: 'senderId' })
  sender: EmployeeEntity | null;

  @Column('json')
  payload: any;

  @Column({ type: 'enum', enum: BuildingChatItemType })
  type: BuildingChatItemType;

  @OneToMany(() => BuildingChatItemAcknowledgementEntity, ({ buildingChatItem }) => buildingChatItem, {
    eager: true,
    cascade: ['insert', 'update', 'remove'],
  })
  acknowledgement: BuildingChatItemAcknowledgementEntity[];
}

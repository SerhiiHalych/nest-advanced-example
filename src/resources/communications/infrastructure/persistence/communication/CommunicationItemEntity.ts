import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../../../common/infrastructure/persistance/base.entity';
import { EmployeeEntity } from '../../../../employees/infrastructure/persistence/EmployeeEntity';
import { CommunicationItemType } from '../../../application/enum/CommunicationItemType';
import { CommunicationEntity } from './CommunicationEntity';
import { CommunicationItemAcknowledgementEntity } from './communicationItemAcknowledgement/CommunicationItemAcknowledgementEntity';

@Entity({ name: 'communication_item' })
export class CommunicationItemEntity extends BaseEntity {
  @Column('uuid')
  communicationId: string;

  @ManyToOne(() => CommunicationEntity)
  @JoinColumn({ name: 'communicationId' })
  communication: CommunicationEntity;

  @Column('uuid', { nullable: true })
  senderId: string | null;

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn({ name: 'senderId' })
  sender: EmployeeEntity | null;

  @Column('json')
  payload: any;

  @Column({ type: 'enum', enum: CommunicationItemType })
  type: CommunicationItemType;

  @OneToMany(() => CommunicationItemAcknowledgementEntity, ({ communicationItem }) => communicationItem, {
    eager: true,
    cascade: ['insert', 'update', 'remove'],
  })
  acknowledgement: CommunicationItemAcknowledgementEntity[];
}

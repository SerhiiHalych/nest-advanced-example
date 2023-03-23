import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { BaseEntity } from '../../../../../common/infrastructure/persistance/base.entity';
import { ContactBuildingEntity } from '../../../../contacts/infrastructure/persistence/ContactBuildingEntity';

@Entity({ name: 'building_chat' })
export class BuildingChatEntity extends BaseEntity {
  @Column('uuid')
  contactBuildingId: string;

  @OneToOne(() => ContactBuildingEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contactBuildingId' })
  contactBuilding: ContactBuildingEntity;
}

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../../common/infrastructure/persistance/base.entity';
import { BuildingSource } from '../../../buildings/application/enum/BuildingSource';
import { BuildingEntity } from '../../../buildings/infrastructure/persistence/BuildingEntity';
import { ContactEntity } from './ContactEntity';

@Entity({ name: 'contact_building' })
export class ContactBuildingEntity extends BaseEntity {
  @Column({
    type: 'text',
    nullable: true,
  })
  notes: string | null;

  @Column({ type: 'uuid' })
  contactId: string;

  @ManyToOne(() => ContactEntity)
  @JoinColumn({ name: 'contactId' })
  contact: ContactEntity;

  @Column({ type: 'uuid' })
  buildingId: string;

  @ManyToOne(() => BuildingEntity)
  @JoinColumn({ name: 'buildingId' })
  building: BuildingEntity;

  @Column({
    enum: BuildingSource,
    type: 'enum',
    default: BuildingSource.DEFAULT,
  })
  source: BuildingSource;
}

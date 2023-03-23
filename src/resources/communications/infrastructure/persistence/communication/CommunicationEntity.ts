import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { BaseEntity } from '../../../../../common/infrastructure/persistance/base.entity';
import { ContactEntity } from '../../../../contacts/infrastructure/persistence/ContactEntity';

@Entity({ name: 'communication' })
export class CommunicationEntity extends BaseEntity {
  @Column('uuid')
  contactId: string;

  @OneToOne(() => ContactEntity)
  @JoinColumn({ name: 'contactId' })
  contact: ContactEntity;
}

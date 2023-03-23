import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../../../common/infrastructure/persistance/base.entity';

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
  @Column()
  externalId: string;

  @Column()
  givenName: string;

  @Column({ type: 'text', nullable: true })
  familyName: string | null;

  @Column()
  email: string;

  @Column()
  picture: string;

  @Column()
  isActive: boolean;
}

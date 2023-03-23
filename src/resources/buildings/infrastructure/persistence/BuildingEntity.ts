import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { FoobarProperty } from '../../application/dataStructures/BuildingDto';

@Entity({ name: 'building' })
export class BuildingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ type: 'json' })
  data: FoobarProperty;

  @Column({ type: 'uuid', nullable: true })
  externalId: string;
}

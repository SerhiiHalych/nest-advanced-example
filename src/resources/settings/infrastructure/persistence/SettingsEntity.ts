import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'settings' })
export class SettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'json' })
  settings: string;
}

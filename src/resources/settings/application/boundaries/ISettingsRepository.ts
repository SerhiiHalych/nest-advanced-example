import type { SettingsDto } from '../dataStructures/SettingsDto';

export interface ISettingsRepository {
  get(): Promise<SettingsDto | null>;

  save(data: SettingsDto): Promise<void>;
}

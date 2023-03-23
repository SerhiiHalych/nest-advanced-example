import type { SettingsDto } from '../../application/dataStructures/SettingsDto';
import type { SettingsEntity } from './SettingsEntity';

export class SettingsMapper {
  static toDto(entity: SettingsEntity): SettingsDto {
    return JSON.parse(entity.settings);
  }

  static toEntity(entity: SettingsDto, id?: string): SettingsEntity {
    return {
      id,
      settings: JSON.stringify(entity),
    };
  }
}

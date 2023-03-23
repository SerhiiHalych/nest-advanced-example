import { AbstractRepository, EntityRepository } from 'typeorm';

import type { ISettingsRepository } from '../../application/boundaries/ISettingsRepository';
import type { SettingsDto } from '../../application/dataStructures/SettingsDto';
import { SettingsEntity } from './SettingsEntity';
import { SettingsMapper } from './SettingsMapper';

@EntityRepository(SettingsEntity)
export class SettingsRepository extends AbstractRepository<SettingsEntity> implements ISettingsRepository {
  async get(): Promise<SettingsDto | null> {
    const settingsEntity = await this.repository.findOne({});

    if (!settingsEntity) {
      const settingsToSave: SettingsDto = {
        google: {
          communicationEmail: null,
          accessToken: null,
          expiryDate: null,
          refreshToken: null,
          scope: null,
          tokenType: null,
        },
        lastGmailHistoryId: null,
      };

      await this.save(settingsToSave);

      return settingsToSave;
    }

    return SettingsMapper.toDto(settingsEntity);
  }

  async save(data: SettingsDto): Promise<void> {
    const settingsEntity = await this.repository.findOne({});

    const settingsEntityToSave = SettingsMapper.toEntity(data, settingsEntity?.id);

    await this.repository.save(settingsEntityToSave);
  }
}

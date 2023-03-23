/* eslint-disable @typescript-eslint/naming-convention */
import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { IGlobalReadDBContext } from '../../../../common/application/IGlobalReadDBContext';
import { BaseType } from '../../../../common/diTokens';
import { GoogleGmailService } from '../../infrastructure/services/GoogleGmailService';

@Injectable()
export class TasksService {
  constructor(
    private googleGmailService: GoogleGmailService,
    @Inject(BaseType.GLOBAL_READ_DB_CONTEXT) private readDbContext: IGlobalReadDBContext
  ) {}

  @Cron('0 0 0 * * *')
  async handleGmailWatch(): Promise<void> {
    const settings = await this.readDbContext.settingsRepository.get();

    if (!settings.google.communicationEmail) {
      return;
    }

    await this.googleGmailService.watchEmailInbox(settings.google.communicationEmail);
  }
}

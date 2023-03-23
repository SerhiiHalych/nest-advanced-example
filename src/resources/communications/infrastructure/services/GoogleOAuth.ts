/* eslint-disable @typescript-eslint/naming-convention */
import { Inject } from '@nestjs/common';
import { google } from 'googleapis';

import { IGlobalReadDBContext } from '../../../../common/application/IGlobalReadDBContext';
import { BaseType } from '../../../../common/diTokens';

export class GoogleOAuth {
  constructor(@Inject(BaseType.GLOBAL_READ_DB_CONTEXT) private readDbContext: IGlobalReadDBContext) {}

  async loadCredentials(): Promise<void> {
    const settings = await this.readDbContext.settingsRepository.get();

    if (!settings.google.communicationEmail) {
      return;
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_OAUTH_ID,
      process.env.GMAIL_OAUTH_SECRET,
      process.env.GMAIL_OAUTH_CALLBACK
    );

    oAuth2Client.setCredentials({
      access_token: settings.google.accessToken,
      expiry_date: settings.google.expiryDate,
      refresh_token: settings.google.refreshToken,
      scope: settings.google.scope,
      token_type: settings.google.tokenType,
    });

    google.options({
      auth: oAuth2Client,
    });
  }
}

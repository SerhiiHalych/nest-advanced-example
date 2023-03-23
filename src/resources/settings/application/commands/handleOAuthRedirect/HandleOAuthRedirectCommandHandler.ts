import { Inject, Injectable, Scope } from '@nestjs/common';
import { google } from 'googleapis';

import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType, ServiceType } from '../../../../../common/diTokens';
import { GoogleGmailService } from '../../../../communications/infrastructure/services/GoogleGmailService';
import { IAuthService } from '../../../../users/application/services/authService/IAuthService';
import type { HandleOAuthRedirectCommandInput } from './HandleOAuthRedirectCommandInput';
import type { IHandleOAuthRedirectCommandHandler } from './IHandleOAuthRedirectCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class HandleOAuthRedirectCommandHandler
  extends AbstractCommandHandler<HandleOAuthRedirectCommandInput, void>
  implements IHandleOAuthRedirectCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  constructor(
    @Inject(ServiceType.AUTH_SERVICE)
    private authService: IAuthService,
    private googleGmailService: GoogleGmailService
  ) {
    super();
  }

  protected async implementation(input: HandleOAuthRedirectCommandInput): Promise<void> {
    const { code } = input;

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_OAUTH_ID,
      process.env.GMAIL_OAUTH_SECRET,
      process.env.GMAIL_OAUTH_CALLBACK
    );

    const { tokens } = await oAuth2Client.getToken(code);

    const settings = await this._dbContext.settingsRepository.get();

    if (settings.google.communicationEmail) {
      await this.googleGmailService.stopWatchingEmailInbox(settings.google.communicationEmail);
    }

    oAuth2Client.setCredentials(tokens);

    google.options({
      auth: oAuth2Client,
    });

    const { email } = await this.authService.authenticate(tokens.access_token);

    const historyId = await this.googleGmailService.watchEmailInbox(email);

    settings.google = {
      communicationEmail: email,
      accessToken: tokens.access_token,
      expiryDate: tokens.expiry_date,
      refreshToken: tokens.refresh_token,
      scope: tokens.scope,
      tokenType: tokens.token_type,
    };
    settings.lastGmailHistoryId = historyId;

    await this._dbContext.settingsRepository.save(settings);
  }
}

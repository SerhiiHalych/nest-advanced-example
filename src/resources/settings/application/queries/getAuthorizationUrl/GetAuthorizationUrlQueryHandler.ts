/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable, Scope } from '@nestjs/common';
import { google } from 'googleapis';

import { AbstractQueryHandler } from '../../../../../common/application/AbstractQueryHandler';
import type { GetAuthorizationUrlQueryInput } from './GetAuthorizationUrlQueryInput';
import type { GetAuthorizationUrlQueryResult } from './GetAuthorizationUrlQueryResult';
import type { IGetAuthorizationUrlQueryHandler } from './IGetAuthorizationUrlQueryHandler';

@Injectable({ scope: Scope.REQUEST })
export class GetAuthorizationUrlQueryHandler
  extends AbstractQueryHandler<GetAuthorizationUrlQueryInput, GetAuthorizationUrlQueryResult>
  implements IGetAuthorizationUrlQueryHandler
{
  protected async implementation(input: GetAuthorizationUrlQueryInput): Promise<GetAuthorizationUrlQueryResult> {
    const { redirectTo } = input;

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_OAUTH_ID,
      process.env.GMAIL_OAUTH_SECRET,
      process.env.GMAIL_OAUTH_CALLBACK
    );

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/userinfo.email'],
      prompt: 'consent',
      state: `redirectTo=${redirectTo}`,
    });

    return {
      url: authUrl,
    };
  }
}

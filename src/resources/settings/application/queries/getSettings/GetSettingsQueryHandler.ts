/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable, Scope } from '@nestjs/common';

import { AbstractQueryHandler } from '../../../../../common/application/AbstractQueryHandler';
import type { GetSettingsQueryResult } from './GetSettingsQueryResult';
import type { IGetSettingsQueryHandler } from './IGetSettingsQueryHandler';

@Injectable({ scope: Scope.REQUEST })
export class GetSettingsQueryHandler
  extends AbstractQueryHandler<void, GetSettingsQueryResult>
  implements IGetSettingsQueryHandler
{
  protected async implementation(): Promise<GetSettingsQueryResult> {
    const settings = await this._dbContext.settingsRepository.get();

    return {
      communicationEmail: settings.google.communicationEmail,
    };
  }
}

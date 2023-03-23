import type { GetSettingsQueryResult } from './GetSettingsQueryResult';

export interface IGetSettingsQueryHandler {
  execute(): Promise<GetSettingsQueryResult>;
}

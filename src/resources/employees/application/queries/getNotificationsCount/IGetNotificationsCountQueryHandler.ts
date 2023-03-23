import type { GetNotificationsCountQueryResult } from './GetNotificationsCountQueryResult';

export interface IGetNotificationsCountQueryHandler {
  execute(): Promise<GetNotificationsCountQueryResult>;
}

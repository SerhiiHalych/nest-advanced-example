import type { GetAuthorizationUrlQueryInput } from './GetAuthorizationUrlQueryInput';
import type { GetAuthorizationUrlQueryResult } from './GetAuthorizationUrlQueryResult';

export interface IGetAuthorizationUrlQueryHandler {
  execute(input: GetAuthorizationUrlQueryInput): Promise<GetAuthorizationUrlQueryResult>;
}

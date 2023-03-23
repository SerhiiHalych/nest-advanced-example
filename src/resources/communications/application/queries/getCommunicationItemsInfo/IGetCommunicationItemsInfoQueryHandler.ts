import type { GetCommunicationItemsInfoQueryInput } from './GetCommunicationItemsInfoQueryInput';
import type { GetCommunicationItemsInfoQueryResult } from './GetCommunicationItemsInfoQueryResult';

export interface IGetCommunicationItemsInfoQueryHandler {
  execute(input: GetCommunicationItemsInfoQueryInput): Promise<GetCommunicationItemsInfoQueryResult>;
}

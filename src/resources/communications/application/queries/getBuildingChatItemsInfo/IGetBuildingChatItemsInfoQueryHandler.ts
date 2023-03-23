import type { GetBuildingChatItemsInfoQueryInput } from './GetBuildingChatItemsInfoQueryInput';
import type { GetBuildingChatItemsInfoQueryResult } from './GetBuildingChatItemsInfoQueryResult';

export interface IGetBuildingChatItemsInfoQueryHandler {
  execute(input: GetBuildingChatItemsInfoQueryInput): Promise<GetBuildingChatItemsInfoQueryResult>;
}

import type { AddBuildingChatItemCommandInput } from './АddBuildingChatItemCommandInput';
import type { AddBuildingChatItemCommandResult } from './АddBuildingChatItemCommandResult';

export interface IAddBuildingChatItemCommandHandler {
  execute(input: AddBuildingChatItemCommandInput): Promise<AddBuildingChatItemCommandResult>;
}

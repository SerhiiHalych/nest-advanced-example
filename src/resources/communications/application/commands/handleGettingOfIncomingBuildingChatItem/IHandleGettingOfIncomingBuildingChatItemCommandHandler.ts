import type { HandleGettingOfIncomingBuildingChatItemCommandInput } from './HandleGettingOfIncomingBuildingChatItemCommandInput';

export interface IHandleGettingOfIncomingBuildingChatItemCommandHandler {
  execute(input: HandleGettingOfIncomingBuildingChatItemCommandInput): Promise<void>;
}

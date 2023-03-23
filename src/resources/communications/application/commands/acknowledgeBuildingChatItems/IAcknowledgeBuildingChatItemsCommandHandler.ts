import type { AcknowledgeBuildingChatItemsCommandInput } from './AcknowledgeBuildingChatItemsCommandInput';

export interface IAcknowledgeBuildingChatItemsCommandHandler {
  execute(input: AcknowledgeBuildingChatItemsCommandInput): Promise<void>;
}

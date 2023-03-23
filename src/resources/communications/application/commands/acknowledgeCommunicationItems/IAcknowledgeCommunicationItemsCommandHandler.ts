import type { AcknowledgeCommunicationItemsCommandInput } from './AcknowledgeCommunicationItemsCommandInput';

export interface IAcknowledgeCommunicationItemsCommandHandler {
  execute(input: AcknowledgeCommunicationItemsCommandInput): Promise<void>;
}

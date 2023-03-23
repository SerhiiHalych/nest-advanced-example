import type { HandleGettingOfIncomingEmailCommandInput } from './HandleGettingOfIncomingEmailCommandInput';

export interface IHandleGettingOfIncomingEmailCommandHandler {
  execute(input: HandleGettingOfIncomingEmailCommandInput): Promise<void>;
}

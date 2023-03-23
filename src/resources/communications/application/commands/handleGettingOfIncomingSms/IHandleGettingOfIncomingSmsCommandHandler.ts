import type { HandleGettingOfIncomingSmsCommandInput } from './HandleGettingOfIncomingSmsCommandInput';

export interface IHandleGettingOfIncomingSmsCommandHandler {
  execute(input: HandleGettingOfIncomingSmsCommandInput): Promise<void>;
}

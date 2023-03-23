import type { HandleSmsStatusChangingCommandInput } from './HandleSmsStatusChangingCommandInput';

export interface IHandleSmsStatusChangingCommandHandler {
  execute(input: HandleSmsStatusChangingCommandInput): Promise<void>;
}

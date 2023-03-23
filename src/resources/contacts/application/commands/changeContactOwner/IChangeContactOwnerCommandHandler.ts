import type { ChangeContactOwnerCommandInput } from './ChangeContactOwnerCommandInput';
import type { ChangeContactOwnerCommandResult } from './ChangeContactOwnerCommandResult';

export interface IChangeContactOwnerCommandHandler {
  execute(input: ChangeContactOwnerCommandInput): Promise<ChangeContactOwnerCommandResult>;
}

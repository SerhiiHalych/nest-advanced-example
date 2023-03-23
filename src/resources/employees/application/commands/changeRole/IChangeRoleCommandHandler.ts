import type { ChangeRoleCommandInput } from './ChangeRoleCommandInput';
import type { ChangeRoleCommandResult } from './ChangeRoleCommandResult';

export interface IChangeRoleCommandHandler {
  execute(input: ChangeRoleCommandInput): Promise<ChangeRoleCommandResult>;
}

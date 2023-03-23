import type { ChangeContactAssigneeCommandInput } from './ChangeContactAssigneeCommandInput';
import type { ChangeContactAssigneeCommandResult } from './ChangeContactAssigneeCommandResult';

export interface IChangeContactAssigneeCommandHandler {
  execute(input: ChangeContactAssigneeCommandInput): Promise<ChangeContactAssigneeCommandResult>;
}

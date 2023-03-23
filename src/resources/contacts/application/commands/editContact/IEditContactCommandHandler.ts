import type { EditContactCommandInput } from './EditContactCommandInput';
import type { EditContactCommandResult } from './EditContactCommandResult';

export interface IEditContactCommandHandler {
  execute(input: EditContactCommandInput): Promise<EditContactCommandResult>;
}

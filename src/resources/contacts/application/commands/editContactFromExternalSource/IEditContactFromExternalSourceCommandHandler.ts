import type { EditContactFromExternalSourceCommandInput } from './EditContactFromExternalSourceCommandInput';
import type { EditContactFromExternalSourceCommandResult } from './EditContactFromExternalSourceCommandResult';

export interface IEditContactFromExternalSourceCommandHandler {
  execute(input: EditContactFromExternalSourceCommandInput): Promise<EditContactFromExternalSourceCommandResult>;
}

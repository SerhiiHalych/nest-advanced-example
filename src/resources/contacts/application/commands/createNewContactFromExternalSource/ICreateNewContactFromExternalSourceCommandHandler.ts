import type { CreateNewContactFromExternalSourceCommandInput } from './CreateNewContactFromExternalSourceCommandInput';
import type { CreateNewContactFromExternalSourceCommandResult } from './CreateNewContactFromExternalSourceCommandResult';

export interface ICreateNewContactFromExternalSourceCommandHandler {
  execute(
    input: CreateNewContactFromExternalSourceCommandInput
  ): Promise<CreateNewContactFromExternalSourceCommandResult>;
}

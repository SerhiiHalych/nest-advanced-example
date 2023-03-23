import type { CreateNewContactCommandInput } from './CreateNewContactCommandInput';
import type { CreateNewContactCommandResult } from './CreateNewContactCommandResult';

export interface ICreateNewContactCommandHandler {
  execute(input: CreateNewContactCommandInput): Promise<CreateNewContactCommandResult>;
}

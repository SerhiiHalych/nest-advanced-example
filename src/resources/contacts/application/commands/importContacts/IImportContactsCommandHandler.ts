import type { ImportContactsCommandInput } from './ImportContactsCommandInput';
import type { ImportContactsCommandResult } from './ImportContactsCommandResult';

export interface IImportContactsCommandHandler {
  execute(input: ImportContactsCommandInput): Promise<ImportContactsCommandResult>;
}

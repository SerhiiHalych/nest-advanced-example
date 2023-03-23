import type { ImportContactsFromFoobarCommandInput } from './ImportContactsFromFoobarCommandInput';
import type { ImportContactsFromFoobarCommandResult } from './ImportContactsFromFoobarCommandResult';

export interface IImportContactsFromFoobarCommandHandler {
  execute(input: ImportContactsFromFoobarCommandInput): Promise<ImportContactsFromFoobarCommandResult>;
}

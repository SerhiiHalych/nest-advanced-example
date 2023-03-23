import type { ImportCommunicationsCommandInput } from './ImportCommunicationsCommandInput';
import type { ImportCommunicationsCommandResult } from './ImportCommunicationsCommandResult';

export interface IImportCommunicationsCommandHandler {
  execute(input: ImportCommunicationsCommandInput): Promise<ImportCommunicationsCommandResult>;
}

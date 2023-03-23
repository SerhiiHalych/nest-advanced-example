import type { Readable } from 'stream';

export interface ImportCommunicationsCommandInput {
  csvFile: Readable;
  assigneeEmail: string;
}

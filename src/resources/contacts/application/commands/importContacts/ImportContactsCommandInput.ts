import type { Readable } from 'stream';

export interface ImportContactsCommandInput {
  csvFile: Readable;
  assigneeEmail: string;
}

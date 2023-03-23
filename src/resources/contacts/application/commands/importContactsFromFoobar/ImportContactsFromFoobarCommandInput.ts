import type { Readable } from 'stream';

export interface ImportContactsFromFoobarCommandInput {
  csvFile: Readable;
  assigneeEmail: string;
}

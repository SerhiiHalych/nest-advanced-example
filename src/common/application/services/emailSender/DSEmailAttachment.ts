import type { Readable } from 'stream';

export interface DSEmailAttachment {
  filename: string;
  content: string | Readable;
}

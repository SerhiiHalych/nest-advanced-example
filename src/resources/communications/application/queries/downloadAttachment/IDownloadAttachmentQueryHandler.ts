import type { DownloadAttachmentQueryInput } from './DownloadAttachmentQueryInput';
import type { DownloadAttachmentQueryResult } from './DownloadAttachmentQueryResult';

export interface IDownloadAttachmentQueryHandler {
  execute(input: DownloadAttachmentQueryInput): Promise<DownloadAttachmentQueryResult>;
}

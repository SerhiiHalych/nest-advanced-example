import { ApiProperty } from '@nestjs/swagger';

import { createObjectSchema } from '../../../../../common/infrastructure/validation/joi/createObjectSchema';
import { createRequestSchema } from '../../../../../common/infrastructure/validation/joi/createRequestSchema';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';

export class DownloadAttachmentRequestParams {
  @ApiProperty()
  attachmentId: string;
}

export const downloadAttachmentRequestSchema = createRequestSchema({
  params: createObjectSchema<DownloadAttachmentRequestParams>({
    attachmentId: extendedJoi.string(),
  }),
});

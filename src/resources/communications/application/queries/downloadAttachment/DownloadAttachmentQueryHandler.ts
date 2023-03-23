/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-case-declarations */
import { Injectable, Scope } from '@nestjs/common';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractQueryHandler } from '../../../../../common/application/AbstractQueryHandler';
import { GoogleGmailService } from '../../../infrastructure/services/GoogleGmailService';
import type { DownloadAttachmentQueryInput } from './DownloadAttachmentQueryInput';
import type { DownloadAttachmentQueryResult } from './DownloadAttachmentQueryResult';
import type { IDownloadAttachmentQueryHandler } from './IDownloadAttachmentQueryHandler';

@Injectable({ scope: Scope.REQUEST })
export class DownloadAttachmentQueryHandler
  extends AbstractQueryHandler<DownloadAttachmentQueryInput, DownloadAttachmentQueryResult>
  implements IDownloadAttachmentQueryHandler
{
  constructor(private googleGmailService: GoogleGmailService) {
    super();
  }

  protected async implementation(input: DownloadAttachmentQueryInput): Promise<DownloadAttachmentQueryResult> {
    const emailItem = await this._dbContext.communicationRepository.findEmailByAttachmentId(input.attachmentId);

    if (!emailItem) {
      throw new ApplicationError('Attachment not found');
    }

    const attachment = emailItem.payload.emailAttachments.find(
      ({ attachmentId }) => input.attachmentId === attachmentId
    );

    const attachmentData = await this.googleGmailService.getAttachment(
      null,
      emailItem.payload.extenalEmailId,
      attachment.attachmentId
    );

    return {
      fileData: Buffer.from(attachmentData, 'base64url'),
    };
  }
}

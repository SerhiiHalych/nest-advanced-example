/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-process-env */
import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as mime from 'mime-types';

import { ApplicationError } from '../../../../app/errors/application.error';
import { runSequentially } from '../../../../common/utils/runSequentially';
import type { IMmsMediaStorageService } from '../../application/services/IMmsMediaStorageService';

@Injectable()
export class S3MmsMediaStorageService implements IMmsMediaStorageService {
  private s3: S3;

  constructor() {
    this.s3 = new S3();
  }

  async uploadMedia(
    files: Array<{
      fileData: Buffer;
      fileName: string;
    }>
  ): Promise<
    Array<{
      url: string;
      key: string;
      contentType: string;
    }>
  > {
    const writtenS3ObjectsFileKeys: Array<{
      url: string;
      key: string;
      contentType: string;
    }> = [];

    try {
      await runSequentially(files, async file => {
        const contentType = mime.lookup(file.fileName);

        if (!contentType) {
          throw new ApplicationError(`Incorrect file extension: ${file.fileName}`);
        }

        await this.s3
          .upload({
            Bucket: process.env.TWILIO_MEDIA_STORAGE,
            Key: file.fileName,
            Body: file.fileData,
            ContentType: contentType,
            ACL: 'public-read',
          })
          .promise()
          .then(({ Location, Key }) => {
            writtenS3ObjectsFileKeys.push({
              key: Key,
              url: Location,
              contentType,
            });
          });
      });

      return writtenS3ObjectsFileKeys;
    } catch (error) {
      await this.delete(writtenS3ObjectsFileKeys.map(({ key }) => key));

      throw error;
    }
  }

  async delete(fileNames: string[]): Promise<void> {
    await runSequentially(fileNames, fileKey =>
      this.s3.deleteObject({
        Bucket: process.env.TWILIO_MEDIA_STORAGE,
        Key: fileKey,
      })
    );
  }
}

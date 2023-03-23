import { Inject, Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Analytics = require('analytics-node');

import { IGlobalDBContext } from '../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../common/diTokens';
import type { ISegmentService } from './ISegmentService';

@Injectable()
export class SegmentService implements ISegmentService {
  private segmentClient: any;

  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;
  constructor() {
    this.segmentClient = new Analytics(process.env.SEGMENT_KEY);
  }

  async alias(data: { oldId: string; newId: string }): Promise<void> {
    await this.segmentClient.alias({
      previousId: data.oldId,
      userId: data.newId,
    });
  }

  async identify(data: { userId?: string; anonymousId?: string; traits: any }): Promise<void> {
    await this.segmentClient.identify({
      ...(data?.userId && { userId: data.userId }),
      ...(data?.anonymousId && { anonymousId: data.anonymousId }),
      traits: data.traits,
    });
  }

  async track(data: { userId: string; anonymousId: string; event: string; properties: any }): Promise<void> {
    const idInfo = data.userId ? { userId: data.userId } : { anonymousId: data.anonymousId };

    await this.segmentClient.track({
      ...idInfo,
      event: data.event,
      properties: {
        platform: 'CRM',
        ...data.properties,
      },
    });
  }
}

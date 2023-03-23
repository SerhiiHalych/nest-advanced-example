import { Inject, Injectable, Scope } from '@nestjs/common';

import { AbstractEventHandler } from '../../../../common/application/AbstractEventHandler';
import { IGlobalDBContext } from '../../../../common/application/IGlobalDBContext';
import { BaseType, DomainServiceType } from '../../../../common/diTokens';
import type { NewContactCreatedEvent } from '../events/NewContactCreatedEvent';
import { ISegmentService } from '../services/ISegmentService';

@Injectable({ scope: Scope.REQUEST })
export class CreateSegmentOnNewContactCreated extends AbstractEventHandler<NewContactCreatedEvent> {
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;
  @Inject(DomainServiceType.SEGMENT_SERVICE) private segmentService: ISegmentService;

  protected async implementation(event: NewContactCreatedEvent): Promise<void> {
    const { payload } = event;

    const contact = await this._dbContext.contactRepository.findById(payload.contactId);

    if (contact.externalId) {
      await this.segmentService.identify({
        userId: contact.externalId,
        traits: contact,
      });
    } else {
      await this.segmentService.identify({
        anonymousId: contact.id,
        traits: {
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
        },
      });
    }
  }
}

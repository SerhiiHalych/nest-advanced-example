import { Inject, Injectable, Scope } from '@nestjs/common';

import { AbstractEventHandler } from '../../../../common/application/AbstractEventHandler';
import { IGlobalDBContext } from '../../../../common/application/IGlobalDBContext';
import { BaseType, DomainServiceType } from '../../../../common/diTokens';
import type { ContactExternalIdChangedEvent } from '../events/ContactExternalIdChangedEvent';
import { ISegmentService } from '../services/ISegmentService';

@Injectable({ scope: Scope.REQUEST })
export class CreateSegmentOnContactExternalIdChanged extends AbstractEventHandler<ContactExternalIdChangedEvent> {
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;
  @Inject(DomainServiceType.SEGMENT_SERVICE) private segmentService: ISegmentService;

  protected async implementation(event: ContactExternalIdChangedEvent): Promise<void> {
    const { payload } = event;

    const contact = await this._dbContext.contactRepository.findById(payload.contactId);

    if (contact.externalId) {
      await this.segmentService.alias({
        oldId: contact.id,
        newId: contact.externalId,
      });
    }
  }
}

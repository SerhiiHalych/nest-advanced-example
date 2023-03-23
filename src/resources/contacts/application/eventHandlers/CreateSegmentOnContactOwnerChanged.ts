import { Inject, Injectable, Scope } from '@nestjs/common';

import { AbstractEventHandler } from '../../../../common/application/AbstractEventHandler';
import { IGlobalDBContext } from '../../../../common/application/IGlobalDBContext';
import { BaseType, DomainServiceType } from '../../../../common/diTokens';
import type { EmployeeRole } from '../../../employees/application/enums/EmployeeRole';
import { SegmentEvents } from '../enum/SegmentEvents';
import type { ContactOwnerChangedEvent } from '../events/ContactOwnerChangedEvent';
import { ISegmentService } from '../services/ISegmentService';

interface ContactOwnerChangedSegmentEventProperties {
  previousOwner: {
    crmEmployeeId: string;
    firstName: string;
    lastName: string;
    roles: EmployeeRole[];
  };
  newOwner: {
    crmEmployeeId: string;
    firstName: string;
    lastName: string;
    roles: EmployeeRole[];
  };
}

@Injectable({ scope: Scope.REQUEST })
export class CreateSegmentOnContactOwnerChanged extends AbstractEventHandler<ContactOwnerChangedEvent> {
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;
  @Inject(DomainServiceType.SEGMENT_SERVICE) private segmentService: ISegmentService;

  protected async implementation(event: ContactOwnerChangedEvent): Promise<void> {
    const { payload } = event;

    const previousOwner = await this._dbContext.employeeRepository.findById(payload.previousOwnerId);

    const newOwner = await this._dbContext.employeeRepository.findById(payload.newOwnerId);

    const previousOwnerUser = await this._dbContext.userRepository.findById(previousOwner.userId);

    const newOwnerUser = await this._dbContext.userRepository.findById(newOwner.userId);

    const contact = await this._dbContext.contactRepository.findById(payload.contactId);

    await this.segmentService.track<ContactOwnerChangedSegmentEventProperties>({
      userId: contact.externalId,
      anonymousId: contact.id,
      event: SegmentEvents.CONTACT_OWNER_CHANGED,
      properties: {
        previousOwner: {
          crmEmployeeId: previousOwner.id,
          firstName: previousOwnerUser.givenName,
          lastName: previousOwnerUser.familyName,
          roles: previousOwner.roles,
        },
        newOwner: {
          crmEmployeeId: newOwner.id,
          firstName: newOwnerUser.givenName,
          lastName: newOwnerUser.familyName,
          roles: newOwner.roles,
        },
      },
    });
  }
}

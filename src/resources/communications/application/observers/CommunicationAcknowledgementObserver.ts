import { Injectable } from '@nestjs/common';

import { AbstractObserver } from '../../../../common/application/AbstractObserver';
import type { CommunicationItemDto } from '../dataStructures/CommunicationItemDto';

type CommunicationAcknowledgementObserverSubscriptionActionType = (args: {
  communicationItems: CommunicationItemDto[];
  contactId: string;
  employeeId: string;
}) => Promise<void> | void;

@Injectable()
export class CommunicationAcknowledgementObserver extends AbstractObserver<CommunicationAcknowledgementObserverSubscriptionActionType> {
  async dispatchAcknowledgedCommunicationItems(
    communicationItems: CommunicationItemDto[],
    contactId: string,
    employeeId: string
  ): Promise<void> {
    await this.notify({ communicationItems, contactId, employeeId });
  }
}

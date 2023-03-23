import { Injectable } from '@nestjs/common';

import { AbstractObserver } from '../../../../common/application/AbstractObserver';
import type { CommunicationItemDto } from '../dataStructures/CommunicationItemDto';

type CommunicationObserverSubscriptionActionType = (args: {
  communicationItem: CommunicationItemDto;
  contactId: string;
}) => Promise<void> | void;

@Injectable()
export class CommunicationObserver extends AbstractObserver<CommunicationObserverSubscriptionActionType> {
  async dispatchCommunicationItem(communicationItem: CommunicationItemDto, contactId: string): Promise<void> {
    await this.notify({ communicationItem, contactId });
  }
}

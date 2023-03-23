/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/naming-convention */
import { Inject, Injectable, Scope } from '@nestjs/common';

import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../../common/diTokens';
import { CommunicationAcknowledgementObserver } from '../../observers/CommunicationAcknowledgementObserver';
import type { AcknowledgeCommunicationItemsCommandInput } from './AcknowledgeCommunicationItemsCommandInput';
import type { IAcknowledgeCommunicationItemsCommandHandler } from './IAcknowledgeCommunicationItemsCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class AcknowledgeCommunicationItemsCommandHandler
  extends AbstractCommandHandler<AcknowledgeCommunicationItemsCommandInput, void>
  implements IAcknowledgeCommunicationItemsCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  constructor(private communicationAcknowledgementObserver: CommunicationAcknowledgementObserver) {
    super();
  }

  protected async implementation(input: AcknowledgeCommunicationItemsCommandInput): Promise<void> {
    const { employeeId, communicationItemIds } = input;

    const communicationItems = await this._dbContext.communicationRepository.listItemsByIds(communicationItemIds);

    const communicationId = communicationItems[0].communicationId;

    const communication = await this._dbContext.communicationRepository.findById(communicationId);

    communicationItems.forEach(item => {
      item.acknowledgement.forEach(itemAcknowledger => {
        if (itemAcknowledger.employeeId === employeeId) {
          itemAcknowledger.acknowledged = true;
        }
      });
    });

    await this._dbContext.communicationRepository.bulkUpdateItems(communicationItems);

    this.addCommitHandler(() =>
      this.communicationAcknowledgementObserver.dispatchAcknowledgedCommunicationItems(
        communicationItems,
        communication.contactId,
        employeeId
      )
    );
  }
}

import { Injectable, Scope } from '@nestjs/common';

import { AbstractQueryHandler } from '../../../../../common/application/AbstractQueryHandler';
import type { GetNotificationsCountQueryResult } from './GetNotificationsCountQueryResult';
import type { IGetNotificationsCountQueryHandler } from './IGetNotificationsCountQueryHandler';

@Injectable({ scope: Scope.REQUEST })
export class GetNotificationsCountQueryHandler
  extends AbstractQueryHandler<void, GetNotificationsCountQueryResult>
  implements IGetNotificationsCountQueryHandler
{
  protected async implementation(): Promise<GetNotificationsCountQueryResult> {
    const identity = this._identityContext.getIdentity();

    const employee = await this._dbContext.employeeRepository.findByUserId(identity.id);

    const unacknowledgedCommunicationItemsCount =
      await this._dbContext.communicationRepository.countUnacknowledgedItemsForEmployee(employee.id);

    const unacknowledgedBuildingChatItemsCount =
      await this._dbContext.buildingChatRepository.countUnacknowledgedItemsForEmployee(employee.id);

    const totalNotificationsCount = unacknowledgedCommunicationItemsCount + unacknowledgedBuildingChatItemsCount;

    return {
      notificationCount: totalNotificationsCount,
    };
  }
}

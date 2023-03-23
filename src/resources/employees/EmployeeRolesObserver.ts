import { Injectable } from '@nestjs/common';

import { AbstractObserver } from '../../common/application/AbstractObserver';
import type { EmployeeRole } from './application/enums/EmployeeRole';

type EmployeeRolesObserverSubscriptionActionType = (args: {
  employeeId: string;
  newRoles: EmployeeRole[];
}) => Promise<void> | void;

@Injectable()
export class EmployeeRolesObserver extends AbstractObserver<EmployeeRolesObserverSubscriptionActionType> {
  async dispatchEmployeeRoles(employeeId: string, newRoles: EmployeeRole[]): Promise<void> {
    await this.notify({
      employeeId,
      newRoles,
    });
  }
}

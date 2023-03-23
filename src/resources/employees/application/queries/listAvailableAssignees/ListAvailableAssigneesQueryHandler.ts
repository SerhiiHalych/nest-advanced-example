import { Injectable, Scope } from '@nestjs/common';
import * as _ from 'lodash';

import { AbstractQueryHandler } from '../../../../../common/application/AbstractQueryHandler';
import { createHashMap } from '../../../../../common/utils/createHashMap';
import type { IListAvailableAssigneesQueryHandler } from './IListAvailableAssigneesQueryHandler';
import type { ListAvailableAssigneesQueryResult } from './ListAvailableAssigneesQueryResult';

@Injectable({ scope: Scope.REQUEST })
export class ListAvailableAssigneesQueryHandler
  extends AbstractQueryHandler<void, ListAvailableAssigneesQueryResult>
  implements IListAvailableAssigneesQueryHandler
{
  protected async implementation(): Promise<ListAvailableAssigneesQueryResult> {
    const employees = await this._dbContext.employeeRepository.listAssignees();

    const userIds = _(employees)
      .map(({ userId }) => userId)
      .uniq()
      .value();

    const users = await this._dbContext.userRepository.listByIds(userIds);

    const userHashMap = createHashMap(users, ({ id }) => id);

    return {
      items: employees.map(employee => {
        const user = userHashMap[employee.userId];

        return {
          id: employee.id,
          roles: employee.roles,
          user: {
            familyName: user.familyName,
            givenName: user.givenName,
            id: user.id,
            picture: user.picture,
          },
        };
      }),
    };
  }
}

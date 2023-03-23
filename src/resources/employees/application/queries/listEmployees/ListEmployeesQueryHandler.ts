import { Injectable, Scope } from '@nestjs/common';
import * as _ from 'lodash';

import { AbstractQueryHandler } from '../../../../../common/application/AbstractQueryHandler';
import { createHashMap } from '../../../../../common/utils/createHashMap';
import { EmployeeRole } from '../../enums/EmployeeRole';
import type { IListEmployeesQueryHandler } from './IListEmployeesQueryHandler';
import type { ListEmployeesQueryInput } from './ListEmployeesQueryInput';
import type { ListEmployeesQueryResult } from './ListEmployeesQueryResult';

@Injectable({ scope: Scope.REQUEST })
export class ListEmployeesQueryHandler
  extends AbstractQueryHandler<ListEmployeesQueryInput, ListEmployeesQueryResult>
  implements IListEmployeesQueryHandler
{
  protected async implementation(input: ListEmployeesQueryInput): Promise<ListEmployeesQueryResult> {
    const { employees, totalCount } = await this._dbContext.employeeRepository.listAll({
      skip: input.skip,
      take: input.take,
      roles: input.ownersOnly
        ? [EmployeeRole.DISPATCHERS, EmployeeRole.LIGHTKEEPERS, EmployeeRole.SEARCHLIGHTS]
        : undefined,
    });

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
          team: employee.team?.name,
          roles: employee.roles,
          isAvailable: employee.isAvailable,
          user: {
            familyName: user.familyName,
            givenName: user.givenName,
            id: user.id,
            picture: user.picture,
            email: user.email,
          },
          createdAt: employee.createdAt,
        };
      }),
      totalCount,
    };
  }
}

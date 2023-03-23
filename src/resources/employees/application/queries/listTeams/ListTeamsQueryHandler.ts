import { Injectable, Scope } from '@nestjs/common';

import { AbstractQueryHandler } from '../../../../../common/application/AbstractQueryHandler';
import type { IListTeamsQueryHandler } from './IListTeamsQueryHandler';
import type { ListTeamsQueryResult } from './ListTeamsQueryResult';

@Injectable({ scope: Scope.REQUEST })
export class ListTeamsQueryHandler
  extends AbstractQueryHandler<void, ListTeamsQueryResult>
  implements IListTeamsQueryHandler
{
  protected async implementation(): Promise<ListTeamsQueryResult> {
    const employeeTeams = await this._dbContext.employeeRepository.listAllTeams();

    return {
      items: employeeTeams.map(employeeTeam => ({
        createdAt: employeeTeam.createdAt,
        id: employeeTeam.id,
        name: employeeTeam.name,
        role: employeeTeam.role,
        updatedAt: employeeTeam.updatedAt,
      })),
    };
  }
}

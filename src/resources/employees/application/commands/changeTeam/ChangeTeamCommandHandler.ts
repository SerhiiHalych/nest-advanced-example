import { Inject, Injectable, Scope } from '@nestjs/common';

import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../../common/diTokens';
import type { ChangeRoleCommandResult } from '../changeRole/ChangeRoleCommandResult';
import type { ChangeTeamCommandInput } from './ChangeTeamCommandInput';
import type { ChangeTeamCommandResult } from './ChnageTeamCommandResult';
import type { IChangeTeamCommandHandler } from './IChangeTeamCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class ChangeTeamCommandHandler
  extends AbstractCommandHandler<ChangeTeamCommandInput, ChangeRoleCommandResult>
  implements IChangeTeamCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  protected async implementation(input: ChangeTeamCommandInput): Promise<ChangeTeamCommandResult> {
    const { employeeId, teamName } = input;

    const employee = await this._dbContext.employeeRepository.findById(employeeId);

    if (teamName) {
      const team = await this._dbContext.employeeRepository.findEmployeeTeamByRoleName(teamName);

      employee.teamId = team.id;
    } else {
      employee.teamId = null;
    }

    await this._dbContext.employeeRepository.updateEmployee(employee);

    return this._dbContext.employeeRepository.findById(employeeId);
  }
}

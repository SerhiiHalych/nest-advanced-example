import { Inject, Injectable, Scope } from '@nestjs/common';
import * as _ from 'lodash';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../../common/diTokens';
import { EmployeeRolesObserver } from '../../../EmployeeRolesObserver';
import { EmployeeRole } from '../../enums/EmployeeRole';
import type { ChangeRoleCommandInput } from './ChangeRoleCommandInput';
import type { ChangeRoleCommandResult } from './ChangeRoleCommandResult';
import type { IChangeRoleCommandHandler } from './IChangeRoleCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class ChangeRoleCommandHandler
  extends AbstractCommandHandler<ChangeRoleCommandInput, ChangeRoleCommandResult>
  implements IChangeRoleCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  constructor(private employeeObserver: EmployeeRolesObserver) {
    super();
  }

  protected async implementation(input: ChangeRoleCommandInput): Promise<ChangeRoleCommandResult> {
    let { roles } = input;
    const { employeeId } = input;

    const employee = await this._dbContext.employeeRepository.findById(employeeId);

    if (!employee) {
      throw new ApplicationError('Employee not found');
    }

    if (roles.length === 0) {
      throw new ApplicationError('Role field cannot be empty');
    }

    if (roles.includes(EmployeeRole.COLLABORATORS)) {
      roles = [EmployeeRole.COLLABORATORS];
    }

    const countOfCollisiveRoles = [
      EmployeeRole.DISPATCHERS,
      EmployeeRole.LIGHTKEEPERS,
      EmployeeRole.SEARCHLIGHTS,
    ].reduce((count, role) => (roles.includes(role) ? count + 1 : count), 0);

    if (countOfCollisiveRoles > 1) {
      throw new ApplicationError('User can be assign to only one of Dispatcher, Lightkeeper or Searchlight role');
    }

    if (employee.team && !roles.includes(employee.team.role)) {
      employee.team = null;
      employee.teamId = null;
    }

    employee.roles = roles;

    await this._dbContext.employeeRepository.updateEmployee(employee);

    await this.employeeObserver.dispatchEmployeeRoles(employeeId, roles);

    return this._dbContext.employeeRepository.findById(employeeId);
  }
}

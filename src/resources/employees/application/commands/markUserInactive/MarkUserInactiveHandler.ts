import { Inject, Injectable, Scope } from '@nestjs/common';

import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../../common/diTokens';
import type { IMarkUserInactiveHandler } from './IMarkUserInactiveHandler';
import type { MarkUserInactiveInput } from './MarkUserInactiveInput';
import type { MarkUserInactiveResult } from './MarkUserInactiveResult';

@Injectable({ scope: Scope.REQUEST })
export class MarkUserInactiveHandler
  extends AbstractCommandHandler<MarkUserInactiveInput, MarkUserInactiveResult>
  implements IMarkUserInactiveHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  protected async implementation(input: MarkUserInactiveInput): Promise<MarkUserInactiveResult> {
    const { employeeId } = input;

    const employee = await this._dbContext.employeeRepository.findById(employeeId);

    employee.isAvailable = false;

    await this._dbContext.employeeRepository.updateEmployee(employee);

    return this._dbContext.employeeRepository.findById(employeeId);
  }
}

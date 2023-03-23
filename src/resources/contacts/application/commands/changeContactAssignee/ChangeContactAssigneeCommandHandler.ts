import { Inject, Injectable, Scope } from '@nestjs/common';
import { isNull } from 'lodash';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import type { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../../common/diTokens';
import type { EmployeeDto } from '../../../../employees/application/dataStructures/EmployeeDto';
import type { UserDto } from '../../../../users/application/dataStructures/UserDto';
import { ContactAssigneeChangedEvent } from '../../events/ContactAssigneeChangedEvent';
import type { ChangeContactAssigneeCommandInput } from './ChangeContactAssigneeCommandInput';
import type { ChangeContactAssigneeCommandResult } from './ChangeContactAssigneeCommandResult';
import type { IChangeContactAssigneeCommandHandler } from './IChangeContactAssigneeCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class ChangeContactAssigneeCommandHandler
  extends AbstractCommandHandler<ChangeContactAssigneeCommandInput, ChangeContactAssigneeCommandResult>
  implements IChangeContactAssigneeCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  protected async implementation(
    input: ChangeContactAssigneeCommandInput
  ): Promise<ChangeContactAssigneeCommandResult> {
    const { assigneeId, contactId } = input;

    const isUnassigned = isNull(assigneeId);

    let user: UserDto;
    let assignee: EmployeeDto;

    const existingContact = await this._dbContext.contactRepository.findById(contactId);

    if (!existingContact) {
      throw new ApplicationError('Contact not found');
    }

    const previousContactAssigneeId = existingContact.assigneeId;
    existingContact.assigneeId = assigneeId;

    if (!isUnassigned) {
      assignee = await this._dbContext.employeeRepository.findById(assigneeId);

      if (!assignee) {
        throw new ApplicationError('Assignee not found');
      }

      if (!assignee.isAvailable) {
        throw new ApplicationError('Assignee is inactive');
      }

      user = await this._dbContext.userRepository.findById(assignee.userId);
    }

    await this._dbContext.contactRepository.update(existingContact);

    const contactAssigneeChangedEvent = new ContactAssigneeChangedEvent({
      contactId: existingContact.id,
      newAssigneeId: existingContact.assigneeId,
      previousAssigneeId: previousContactAssigneeId,
    });

    this._eventDispatcher.registerEvent(contactAssigneeChangedEvent);

    if (isUnassigned) {
      return { assignee: null };
    }

    return {
      assignee: {
        id: assignee?.id,
        roles: assignee?.roles,
        user: {
          familyName: user.familyName,
          givenName: user.givenName,
          id: user.id,
          picture: user.picture,
        },
      },
    };
  }
}

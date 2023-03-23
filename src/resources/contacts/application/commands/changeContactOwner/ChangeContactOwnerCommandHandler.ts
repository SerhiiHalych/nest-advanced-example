import { Inject, Injectable, Scope } from '@nestjs/common';
import { isNull } from 'lodash';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import type { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../../common/diTokens';
import type { EmployeeDto } from '../../../../employees/application/dataStructures/EmployeeDto';
import type { UserDto } from '../../../../users/application/dataStructures/UserDto';
import { ContactAssigneeChangedEvent } from '../../events/ContactAssigneeChangedEvent';
import { ContactOwnerChangedEvent } from '../../events/ContactOwnerChangedEvent';
import type { ChangeContactOwnerCommandInput } from './ChangeContactOwnerCommandInput';
import type { ChangeContactOwnerCommandResult } from './ChangeContactOwnerCommandResult';
import type { IChangeContactOwnerCommandHandler } from './IChangeContactOwnerCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class ChangeContactOwnerCommandHandler
  extends AbstractCommandHandler<ChangeContactOwnerCommandInput, ChangeContactOwnerCommandResult>
  implements IChangeContactOwnerCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  protected async implementation(input: ChangeContactOwnerCommandInput): Promise<ChangeContactOwnerCommandResult> {
    const { ownerId, contactId } = input;

    const isUnassigned = isNull(ownerId);

    let user: UserDto;
    let owner: EmployeeDto;

    const existingContact = await this._dbContext.contactRepository.findById(contactId);

    if (!existingContact) {
      throw new ApplicationError('Contact not found');
    }

    const previousContactOwnerId = existingContact.ownerId;
    const previousContactAssigneeId = existingContact.assigneeId;

    existingContact.ownerId = ownerId;
    existingContact.assigneeId = ownerId;

    if (!isUnassigned) {
      owner = await this._dbContext.employeeRepository.findById(ownerId);

      if (!owner) {
        throw new ApplicationError('Owner not found');
      }

      if (!owner.isAvailable) {
        throw new ApplicationError('Owner is inactive');
      }

      user = await this._dbContext.userRepository.findById(owner.userId);
    }

    await this._dbContext.contactRepository.update(existingContact);

    const contactOwnerChangedEvent = new ContactOwnerChangedEvent({
      contactId: existingContact.id,
      newOwnerId: existingContact.ownerId,
      previousOwnerId: previousContactOwnerId,
      previousAssigneeId: previousContactAssigneeId,
    });

    this._eventDispatcher.registerEvent(contactOwnerChangedEvent);

    const contactAssigneeChangedEvent = new ContactAssigneeChangedEvent({
      contactId: existingContact.id,
      newAssigneeId: existingContact.assigneeId,
      previousAssigneeId: previousContactAssigneeId,
    });

    this._eventDispatcher.registerEvent(contactAssigneeChangedEvent);

    if (isUnassigned) {
      return {
        owner: null,
        assignee: null,
      };
    }

    return {
      owner: {
        id: owner.id,
        roles: owner.roles,
        user: {
          familyName: user.familyName,
          givenName: user.givenName,
          id: user.id,
          picture: user.picture,
        },
      },
      assignee: {
        id: owner.id,
        roles: owner.roles,
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

import { Inject, Injectable, Scope } from '@nestjs/common';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../../common/diTokens';
import type { UserDto } from '../../../../users/application/dataStructures/UserDto';
import { ContactNotUnique } from '../../../errors/contact-not-unique.error';
import type { ContactCreateDto } from '../../dataStructures/ContactCreateDto';
import type { ContactDto } from '../../dataStructures/ContactDto';
import { NewContactCreatedEvent } from '../../events/NewContactCreatedEvent';
import type { CreateNewContactCommandInput } from './CreateNewContactCommandInput';
import type { CreateNewContactCommandResult } from './CreateNewContactCommandResult';
import type { ICreateNewContactCommandHandler } from './ICreateNewContactCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class CreateNewContactCommandHandler
  extends AbstractCommandHandler<CreateNewContactCommandInput, CreateNewContactCommandResult>
  implements ICreateNewContactCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  protected async implementation(input: CreateNewContactCommandInput): Promise<CreateNewContactCommandResult> {
    const { cameFrom, contactStyle, email, firstName, lastName, phone } = input;

    const existingContact = await this._dbContext.contactRepository.findByEmailOrPhone({ email, phone });

    if (existingContact) {
      throw new ContactNotUnique(existingContact.id);
    }

    const identity = this._identityContext.getIdentity();

    const employee = await this._dbContext.employeeRepository.findByUserId(identity.id);

    if (!employee) {
      throw new ApplicationError('Employee not found');
    }

    const user = (await this._dbContext.userRepository.findById(employee.userId)) as UserDto;

    const formattedEmail = input.email ? input.email.toLowerCase() : null;

    const contactToSave: ContactCreateDto = {
      acquisitionData: null,
      emailIsConfirmed: false,
      phoneIsConfirmed: false,
      externalId: null,
      assigneeId: employee.id,
      ownerId: employee.id,
      cameFrom,
      contactStyle,
      email: formattedEmail,
      firstName,
      lastName,
      phone,
    };

    const createdContact: ContactDto = await this._dbContext.contactRepository.create(contactToSave);

    const newContactCreatedEvent = new NewContactCreatedEvent({
      contactId: createdContact.id,
    });

    this._eventDispatcher.registerEvent(newContactCreatedEvent);

    await this._dbContext.communicationRepository.create(createdContact.id);

    return {
      createdAt: createdContact.createdAt,
      email: createdContact.email,
      firstName: createdContact.firstName,
      id: createdContact.id,
      lastName: createdContact.lastName,
      owner: {
        id: employee.id,
        user: {
          familyName: user.familyName,
          givenName: user.givenName,
          id: user.id,
          picture: user.picture,
        },
      },
      phone: createdContact.phone,
    };
  }
}

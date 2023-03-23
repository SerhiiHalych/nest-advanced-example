import { Inject, Injectable, Scope } from '@nestjs/common';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../../common/diTokens';
import { getOrDefault } from '../../../../../common/utils/getOrDefault';
import { EmployeeRole } from '../../../../employees/application/enums/EmployeeRole';
import type { ContactCreateDto } from '../../dataStructures/ContactCreateDto';
import type { ContactDto } from '../../dataStructures/ContactDto';
import { ContactExternalIdChangedEvent } from '../../events/ContactExternalIdChangedEvent';
import { NewContactCreatedEvent } from '../../events/NewContactCreatedEvent';
import type { CreateNewContactFromExternalSourceCommandInput } from './CreateNewContactFromExternalSourceCommandInput';
import type { CreateNewContactFromExternalSourceCommandResult } from './CreateNewContactFromExternalSourceCommandResult';
import type { ICreateNewContactFromExternalSourceCommandHandler } from './ICreateNewContactFromExternalSourceCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class CreateNewContactFromExternalSourceCommandHandler
  extends AbstractCommandHandler<
    CreateNewContactFromExternalSourceCommandInput,
    CreateNewContactFromExternalSourceCommandResult
  >
  implements ICreateNewContactFromExternalSourceCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  protected async implementation(
    input: CreateNewContactFromExternalSourceCommandInput
  ): Promise<CreateNewContactFromExternalSourceCommandResult> {
    let contactToUpdate: ContactDto;

    const sanitizedPhone = input.phone ? input.phone.replace(/[()-\s]/g, '') : null;

    const formattedPhone = sanitizedPhone ? (sanitizedPhone[0] === '+' ? sanitizedPhone : `+${sanitizedPhone}`) : null;

    const formattedEmail = input.email ? input.email.toLowerCase() : null;

    const existingContactByExternalContactId = await this._dbContext.contactRepository.findByExternalId(
      input.externalContactId
    );

    if (!existingContactByExternalContactId) {
      const existingContactByEmailOrPhone = await this._dbContext.contactRepository.findByEmailOrPhone({
        email: input.email,
        phone: input.phone,
      });

      if (!existingContactByEmailOrPhone) {
        const contactToSave: ContactCreateDto = {
          acquisitionData: input.acquisitionData
            ? {
                acquisitionChannel: input.acquisitionData.acquisitionChannel,
                campaign: input.acquisitionData.campaign,
                device: input.acquisitionData.device,
                gAId: input.acquisitionData.gAId,
                gclId: input.acquisitionData.gclId,
                foobarId: input.acquisitionData.foobarId,
                medium: input.acquisitionData.medium,
                referredBy: input.acquisitionData.referredBy,
                signUpLink: input.acquisitionData.signUpLink,
                source: input.acquisitionData.source,
                stytchId: input.acquisitionData.stytchId,
                term: input.acquisitionData.term,
                userIP: input.acquisitionData.userIP,
                referredbyID: null,
                unsubscribed: false,
              }
            : null,
          emailIsConfirmed: input.emailIsConfirmed,
          phoneIsConfirmed: input.phoneIsConfirmed,
          externalId: input.externalContactId,
          assigneeId: null,
          ownerId: null,
          cameFrom: input.cameFrom,
          contactStyle: input.contactStyle,
          email: formattedEmail,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: formattedPhone,
        };

        const createdContact: ContactDto = await this._dbContext.contactRepository.create(contactToSave);

        const newContactCreatedEvent = new NewContactCreatedEvent({
          contactId: createdContact.id,
        });

        this._eventDispatcher.registerEvent(newContactCreatedEvent);

        await this._dbContext.communicationRepository.create(createdContact.id);

        return {
          id: createdContact.id,
        };
      }

      contactToUpdate = existingContactByEmailOrPhone;
      contactToUpdate.externalId = input.externalContactId;

      const contactExternalIdChangedEvent = new ContactExternalIdChangedEvent({
        contactId: contactToUpdate.id,
      });

      this._eventDispatcher.registerEvent(contactExternalIdChangedEvent);
    } else {
      contactToUpdate = existingContactByExternalContactId;
    }

    contactToUpdate.cameFrom = getOrDefault(input.cameFrom, contactToUpdate.cameFrom);
    contactToUpdate.contactStyle = getOrDefault(input.contactStyle, contactToUpdate.contactStyle);
    contactToUpdate.email = formattedEmail ?? contactToUpdate.email;
    contactToUpdate.firstName = getOrDefault(input.firstName, contactToUpdate.firstName);
    contactToUpdate.lastName = getOrDefault(input.lastName, contactToUpdate.lastName);
    contactToUpdate.phone = formattedPhone ?? contactToUpdate.phone;
    contactToUpdate.acquisitionData = {
      ...contactToUpdate.acquisitionData,
      ...input.acquisitionData,
    };

    await this._dbContext.contactRepository.update(contactToUpdate);

    return {
      id: contactToUpdate.id,
    };
  }
}

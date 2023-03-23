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
import type { EditContactFromExternalSourceCommandInput } from './EditContactFromExternalSourceCommandInput';
import type { EditContactFromExternalSourceCommandResult } from './EditContactFromExternalSourceCommandResult';
import type { IEditContactFromExternalSourceCommandHandler } from './IEditContactFromExternalSourceCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class EditContactFromExternalSourceCommandHandler
  extends AbstractCommandHandler<EditContactFromExternalSourceCommandInput, EditContactFromExternalSourceCommandResult>
  implements IEditContactFromExternalSourceCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  protected async implementation(
    input: EditContactFromExternalSourceCommandInput
  ): Promise<EditContactFromExternalSourceCommandResult> {
    let contactToUpdate = await this._dbContext.contactRepository.findByExternalId(input.externalContactId);

    const sanitizedPhone = input.phone ? input.phone.replace(/[()-\s]/g, '') : null;

    const formattedPhone = sanitizedPhone ? (sanitizedPhone[0] === '+' ? sanitizedPhone : `+${sanitizedPhone}`) : null;

    const formattedEmail = input.email ? input.email.toLowerCase() : null;

    if (!contactToUpdate) {
      const existingContactByEmailOrPhone = await this._dbContext.contactRepository.findByEmailOrPhone({
        email: input.email,
        phone: input.phone,
      });

      if (!existingContactByEmailOrPhone) {
        const employee = await this._dbContext.employeeRepository.findRandomByRole(EmployeeRole.DISPATCHERS);

        if (!employee) {
          throw new ApplicationError('Employee not found');
        }

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
          emailIsConfirmed: input.phoneIsConfirmed,
          phoneIsConfirmed: input.emailIsConfirmed,
          externalId: input.externalContactId,
          assigneeId: employee.id,
          ownerId: employee.id,
          cameFrom: input.cameFrom,
          contactStyle: input.contactStyle,
          email: formattedEmail,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: formattedPhone,
        };

        const createdContact: ContactDto = await this._dbContext.contactRepository.create(contactToSave);

        await this._dbContext.communicationRepository.create(createdContact.id);

        return {
          acquisitionData: createdContact.acquisitionData
            ? {
                acquisitionChannel: createdContact.acquisitionData.acquisitionChannel,
                campaign: createdContact.acquisitionData.campaign,
                device: createdContact.acquisitionData.device,
                gAId: createdContact.acquisitionData.gAId,
                gclId: createdContact.acquisitionData.gclId,
                foobarId: createdContact.acquisitionData.foobarId,
                medium: createdContact.acquisitionData.medium,
                referredBy: createdContact.acquisitionData.referredBy,
                signUpLink: createdContact.acquisitionData.signUpLink,
                source: createdContact.acquisitionData.source,
                stytchId: createdContact.acquisitionData.stytchId,
                term: createdContact.acquisitionData.term,
                userIP: createdContact.acquisitionData.userIP,
              }
            : null,
          cameFrom: createdContact.cameFrom,
          contactStyle: createdContact.contactStyle,
          email: createdContact.email,
          externalId: createdContact.externalId,
          firstName: createdContact.firstName,
          id: createdContact.id,
          lastName: createdContact.lastName,
          phone: createdContact.phone,
        };
      }

      contactToUpdate = existingContactByEmailOrPhone;
      contactToUpdate.externalId = input.externalContactId;

      const contactExternalIdChangedEvent = new ContactExternalIdChangedEvent({
        contactId: contactToUpdate.id,
      });

      this._eventDispatcher.registerEvent(contactExternalIdChangedEvent);
    }

    contactToUpdate.firstName = getOrDefault(input.firstName, contactToUpdate.firstName);
    contactToUpdate.lastName = getOrDefault(input.lastName, contactToUpdate.lastName);
    contactToUpdate.email = formattedEmail ?? contactToUpdate.email;
    contactToUpdate.phone = formattedPhone ?? contactToUpdate.phone;
    contactToUpdate.emailIsConfirmed = getOrDefault(input.emailIsConfirmed, contactToUpdate.emailIsConfirmed);
    contactToUpdate.phoneIsConfirmed = getOrDefault(input.phoneIsConfirmed, contactToUpdate.phoneIsConfirmed);
    contactToUpdate.acquisitionData = input.acquisitionData
      ? {
          ...contactToUpdate.acquisitionData,
          ...input.acquisitionData,
        }
      : contactToUpdate.acquisitionData;

    await this._dbContext.contactRepository.update(contactToUpdate);

    const updatedContact = (await this._dbContext.contactRepository.findById(contactToUpdate.id)) as ContactDto;

    return {
      acquisitionData: updatedContact.acquisitionData
        ? {
            acquisitionChannel: updatedContact.acquisitionData.acquisitionChannel,
            campaign: updatedContact.acquisitionData.campaign,
            device: updatedContact.acquisitionData.device,
            gAId: updatedContact.acquisitionData.gAId,
            gclId: updatedContact.acquisitionData.gclId,
            foobarId: updatedContact.acquisitionData.foobarId,
            medium: updatedContact.acquisitionData.medium,
            referredBy: updatedContact.acquisitionData.referredBy,
            signUpLink: updatedContact.acquisitionData.signUpLink,
            source: updatedContact.acquisitionData.source,
            stytchId: updatedContact.acquisitionData.stytchId,
            term: updatedContact.acquisitionData.term,
            userIP: updatedContact.acquisitionData.userIP,
          }
        : null,
      cameFrom: updatedContact.cameFrom,
      contactStyle: updatedContact.contactStyle,
      email: updatedContact.email,
      externalId: updatedContact.externalId,
      firstName: updatedContact.firstName,
      id: updatedContact.id,
      lastName: updatedContact.lastName,
      phone: updatedContact.phone,
    };
  }
}

import { Inject, Injectable, Scope } from '@nestjs/common';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../../common/diTokens';
import { ContactNotUnique } from '../../../errors/contact-not-unique.error';
import { ContactDto } from '../../dataStructures/ContactDto';
import type { EditContactCommandInput } from './EditContactCommandInput';
import type { EditContactCommandResult } from './EditContactCommandResult';
import type { IEditContactCommandHandler } from './IEditContactCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class EditContactCommandHandler
  extends AbstractCommandHandler<EditContactCommandInput, EditContactCommandResult>
  implements IEditContactCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  protected async implementation(input: EditContactCommandInput): Promise<EditContactCommandResult> {
    const { cameFrom, contactStyle, email, firstName, lastName, phone, contactId } = input;

    const existingContact = await this._dbContext.contactRepository.findById(contactId);

    if (!existingContact) {
      throw new ApplicationError('Contact not found');
    }

    if (existingContact.externalId) {
      const emailChanged = input.email && input.email !== existingContact.email;
      const phoneChanged = input.phone && input.phone !== existingContact.phone;
      const firstNameChanged = input.firstName && input.firstName !== existingContact.firstName;
      const lastNameChanged = input.lastName && input.lastName !== existingContact.lastName;

      if ([emailChanged, phoneChanged, firstNameChanged, lastNameChanged].some(Boolean)) {
        throw new ApplicationError(
          "This contact is synchronized with Foobar Website. Primary contact fields can't be edited"
        );
      }
    }

    if (phone && phone !== existingContact.phone) {
      const existingContactByPhoneOrEmail = await this._dbContext.contactRepository.findByEmailOrPhone({
        phone,
        omitContactId: existingContact.id,
      });

      if (existingContactByPhoneOrEmail) {
        throw new ContactNotUnique(existingContactByPhoneOrEmail.id);
      }

      existingContact.phoneIsConfirmed = false;
    }

    const formattedEmail = input.email ? input.email.toLowerCase() : null;

    if (formattedEmail && formattedEmail !== existingContact.email) {
      const existingContactByPhoneOrEmail = await this._dbContext.contactRepository.findByEmailOrPhone({
        email: formattedEmail,
        omitContactId: existingContact.id,
      });

      if (existingContactByPhoneOrEmail) {
        throw new ContactNotUnique(existingContactByPhoneOrEmail.id);
      }

      existingContact.emailIsConfirmed = false;
    }

    existingContact.cameFrom = cameFrom ?? existingContact.cameFrom;
    existingContact.contactStyle = contactStyle ?? existingContact.contactStyle;
    existingContact.email = formattedEmail ?? existingContact.email;
    existingContact.firstName = firstName ?? existingContact.firstName;
    existingContact.lastName = lastName ?? existingContact.lastName;
    existingContact.phone = phone ?? existingContact.phone;

    await this._dbContext.contactRepository.update(existingContact);

    return {
      acquisitionData: existingContact.acquisitionData
        ? {
            acquisitionChannel: existingContact.acquisitionData.acquisitionChannel,
            campaign: existingContact.acquisitionData.campaign,
            device: existingContact.acquisitionData.device,
            gAId: existingContact.acquisitionData.gAId,
            gclId: existingContact.acquisitionData.gclId,
            foobarId: existingContact.acquisitionData.foobarId,
            medium: existingContact.acquisitionData.medium,
            referredBy: existingContact.acquisitionData.referredBy,
            signUpLink: existingContact.acquisitionData.signUpLink,
            source: existingContact.acquisitionData.source,
            stytchId: existingContact.acquisitionData.stytchId,
            term: existingContact.acquisitionData.term,
            userIP: existingContact.acquisitionData.userIP,
          }
        : null,
      cameFrom: existingContact.cameFrom,
      contactStyle: existingContact.contactStyle,
      email: existingContact.email,
      externalId: existingContact.externalId,
      firstName: existingContact.firstName,
      id: existingContact.id,
      lastName: existingContact.lastName,
      phone: existingContact.phone,
    };
  }
}

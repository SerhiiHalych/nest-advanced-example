import { Inject, Injectable, Scope } from '@nestjs/common';
import { capitalCase } from 'change-case';
import * as csvParser from 'csv-parser';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import { inspect } from 'util';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../../common/diTokens';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';
import { createHashMap } from '../../../../../common/utils/createHashMap';
import type { ContactCreateDto } from '../../dataStructures/ContactCreateDto';
import type { ContactUpdateDto } from '../../dataStructures/ContactUpdateDto';
import { AcquisitionChannel } from '../../enum/AcquisitionChannel';
import type { ContactFileRawData } from './ContactFileRawData';
import type { IImportContactsFromFoobarCommandHandler } from './IImportContactsFromFoobarCommandHandler';
import type { ImportContactsFromFoobarCommandInput } from './ImportContactsFromFoobarCommandInput';
import type { ImportContactsFromFoobarCommandResult } from './ImportContactsFromFoobarCommandResult';

@Injectable({ scope: Scope.REQUEST })
export class ImportContactsFromFoobarCommandHandler
  extends AbstractCommandHandler<ImportContactsFromFoobarCommandInput, ImportContactsFromFoobarCommandResult>
  implements IImportContactsFromFoobarCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  protected async implementation(
    input: ImportContactsFromFoobarCommandInput
  ): Promise<ImportContactsFromFoobarCommandResult> {
    const { csvFile, assigneeEmail } = input;

    const assigneeUser = await this._dbContext.userRepository.findByEmail(assigneeEmail);

    if (!assigneeUser) {
      throw new ApplicationError('Employee with provided email not found');
    }

    const assignee = await this._dbContext.employeeRepository.findByUserId(assigneeUser.id);

    const contactsToSave: ContactCreateDto[] = [];

    const existingEmails: Record<string, true> = {};
    const existingPhones: Record<string, true> = {};

    await new Promise((resolve, reject) => {
      csvFile
        .pipe(
          csvParser({
            mapHeaders: ({ header }) => {
              // split & clean up the header string
              const trimmedHeader = header.trim();

              // clear headers from BOM characters
              return trimmedHeader.replace(/[\u200B-\u200D\uFEFF"]/g, '');
            },
            mapValues: ({ value }) => {
              if (_.isString(value)) {
                const trimmedString = _.trim(value.replace(/^["]/, '').replace(/["]$/, ''));

                return trimmedString === '' ? null : trimmedString;
              }

              return value;
            },
          })
        )
        .on('headers', headers => {
          try {
            this.validateHeaders(headers);
          } catch (error) {
            reject(error);
          }
        })
        .on('data', async (csvRow: ContactFileRawData) => {
          const {
            email,
            emailVerified,
            id,
            phoneVerified,
            referredBy,
            stytchId,
            createdAt,
            familyName,
            givenName,
            phoneNumber,
          } = csvRow;

          try {
            const { error } = extendedJoi.string().uuid({ version: 'uuidv4' }).validate(id);

            const foobarId = error ? null : id;

            if (![email, foobarId, phoneNumber].some(Boolean)) {
              return;
            }

            const formattedEmail = email ? email.toLowerCase() : null;

            if (formattedEmail && existingEmails[formattedEmail]) {
              return;
            }

            existingEmails[formattedEmail] = true;

            const sanitizedPhone = phoneNumber ? phoneNumber.replace(/[()-\s]/g, '') : null;

            if (sanitizedPhone && existingPhones[sanitizedPhone]) {
              return;
            }

            existingPhones[sanitizedPhone] = true;

            contactsToSave.push({
              acquisitionData: {
                acquisitionChannel: null,
                campaign: null,
                device: null,
                gAId: null,
                gclId: null,
                foobarId,
                medium: null,
                referredBy,
                signUpLink: null,
                source: null,
                stytchId,
                term: null,
                userIP: null,
                referredbyID: null,
                unsubscribed: false,
              },
              createdAt: createdAt && moment(createdAt).toDate(),
              assigneeId: assignee.id,
              cameFrom: AcquisitionChannel.LH_WEB_SITE,
              contactStyle: [],
              email: email ? email.toLowerCase() : null,
              emailIsConfirmed: emailVerified?.toLowerCase() === 'true',
              externalId: foobarId,
              firstName: givenName ? capitalCase(givenName) : null,
              lastName: familyName ? capitalCase(familyName) : null,
              ownerId: assignee.id,
              phone: sanitizedPhone ? (sanitizedPhone[0] === '+' ? sanitizedPhone : `+${sanitizedPhone}`) : null,
              phoneIsConfirmed: phoneVerified?.toLowerCase() === 'true',
            });
          } catch (error) {
            reject(new ApplicationError(`Error in file row: ${inspect(csvRow, false, null, false)}\n${error}`));
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    let contactsToCreate = [...contactsToSave];

    const existingContactsByExternalId = await this._dbContext.contactRepository.checkAreExistsByExternalId(
      contactsToSave.map(({ externalId }) => externalId).filter(Boolean)
    );

    contactsToCreate = contactsToCreate.filter(({ externalId }) => !existingContactsByExternalId[externalId]);

    const existingContactsByEmail = await this._dbContext.contactRepository.checkAreExistsByEmail(
      contactsToSave.map(({ email }) => email).filter(Boolean)
    );

    contactsToCreate = contactsToCreate.filter(({ email }) => !existingContactsByEmail[email]);

    const existingContactsByPhone = await this._dbContext.contactRepository.checkAreExistsByPhone(
      contactsToSave.map(({ phone }) => phone).filter(Boolean)
    );

    contactsToCreate = contactsToCreate.filter(({ phone }) => !existingContactsByPhone[phone]);

    if (contactsToCreate.length > 0) {
      const newContactIds = await this._dbContext.contactRepository.bulkCreate(contactsToCreate);

      await this._dbContext.communicationRepository.bulkCreate(newContactIds);
    }

    const newContactsData: ContactUpdateDto[] = contactsToSave
      .map(contact => {
        const contactByExternalId = contact.externalId ? existingContactsByExternalId[contact.externalId] : null;

        if (contactByExternalId) {
          return {
            id: contactByExternalId,
            ...contact,
          };
        }

        const contactByEmail = contact.email ? existingContactsByEmail[contact.email] : null;

        if (contactByEmail) {
          return {
            id: contactByEmail,
            ...contact,
          };
        }

        const contactByPhone = contact.phone ? existingContactsByPhone[contact.phone] : null;

        if (contactByPhone) {
          return {
            id: contactByPhone,
            ...contact,
          };
        }

        return null;
      })
      .filter(Boolean);

    const contactsToUpdateHashMap = createHashMap(newContactsData, ({ id }) => id);

    const existingContactsToUpdate = await this._dbContext.contactRepository.listByIds(
      newContactsData.map(({ id }) => id)
    );

    const contactsToUpdate: ContactUpdateDto[] = existingContactsToUpdate
      .map(existingContact => {
        const newContactData = contactsToUpdateHashMap[existingContact.id];

        if (
          [
            newContactData.email === existingContact.email,
            newContactData.emailIsConfirmed === existingContact.emailIsConfirmed,
            newContactData.externalId === existingContact.externalId,
            newContactData.firstName === existingContact.firstName,
            newContactData.lastName === existingContact.lastName,
            newContactData.phone === existingContact.phone,
            newContactData.phoneIsConfirmed === existingContact.phoneIsConfirmed,
          ].every(Boolean)
        ) {
          return null;
        }

        return {
          ...existingContact,
          email: newContactData.email ?? existingContact.email,
          emailIsConfirmed: newContactData.emailIsConfirmed ?? existingContact.emailIsConfirmed,
          externalId: newContactData.externalId ?? existingContact.externalId,
          firstName: newContactData.firstName ?? existingContact.firstName,
          lastName: newContactData.lastName ?? existingContact.lastName,
          phone: newContactData.phone ?? existingContact.phone,
          phoneIsConfirmed: newContactData.phoneIsConfirmed ?? existingContact.phoneIsConfirmed,
        };
      })
      .filter(Boolean);

    if (contactsToUpdate.length > 0) {
      await this._dbContext.contactRepository.bulkUpdate(contactsToUpdate);
    }

    return {
      created: contactsToCreate.length,
      updated: contactsToUpdate.length,
    };
  }

  private validateHeaders(headers: string[]): void {
    const EXPECTED_FILE_HEADERS = [
      'id',
      'referredBy',
      'referralCode',
      'givenName',
      'familyName',
      'email',
      'createdAt',
      'updatedAt',
      'signedUp',
      'typeformSubmitted',
      'emailVerified',
      'emailCode',
      'phoneVerified',
      'phoneNumber',
      'stytchId',
      'role',
      'markForDeletion',
      'fbToken',
      'featureFlags',
    ];

    if (headers[headers.length - 1] === '') {
      headers = headers.slice(0, headers.length - 1);

      console.debug(`File has trailing comas. Removed the last (empty) column`);
    }

    const errorMessage = `File has invalid csv headers.`;

    const missingHeaders = EXPECTED_FILE_HEADERS.filter(v => !headers.includes(v));

    if (missingHeaders.length > 0) {
      throw new ApplicationError(`${errorMessage} File is missing headers: ${missingHeaders.join(',')}.`);
    }

    EXPECTED_FILE_HEADERS.forEach((expectedHeader, i) => {
      if (expectedHeader !== headers[i]) {
        const errorDetails = EXPECTED_FILE_HEADERS.includes(headers[i])
          ? ` The header "${headers[i]}" is in a wrong position.`
          : ` Unknown header "${headers[i]}".`;

        throw new ApplicationError(`${errorMessage}${errorDetails}`);
      }
    });
  }
}

import { Inject, Injectable, Scope } from '@nestjs/common';
import { capitalCase } from 'change-case';
import * as csvParser from 'csv-parser';
import * as _ from 'lodash';
import { inspect } from 'util';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../../common/diTokens';
import { extendedJoi } from '../../../../../common/infrastructure/validation/joi/extendedJoi';
import type { ContactCreateDto } from '../../dataStructures/ContactCreateDto';
import type { ContactUpdateDto } from '../../dataStructures/ContactUpdateDto';
import { AcquisitionChannel } from '../../enum/AcquisitionChannel';
import type { ContactFileRawData } from './ContactFileRawData';
import type { IImportContactsCommandHandler } from './IImportContactsCommandHandler';
import type { ImportContactsCommandInput } from './ImportContactsCommandInput';
import type { ImportContactsCommandResult } from './ImportContactsCommandResult';

@Injectable({ scope: Scope.REQUEST })
export class ImportContactsCommandHandler
  extends AbstractCommandHandler<ImportContactsCommandInput, ImportContactsCommandResult>
  implements IImportContactsCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  protected async implementation(input: ImportContactsCommandInput): Promise<ImportContactsCommandResult> {
    const { csvFile, assigneeEmail } = input;

    const assigneeUser = await this._dbContext.userRepository.findByEmail(assigneeEmail);

    if (!assigneeUser) {
      throw new ApplicationError('Employee with provided email not found');
    }

    const assignee = await this._dbContext.employeeRepository.findByUserId(assigneeUser.id);

    const contactsToSave: ContactCreateDto[] = [];

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
                const trimmedString = _.trim(value);

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
            campaign,
            created_at,
            device,
            email,
            emailVerified,
            firstName,
            gaUser,
            gclid,
            id,
            lastName,
            medium,
            phone,
            phoneVerified,
            referredBy,
            referredbyID,
            source,
            stytchId,
            term,
            unsubscribed,
          } = csvRow;

          try {
            const { error } = extendedJoi.string().uuid({ version: 'uuidv4' }).validate(id);

            const foobarId = error ? null : id;

            if (![email, foobarId, phone].some(Boolean)) {
              return;
            }

            const sanitizedPhone = phone ? phone.replace(/[()-\s]/g, '') : null;

            contactsToSave.push({
              acquisitionData: {
                acquisitionChannel: null,
                campaign,
                device,
                gAId: gaUser,
                gclId: gclid,
                foobarId,
                medium,
                referredBy,
                signUpLink: null,
                source,
                stytchId,
                term,
                userIP: null,
                referredbyID: referredbyID ?? null,
                unsubscribed: unsubscribed?.toLowerCase() === 'true',
              },
              createdAt: created_at && new Date(created_at * 1000),
              assigneeId: assignee.id,
              cameFrom: AcquisitionChannel.LH_WEB_SITE,
              contactStyle: [],
              email: email ? email.toLowerCase() : null,
              emailIsConfirmed: emailVerified?.toLowerCase() === 'true',
              externalId: foobarId,
              firstName: firstName ? capitalCase(firstName) : null,
              lastName: lastName ? capitalCase(lastName) : null,
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

    const contactsToUpdate: ContactUpdateDto[] = contactsToSave
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

    const newContactIds = await this._dbContext.contactRepository.bulkCreate(contactsToCreate);

    await this._dbContext.communicationRepository.bulkCreate(newContactIds);

    await this._dbContext.contactRepository.bulkUpdate(contactsToUpdate);

    return {
      created: contactsToCreate.length,
      updated: contactsToUpdate.length,
    };
  }

  private validateHeaders(headers: string[]): void {
    const EXPECTED_FILE_HEADERS = [
      'id',
      'campaign',
      'created_at',
      'device',
      'email',
      'emailVerified',
      'firstName',
      'gaUser',
      'gclid',
      'lastName',
      'medium',
      'phone',
      'phoneVerified',
      'referredBy',
      'referredbyID',
      'source',
      'stytchId',
      'term',
      'unsubscribed',
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

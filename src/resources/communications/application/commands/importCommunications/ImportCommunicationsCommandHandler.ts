import { Inject, Injectable, Scope } from '@nestjs/common';
import * as csvParser from 'csv-parser';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import { inspect } from 'util';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../../common/diTokens';
import type { ContactCreateDto } from '../../../../contacts/application/dataStructures/ContactCreateDto';
import { AcquisitionChannel } from '../../../../contacts/application/enum/AcquisitionChannel';
import type { CommunicationItemCreateDto } from '../../dataStructures/CommunicationItemCreateDto';
import { CommunicationItemType } from '../../enum/CommunicationItemType';
import { SmsState } from '../../enum/SmsState';
import type { CommunicationFileRawData } from './CommunicationFileRawData';
import type { IImportCommunicationsCommandHandler } from './IImportCommunicationsCommandHandler';
import type { ImportCommunicationsCommandInput } from './ImportCommunicationsCommandInput';
import type { ImportCommunicationsCommandResult } from './ImportCommunicationsCommandResult';

@Injectable({ scope: Scope.REQUEST })
export class ImportCommunicationsCommandHandler
  extends AbstractCommandHandler<ImportCommunicationsCommandInput, ImportCommunicationsCommandResult>
  implements IImportCommunicationsCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  protected async implementation(input: ImportCommunicationsCommandInput): Promise<ImportCommunicationsCommandResult> {
    const { csvFile, assigneeEmail } = input;

    const assigneeUser = await this._dbContext.userRepository.findByEmail(assigneeEmail);

    if (!assigneeUser) {
      throw new ApplicationError('Employee with provided email not found');
    }

    const assignee = await this._dbContext.employeeRepository.findByUserId(assigneeUser.id);

    const messagesByPhones: Record<
      string,
      {
        received: Array<{
          text: string;
          externalId: string;
          date: Date;
        }>;
        sent: Array<{
          errorCode: number | null;
          text: string;
          externalId: string;
          date: Date;
        }>;
      }
    > = {};

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
        .on('data', async (csvRow: CommunicationFileRawData) => {
          const { Body, Direction, ErrorCode, From, Status, To, Sid, SentDate } = csvRow;

          try {
            const contactPhone = Direction === 'outbound-api' ? To : From;

            const phoneMessagesExist = _.has(messagesByPhones, [contactPhone]);

            if (!phoneMessagesExist) {
              _.set(messagesByPhones, [contactPhone], {
                received: [],
                sent: [],
              });
            }

            const phoneMessages = _.get(messagesByPhones, [contactPhone]);

            switch (Status) {
              case 'delivered':
              case 'sent':
                phoneMessages.sent.push({
                  errorCode: null,
                  text: Body,
                  externalId: Sid,
                  date: moment(SentDate).toDate(),
                });

                break;

              case 'received':
                phoneMessages.received.push({
                  text: Body,
                  externalId: Sid,
                  date: moment(SentDate).toDate(),
                });

                break;

              case 'undelivered':
                phoneMessages.sent.push({
                  errorCode: ErrorCode,
                  text: Body,
                  externalId: Sid,
                  date: moment(SentDate).toDate(),
                });

                break;
            }
          } catch (error) {
            reject(new ApplicationError(`Error in file row: ${inspect(csvRow, false, null, false)}\n${error}`));
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    const contactPhonesWithMinDate = _(messagesByPhones)
      .mapValues(value => _([...value.received.map(({ date }) => date), ...value.sent.map(({ date }) => date)]).min())
      .value();

    const contactPhones = Object.keys(contactPhonesWithMinDate);

    let existingContactsByPhone = await this._dbContext.contactRepository.checkAreExistsByPhone(contactPhones);

    const newContactPhones = contactPhones.filter(phone => !existingContactsByPhone[phone]);

    const contactIds = _.values(existingContactsByPhone);

    if (newContactPhones.length > 0) {
      const contactsToCreate: ContactCreateDto[] = newContactPhones.map(phone => ({
        phone,
        firstName: null,
        lastName: null,
        acquisitionData: null,
        email: null,
        emailIsConfirmed: false,
        phoneIsConfirmed: false,
        externalId: null,
        assigneeId: assignee.id,
        ownerId: assignee.id,
        cameFrom: AcquisitionChannel.DEFAULT,
        contactStyle: [],
        createdAt: contactPhonesWithMinDate[phone],
      }));

      const newContactIds = await this._dbContext.contactRepository.bulkCreate(contactsToCreate);

      contactIds.push(...newContactIds);

      await this._dbContext.communicationRepository.bulkCreate(newContactIds);

      existingContactsByPhone = await this._dbContext.contactRepository.checkAreExistsByPhone(contactPhones);
    }

    const communicationIdsByContactIds = await this._dbContext.communicationRepository.listByContactIds(contactIds);

    const communicationItemsToCreate: CommunicationItemCreateDto[] = _(contactPhones)
      .map(phone => {
        const contactId = existingContactsByPhone[phone];
        const communicationId = communicationIdsByContactIds[contactId];

        const messagesByPhone = messagesByPhones[phone];

        return [
          ...messagesByPhone.received.map<CommunicationItemCreateDto>(receivedMessage => ({
            createdAt: receivedMessage.date,
            acknowledgement: [],
            communicationId,
            payload: {
              externalId: receivedMessage.externalId,
              text: receivedMessage.text,
              media: [],
            },
            type: CommunicationItemType.INCOMING_SMS,
          })),
          ...messagesByPhone.sent.map<CommunicationItemCreateDto>(sentMessage => ({
            createdAt: sentMessage.date,
            acknowledgement: [],
            communicationId,
            payload: {
              externalId: sentMessage.externalId,
              text: sentMessage.text,
              senderId: assignee.id,
              errorCode: sentMessage.errorCode,
              state: sentMessage.errorCode ? SmsState.FAILED : SmsState.SENT,
              media: [],
            },
            type: CommunicationItemType.OUTGOING_SMS,
          })),
        ];
      })
      .flatten()
      .value();

    await this._dbContext.communicationRepository.bulkCreateItems(communicationItemsToCreate);

    const result: ImportCommunicationsCommandResult = {
      newContacts: newContactPhones.length,
      smsImported: _(messagesByPhones)
        .map(({ received, sent }) => received.length + sent.length)
        .sum(),
    };

    return result;
  }

  private validateHeaders(headers: string[]): void {
    const EXPECTED_FILE_HEADERS = [
      'From',
      'To',
      'Body',
      'Status',
      'SentDate',
      'ApiVersion',
      'NumSegments',
      'ErrorCode',
      'AccountSid',
      'Sid',
      'Direction',
      'Price',
      'PriceUnit',
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

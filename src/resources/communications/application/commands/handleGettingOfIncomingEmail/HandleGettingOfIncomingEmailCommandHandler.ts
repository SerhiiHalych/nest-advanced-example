/* eslint-disable @typescript-eslint/naming-convention */
import { Inject, Injectable, Scope } from '@nestjs/common';
import type { gmail_v1 } from 'googleapis';
import { google } from 'googleapis';
import { JSDOM } from 'jsdom';
import * as _ from 'lodash';

import { ApplicationError } from '../../../../../app/errors/application.error';
import { AbstractCommandHandler } from '../../../../../common/application/AbstractCommandHandler';
import { IGlobalDBContext } from '../../../../../common/application/IGlobalDBContext';
import { BaseType } from '../../../../../common/diTokens';
import { runSequentially } from '../../../../../common/utils/runSequentially';
import type { ContactCreateDto } from '../../../../contacts/application/dataStructures/ContactCreateDto';
import type { ContactDto } from '../../../../contacts/application/dataStructures/ContactDto';
import { AcquisitionChannel } from '../../../../contacts/application/enum/AcquisitionChannel';
import { NewContactCreatedEvent } from '../../../../contacts/application/events/NewContactCreatedEvent';
import { EmployeeRole } from '../../../../employees/application/enums/EmployeeRole';
import type { CommunicationItemCreateDto } from '../../dataStructures/CommunicationItemCreateDto';
import type { CommunicationItemDto } from '../../dataStructures/CommunicationItemDto';
import { CommunicationItemType } from '../../enum/CommunicationItemType';
import { CommunicationObserver } from '../../observers/CommunicationObserver';
import type { HandleGettingOfIncomingEmailCommandInput } from './HandleGettingOfIncomingEmailCommandInput';
import type { IHandleGettingOfIncomingEmailCommandHandler } from './IHandleGettingOfIncomingEmailCommandHandler';

@Injectable({ scope: Scope.REQUEST })
export class HandleGettingOfIncomingEmailCommandHandler
  extends AbstractCommandHandler<HandleGettingOfIncomingEmailCommandInput, void>
  implements IHandleGettingOfIncomingEmailCommandHandler
{
  @Inject(BaseType.GLOBAL_DB_CONTEXT) protected _dbContext: IGlobalDBContext;

  constructor(private communicationObserver: CommunicationObserver) {
    super();
  }

  protected async implementation(input: HandleGettingOfIncomingEmailCommandInput): Promise<void> {
    const { message } = input;

    this.addCommitHandler(() => message.ack());

    const parsedData: {
      emailAddress: string;
      historyId: string;
    } = JSON.parse(message.data.toString());

    const historyId = parsedData.historyId;

    // eslint-disable-next-line no-console
    console.log(`Gmail history event. History id = ${historyId}`);

    const settings = await this._dbContext.settingsRepository.get();

    if (parsedData.emailAddress !== settings.google.communicationEmail) {
      return;
    }

    const { lastGmailHistoryId } = settings;

    settings.lastGmailHistoryId = historyId;

    await this._dbContext.settingsRepository.save(settings);

    if (!lastGmailHistoryId) {
      return;
    }

    const gmail = google.gmail('v1');

    const { data } = await gmail.users.history.list({
      userId: 'me',
      startHistoryId: lastGmailHistoryId,
      labelId: 'UNREAD',
      historyTypes: ['messageAdded'],
    });

    if (!data.history) {
      return;
    }

    const messageIds = _(data.history)
      .map(({ messagesAdded }) => messagesAdded.map(({ message: { id } }) => id))
      .flatten()
      .uniq()
      .value();

    const existingMessages = await this._dbContext.communicationRepository.listEmailsByExternaiId(messageIds);

    const newMessageIds = messageIds.filter(
      messageId => !existingMessages.some(({ payload: { extenalEmailId } }) => extenalEmailId === messageId)
    );

    newMessageIds.reverse();

    await runSequentially(newMessageIds, async messageId => {
      const { data: message } = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });

      const fromRaw = message.payload.headers.find(({ name }) => name === 'From').value;

      const fromMatch = fromRaw.match(/<.+>/);

      const from = fromMatch ? fromMatch[0].slice(1, -1) : fromRaw;

      const fromParts = fromRaw.split(' ');

      let contact = await this._dbContext.contactRepository.findByEmailOrPhone({ email: from });

      if (!contact) {
        const [firstName, lastName] = fromParts.length >= 3 ? fromParts : [null, null];

        contact = await this.createContact({
          email: from,
          firstName,
          lastName,
        });
      }

      const createdCommunicationItem = await this.createCommunicationItem(contact, message);

      this.addCommitHandler(() =>
        this.communicationObserver.dispatchCommunicationItem(createdCommunicationItem, contact.id)
      );
    });
  }

  private async createCommunicationItem(
    contact: ContactDto,
    message: gmail_v1.Schema$Message
  ): Promise<CommunicationItemDto> {
    const communication = await this._dbContext.communicationRepository.findByContactId(contact.id);

    const subject = message.payload.headers.find(({ name }) => name === 'Subject').value;

    const headerMessageId = message.payload.headers.find(
      ({ name }) => name.toLowerCase() === 'Message-ID'.toLowerCase()
    ).value;

    const parsedMessage = this.parseGmailEmailResponse(message.payload);

    const employeeIdsForAcknowledgement = _([contact.ownerId, contact.assigneeId]).uniq().value();

    const communicationItemCreateDto: CommunicationItemCreateDto = {
      communicationId: communication.id,
      payload: {
        headerMessageId,
        text: parsedMessage.text,
        extenalEmailId: message.id,
        subject: subject,
        threadId: message.threadId,
        cc: [],
        bcc: [],
        emailAttachments: parsedMessage.attachments,
      },
      type: CommunicationItemType.INCOMING_EMAIL,
      acknowledgement: employeeIdsForAcknowledgement.map(employeeId => ({
        acknowledged: false,
        employeeId,
      })),
    };

    const createdCommunicationItem = await this._dbContext.communicationRepository.createItem(
      communicationItemCreateDto
    );

    return createdCommunicationItem;
  }

  private async createContact(params: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  }): Promise<ContactDto> {
    const { email, firstName, lastName } = params;

    const employee = await this._dbContext.employeeRepository.findRandomByRole(EmployeeRole.DISPATCHERS);

    if (!employee) {
      throw new ApplicationError('No dispatcher found in system');
    }

    const contactToSave: ContactCreateDto = {
      email,
      firstName,
      lastName,
      acquisitionData: null,
      emailIsConfirmed: false,
      phoneIsConfirmed: false,
      externalId: null,
      assigneeId: employee.id,
      ownerId: employee.id,
      cameFrom: AcquisitionChannel.DEFAULT,
      contactStyle: [],

      phone: null,
    };

    const contact = await this._dbContext.contactRepository.create(contactToSave);

    const newContactCreatedEvent = new NewContactCreatedEvent({
      contactId: contact.id,
    });

    this._eventDispatcher.registerEvent(newContactCreatedEvent);

    await this._dbContext.communicationRepository.create(contact.id);

    return contact;
  }

  private parseGmailEmailResponse(
    messagePart: gmail_v1.Schema$MessagePart,
    result: {
      text: string;
      attachments: Array<{
        attachmentId: string;
        filename: string;
        extension: string;
        size: number;
      }>;
    } = {
      text: null,
      attachments: [],
    }
  ): {
    text: string;
    attachments: Array<{
      attachmentId: string;
      filename: string;
      extension: string;
      size: number;
    }>;
  } {
    if (messagePart.parts) {
      messagePart.parts.forEach(part => this.parseGmailEmailResponse(part, result));
    }

    const textMimeType = 'text/html';

    const attachmentMimeBranches = ['application', 'audio', 'image', 'video'];

    if (messagePart.mimeType === textMimeType) {
      const html = Buffer.from(messagePart.body.data, 'base64').toString();

      const jsdom = new JSDOM(html);

      const firstElement = jsdom.window.document.body.firstElementChild;

      result.text = firstElement ? firstElement.innerHTML : jsdom.window.document.body.innerHTML;

      return result;
    }

    const [mimeTypeBranch] = messagePart.mimeType.split('/');

    if (attachmentMimeBranches.includes(mimeTypeBranch)) {
      const fileParts = messagePart.filename.split('.');

      const fileExtencion = fileParts[fileParts.length - 1];

      const fileName = fileParts.slice(0, -1).join('.');

      result.attachments.push({
        attachmentId: messagePart.body.attachmentId,
        extension: fileExtencion,
        filename: fileName,
        size: messagePart.body.size,
      });
    }

    return result;
  }
}

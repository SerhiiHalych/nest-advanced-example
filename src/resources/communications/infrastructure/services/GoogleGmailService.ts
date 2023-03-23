import type { gmail_v1 } from 'googleapis';
import { google } from 'googleapis';
// eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/naming-convention
const MailComposer = require('nodemailer/lib/mail-composer');
import type Mail from 'nodemailer/lib/mailer';

export class GoogleGmailService {
  private gmail: gmail_v1.Gmail;

  constructor() {
    this.gmail = google.gmail({
      version: 'v1',
    });
  }

  async watchEmailInbox(email: string): Promise<string> {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const topicName = process.env.GOOGLE_CLOUD_GMAIL_UNREAD_TOPIC_NAME;
    const topicId = `projects/${projectId}/topics/${topicName}`;

    const {
      data: { historyId },
    } = await this.gmail.users.watch({
      userId: email,
      requestBody: {
        labelIds: ['UNREAD'],
        labelFilterAction: 'include',
        topicName: topicId,
      },
    });

    console.log('Listening for gmail new emails');

    return historyId;
  }

  async stopWatchingEmailInbox(email: string): Promise<void> {
    await this.gmail.users.stop({
      userId: email,
    });

    console.log('Stopped listening for gmail new emails');
  }

  async sendEmail(params: {
    to: string;
    fromName: string;
    fromEmail: string;
    subject: string;
    text: string;
    cc?: string[];
    bcc?: string[];
    replyTo?: {
      headerMessageId: string;
      threadId: string;
    };
    attachments?: Array<{
      fileName: string;
      fileExtension: string;
      fileData: Buffer;
    }>;
  }): Promise<string> {
    const options: Mail.Options = {
      to: params.to,
      from: `${params.fromName} <${params.fromEmail}>`,
      subject: params.subject,
      text: params.text,
      html: params.text,
      textEncoding: 'base64',
      attachments: (params.attachments ?? []).map(({ fileName, fileData, fileExtension }) => ({
        filename: `${fileName}.${fileExtension}`,
        content: fileData,
        encoding: 'base64',
      })),
      cc: params.cc ?? [],
      bcc: params.bcc ?? [],
    };

    let threadId: string | null = null;

    if (params.replyTo) {
      options.references = params.replyTo.headerMessageId;
      options.inReplyTo = params.replyTo.headerMessageId;
      options.subject = params.subject;
      threadId = params.replyTo.threadId;
    }

    const mail = new MailComposer(options);

    const compiledMessage = await mail.compile();
    compiledMessage.keepBcc = true;

    const builtMessage = await compiledMessage.build();

    const base64 = builtMessage.toString('base64');

    const encodedMessage = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const requestBody: gmail_v1.Schema$Message = {
      raw: encodedMessage,
    };

    if (threadId) {
      requestBody.threadId = threadId;
    }

    const emailSendResult = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody,
    });

    return emailSendResult.data.id;
  }

  async getEmailById(
    email: string,
    emailId: string
  ): Promise<{
    id: string;
    threadId: string;
    headerMessageId: string;
    attachments: {
      attachmentId: string;
      filename: string;
      extension: string;
      size: number;
    }[];
  }> {
    const sentEmail = await this.gmail.users.messages.get({
      userId: email,
      id: emailId,
    });

    const headerMessageId = sentEmail.data.payload.headers.find(
      ({ name }) => name.toLowerCase() === 'Message-Id'.toLowerCase()
    ).value;

    const parsedMessage = this.parseGmailEmailResponse(sentEmail.data.payload);

    return {
      attachments: parsedMessage.attachments,
      headerMessageId,
      id: sentEmail.data.id,
      threadId: sentEmail.data.threadId,
    };
  }

  async getAttachment(email: string | null, messageId: string, attachmentId: string): Promise<string> {
    const response = await this.gmail.users.messages.attachments.get({
      userId: email ?? 'me',
      id: attachmentId,
      messageId,
    });

    return response.data.data;
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

    const textMimeType = 'text/plain';

    const attachmentMimeBranches = ['application', 'audio', 'image', 'video'];

    if (messagePart.mimeType === textMimeType) {
      result.text = Buffer.from(messagePart.body.data, 'base64').toString();

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

import type { AbstractEmailTemplate } from './AbstractEmailTemplate';

export interface IEmailSender {
  sendEmail<TPayload>(from: string, to: string, template: AbstractEmailTemplate<TPayload>): Promise<void>;

  replyTo<TPayload>(
    emailId: string,
    from: string,
    to: string[],
    template: AbstractEmailTemplate<TPayload>
  ): Promise<void>;
}

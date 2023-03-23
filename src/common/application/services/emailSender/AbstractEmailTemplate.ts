import type { DSEmailAttachment } from './DSEmailAttachment';

export abstract class AbstractEmailTemplate<TEmailTemplatePayload> {
  protected readonly _payload: TEmailTemplatePayload;

  constructor(variables: TEmailTemplatePayload) {
    this._payload = variables;
  }

  getAttachments(): DSEmailAttachment[] {
    return [];
  }

  abstract getSubject(): string;

  getBody(): string {
    return this.buildHTMLTemplate();
  }

  protected abstract buildHTMLTemplate(): string;
}

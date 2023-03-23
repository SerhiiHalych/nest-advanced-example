import type { EventType } from './EventType';

export abstract class AbstractEvent<TPayload> {
  private readonly _payload: Readonly<TPayload>;
  abstract eventType: EventType;

  constructor(payload: TPayload) {
    this._payload = Object.freeze(payload);
  }

  get payload(): Readonly<TPayload> {
    return this._payload;
  }
}

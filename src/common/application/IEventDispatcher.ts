import type { AbstractEvent } from './AbstractEvent';

export interface IEventDispatcher {
  registerEvent(event: AbstractEvent<any>): void;

  registerFailureEvent(event: AbstractEvent<any>): void;

  dispatchEvents(): void;

  dispatchFailureEvents(): void;
}

/* eslint-disable no-console */
import { Injectable, Scope } from '@nestjs/common';

import type { AbstractEvent } from '../application/AbstractEvent';
import type { IEventDispatcher } from '../application/IEventDispatcher';
import { EventHandlerFactory } from './EventHandlerFactory';

@Injectable({ scope: Scope.REQUEST })
export class InProcessEventDispatcher implements IEventDispatcher {
  private readonly _publishedEvents: Array<{
    event: AbstractEvent<any>;
    isFailure: boolean;
  }>;

  constructor(private eventHandlerFactory: EventHandlerFactory) {
    this._publishedEvents = [];
  }

  registerEvent(event: AbstractEvent<any>): void {
    console.log(`Event registered: ${event.eventType}`);

    this._publishedEvents.push({
      event,
      isFailure: false,
    });
  }

  registerFailureEvent(event: AbstractEvent<any>): void {
    this._publishedEvents.push({
      event,
      isFailure: true,
    });
  }

  dispatchEvents(): void {
    this._publishedEvents
      .filter(({ isFailure }) => !isFailure)
      .map(({ event }) =>
        setImmediate(async () => {
          try {
            await this.dispatchEvent(event);
          } catch (e) {
            console.error(`Error during commit handlers execution`, e);
          }
        })
      );
  }

  dispatchFailureEvents(): void {
    this._publishedEvents
      .filter(({ isFailure }) => isFailure)
      .map(({ event }) =>
        setImmediate(async () => {
          try {
            await this.dispatchEvent(event);
          } catch (e) {
            console.error(`Error during commit handlers execution`, e);
          }
        })
      );
  }

  private async dispatchEvent(event: AbstractEvent<any>): Promise<void> {
    const eventHandlers = await this.eventHandlerFactory.getHandlers(event);

    console.log(
      `Event is dispatching - ${event.eventType}.\nHandlers - ${eventHandlers
        .map(handler => handler.constructor.name)
        .join(', ')}`
    );

    await Promise.allSettled(eventHandlers.map(eventHandler => eventHandler.handle(event)));

    console.log(`Event dispatched - ${event.eventType}`);
  }
}

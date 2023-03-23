import type { AbstractEvent } from './AbstractEvent';
import type { IDBContext } from './IDBContext';

export abstract class AbstractEventHandler<TEvent extends AbstractEvent<any>> {
  protected _event: TEvent;

  protected abstract _dbContext: IDBContext | null;

  private _commitHandlers: Array<() => Promise<any>>;

  constructor() {
    this._commitHandlers = [];
  }

  protected addCommitHandler(handler: () => any): void {
    this._commitHandlers.push(handler);
  }

  async handle(event: TEvent): Promise<void> {
    this._event = event;

    if (this._dbContext) {
      await this._dbContext.startTransaction();
    }

    try {
      await this.implementation(event);

      if (this._dbContext) {
        await this._dbContext.commitTransaction();
      }

      this._commitHandlers.map(action =>
        setImmediate(async () => {
          try {
            await action.apply(this);
          } catch (e) {
            console.error(`Error during commit handlers ${this.constructor.name} execution`, e);
          }
        })
      );

      console.log(`Event handler ${this.constructor.name} successfully finished.`);
    } catch (error) {
      console.log(`Event handler ${this.constructor.name} failed with error:`);
      console.error(error);

      if (this._dbContext) {
        await this._dbContext.rollbackTransaction();
      }
    }
  }

  protected abstract implementation(event: TEvent): Promise<void>;
}

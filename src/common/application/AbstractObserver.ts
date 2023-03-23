export abstract class AbstractObserver<TActionCb extends (...args: Parameters<TActionCb>) => void | Promise<void>> {
  protected readonly listeners: Map<string, Array<TActionCb>>;

  constructor() {
    this.listeners = new Map();
  }

  subscribe(subscriberId: string, action: TActionCb): void {
    const listenerExists = this.listeners.has(subscriberId);

    if (!listenerExists) {
      this.listeners.set(subscriberId, [action]);

      return;
    }

    const subscriberMap = this.listeners.get(subscriberId);

    subscriberMap.push(action);
  }

  unsubscribe(subscriberId: string): void {
    this.listeners.delete(subscriberId);
  }

  protected async notify(...args: Parameters<TActionCb>): Promise<void> {
    const actionsNested = Array.from(this.listeners.values());

    await Promise.all(actionsNested.map(actions => Promise.all(actions.map(action => action(...args)))));
  }
}

interface EventListeners {
  [eventName: string]: ((value: any) => void)[];
}

/**
 * EventDispatcher
 * @export
 * @class EventDispatcher
 */
export default class EventDispatcher {
  private listeners: EventListeners;
  /**
   * Creates an instance of EventDispatcher.
   */
  constructor() {
    this.listeners = {};
  }

  /**
   * addEventListener
   */
  public addEventListener = (eventName: string, listener: () => void): void => {
    if (this.listeners[eventName] == null) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listener);
  };

  /**
   * removeEventListener
   */
  public removeEventListener = (eventName: string, listener: () => void): void => {
    if (listener) {
      const eventListeners = this.listeners[eventName];
      const max: number = eventListeners.length;
      for (let i: number = 0; i < max; i += 1) {
        const l = eventListeners[i];
        if (l === listener) {
          eventListeners.splice(i, 1);
        }
      }
    } else {
      if (this.listeners[eventName]) {
        this.listeners[eventName] = [];
      }
    }
  };

  /**
   * dispatch
   */
  public dispatchEvent = (eventName: string, data?: any): void => {
    if (data === void 0) {
      data = null;
    }
    const listeners = this.listeners[eventName];
    if (listeners == null) return;

    for (let i: number = 0, length = listeners.length; i < length; i += 1) {
      const listener = listeners[i];
      if (listener) {
        const value = {
          target: this,
          data,
        };
        listener(value);
      }
    }
  };
}

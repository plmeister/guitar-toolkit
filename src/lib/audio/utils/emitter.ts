type Listener<T> = (payload: T) => void;

export class Emitter<Events extends Record<string, any>> {
  private listeners: {
    [K in keyof Events]?: Listener<Events[K]>[];
  } = {};

  on<K extends keyof Events>(event: K, fn: Listener<Events[K]>) {
    this.listeners[event] ??= [];
    this.listeners[event]!.push(fn);

    return () => this.off(event, fn);
  }

  off<K extends keyof Events>(event: K, fn: Listener<Events[K]>) {
    this.listeners[event] = this.listeners[event]?.filter((f) => f !== fn);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    this.listeners[event]?.forEach((fn) => fn(payload));
  }
}

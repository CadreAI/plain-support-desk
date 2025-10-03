// Simple in-memory event emitter for real-time updates
// In production, use Redis Pub/Sub or a similar solution for multi-instance support

type EventCallback = (data: unknown) => void;

class EventEmitter {
  private events: Map<string, Set<EventCallback>> = new Map();

  subscribe(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.events.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  emit(event: string, data: unknown) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  listenerCount(event: string): number {
    return this.events.get(event)?.size || 0;
  }
}

export const eventEmitter = new EventEmitter();


export class MockSocket {
  handlers = new Map<string, (...args: any[]) => void>();
  connected = true;
  auth = {};
  io = { opts: { query: {} } };

  on(event: string, handler: (...args: any[]) => void) {
    this.handlers.set(event, handler);
  }

  emit(event: string, ...args: any[]) {
    if (args[1] && typeof args[1] === 'function') {
      // Handle acknowledgments
      args[1]({ success: true });
    }
  }

  disconnect() {
    this.connected = false;
  }

  // Test helpers
  simulateMessage(event: string, data: any) {
    this.handlers.get(event)?.(data);
  }

  simulateConnectError(err: Error) {
    this.handlers.get('connect_error')?.(err);
  }
}

export class MockNamespaceSocket extends MockSocket {
  rooms = new Set<string>();

  join(room: string) {
    this.rooms.add(room);
  }

  leave(room: string) {
    this.rooms.delete(room);
  }
}
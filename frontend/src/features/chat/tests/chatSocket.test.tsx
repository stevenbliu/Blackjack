// chatSocket.test.tsx

import socketServiceInstance from '@features/websocket/socketServiceSingleton';
import SocketService from '../../websocket/socketService'; // default import

let socketService: SocketService;

describe('SocketService - integration', () => {

  beforeAll(async () => {
    socketService = new SocketService();
    await socketService.connect('test-token', 'testuser', 'userid123');
  });

  afterAll(() => {
    socketService.disconnect();
  });


  test('subscribe and receive ack', async () => {
    const ack = await socketService.subscribe('root_test', () => {});
    console.log(ack);
    expect(ack).toHaveProperty('success', true);
  }, 5000);

  test('can join namespace send and receive messages', async () => {
    const ns = await socketService.addNamespace('/chat');

    ns.emit('join_room', { room_id: 'room123' });

    ns.on('room_joined', (msg: any) => {
      expect(msg).toHaveProperty('room_id', 'room123');
    });
  });
});


describe('Connection Management', () => {
  test('should connect with valid credentials', async () => {
    await expect(socketService.connect('valid-token', 'user', 'id'))
      .resolves.not.toThrow();
  });

  test('should reject invalid connections', async () => {
    await expect(socketService.connect('', '', ''))
      .rejects.toThrow('Invalid credentials');
  });

  test('should emit connect event', (done) => {
    socketService.on('connect', () => {
      done();
    });
  });
});


describe('Namespace/Room Management', () => {
  let chatNamespace: Socket;

  beforeAll(async () => {
    chatNamespace = await socketService.addNamespace('/chat');
  });

  test('should create namespace connection', () => {
    expect(chatNamespace.connected).toBe(true);
  });

  test('should join and leave rooms', async () => {
    const joinAck = await chatNamespace.emitWithAck('join_room', 'general');
    expect(joinAck).toHaveProperty('success', true);

    const leaveAck = await chatNamespace.emitWithAck('leave_room', 'general');
    expect(leaveAck).toHaveProperty('success', true);
  });

  test('should receive room-specific messages', async () => {
    const testMsg = { text: "Test", user: "tester" };
    const promise = new Promise((resolve) => {
      chatNamespace.on('room_message', (msg) => {
        expect(msg).toEqual(testMsg);
        resolve(true);
      });
    });

    chatNamespace.emit('send_message', { 
      room: 'general', 
      message: testMsg 
    });

    await promise;
  });
});


describe('Message Handling', () => {
  test('should receive messages after subscription', async () => {
    const testMsg = { text: "Hello", user: "test" };
    const received = new Promise((resolve) => {
      const unsubscribe = socketService.subscribe('chat_message', (msg) => {
        expect(msg).toEqual(testMsg);
        unsubscribe();
        resolve(true);
      });
    });

    // Simulate server sending message
    socketService.socket?.emit('chat_message', testMsg);
    await received;
  });

  test('should not receive messages after unsubscribing', async () => {
    let received = false;
    const unsubscribe = socketService.subscribe('test_event', () => {
      received = true;
    });

    unsubscribe();
    socketService.socket?.emit('test_event', {});
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(received).toBe(false);
  });
});


describe('Error Handling', () => {
  test('should handle connection errors', (done) => {
    const tempService = new SocketService();
    tempService.on('connect_error', (err) => {
      expect(err).toBeInstanceOf(Error);
      tempService.disconnect();
      done();
    });
    tempService.connect('invalid-token', '', '');
  });

  test('should reject invalid namespace joins', async () => {
    await expect(socketService.addNamespace('/invalid'))
      .rejects.toThrow('Unauthorized namespace');
  });
});

describe('Performance & Edge Cases', () => {
  test('should handle 100+ simultaneous rooms', async () => {
    const ns = await socketService.addNamespace('/massive');
    const joins = Array(100).fill(0).map((_, i) => 
      ns.emitWithAck('join_room', `room-${i}`)
    );
    
    await expect(Promise.all(joins))
      .resolves.not.toThrow();
  });

  test('should recover after disconnect', async () => {
    socketService.disconnect();
    await new Promise(resolve => setTimeout(resolve, 500));
    await expect(socketService.connect('token', 'user', 'id'))
      .resolves.not.toThrow();
  });
});

describe('With Mocks', () => {
  let mockSocket: MockSocket;

  beforeEach(() => {
    mockSocket = new MockSocket();
    socketService = new SocketService(mockSocket as any);
  });

  test('should emit subscribe message', async () => {
    mockSocket.on('subscribe', (data, ack) => {
      expect(data.event).toBe('test_event');
      ack({ success: true });
    });

    await socketService.subscribe('test_event', () => {});
  });
});
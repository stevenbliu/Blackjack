// chatSocket.test.tsx

import SocketService from '../../websocket/socketService'; // default import

describe('SocketService - integration', () => {
  let socketService: SocketService;

  beforeAll(async () => {
    socketService = new SocketService();
    await socketService.connect('test-token', 'testuser', 'userid123');
  });

  afterAll(() => {
    socketService.disconnect();
  });

  test('connect and send messages', (done) => {
    socketService.send({event: 'root', payload: 'hello'});
  });

  test('connects and receives welcome message', (done) => {
    socketService.subscribe('root_test', (data: any) => {
      try {
        console.log("data");
        expect(data).toHaveProperty('data', 'Connected');
        done();
      } catch (err) {
        done(err);
      }
    });
  }, 5000);

  test('can join namespace and receive messages', async () => {
    const ns = await socketService.addNamespace('/chat');

    ns.emit('join_room', { room_id: 'room123' });

    ns.on('room_joined', (msg: any) => {
      expect(msg).toHaveProperty('room_id', 'room123');
    });
  });
});

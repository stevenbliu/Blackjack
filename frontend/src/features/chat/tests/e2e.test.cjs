const axios = require('axios');
const SocketService  = require('../../websocket/socketService'); // adjust import path
const TEST_SERVER = 'http://localhost:8000';
const SOCKET_SERVER_NAMESPACE = '/chat'; // your namespace
const TEST_TIMEOUT = 3000;

describe.skip('WebSocket Chat Integration Test with HTTP Setup', () => {
  let room;

  let users = [
    { username: 'user1', id: null, access_token: null, socket: null },
    { username: 'user2', id: null, access_token: null, socket: null },
    { username: 'user3', id: null, access_token: null, socket: null },
    { username: 'user4', id: null, access_token: null, socket: null, joinsRoom: false }, // Does NOT join room
  ];

beforeAll(async () => {
    // Create guest accounts and assign tokens & IDs
    for (const user of users) {
      const res = await axios.post(`${TEST_SERVER}/auth/guest`);
      user.access_token = res.data.access_token;
      user.user_id = res.data.user_id;
      console.log("Response:", res.data);
    }

    // Create room using user1
    const createResp = await axios.post(
      `${TEST_SERVER}/api/chat/create`,
      {
        name: 'TestRoom',
        creator_id: users[0].user_id,
        max_participants: 5,
      },
      {
        headers: { Authorization: `Bearer ${users[0].access_token}` },
      }
    );
    console.log("Create Response:", createResp.data);
    room = createResp.data;

    console.log("Connected to namespace:", SOCKET_SERVER_NAMESPACE);

    // Connect sockets using socketService and join room where applicable
    for (const user of users) {
      user.mainSocket = new SocketService();
      await user.mainSocket.connect(user.access_token, user.username, user.user_id);
      console.log(`User ${user.username} connected to namespace`);

      user.socket = await user.mainSocket.addNamespace(SOCKET_SERVER_NAMESPACE);

      user.socket.on('connect_error', (err) => {
        throw new Error(`Socket connect error for user ${user.username}: ${err.message}`);
      });

      user.socket.on('disconnect', (reason) => {
        console.log(`User ${user.username} disconnected: ${reason}`);
      });

      user.socket.on('room_joined', (data) => {
        console.log(`User ${user.username} joined room`, data);
      });

      if (user.joinsRoom !== false) {
        user.socket.emit('join_room', { room_id: room.room_id });
      }
    }
  }, TEST_TIMEOUT);


  afterAll(() => {
    // Disconnect all sockets
    users.forEach((user) => {
      if (user.socket) user.socket.disconnect();
    });
  });

  test(
    'Users in room receive message, users not in room do NOT receive message',
    (done) => {
      const roomId = room.room_id;
      let messagesReceived = {};

      users.forEach((user) => {
        user.socket.on('new_message', (msg) => {
          if (!messagesReceived[user.username]) messagesReceived[user.username] = [];
          messagesReceived[user.username].push(msg);

          const expectedReceivers = users.filter(u => u.joinsRoom !== false).length;
          const totalReceived = Object.values(messagesReceived).reduce((acc, msgs) => acc + msgs.length, 0);

          if (totalReceived >= expectedReceivers) {
            users.forEach((u) => {
              if (u.joinsRoom === false) {
                expect(messagesReceived[u.username]).toBeUndefined();
              } else {
                const msgs = messagesReceived[u.username];
                expect(msgs).toBeDefined();
                expect(msgs[0].text).toBe('Hello from user1');
                expect(msgs[0].username).toBe(users[0].username);
                expect(msgs[0].user_id).toBe(users[0].user_id);
              }
            });
            done();
          }
        });
      });

      // Send message after a short delay to ensure everyone joined
      setTimeout(() => {
        users[0].socket.emit('message', {
          room_id: roomId,
          message: 'Hello from user1',
        });
      }, 500);
    },
    TEST_TIMEOUT
  );
});

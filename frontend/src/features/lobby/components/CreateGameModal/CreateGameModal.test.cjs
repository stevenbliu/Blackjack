// test http createsconst axios = require('axios');
const io = require('socket.io-client');

const TEST_SERVER = 'http://localhost:8000';
const SOCKET_SERVER = 'ws://localhost:8000'; // adjust if different
const TEST_TIMEOUT = 10000;

describe.skip('WebSocket Chat Integration Test with HTTP Setup', () => {
  let authToken;
  let room;
  const users = [
    { id: 'user1', socket: null },
    { id: 'user2', socket: null },
    { id: 'user3', socket: null },
  ];

  beforeAll(async () => {
    // 1. Get auth token
    const authResp = await axios.post(`${TEST_SERVER}/auth/guest`);
    authToken = authResp.data.access_token;

    // 2. Create room via HTTP
    const createResp = await axios.post(
      `${TEST_SERVER}/api/chat/create`,
      {
        name: 'TestRoom',
        creator_id: users[0].id,
        max_participants: 5,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    room = createResp.data;

    // 3. Join other users via HTTP
    for (let i = 1; i < users.length; i++) {
      await axios.post(
        `${TEST_SERVER}/api/chat/join`,
        {
          room_id: room.room_id,
          user_id: users[i].id,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
    }
  }, TEST_TIMEOUT);

  afterAll(() => {
    // Disconnect all sockets
    users.forEach((user) => {
      if (user.socket) user.socket.disconnect();
    });
  });

  test(
    'Multiple users connect sockets, join namespace and room, and exchange messages',
    (done) => {
      const namespace = '/chat'; // your chat namespace
      const roomId = room.room_id;

      // Track connected sockets and message events
      let connectedCount = 0;
      const messagesReceived = {};

      users.forEach((user) => {
        // Connect socket for each user with auth token (adjust if needed)
        user.socket = io(`${SOCKET_SERVER}${namespace}`, {
          auth: { token: authToken },
          transports: ['websocket'],
        });

        user.socket.on('connect', () => {
          connectedCount++;
          // After all connected, join the chat room
          user.socket.emit('join_room', { room_id: roomId });
        });

        user.socket.on('room_joined', (data) => {
          // Wait for all users to join before sending messages
          if (Object.keys(messagesReceived).length === 0 && connectedCount === users.length) {
            // Let user1 send a message to room
            users[0].socket.emit('message', {
              room_id: roomId,
              message: 'Hello from user1',
            });
          }
        });

        user.socket.on('new_message', (msg) => {
          if (!messagesReceived[user.id]) messagesReceived[user.id] = [];
          messagesReceived[user.id].push(msg);

          // Check if all users received the message (including sender)
          const totalReceived = Object.values(messagesReceived).reduce(
            (acc, msgs) => acc + msgs.length,
            0
          );

          if (totalReceived >= users.length) {
            // Assert message content
            users.forEach((u) => {
              const msgs = messagesReceived[u.id];
              expect(msgs).toBeDefined();
              expect(msgs[0].text).toBe('Hello from user1');
              expect(msgs[0].user_id).toBe(users[0].id);
            });

            done(); // all good, finish test
          }
        });

        user.socket.on('connect_error', (err) => {
          done.fail(`Socket connect error for user ${user.id}: ${err.message}`);
        });
      });
    },
    TEST_TIMEOUT
  );
});

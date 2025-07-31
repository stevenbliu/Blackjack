const axios = require('axios');

const TEST_SERVER = 'http://localhost:8000';
const TEST_TIMEOUT = 6000;

describe.skip('Chat Room HTTP API Tests - Multiple Users', () => {
  let authToken;
  let createdRoom;

  beforeAll(async () => {
    const response = await axios.post(`${TEST_SERVER}/auth/guest`);
    authToken = response.data.access_token;
  }, TEST_TIMEOUT);

  test('Create a new chat room', async () => {
    const createPayload = {
      name: "MultiUserRoom",
      creator_id: "user1",
      max_participants: 5,
    };

    const response = await axios.post(`${TEST_SERVER}/api/chat/create`, createPayload, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    createdRoom = response.data;
  });

  test('Multiple users join the same room', async () => {
    const userIds = ['user2', 'user3', 'user4'];

    for (const user_id of userIds) {
      const joinPayload = {
        room_id: createdRoom.room_id,
        user_id,
      };

      const response = await axios.post(`${TEST_SERVER}/api/chat/join`, joinPayload, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.participants).toContain(user_id);
    }
  });

  test('Verify all users are in the room', async () => {
    const response = await axios.get(`${TEST_SERVER}/api/chat/rooms/${createdRoom.room_id}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    const participants = response.data.participants;
    expect(participants).toContain('user1'); // creator
    expect(participants).toContain('user2');
    expect(participants).toContain('user3');
    expect(participants).toContain('user4');
  });
});

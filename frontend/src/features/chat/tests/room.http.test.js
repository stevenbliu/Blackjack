const axios = require('axios');

const TEST_SERVER = 'http://localhost:8000';
const TEST_TIMEOUT = 6000; // 6 seconds

describe('Chat Room HTTP API Tests', () => {
  let authToken;
  let createdRoom;

  beforeAll(async () => {
    // Get auth token first (adjust endpoint if needed)
    const response = await axios.post(`${TEST_SERVER}/auth/guest`);
    authToken = response.data.access_token;
  }, TEST_TIMEOUT);

  test('Create a new chat room', async () => {
    const createPayload = {
      name: "Test Room",
      creator_id: "test_user_123",
      max_participants: 5,
    };

    const response = await axios.post(`${TEST_SERVER}/api/chat/create`, createPayload, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    // console.log("Create response data", response.data);

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('room_id');
    expect(response.data.name).toBe(createPayload.name);
    expect(response.data.creator_id).toBe(createPayload.creator_id);
    const participantUserIds = response.data.participants.map(p => p.user_id);
    const participantUsernames = response.data.participants.map(p => p.username);

    expect(participantUserIds).toContain(createPayload.creator_id);
    // expect(participantUsernames).toContain(createPayload.creator_id);

    createdRoom = response.data;
  });

  test('Join the created chat room', async () => {
    const joinPayload = {
      room_id: createdRoom.room_id,
      user_id: "test_user_456",
      username: "Test Username 456",
    };

    const response = await axios.post(`${TEST_SERVER}/api/chat/join`, joinPayload, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    const participantUserIds = response.data.participants.map(p => p.user_id);

    expect(participantUserIds).toContain(joinPayload.user_id);
  });

  test('Get the created chat room details', async () => {
    const response = await axios.get(`${TEST_SERVER}/api/chat/rooms/${createdRoom.room_id}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log("[chat detals] Get response data", response.data);
    expect(response.status).toBe(200);
    expect(response.data.room_id).toBe(createdRoom.room_id);
    expect(response.data.participants.length).toBeGreaterThanOrEqual(2);
  });

  test('List all chat rooms', async () => {
    const response = await axios.get(`${TEST_SERVER}/api/chat/rooms`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.some(room => room.room_id === createdRoom.room_id)).toBe(true);
  });
});

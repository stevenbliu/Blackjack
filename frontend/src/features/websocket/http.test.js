const axios = require('axios');

const TEST_SERVER = 'http://localhost:8000'; // Adjust if needed
const TEST_TIMEOUT = 5000; // 10 seconds

describe.skip('Game Service API', () => {
  let createdGame;

  test('Create a new game', async () => {
    const payload = {
      game_name: 'Test Game',
      host_player_id: 'host123',
      max_players: 4,
    };

    const response = await axios.post(`${TEST_SERVER}/api/create_game`, payload);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('game_id');
    expect(response.data).toHaveProperty('room_id');
    expect(response.data.name).toBe(payload.game_name);
    expect(response.data.host_player_id).toBe(payload.host_player_id);

    createdGame = response.data; // save for next tests
  }, TEST_TIMEOUT);

  test('Join the created game', async () => {
    const payload = {
      game_id: createdGame.game_id,
      player_id: 'player456',
    };

    const response = await axios.post(`${TEST_SERVER}/api/join_game`, payload);
    expect(response.status).toBe(200);
    expect(response.data.players).toContain('player456');
  }, TEST_TIMEOUT);

  test('Get game info', async () => {
    const response = await axios.get(`${TEST_SERVER}/api/games/${createdGame.game_id}`);
    expect(response.status).toBe(200);
    expect(response.data.game_id).toBe(createdGame.game_id);
    expect(response.data.players.length).toBeGreaterThanOrEqual(2);
  }, TEST_TIMEOUT);
});

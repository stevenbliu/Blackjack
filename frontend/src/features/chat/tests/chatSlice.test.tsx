import chatReducer, { setRoomId, addMessage } from '../chatSlice';
import { ChatMessagePayload } from '../socketEvents'; // adjust import path as needed

describe('chatSlice', () => {
  it('should handle initial state', () => {
    const initial = chatReducer(undefined, { type: '@@INIT' });
    expect(initial).toEqual({
      messagesByContext: {},
      roomId: 'lobby',
    });
  });

  it('should handle setRoomId', () => {
    const state = chatReducer(undefined, setRoomId('game-123'));
    expect(state.roomId).toBe('game-123');
  });

  it('should add message to the correct context', () => {
    const payload: ChatMessagePayload = {
      room_id: 'game-456',
      user_id: 'user1',
      username: 'Alice',
      message: 'Hello!',
      timestamp: 1234567890,
    };

    const state = chatReducer(undefined, addMessage(payload));
    expect(state.messagesByContext['game-456']).toHaveLength(1);
    expect(state.messagesByContext['game-456'][0].text).toBe('Hello!');
  });

  it('should parse timestamp strings', () => {
    const payload: ChatMessagePayload = {
      room_id: 'lobby',
      user_id: 'user1',
      username: 'Alice',
      message: 'Hi',
      timestamp: '2025-07-31T23:00:00Z',
    };

    const state = chatReducer(undefined, addMessage(payload));
    expect(typeof state.messagesByContext['lobby'][0].timestamp).toBe('number');
  });
});

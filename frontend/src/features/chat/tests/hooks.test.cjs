// const React = require('react');
// const { renderHook, waitFor } = require('@testing-library/react-hooks');
// const { useChatRoom } = require('../../chat/hooks/useChatRoom');

// // Mock the RTK Query hooks
// jest.mock('../../chat/api/chatApi', () => ({
//   useCreateRoomMutation: () => [
//     jest.fn(() =>
//       Promise.resolve({ unwrap: () => Promise.resolve({ room_id: 'test-room' }) })
//     ),
//   ],
//   useJoinRoomMutation: () => [
//     jest.fn(() =>
//       Promise.resolve({ unwrap: () => Promise.resolve({ success: true }) })
//     ),
//   ],
// }));

describe.skip('useChatRoom', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates and joins a room', async () => {
    const { result } = renderHook(() => useChatRoom('user123', 'Steven'));

    await waitFor(() => {
      if (result.current !== 'test-room') {
        throw new Error('roomId not set yet');
      }
    });

    expect(result.current).toBe('test-room');
  });

  it('does not run if missing user info', () => {
    const { result } = renderHook(() => useChatRoom('', ''));

    expect(result.current).toBe(null);
  });
});

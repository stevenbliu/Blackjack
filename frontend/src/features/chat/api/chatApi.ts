// features/chat/api/chatApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../../app/store';

// Types for requests/responses
export interface ChatRoom {
  name: string;
  creator_id: string;
  max_participants: number;
  room_id: string | null;
}

export interface ChatRoomData {
  name: string;
  creator_id: string;
  // room_id: string | null;
//   creator_username: string;
  max_participants: number;
//   room_id: string | null;
}

export interface JoinRoomRequest {
  room_id: string;
  user_id: string;
  username: string;
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api/chat',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  endpoints: (builder) => ({
    createRoom: builder.mutation<ChatRoom, ChatRoomData>({
      query: (roomData) => ({
        url: '/create',
        method: 'POST',
        body: roomData
      })
    }),

    joinRoom: builder.mutation<ChatRoom, JoinRoomRequest>({
      query: (joinData) => ({
        url: '/join',
        method: 'POST',
        body: joinData
      })
    }),

    listRooms: builder.query<ChatRoom[], void>({
      query: () => '/rooms'
    }),

    getRoom: builder.query<ChatRoom, string>({
      query: (roomId) => `/rooms/${roomId}`
    })
  })
});

export const {
  useCreateRoomMutation,
  useJoinRoomMutation,
  useListRoomsQuery,
  useGetRoomQuery
} = chatApi;

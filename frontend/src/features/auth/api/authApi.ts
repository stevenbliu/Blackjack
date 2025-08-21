// features/auth/api/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../../app/store';

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  username: string;
}

// Choose API URL based on environment
// const baseUrl = import.meta.env.DEV
//   ? import.meta.env.VITE_DEVELOPMENT_API_URL
//   : import.meta.env.VITE_PRODUCTION_API_URL;

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8000/auth',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  endpoints: (builder) => ({
    loginAsGuest: builder.mutation<{
      access_token: string;
      user_id: string;
      expires_in: number;
      username: string;
    }, void>({
      query: () => ({
        url: '/guest',
        method: 'POST',
        headers: { 'X-Guest-Request': 'true' }
      })
    }),

    loginUser: builder.mutation<{
      access_token: string;
      user_id: string;
      was_guest: boolean;
    }, { 
      email: string; 
      password: string; 
      rememberMe: boolean; 
      guest_id?: string 
    }>({
      query: (credentials) => ({
        url: credentials.guest_id ? '/convert' : '/login',
        method: 'POST',
        body: credentials
      })
    }),

    socialLogin: builder.mutation<{
      access_token: string;
      user_id: string;
      was_guest: boolean;
    }, {
      provider: 'google' | 'discord';
      guest_id?: string;
    }>({
      query: ({ provider, guest_id }) => ({
        url: `/${provider}`,
        method: 'POST',
        body: guest_id ? { guest_id } : undefined
      })
    }),

    register: builder.mutation<{
      access_token: string;
      user_id: string;
    }, RegisterCredentials>({
      query: (credentials) => ({
        url: '/register',
        method: 'POST',
        body: {
          ...credentials,
          invalidate_guest: true
        }
      })
    }),

    refreshToken: builder.mutation<{
      access_token: string;
    }, void>({
      query: () => ({
        url: '/refresh',
        method: 'POST'
      })
    })
  })
});

export const { 
  useLoginAsGuestMutation,
  useLoginUserMutation,
  useSocialLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation
} = authApi;
// features/auth/authSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { verifyToken } from './authUtils';

interface AuthState {
  token: string | null;
  isGuest: boolean;
  userId: string | null;
  username: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  guestExpiresAt: number | null; // Track guest session expiry
}

const initialState: AuthState = {
  token: null,
  isGuest: false,
  userId: null,
  status: 'idle',
  error: null,
  guestExpiresAt: null, // Track guest session expiry
  username: null

};

// Token verification utility
const verifyStoredToken = async (token: string | null): Promise<boolean> => {
  if (!token) return false;
  try {
    return await verifyToken(token);
  } catch {
    return false;
  }
};

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { getState }) => {
    // Get initial state from Redux (could be hydrated from server)
    const { token } = (getState() as { auth: AuthState }).auth;
    return await verifyStoredToken(token) ? token : null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{
      token: string;
      isGuest: boolean;
      userId: string;
      username: string;
    }>) => {
      state.token = action.payload.token;
      state.isGuest = action.payload.isGuest;
      state.userId = action.payload.userId;
      state.username = action.payload.username;
    },
    logout: (state) => {
      state.token = null;
      state.isGuest = false;
      state.userId = null;
      state.status = 'idle';
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    refreshGuestExpiry: (state, action: PayloadAction<number>) => {
      if (state.isGuest) {
        state.guestExpiresAt = Date.now() + action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(initializeAuth.fulfilled, (state, { payload }) => {
        state.token = payload;
        state.status = payload ? 'succeeded' : 'idle';
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.status = 'failed';
      })
      .addMatcher(
        authApi.endpoints.loginAsGuest.matchFulfilled,
        (state, {payload}) => {
        state.token = payload.access_token;
        state.isGuest = true;
        state.userId = payload.user_id;
        state.guestExpiresAt = Date.now() + (payload.expires_in * 1000);
        state.status = 'succeeded';
        }
      )

      // RTK Query auth endpoints
      .addMatcher(
        authApi.endpoints.loginUser.matchFulfilled,
        (state, { payload }) => {
          state.token = payload.access_token;
          // state.isGuest = payload.is_guest;
          state.userId = payload.user_id;
          state.status = 'succeeded';
        }
      )
    .addMatcher(
      authApi.endpoints.socialLogin.matchFulfilled,
      (state, { payload }) => {
        state.token = payload.access_token;
        state.isGuest = false;
        state.userId = payload.user_id;
        state.status = 'succeeded';
        state.error = null;
      }
    )      
    .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, { payload }) => {
          state.token = payload.access_token;
          state.isGuest = false;
          state.userId = payload.user_id;
          state.status = 'succeeded';
          state.error = null;

        }
      )
      .addMatcher(
        authApi.endpoints.refreshToken.matchFulfilled,
        (state, { payload }) => {
          state.token = payload.access_token;
          state.status = 'succeeded';
        }
      )
      .addMatcher(
      (action): action is PayloadAction<{ data: { error: string } }> =>
      [
          authApi.endpoints.loginAsGuest.matchRejected,
          authApi.endpoints.loginUser.matchRejected,
          authApi.endpoints.socialLogin.matchRejected,
          authApi.endpoints.refreshToken.matchRejected,
          authApi.endpoints.register.matchRejected,
        ].some(matcher => matcher(action)),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload?.data?.error || 'Authentication error';
        }
      );
  }
});

// Selectors
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;
export const selectCurrentUser = (state: { auth: AuthState }) => ({
  id: state.auth.userId,
  isGuest: state.auth.isGuest
});
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;

export const { setCredentials, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  logout,
  clearError,
  selectAuthStatus,
} from './authSlice';
import {
  useLoginAsGuestMutation,
  useLoginUserMutation,
  useSocialLoginMutation,
} from './api/authApi';
import { useCallback } from 'react';

export type AuthStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface AuthSuccess {
  success: true;
  token: string;
  user_id?: string;
  username?: string;
}

interface AuthFailure {
  success: false;
  error: string;
}

export type AuthResult = AuthSuccess | AuthFailure;

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);

  const [guestLogin] = useLoginAsGuestMutation();
  const [userLogin] = useLoginUserMutation();
  const [socialLogin] = useSocialLoginMutation();

  const loginAsGuest = useCallback(async (): Promise<AuthResult> => {
    try {
      const result = await guestLogin().unwrap();
      return {
        success: true,
        token: result.access_token,
        user_id: result.user_id,
        username: result.username,
      };
    } catch (err: unknown) {
      let message = 'Guest login failed';
      if (typeof err === 'object' && err !== null) {
        const e = err as FetchBaseQueryError;
        if (e.data && typeof e.data === 'object' && 'message' in e.data) {
          message = (e.data as { message: string }).message;
        }
  }
      return { success: false, error: message };
    }
  }, [guestLogin]);

  const loginWithCredentials = useCallback(
    async (credentials: {
      email: string;
      password: string;
      rememberMe: boolean;
    }): Promise<AuthResult> => {
      try {
        const result = await userLogin(credentials).unwrap();
        return { success: true, token: result.access_token };
      } catch (err: unknown) {
        let message = 'Login failed';
        if (typeof err === 'object' && err !== null) {
          const e = err as FetchBaseQueryError;
          if (e.data && typeof e.data === 'object' && 'message' in e.data) {
            message = (e.data as { message: string }).message;
          }
        }
        return { success: false, error: message };
      }
    },
    [userLogin]
  );

  const loginWithSocial = useCallback(
    async (provider: 'google' | 'discord'): Promise<AuthResult> => {
      try {
        const result = await socialLogin({ provider }).unwrap(); // ✅ object, not string
        return { success: true, token: result.access_token };
      } catch (err: unknown) {
        let message = `${provider} login failed`;
        if (typeof err === 'object' && err !== null) {
          const e = err as FetchBaseQueryError;
          if (e.data && typeof e.data === 'object' && 'message' in e.data) {
            message = (e.data as { message: string }).message;
          }
        }
        return { success: false, error: message };
      }
    },
    [socialLogin]
  );

  const signOut = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    status,
    loginAsGuest,
    loginWithCredentials,
    loginWithSocial,
    logout: signOut,
    clearError: clearAuthError,
  };
};

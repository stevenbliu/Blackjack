// features/auth/hooks/useAuth.ts
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { 
  logout,
  clearError,
  selectAuthToken,
  selectIsAuthenticated,
  selectAuthStatus,
  selectAuthError
} from '../authSlice';
import { 
  useLoginAsGuestMutation,
  useLoginUserMutation,
  useSocialLoginMutation 
} from '../api/authApi';
import { useCallback } from 'react';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAuthToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);

  // API Mutations
  const [guestLogin] = useLoginAsGuestMutation();
  const [userLogin] = useLoginUserMutation();
  const [socialLogin] = useSocialLoginMutation();

  const loginAsGuest = useCallback(async () => {
    try {
      const result = await guestLogin().unwrap();
      return { 
        success: true, 
        token: result.access_token,
        user_id: result.user_id,
        username: result.username
      };
    } catch (err) {
      return {
        success: false,
        error: (err as any)?.data?.message || 'Guest login failed'
      };
    }
  }, [guestLogin]);

  const loginWithCredentials = useCallback(async (credentials: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    try {
      const result = await userLogin(credentials).unwrap();
      return {
        success: true,
        token: result.access_token
      };
    } catch (err) {
      return {
        success: false,
        error: (err as any)?.data?.message || 'Login failed'
      };
    }
  }, [userLogin]);

  const loginWithSocial = useCallback(async (provider: 'google' | 'discord') => {
    try {
      const result = await socialLogin(provider).unwrap();
      return {
        success: true,
        token: result.access_token
      };
    } catch (err) {
      return {
        success: false,
        error: (err as any)?.data?.message || `${provider} login failed`
      };
    }
  }, [socialLogin]);

  const signOut = useCallback(() => {
    dispatch(logout());
    // Optional: Add API call to invalidate token on server
  }, [dispatch]);

  return {
    // State
    token,
    isAuthenticated,
    status,
    error,

    // Methods
    loginAsGuest,
    loginWithCredentials,
    loginWithSocial,
    logout: signOut,
    clearError: () => dispatch(clearError())
  };
};
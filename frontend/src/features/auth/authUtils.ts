// features/auth/authUtils.ts
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;    // Expiration timestamp
  sub: string;    // User ID
  is_guest?: boolean;
  [key: string]: any; // Other possible claims
}

/**
 * Verifies if a JWT token is valid and not expired
 */
export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    // In practice, use your auth server's verification endpoint
    const response = await fetch('/api/verify-token', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Extracts user ID from token
 */
export const getUserIdFromToken = (token: string): string | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.sub || null;
  } catch (error) {
    return null;
  }
};

/**
 * Checks if token belongs to a guest user
 */
export const isGuestToken = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.is_guest === true;
  } catch (error) {
    return false;
  }
};

/**
 * Stores auth data securely
 */
export const storeAuthData = (data: {
  token: string;
  userId: string;
  isGuest: boolean;
}): void => {
  try {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_userId', data.userId);
    localStorage.setItem('auth_isGuest', String(data.isGuest));
  } catch (error) {
    console.error('Failed to store auth data:', error);
  }
};

/**
 * Clears all auth data from storage
 */
export const clearAuthData = (): void => {
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_userId');
    localStorage.removeItem('auth_isGuest');
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
};

/**
 * Retrieves stored auth token
 */
export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    return null;
  }
};

/**
 * Checks if user has any auth data stored
 */
export const hasAuthData = (): boolean => {
  return !!getStoredToken();
};
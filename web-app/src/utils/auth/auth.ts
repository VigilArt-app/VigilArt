import { UserGet } from "@vigilart/shared";
import { authenticatedFetch } from "./authenticatedFetch";

/**
 * Check if user is authenticated by calling /users/me
 * Returns user data if authenticated, null otherwise
 */
export const checkAuth = async (): Promise<UserGet | null> => {
  try {
    const response = await authenticatedFetch("/auth/me", {
      method: 'GET'
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    return null;
  }
};

/**
 * Logout - cookies are cleared by backend
 */
export const logout = async (): Promise<void> => {
  try {
    await authenticatedFetch("/auth/logout", {
      method: 'POST'
    });
  } finally {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
};

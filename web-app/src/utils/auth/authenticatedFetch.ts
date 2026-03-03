let refreshTokenPromise: Promise<Response> | null = null;

/**
 * Authenticated fetch for httpOnly cookie-based authentication
 *
 * Automatically refreshes access token on 401 errors using the refresh_token cookie
 * No need to add Authorization header - cookies are sent automatically!
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const fetchOptions: RequestInit = {
    ...options,
    credentials: 'include',
  };

  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  fetchOptions.headers = headers;

  let response = await fetch(API_BASE + url, fetchOptions);

  if (response.status === 401) {

    if (!refreshTokenPromise) {
      refreshTokenPromise = fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
    }

    const refreshResponse = await refreshTokenPromise;

    refreshTokenPromise = null;

    if (refreshResponse.ok) {
      response = await fetch(API_BASE + url, fetchOptions);
    } else {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error("Session expired. Please login again.");
    }
  }

  return response;
};

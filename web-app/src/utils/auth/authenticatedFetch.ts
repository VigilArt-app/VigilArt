import { getAuthToken } from "./getAuthToken";

/**
 * Centralized fetch helper that includes Authorization header
 */
export const authenticatedFetch = (url: string, options: RequestInit = {}) => {
  const authToken = getAuthToken();

  if (!authToken) {
    throw new Error("Authentication token not found");
  }

  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${authToken}`);

  const isFormData = options.body instanceof FormData;

  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, { ...options, headers, });
};
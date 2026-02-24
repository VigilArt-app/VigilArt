export const getUserIdFromToken = (): string | null => {
  try {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

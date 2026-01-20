/**
 * CSRF Token Management
 * Generates and validates CSRF tokens to protect against Cross-Site Request Forgery attacks
 */

const CSRF_TOKEN_KEY = "league_master_csrf_token";
const CSRF_HEADER_NAME = "X-CSRF-Token";

/**
 * Generate a new CSRF token using cryptographically secure random values
 */
export const generateCsrfToken = (): string => {
  if (typeof window === "undefined") return "";

  // Use crypto API for secure random generation
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

/**
 * Store CSRF token in sessionStorage (cleared when tab closes)
 */
export const storeCsrfToken = (token: string): void => {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(CSRF_TOKEN_KEY, token);
    } catch (err) {
      console.error("Failed to store CSRF token:", err);
    }
  }
};

/**
 * Retrieve stored CSRF token
 */
export const getCsrfToken = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    return sessionStorage.getItem(CSRF_TOKEN_KEY);
  } catch (err) {
    console.error("Failed to retrieve CSRF token:", err);
    return null;
  }
};

/**
 * Initialize CSRF token on app load
 * Generates a new token if one doesn't exist
 */
export const initializeCsrfToken = (): string => {
  let token = getCsrfToken();

  if (!token) {
    token = generateCsrfToken();
    storeCsrfToken(token);
  }

  return token;
};

/**
 * Validate that a token matches the stored token
 */
export const validateCsrfToken = (token: string | null): boolean => {
  if (!token) return false;

  const storedToken = getCsrfToken();
  return token === storedToken;
};

/**
 * Get header object for CSRF token to include in requests
 */
export const getCsrfHeader = (): Record<string, string> => {
  const token = getCsrfToken();

  if (!token) {
    console.warn("CSRF token not initialized");
    return {};
  }

  return {
    [CSRF_HEADER_NAME]: token,
  };
};

/**
 * Regenerate CSRF token (called after sensitive operations)
 */
export const regenerateCsrfToken = (): string => {
  const newToken = generateCsrfToken();
  storeCsrfToken(newToken);
  return newToken;
};


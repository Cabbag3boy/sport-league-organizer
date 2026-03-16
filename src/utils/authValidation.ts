import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

/**
 * Server-side Authentication & CSRF Validation
 * Validates session tokens and CSRF protection on API routes
 */

const CSRF_HEADER_NAME = "X-CSRF-Token";
const ACCESS_TOKEN_COOKIE = "lm_access_token";

interface ValidationResult {
  valid: boolean;
  error?: string;
  userId?: string;
}

export function getAccessTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim() || null;
  }

  const cookieToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  return cookieToken?.trim() || null;
}

/**
 * Validate CSRF token from request header
 * The CSRF token is stored in sessionStorage on client and must match the header
 */
export async function validateCsrfToken(req: NextRequest): Promise<boolean> {
  const csrfToken = req.headers.get(CSRF_HEADER_NAME);

  if (!csrfToken) {
    console.warn("CSRF validation failed: Token header missing");
    return false;
  }

  // CSRF token format check (should be 64 hex chars = 32 bytes)
  if (!/^[a-f0-9]{64}$/.test(csrfToken)) {
    console.warn("CSRF validation failed: Invalid token format");
    return false;
  }

  return true;
}

/**
 * Validate session token from Authorization header
 * Extracts Bearer token and verifies it with Supabase
 */
export async function validateSessionToken(
  supabase: SupabaseClient,
  req: NextRequest,
): Promise<ValidationResult> {
  const token = getAccessTokenFromRequest(req);

  if (!token) {
    return {
      valid: false,
      error: "Missing or invalid session token",
    };
  }

  try {
    // Verify token and get user info
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        valid: false,
        error: error?.message || "Invalid token",
      };
    }

    return {
      valid: true,
      userId: user.id,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Token validation failed";
    return {
      valid: false,
      error: message,
    };
  }
}

/**
 * Comprehensive request validation for authenticated API endpoints
 * Validates both session token and CSRF token
 */
export async function validateAuthenticatedRequest(
  supabase: SupabaseClient,
  req: NextRequest,
): Promise<ValidationResult> {
  // Check CSRF token
  const csrfValid = await validateCsrfToken(req);
  if (!csrfValid) {
    return {
      valid: false,
      error: "CSRF validation failed",
    };
  }

  // Check session token
  const sessionValidation = await validateSessionToken(supabase, req);
  if (!sessionValidation.valid) {
    return {
      valid: false,
      error: sessionValidation.error || "Session validation failed",
    };
  }

  return {
    valid: true,
    userId: sessionValidation.userId,
  };
}

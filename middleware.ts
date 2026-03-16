import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "lm_access_token";
const CSRF_HEADER_NAME = "x-csrf-token";

function hasAuthorization(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return true;

  const tokenCookie = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  return Boolean(tokenCookie);
}

export function middleware(req: NextRequest) {
  const method = req.method.toUpperCase();
  const isMutationMethod =
    method === "POST" ||
    method === "PATCH" ||
    method === "PUT" ||
    method === "DELETE";

  if (!isMutationMethod) {
    return NextResponse.next();
  }

  if (!hasAuthorization(req)) {
    return NextResponse.json(
      { error: "Missing authorization" },
      { status: 401 },
    );
  }

  const csrfToken = req.headers.get(CSRF_HEADER_NAME);
  if (!csrfToken) {
    return NextResponse.json({ error: "Missing CSRF token" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/events/:path*", "/api/players/:path*", "/api/rounds/:path*"],
};

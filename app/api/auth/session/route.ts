import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/utils/supabaseServer";

const ACCESS_TOKEN_COOKIE = "lm_access_token";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { accessToken?: string | null };
    const accessToken = body.accessToken?.trim() || null;

    if (!accessToken) {
      const res = NextResponse.json({ success: true });
      res.cookies.set(ACCESS_TOKEN_COOKIE, "", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      });
      return res;
    }

    // Verify token before storing it in cookie
    const supabase = createServerSupabase(accessToken);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid session token" },
        { status: 401 },
      );
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      // Supabase access token lifetime is short; keep cookie aligned.
      maxAge: 60 * 60,
    });

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

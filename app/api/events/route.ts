import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/utils/supabaseServer";
import { getAccessTokenFromRequest, validateAuthenticatedRequest } from "@/utils/authValidation";

export async function POST(req: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(req);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing session token" },
        { status: 401 },
      );
    }

    const supabase = createServerSupabase(accessToken);

    // Validate session token and CSRF token
    const validation = await validateAuthenticatedRequest(supabase, req);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Authentication failed" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const { data, error } = await supabase
      .from("events")
      .insert({
        league_id: body.leagueId,
        title: body.title,
        content: body.content,
        pinned: body.pinned,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

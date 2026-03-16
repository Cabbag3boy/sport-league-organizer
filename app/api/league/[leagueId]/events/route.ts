import { NextRequest, NextResponse } from "next/server";
import type { DBEvent } from "@/types";
import { createServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateSessionToken,
} from "@/utils/authValidation";

type RouteParams = {
  params: Promise<{ leagueId: string }>;
};

export async function GET(req: NextRequest, context: RouteParams) {
  try {
    const { leagueId } = await context.params;
    const accessToken = getAccessTokenFromRequest(req);

    const supabase = createServerSupabase(accessToken ?? undefined);

    if (accessToken) {
      const sessionValidation = await validateSessionToken(supabase, req);

      if (!sessionValidation.valid) {
        return NextResponse.json(
          { error: sessionValidation.error || "Authentication failed" },
          { status: 401 },
        );
      }
    }

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("league_id", leagueId)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json((data as DBEvent[]) || []);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

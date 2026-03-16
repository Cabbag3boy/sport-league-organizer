import { NextRequest, NextResponse } from "next/server";
import { fetchBootstrapLeagueData } from "@/features/league/services";
import { createPublicServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateSessionToken,
} from "@/utils/authValidation";

export async function GET(req: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(req);
    const supabase = createPublicServerSupabase(accessToken ?? undefined);

    if (accessToken) {
      const sessionValidation = await validateSessionToken(supabase, req);

      if (!sessionValidation.valid) {
        return NextResponse.json(
          { error: sessionValidation.error || "Authentication failed" },
          { status: 401 },
        );
      }
    }

    const requestedLeagueId = req.nextUrl.searchParams.get("leagueId") || "";
    const requestedSeasonId = req.nextUrl.searchParams.get("seasonId") || "";

    const data = await fetchBootstrapLeagueData(
      supabase,
      requestedLeagueId,
      requestedSeasonId,
    );

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

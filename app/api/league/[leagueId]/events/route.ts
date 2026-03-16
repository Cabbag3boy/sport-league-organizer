import { NextRequest, NextResponse } from "next/server";
import { createPublicServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateSessionToken,
} from "@/utils/authValidation";
import { fetchLeagueEventsServer } from "@/features/events/services/eventReadService";

type RouteParams = {
  params: Promise<{ leagueId: string }>;
};

export async function GET(req: NextRequest, context: RouteParams) {
  try {
    const { leagueId } = await context.params;
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

    const events = await fetchLeagueEventsServer(supabase, leagueId);
    return NextResponse.json(events);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import type { DBRound, RoundHistoryEntry } from "@/types";
import { createPublicServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateSessionToken,
} from "@/utils/authValidation";

type RouteParams = {
  params: Promise<{ seasonId: string }>;
};

export async function GET(req: NextRequest, context: RouteParams) {
  try {
    const { seasonId } = await context.params;
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

    const { data, error } = await supabase
      .from("rounds")
      .select("*")
      .eq("season_id", seasonId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const roundHistory = ((data as DBRound[]) || []).map((round) => ({
      id: round.id,
      date: round.created_at,
      present_players: round.present_players,
      groups: (round.details as any)?.groups || [],
      scores: (round.details as any)?.scores || {},
      finalPlacements: (round.details as any)?.finalPlacements || [],
      playersBefore: (round.details as any)?.playersBefore || [],
      playersAfter: (round.details as any)?.playersAfter || [],
    })) as RoundHistoryEntry[];

    return NextResponse.json(roundHistory);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import type { DBPlayerInLeague, Player } from "@/types";
import { createPublicServerSupabase } from "@/utils/supabaseServer";
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
      .from("players_in_leagues")
      .select("id, rank, player_id, players(id, first_name, last_name)")
      .eq("league_id", leagueId)
      .order("rank", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const players = ((data as unknown as DBPlayerInLeague[]) || [])
      .map((row) => {
        const joinedPlayer = Array.isArray(row.players)
          ? row.players[0]
          : row.players;
        if (!joinedPlayer) return null;

        return {
          id: joinedPlayer.id,
          first_name: joinedPlayer.first_name,
          last_name: joinedPlayer.last_name,
          name: `${joinedPlayer.first_name} ${joinedPlayer.last_name}`.trim(),
          rank: row.rank,
        };
      })
      .filter((row): row is Player => !!row);

    return NextResponse.json(players);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

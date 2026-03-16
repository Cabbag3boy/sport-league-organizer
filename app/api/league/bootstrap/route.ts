import { NextRequest, NextResponse } from "next/server";
import type {
  DBLeague,
  DBPlayer,
  DBPlayerInLeague,
  DBRound,
  DBSeason,
  Player,
  RoundHistoryEntry,
} from "@/types";
import { createServerSupabase } from "@/utils/supabaseServer";
import {
  getAccessTokenFromRequest,
  validateSessionToken,
} from "@/utils/authValidation";

export async function GET(req: NextRequest) {
  try {
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

    const requestedLeagueId = req.nextUrl.searchParams.get("leagueId") || "";
    const requestedSeasonId = req.nextUrl.searchParams.get("seasonId") || "";

    const [
      { data: leaguesData, error: leaguesError },
      { data: globalPlayersData, error: playersError },
    ] = await Promise.all([
      supabase.from("leagues").select("*").order("name"),
      supabase
        .from("players")
        .select("*")
        .order("last_name", { ascending: true }),
    ]);

    if (leaguesError) throw leaguesError;
    if (playersError) throw playersError;

    const leagues = (leaguesData as DBLeague[]) || [];
    const globalPlayers = (globalPlayersData as DBPlayer[]) || [];

    const selectedLeagueId = requestedLeagueId || leagues[0]?.id || "";

    let seasons: DBSeason[] = [];
    let selectedSeasonId = "";
    let events: Array<{
      id: string;
      created_at: string;
      title: string | null;
      content: string | null;
      pinned: boolean | null;
      league_id: string;
    }> = [];
    let players: Player[] = [];
    let roundHistory: RoundHistoryEntry[] = [];

    if (selectedLeagueId) {
      const [
        { data: seasonsData, error: seasonsError },
        { data: eventsData, error: eventsError },
      ] = await Promise.all([
        supabase
          .from("seasons")
          .select("*")
          .eq("league_id", selectedLeagueId)
          .order("created_at", { ascending: false }),
        supabase
          .from("events")
          .select("*")
          .eq("league_id", selectedLeagueId)
          .order("pinned", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);

      if (seasonsError) throw seasonsError;
      if (eventsError) throw eventsError;

      seasons = (seasonsData as DBSeason[]) || [];
      events = eventsData || [];
      selectedSeasonId = requestedSeasonId || seasons[0]?.id || "";

      if (selectedSeasonId) {
        const [
          { data: playersInLeagueData, error: playersInLeagueError },
          { data: roundsData, error: roundsError },
        ] = await Promise.all([
          supabase
            .from("players_in_leagues")
            .select("rank, players(id, first_name, last_name)")
            .eq("league_id", selectedLeagueId)
            .order("rank"),
          supabase
            .from("rounds")
            .select("*")
            .eq("season_id", selectedSeasonId)
            .order("created_at", { ascending: false }),
        ]);

        if (playersInLeagueError) throw playersInLeagueError;
        if (roundsError) throw roundsError;

        const playersInLeague =
          (playersInLeagueData as unknown as DBPlayerInLeague[]) || [];

        players = playersInLeague
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

        roundHistory = (((roundsData as DBRound[]) || []) as DBRound[]).map(
          (round) => ({
            id: round.id,
            date: round.created_at,
            present_players: round.present_players,
            groups: (round.details as any)?.groups || [],
            scores: (round.details as any)?.scores || {},
            finalPlacements: (round.details as any)?.finalPlacements || [],
            playersBefore: (round.details as any)?.playersBefore || [],
            playersAfter: (round.details as any)?.playersAfter || [],
          }),
        );
      }
    }

    return NextResponse.json({
      leagues,
      seasons,
      globalPlayers,
      players,
      events,
      roundHistory,
      selectedLeagueId,
      selectedSeasonId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

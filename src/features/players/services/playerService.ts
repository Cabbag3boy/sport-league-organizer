import type {
  Player,
  DBPlayer,
  DBPlayerInLeague,
  AddPlayerInput,
  AddExistingPlayerInput,
  RemovePlayerInput,
  UpdatePlayerInput,
} from "@/types";
import { getSupabase } from "@/utils/supabase";
import { reorderPlayerRanks } from "@/features/league/utils";

/**
 * Player Service - Manages player operations within leagues
 */

export async function addPlayer(input: AddPlayerInput): Promise<Player> {
  const { leagueId, playerName, globalPlayerId } = input;
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  const parts = playerName.trim().split(" ");
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ") || "-";

  // If adding a new global player
  if (!globalPlayerId) {
    const { data: pData, error: pErr } = await supabase
      .from("players")
      .insert({ first_name: firstName, last_name: lastName })
      .select()
      .single();

    if (pErr) throw pErr;
    const insertedPlayer = pData as DBPlayer;

    // Get current player count in league
    const { data: existingPlayers, error: countErr } = await supabase
      .from("players_in_leagues")
      .select("id")
      .eq("league_id", leagueId);

    if (countErr) throw countErr;
    const nextRank = (existingPlayers?.length || 0) + 1;

    const { error: pilErr } = await supabase.from("players_in_leagues").insert({
      league_id: leagueId,
      player_id: insertedPlayer.id,
      rank: nextRank,
    });

    if (pilErr) throw pilErr;

    return {
      id: insertedPlayer.id,
      first_name: insertedPlayer.first_name,
      last_name: insertedPlayer.last_name,
      name: `${insertedPlayer.first_name} ${insertedPlayer.last_name}`.trim(),
      rank: nextRank,
    };
  }

  // If adding existing global player to league
  const { data: existingPlayers, error: countErr } = await supabase
    .from("players_in_leagues")
    .select("id")
    .eq("league_id", leagueId);

  if (countErr) throw countErr;
  const nextRank = (existingPlayers?.length || 0) + 1;

  const { error: pilErr } = await supabase.from("players_in_leagues").insert({
    league_id: leagueId,
    player_id: globalPlayerId,
    rank: nextRank,
  });

  if (pilErr) throw pilErr;

  // Fetch the player data
  const { data: playerData, error: fetchErr } = await supabase
    .from("players")
    .select("*")
    .eq("id", globalPlayerId)
    .single();

  if (fetchErr) throw fetchErr;

  const p = playerData as DBPlayer;
  return {
    id: p.id,
    first_name: p.first_name,
    last_name: p.last_name,
    name: `${p.first_name} ${p.last_name}`.trim(),
    rank: nextRank,
  };
}

export async function addExistingPlayer(
  input: AddExistingPlayerInput
): Promise<Player> {
  const { leagueId, playerId } = input;
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  // Get current player count
  const { data: existingPlayers, error: countErr } = await supabase
    .from("players_in_leagues")
    .select("id")
    .eq("league_id", leagueId);

  if (countErr) throw countErr;
  const nextRank = (existingPlayers?.length || 0) + 1;

  const { error: pilErr } = await supabase.from("players_in_leagues").insert({
    league_id: leagueId,
    player_id: playerId,
    rank: nextRank,
  });

  if (pilErr) throw pilErr;

  // Fetch player data
  const { data: playerData, error: fetchErr } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .single();

  if (fetchErr) throw fetchErr;

  const p = playerData as DBPlayer;
  return {
    id: p.id,
    first_name: p.first_name,
    last_name: p.last_name,
    name: `${p.first_name} ${p.last_name}`.trim(),
    rank: nextRank,
  };
}

export async function removePlayer(input: RemovePlayerInput): Promise<void> {
  const { leagueId, playerId } = input;
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  // Delete link from league
  const { error: deleteLinkError } = await supabase
    .from("players_in_leagues")
    .delete()
    .eq("player_id", playerId)
    .eq("league_id", leagueId);

  if (deleteLinkError) throw deleteLinkError;

  // Check if player is in other leagues
  const { data: otherLeagues, error: checkError } = await supabase
    .from("players_in_leagues")
    .select("id")
    .eq("player_id", playerId);

  if (checkError) throw checkError;

  // If not in other leagues, delete player
  if (!otherLeagues || otherLeagues.length === 0) {
    const { error: deletePlayerError } = await supabase
      .from("players")
      .delete()
      .eq("id", playerId);

    if (deletePlayerError) throw deletePlayerError;
  }
}

export async function updatePlayer(input: UpdatePlayerInput): Promise<Player> {
  const { id, first_name, last_name, rank, leagueId } = input;
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  // Fetch current players in league
  const { data: pilData, error: fetchErr } = await supabase
    .from("players_in_leagues")
    .select("id, rank, player_id, players(id, first_name, last_name)")
    .eq("league_id", leagueId)
    .order("rank", { ascending: true });

  if (fetchErr) throw fetchErr;

  const currentPlayers: Player[] = (
    (pilData as unknown as DBPlayerInLeague[]) || []
  ).map((row) => ({
    id: row.players!.id,
    first_name: row.players!.first_name,
    last_name: row.players!.last_name,
    name: `${row.players!.first_name} ${row.players!.last_name}`.trim(),
    rank: row.rank,
  }));

  // Update player name
  const { error: updateErr } = await supabase
    .from("players")
    .update({
      first_name,
      last_name,
    })
    .eq("id", id);

  if (updateErr) throw updateErr;

  // Reorder ranks if needed
  const { reorderedPlayers, error: reorderError } = reorderPlayerRanks(
    currentPlayers,
    id,
    rank
  );

  if (reorderError) throw new Error(reorderError);

  // Update all ranks
  const rankUpdates = reorderedPlayers.map((player) => ({
    player_id: player.id,
    league_id: leagueId,
    rank: player.rank,
  }));

  const { error: upsertError } = await supabase
    .from("players_in_leagues")
    .upsert(rankUpdates, { onConflict: "league_id,player_id" });

  if (upsertError) throw upsertError;

  return {
    id,
    first_name,
    last_name,
    name: `${first_name} ${last_name}`.trim(),
    rank,
  };
}

export async function fetchPlayersInLeague(
  leagueId: string
): Promise<Player[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  const { data: pilData, error: pilErr } = await supabase
    .from("players_in_leagues")
    .select("id, rank, player_id, players(id, first_name, last_name)")
    .eq("league_id", leagueId)
    .order("rank", { ascending: true });

  if (pilErr) throw pilErr;

  return ((pilData as unknown as DBPlayerInLeague[]) || []).map((row) => ({
    id: row.players!.id,
    first_name: row.players!.first_name,
    last_name: row.players!.last_name,
    name: `${row.players!.first_name} ${row.players!.last_name}`.trim(),
    rank: row.rank,
  }));
}

export async function fetchAllPlayers(leagueId: string): Promise<Player[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not initialized");

  const { data: pilData, error: pilErr } = await supabase
    .from("players_in_leagues")
    .select("rank, players(id, first_name, last_name)")
    .eq("league_id", leagueId)
    .order("rank");

  if (pilErr) throw pilErr;

  return ((pilData as unknown as DBPlayerInLeague[]) || []).map((row) => {
    const player = row.players!;
    return {
      id: player.id,
      first_name: player.first_name,
      last_name: player.last_name,
      name: `${player.first_name} ${player.last_name}`.trim(),
      rank: row.rank,
    };
  });
}

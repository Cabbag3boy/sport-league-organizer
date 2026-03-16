import type {
  DBPlayer,
  DBPlayerInLeague,
  DBRound,
  Player,
  RoundHistoryEntry,
} from "@/types";

type JoinedPlayerRow = Omit<DBPlayerInLeague, "players"> & {
  players?: DBPlayer | DBPlayer[] | null;
};

export function mapPlayerInLeagueRowToPlayer(
  row: JoinedPlayerRow,
): Player | null {
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
}

export function mapRoundToHistoryEntry(round: DBRound): RoundHistoryEntry {
  return {
    id: round.id,
    date: round.created_at,
    present_players: round.present_players,
    groups: round.details?.groups || [],
    scores: round.details?.scores || {},
    finalPlacements: round.details?.finalPlacements || [],
    playersBefore: round.details?.playersBefore || [],
    playersAfter: round.details?.playersAfter || [],
  };
}

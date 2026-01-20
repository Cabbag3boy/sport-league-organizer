import type {
  DBLeague,
  DBSeason,
  DBPlayer,
  DBPlayerInLeague,
  DBRound,
  DBEvent,
  RoundDetails,
  Player,
} from "@/types";

/**
 * Factory function for creating mock DBLeague objects
 * Accepts optional overrides for test-specific mutations
 */
export const createMockLeague = (overrides?: Partial<DBLeague>): DBLeague => {
  return {
    id: "league-test-1",
    name: "Test League",
    created_at: new Date().toISOString(),
    ...overrides,
  };
};

/**
 * Factory function for creating mock DBSeason objects
 * Accepts optional overrides for test-specific mutations
 */
export const createMockSeason = (overrides?: Partial<DBSeason>): DBSeason => {
  return {
    id: "season-test-1",
    league_id: "league-test-1",
    name: "Test Season",
    created_at: new Date().toISOString(),
    ...overrides,
  };
};

/**
 * Factory function for creating mock DBPlayer objects
 * Accepts optional overrides for test-specific mutations
 */
export const createMockPlayer = (overrides?: Partial<DBPlayer>): DBPlayer => {
  return {
    id: "player-test-1",
    first_name: "John",
    last_name: "Doe",
    created_at: new Date().toISOString(),
    ...overrides,
  };
};

/**
 * Factory function for creating mock DBPlayerInLeague objects
 * Accepts optional overrides for test-specific mutations
 */
export const createMockPlayerInLeague = (
  overrides?: Partial<DBPlayerInLeague>
): DBPlayerInLeague => {
  return {
    id: "player-in-league-test-1",
    league_id: "league-test-1",
    player_id: "player-test-1",
    rank: 1,
    ...overrides,
  };
};

/**
 * Factory function for creating mock round details
 * Accepts optional overrides for test-specific mutations
 */
export const createMockRoundDetails = (
  overrides?: Partial<RoundDetails>
): RoundDetails => {
  const mockPlayers: Player[] = [
    {
      id: "player-1",
      first_name: "P1",
      last_name: "One",
      name: "P1 One",
      rank: 1,
    },
    {
      id: "player-2",
      first_name: "P2",
      last_name: "Two",
      name: "P2 Two",
      rank: 2,
    },
    {
      id: "player-3",
      first_name: "P3",
      last_name: "Three",
      name: "P3 Three",
      rank: 3,
    },
    {
      id: "player-4",
      first_name: "P4",
      last_name: "Four",
      name: "P4 Four",
      rank: 4,
    },
  ];
  return {
    groups: [
      [mockPlayers[0]!, mockPlayers[1]!],
      [mockPlayers[2]!, mockPlayers[3]!],
    ],
    scores: {
      "match-1": { score1: "10", score2: "8" },
      "match-2": { score1: "9", score2: "7" },
    },
    finalPlacements: [
      [mockPlayers[0]!],
      [mockPlayers[1]!],
      [mockPlayers[2]!],
      [mockPlayers[3]!],
    ],
    playersBefore: [
      {
        id: "player-1",
        first_name: "Player",
        last_name: "One",
        name: "Player One",
        rank: 1,
      },
      {
        id: "player-2",
        first_name: "Player",
        last_name: "Two",
        name: "Player Two",
        rank: 2,
      },
      {
        id: "player-3",
        first_name: "Player",
        last_name: "Three",
        name: "Player Three",
        rank: 3,
      },
      {
        id: "player-4",
        first_name: "Player",
        last_name: "Four",
        name: "Player Four",
        rank: 4,
      },
    ],
    playersAfter: [
      {
        id: "player-1",
        first_name: "Player",
        last_name: "One",
        name: "Player One",
        rank: 1,
      },
      {
        id: "player-2",
        first_name: "Player",
        last_name: "Two",
        name: "Player Two",
        rank: 2,
      },
      {
        id: "player-3",
        first_name: "Player",
        last_name: "Three",
        name: "Player Three",
        rank: 3,
      },
      {
        id: "player-4",
        first_name: "Player",
        last_name: "Four",
        name: "Player Four",
        rank: 4,
      },
    ],
    ...overrides,
  };
};

/**
 * Factory function for creating mock DBRound objects
 * Accepts optional overrides for test-specific mutations
 */
export const createMockRound = (overrides?: Partial<DBRound>): DBRound => {
  return {
    id: "round-test-1",
    season_id: "season-test-1",
    created_at: new Date().toISOString(),
    present_players: ["player-1", "player-2", "player-3", "player-4"],
    details: createMockRoundDetails(),
    ...overrides,
  };
};

/**
 * Factory function for creating mock DBEvent objects
 * Accepts optional overrides for test-specific mutations
 */
export const createMockEvent = (overrides?: Partial<DBEvent>): DBEvent => {
  return {
    id: "event-test-1",
    created_at: new Date().toISOString(),
    title: "Test Event",
    content: "This is a test event",
    pinned: false,
    league_id: "league-test-1",
    ...overrides,
  };
};

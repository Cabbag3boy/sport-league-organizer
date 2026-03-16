import React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent } from "@testing-library/react";
import { render, screen } from "@/test/test-utils";
import RoundHistoryCard from "../RoundHistoryCard";
import type { RoundHistoryEntry, Player } from "@/types";

vi.mock("@/components/shared/StaticMatch", () => ({
  default: () => <div>StaticMatch</div>,
}));

vi.mock("@/utils/shared/legacyRound2ScoreSwap", () => ({
  shouldSwapLegacyRound2Scores: () => false,
}));

function makePlayer(id: string, rank: number): Player {
  return {
    id,
    first_name: `First ${id}`,
    last_name: `Last ${id}`,
    name: `Player ${id}`,
    rank,
  };
}

function makeEntry(): RoundHistoryEntry {
  const player1 = makePlayer("p1", 1);
  const player2 = makePlayer("p2", 2);

  return {
    id: "round-1",
    date: "2026-01-01T00:00:00.000Z",
    groups: [[player1, player2]],
    scores: {
      "g1-m1": { score1: "11", score2: "9" },
    },
    finalPlacements: [[player1, player2]],
    playersBefore: [player1, player2],
    playersAfter: [player1, player2],
  };
}

describe("RoundHistoryCard", () => {
  it("does not render delete action for unauthenticated users", () => {
    render(
      <RoundHistoryCard
        entry={makeEntry()}
        isSelected={false}
        onToggleSelection={vi.fn()}
        roundNumber={1}
        isLastRound
        isAuthenticated={false}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.queryByTitle("Smazat toto kolo")).not.toBeInTheDocument();
  });

  it("renders delete action for authenticated users and calls handler", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);

    render(
      <RoundHistoryCard
        entry={makeEntry()}
        isSelected={false}
        onToggleSelection={vi.fn()}
        roundNumber={1}
        isLastRound
        isAuthenticated
        onDelete={onDelete}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTitle("Smazat toto kolo"));
    });

    expect(onDelete).toHaveBeenCalledWith("round-1");
  });
});

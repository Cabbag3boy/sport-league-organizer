const LEGACY_ROUND2_SCORE_SWAP_CUTOFF = new Date(
  "2026-01-22T23:59:59.999",
).getTime();

export const shouldSwapLegacyRound2Scores = (roundDate: string): boolean => {
  const timestamp = new Date(roundDate).getTime();
  return (
    !Number.isNaN(timestamp) && timestamp <= LEGACY_ROUND2_SCORE_SWAP_CUTOFF
  );
};

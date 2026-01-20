import React from "react";

interface MatchProps {
  player1Name: string;
  player2Name: string;
  score1: string;
  score2: string;
  onScoreChange: (score1: string, score2: string) => void;
  isPlaceholder?: boolean;
}

const Match: React.FC<MatchProps> = ({
  player1Name,
  player2Name,
  score1,
  score2,
  onScoreChange,
  isPlaceholder = false,
}) => {
  const handleScore1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    onScoreChange(e.target.value, score2);
  };

  const handleScore2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    onScoreChange(score1, e.target.value);
  };

  const inputClasses =
    "w-12 bg-gray-700 text-white text-center rounded-md p-1 mx-1 focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-gray-800 disabled:text-gray-500 transition-colors";

  // Determine player name styling based on scores
  let player1Classes = `font-medium text-right w-2/5 truncate transition-colors ${
    isPlaceholder ? "text-gray-500" : "text-gray-200"
  }`;
  let player2Classes = `font-medium text-left w-2/5 truncate transition-colors ${
    isPlaceholder ? "text-gray-500" : "text-gray-200"
  }`;

  // Color winners/losers if scores are entered
  if (!isPlaceholder && score1 !== "" && score2 !== "") {
    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);
    if (!isNaN(s1) && !isNaN(s2)) {
      if (s1 > s2) {
        player1Classes =
          "font-medium text-right w-2/5 truncate text-green-400 font-bold";
        player2Classes = "font-medium text-left w-2/5 truncate text-gray-500";
      } else if (s2 > s1) {
        player2Classes =
          "font-medium text-left w-2/5 truncate text-green-400 font-bold";
        player1Classes = "font-medium text-right w-2/5 truncate text-gray-500";
      }
    }
  }

  return (
    <li className="flex justify-center items-center bg-gray-900 p-2 rounded-md">
      <span className={player1Classes}>{player1Name}</span>
      <input
        type="number"
        value={score1}
        onChange={handleScore1Change}
        disabled={isPlaceholder}
        className={inputClasses}
        aria-label={`${player1Name} score`}
      />
      <span className="font-bold text-indigo-400 mx-1 text-sm">VS</span>
      <input
        type="number"
        value={score2}
        onChange={handleScore2Change}
        disabled={isPlaceholder}
        className={inputClasses}
        aria-label={`${player2Name} score`}
      />
      <span className={player2Classes}>{player2Name}</span>
    </li>
  );
};

export default Match;


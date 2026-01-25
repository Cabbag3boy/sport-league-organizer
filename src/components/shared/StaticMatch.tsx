import React from "react";

interface StaticMatchProps {
  player1Name: string;
  player2Name: string;
  score1: string;
  score2: string;
  note?: string;
}

const StaticMatch: React.FC<StaticMatchProps> = ({
  player1Name,
  player2Name,
  score1,
  score2,
  note,
}) => {
  let player1Classes = "font-medium text-right w-2/5 truncate text-gray-200";
  let player2Classes = "font-medium text-left w-2/5 truncate text-gray-200";

  // Color winners/losers based on scores
  if (score1 !== "" && score2 !== "") {
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
    <div className="flex flex-col bg-gray-900/50 p-2 rounded-md text-sm">
      <div className="flex justify-center items-center">
        <span className={player1Classes}>{player1Name}</span>
        <span className="w-8 text-center font-bold text-gray-200">
          {score1}
        </span>
        <span className="font-bold text-indigo-400 mx-2 text-xs">VS</span>
        <span className="w-8 text-center font-bold text-gray-200">
          {score2}
        </span>
        <span className={player2Classes}>{player2Name}</span>
      </div>
      {note && <div className="text-gray-400 text-xs mt-1 pl-2">{note}</div>}
    </div>
  );
};

export default StaticMatch;

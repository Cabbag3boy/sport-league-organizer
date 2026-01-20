import type { RoundHistoryEntry, Player } from "../../types";

const getRoundMatchesHtml = (round: RoundHistoryEntry): string => {
  const matchStrings: string[] = [];
  const scores = round.scores;

  round.groups.forEach((group, groupIndex) => {
    const groupNumber = groupIndex + 1;
    matchStrings.push(`<b>Group ${groupNumber}</b>`);

    const formatMatch = (
      p1Name: string,
      p2Name: string,
      score: { score1: string; score2: string } | undefined
    ): void => {
      if (!score || score.score1 === "" || score.score2 === "") return;
      matchStrings.push(
        `${p1Name} - ${p2Name} ${score.score1}:${score.score2}`
      );
    };

    if (group.length === 3) {
      const [p1, p2, p3] = group as [Player, Player, Player];
      formatMatch(p1.name, p2.name, scores[`g${groupNumber}-m1`]);
      formatMatch(p1.name, p3.name, scores[`g${groupNumber}-m2`]);
      formatMatch(p2.name, p3.name, scores[`g${groupNumber}-m3`]);
    } else if (group.length === 4) {
      const [p1, p2, p3, p4] = group as [Player, Player, Player, Player];
      const r1m1Scores = scores[`g${groupNumber}-r1-m1`];
      formatMatch(p1.name, p4.name, r1m1Scores);
      const r1m2Scores = scores[`g${groupNumber}-r1-m2`];
      formatMatch(p2.name, p3.name, r1m2Scores);

      let winner1: Player | null = null,
        loser1: Player | null = null;
      if (r1m1Scores && r1m1Scores.score1 !== "" && r1m1Scores.score2 !== "") {
        const s1 = parseInt(r1m1Scores.score1, 10);
        const s2 = parseInt(r1m1Scores.score2, 10);
        if (!isNaN(s1) && !isNaN(s2)) {
          winner1 = s1 > s2 ? p1 : p4;
          loser1 = s1 > s2 ? p4 : p1;
        }
      }

      let winner2: Player | null = null,
        loser2: Player | null = null;
      if (r1m2Scores && r1m2Scores.score1 !== "" && r1m2Scores.score2 !== "") {
        const s1 = parseInt(r1m2Scores.score1, 10);
        const s2 = parseInt(r1m2Scores.score2, 10);
        if (!isNaN(s1) && !isNaN(s2)) {
          winner2 = s1 > s2 ? p2 : p3;
          loser2 = s1 > s2 ? p3 : p2;
        }
      }

      if (winner1 && winner2) {
        formatMatch(
          winner1.name,
          winner2.name,
          scores[`g${groupNumber}-r2-m1`]
        );
      }
      if (loser1 && loser2) {
        formatMatch(loser1.name, loser2.name, scores[`g${groupNumber}-r2-m2`]);
      }
    } else if (group.length === 2) {
      const [p1, p2] = group as [Player, Player];
      formatMatch(p1.name, p2.name, scores[`g${groupNumber}-m1`]);
    }
  });
  return matchStrings.join("<br>");
};

export const generateXLSContent = (
  selectedRounds: RoundHistoryEntry[]
): string => {
  const sortedRounds = [...selectedRounds].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  if (sortedRounds.length === 0) return "";

  // 1. Get a master map of all players across all selected rounds.
  const allPlayersMap = new Map<string, Player>();
  sortedRounds.forEach((r) => {
    r.playersBefore.forEach((p) => {
      if (!allPlayersMap.has(p.id)) allPlayersMap.set(p.id, p);
    });
    r.playersAfter.forEach((p) => {
      if (!allPlayersMap.has(p.id)) allPlayersMap.set(p.id, p);
    });
  });
  const allPlayersList = Array.from(allPlayersMap.values());
  const numRows = allPlayersList.length;

  // 2. For each round, create a sorted list of ALL players with their data for that round.
  const roundsData = sortedRounds.map((round) => {
    const playersBeforeMap = new Map(round.playersBefore.map((p) => [p.id, p]));
    const playersAfterMap = new Map(round.playersAfter.map((p) => [p.id, p]));
    const presentPlayerIds = new Set(round.groups.flat().map((p) => p.id));

    const sortedPlayersForRound = allPlayersList
      .map((masterPlayer) => {
        const playerBefore = playersBeforeMap.get(masterPlayer.id);
        const playerAfter = playersAfterMap.get(masterPlayer.id);
        return {
          id: masterPlayer.id,
          name: playerBefore ? playerBefore.name : masterPlayer.name,
          rankBefore: playerBefore ? playerBefore.rank : Infinity,
          rankAfter: playerAfter ? playerAfter.rank : null,
          isPresent: playerBefore
            ? presentPlayerIds.has(playerBefore.id)
            : false,
        };
      })
      .sort((a, b) => a.rankBefore - b.rankBefore);

    return {
      round,
      sortedPlayers: sortedPlayersForRound,
      matchesHTML: getRoundMatchesHtml(round),
    };
  });

  // 3. Build headers
  let headerRow1 = "<tr>";
  let headerRow2 = "<tr>";
  sortedRounds.forEach((_round, roundIndex) => {
    const roundNumber = roundIndex + 1;
    headerRow1 += `<th colspan="4" style="text-align:center; background-color:#e8b489; color:#000000; border:1px solid #000000;">${roundNumber}. Kolo</th>`;
    headerRow2 += `<th colspan="2" style="background-color:#e8b489; color:#000000; border:1px solid #000000;">Žebříček před ${roundNumber}. kolem</th>
                   <th style="background-color:#e8b489; color:#000000; border:1px solid #000000;">Odehrané utkání</th>
                   <th style="background-color:#e8b489; color:#000000; border:1px solid #000000;">Žebříček po ${roundNumber}. kole</th>`;
  });
  let headerRow0 = `<tr><th colspan="${
    sortedRounds.length * 4
  }" style="text-align:center; background-color:#e8b489; color:#000000; border:1px solid #000000;">X. den ZLB 2025/2026</th></tr>`;
  headerRow1 += "</tr>";
  headerRow2 += "</tr>";
  const thead = `<thead>${headerRow0}${headerRow1}${headerRow2}</thead>`;

  // 4. Build body
  let tbody = "<tbody>";
  for (let i = 0; i < numRows; i++) {
    let tableRow = "<tr>";
    roundsData.forEach((roundData) => {
      const player = roundData.sortedPlayers[i];

      if (player) {
        const style = player.isPresent
          ? "color:#000000;"
          : player.rankBefore !== Infinity
          ? "background-color:#d9d9d9;"
          : "color:#000000;";
        const rankBefore =
          player.rankBefore !== Infinity ? player.rankBefore : "";
        const foundPlayer = roundData.sortedPlayers.find(
          (p) => p.rankAfter == i + 1
        );
        const playerOnRankAfter = foundPlayer?.name || "";

        tableRow += `<td style="text-align:center; border:1px solid #000000;">${rankBefore}</td>`;
        tableRow += `<td style="${style} border:1px solid #000000;">${player.name}</td>`;

        if (i === 0) {
          tableRow += `<td rowspan="${numRows}" style="text-align:left; vertical-align:top; border:1px solid #000000;">${roundData.matchesHTML}</td>`;
        }

        tableRow += `<td style="text-align:left; border:1px solid #000000; font-weight: bold;">${playerOnRankAfter}</td>`;
      } else {
        tableRow += "<td></td><td></td>";
        if (i === 0) {
          tableRow += `<td rowspan="${numRows}"></td>`;
        }
        tableRow += "<td></td>";
      }
    });
    tableRow += "</tr>";
    tbody += tableRow;
  }
  tbody += "</tbody>";

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Round History</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
        <body><table border="1">${thead}${tbody}</table></body></html>`;
};

export const downloadFile = (
  content: string,
  filename: string,
  type: string
) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", url);
  linkElement.setAttribute("download", filename);
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
  URL.revokeObjectURL(url);
};


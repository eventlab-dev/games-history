import { type GamesHistory, type Game } from "./types";

const HistoryData: GamesHistory = await Bun.file("games_history.json").json();

function extractTitleAndYear(title: string): {
  title: string;
  year: number | null;
} {
  const match = title.match(/^(.*?)\s*\((19\d{2}|20\d{2})\)$/);

  if (match && match[1] && match[2]) {
    return {
      title: match[1].trim(),
      year: Number(match[2]),
    };
  }

  return { title, year: null };
}

function makeInsertCommand(game: Game) {
  const timestamp = Math.round(new Date(game.date).getTime() / 1000);
  const { title, year } = extractTitleAndYear(game.game_title);

  return `
    INSERT INTO games_history (
      player_name,
      game_title,
      game_cover,
      game_link,
      completion_status,
      timestamp,
      event_name,
      review,
      rating,
      game_time,
      year,
      game_id
    ) VALUES (
      '${game.player_nickname}',
      '${title.replaceAll("'", "''")}',
      '${game.game_cover}',
      '${game.game_link}',
      '${game.completion_status}',
      ${timestamp},
      '${game.event_name}',
      '${game.review.replaceAll("'", "''")}',
      '${game.rating}',
      ${game.game_time},
      ${year ?? "NULL"},
      "NULL"
    );
  `;
}

for (const game of HistoryData.games) {
  const cmd = makeInsertCommand(game);
  console.log(cmd);
  console.log("---");
}

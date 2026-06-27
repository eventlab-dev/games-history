import { type } from "arktype";

export const CompletionStatus = type('"completed" | "reroll" | "drop"');
export type CompletionStatus = typeof CompletionStatus.infer;

export const EventName = type('"MGE" | "aukus3" | "aukus2" | "aukus1" | "aukus4" | "nasral-2025" | "nassal-2026" | "igropolius-2025"');
export type EventName = typeof EventName.infer;

export const HistoryGame = type({
  player_nickname: "string",
  game_title: "string",
  game_cover: "string",
  game_link: "string",
  completion_status: CompletionStatus,
  date: "string",
  event_name: EventName,
  review: "string",
  rating: "string",
  game_time: "number",
  igdb_id: "number | null",
  steam_id: "number | null",
  hltb_id: "number | null"
});
export type HistoryGame = typeof HistoryGame.infer;

export const GamesHistory = type({
  games: HistoryGame.array()
});
export type GamesHistory = typeof GamesHistory.infer;

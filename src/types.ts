
export type CompletionStatus = "completed" | "reroll" | "drop";

export type EventName = "MGE" | "aukus3" | "aukus2" | "aukus1" | "nasral-2025" | "nassal-2026" | "igropolius-2025";

export type HistoryGame = {
  player_nickname: string;
  game_title: string;
  game_cover: string;
  game_link: string;
  completion_status: CompletionStatus;
  date: string;
  event_name: EventName;
  review: string;
  rating: string;
  game_time: number;
  igdb_id: number | null;
  steam_id: number | null;
  hltb_id: string | null;
}

export type GamesHistory = {
  games: HistoryGame[];
}

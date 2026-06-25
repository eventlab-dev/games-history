
export type CompletionStatus = "completed" | "reroll" | "drop";

export type EventName = "MGE" | "aukus3" | "aukus2" | "Aukus1";

export type Game = {
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
}

export type GamesHistory = {
  games: Game[];
}

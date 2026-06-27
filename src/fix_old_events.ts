import { CompletionStatus, type GamesHistory } from "./types";

const AUKUS1_FILE = "events_data/aukus1.json";
const AUKUS2_FILE = "events_data/aukus2.json";
const AUKUS3_FILE = "events_data/aukus3.json";
const MGE_FILE = "events_data/mge_game_data.json";

function addGameIds(data: GamesHistory) {
  for (const game of data.games) {
    game.hltb_id = null;
    game.igdb_id = null;
    game.steam_id = null;
  }
}

function filterStatuses(data: GamesHistory) {
  data.games = data.games.filter((game) => CompletionStatus.allows(game.completion_status));
}

async function processFile(filename: string) {
  const data = (await Bun.file(filename).json()) as GamesHistory;
  addGameIds(data);
  filterStatuses(data);
  await Bun.write(filename, JSON.stringify(data, null, 2));
}

processFile(AUKUS1_FILE);
processFile(AUKUS2_FILE);
processFile(AUKUS3_FILE);
processFile(MGE_FILE);

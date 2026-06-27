import type { CompletionStatus, HistoryGame, GamesHistory } from "./types";

type NassalEvent = {
    id: string;
    playerId: string;
    status: "completed" | "rerolled" | "dropped" | "playing";
    finalSpentSec: number | null;
    playerRating: number | null;
    playerReview: string | null;
    createdAt: string;
    type: "game" | "movie";
    hltbGameId: number;
    imageUrl: string;
    releaseYear: number;
    steamAppId: number;
    title: string;
}

type NassalResponse = Record<string, NassalEvent[]>

const HISTORY_URL = "https://nassal.pro/data/event-snapshot/player-game-histories.json";
const PLAYERS_URL = 'https://nassal.pro/data/event-snapshot/players.json';

const OUTPUT_FILE = "./events_data/nassal-2026_events.json";	

type Player = {
    player: {
        id: string;
        name: string;
    }
}

type PlayersResponse = {
    data: {
        array: Player[]
    }
}

async function fetch_players() {
	const response = await fetch(PLAYERS_URL);
	const data = await response.json() as PlayersResponse;
	const playersMap = new Map<string, string>();
	data.data.array.forEach(player => {
		playersMap.set(player.player.id, player.player.name);
	});
	return playersMap;
}

const statusMap = {
	"completed": "completed",
	"rerolled": "reroll",
	"dropped": "drop"
} as const;

function nassalEventToGame(event: NassalEvent, playerName: string): HistoryGame | null {
	if (event.status === "playing") {
		return null;
	}
	return {
		player_nickname: playerName.toLowerCase(),
		game_title: event.title,
		game_cover: event.imageUrl,
		game_link: `https://store.steampowered.com/app/${event.steamAppId}`,
		completion_status: event.status ? statusMap[event.status] : 'drop',
		date: event.createdAt,
		event_name: "nassal-2026",
		review: event.playerReview ?? '',
		rating: event.playerRating ? `${event.playerRating}/10` : '',
		game_time: event.finalSpentSec ?? 0,
		igdb_id: null,
		steam_id: event.steamAppId,
		hltb_id: event.hltbGameId,
	};
}


async function process_events() {
	const response = await fetch(HISTORY_URL);
	const data = await response.json() as NassalResponse;
	const playersMap = await fetch_players();
    const result: HistoryGame[] = [];
	for (const [playerId, events] of Object.entries(data)) {
		const playerName = playersMap.get(playerId);
		if (!playerName) {
			console.error(`Player ${playerId} not found`);
			continue;
		}
		for (const event of events) {
			if (event.type !== "game") {
				continue;
			}
			const game = nassalEventToGame(event, playerName);
			if (game) {
				result.push(game);
			}
		}
	}
	return result;
}

const games = await process_events();

const data: GamesHistory = {
    games,
};

const outFile = Bun.file(OUTPUT_FILE);
await outFile.write(JSON.stringify(data, null, 2));

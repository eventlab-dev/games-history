import type { CompletionStatus, GamesHistory, HistoryGame } from "./types";

type Player = {
    name: string;
    id: string;
}

type PlayersResponse = {
    data: {
        array: Player[]
    }
}

const OUTPUT_FILE = "events_data/nasral-2025.json";
const PLAYERS_URL = "https://nasral.pro/api-mock/player-list.json";

async function fetchPlayers() {
    const response = await fetch(PLAYERS_URL);
    const data = await response.json() as PlayersResponse;
    return data.data.array;
}

type NasralGame = {
    type: "game" | "movie";
    status: "completed" | "rerolled" | "dropped" | "playing";
    playerRating: number;
    playerReview: string | undefined;
    minutesSpent: number | null;
    updatedAt: string;
    metaData: {
        name: string;
        imageUrl: string | null;
        releaseYear?: number;
        steamStoreLink: string | null;
    }
}

type PlayerEventsResponse = {
    data: {
        games: NasralGame[]
    }
}

const COMPLETION_STATUS_MAP: Record<NasralGame["status"], CompletionStatus> = {
    "completed": "completed",
    "rerolled": "reroll",
    "dropped": "drop",
    "playing": "not-finished",
}

function transformNasralGame(player: Player, game: NasralGame): HistoryGame {
    const steamId = game.metaData.steamStoreLink ? game.metaData.steamStoreLink.split('/').pop() : null;
    return {
        completion_status: COMPLETION_STATUS_MAP[game.status],
        player_nickname: player.name.toLowerCase(),
        game_title: game.metaData.name,
        game_cover: game.metaData.imageUrl || "",
        game_link: game.metaData.steamStoreLink || "",
        date: game.updatedAt,
        event_name: "nasral-2025",
        review: game.playerReview ?? "",
        rating: `${game.playerRating}/10`,
        game_time: game.minutesSpent ? game.minutesSpent * 60 : 0,
        igdb_id: null,
        steam_id: steamId ? parseInt(steamId) : null,
        hltb_id: null,
    }
}

async function fetchPlayerEvents(player: Player) {
    const url = `https://nasral.pro/api-mock/player-${player.id}-game-history.json`
    const response = await fetch(url);
    const data = await response.json() as PlayerEventsResponse;
    return data.data.games;
}

async function processEvents() {
    const players = await fetchPlayers();
    const result: HistoryGame[] = [];
    for (const player of players) {
        const events = await fetchPlayerEvents(player);
        for (const event of events) {
            if (event.type !== "game") {
                continue;
            }
            const game = transformNasralGame(player, event);
            result.push(game);
        }
    }
    return result;
}

const games = await processEvents();

const data: GamesHistory = {
    games,
};

const outFile = Bun.file(OUTPUT_FILE);
await outFile.write(JSON.stringify(data, null, 2));

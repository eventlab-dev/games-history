import type { GamesHistory, HistoryGame } from "./types";

type Player = {
    slug: string;
}

type EventDataResponse = {
    players: Player[]
}

const OUTPUT_FILE = "events_data/aukus4.json";

const EVENT_DATA_URL = "https://aukus.eventlab.dev/api/event_data";

async function fetchPlayers() {
    const response = await fetch(EVENT_DATA_URL);
    const data = await response.json() as EventDataResponse;
    return data.players;
}

type AukusGame = {
    created_at: number;
    player_slug: string;
    type: "completed" | "drop" | "reroll" | "movie" | "sheikh";
    item_title: string;
    item_duration: number;
    item_review: string;
    item_rating: number;
    game_id: number;
    cover_image_url: string;
}

type PlayerGamesResponse = {
    moves: AukusGame[]
}

async function fetchPlayerGames(playerSlug: string) {
    const response = await fetch(`https://aukus.eventlab.dev/api/players/moves?players=${playerSlug}`);
    const data = await response.json() as PlayerGamesResponse
    // console.log(data);
    return data.moves;
}

function convertToHistoryGame(game: AukusGame): HistoryGame | null {
    if (game.type !== "completed" && game.type !== "drop" && game.type !== "reroll") {
        return null;
    }
    return {
        date: new Date(game.created_at * 1000).toISOString(),
        event_name: "aukus4",
        player_nickname: game.player_slug,
        game_title: game.item_title,
        game_cover: game.cover_image_url,
        game_link: "",
        completion_status: game.type,
        review: game.item_review,
        rating: `${game.item_rating}/10`,
        game_time: game.item_duration,
        igdb_id: game.game_id,
        steam_id: null,
        hltb_id: null,
    };
}

async function getGamesHistory() {
    const players = await fetchPlayers();
    const games = await Promise.all(players.map(player => fetchPlayerGames(player.slug)));
    const historyGames = games.flat().map(game => convertToHistoryGame(game)).filter(game => game !== null) as HistoryGame[];
    return historyGames;
}

const gamesHistory = await getGamesHistory();
const data: GamesHistory = { games: gamesHistory };

await Bun.write(OUTPUT_FILE, JSON.stringify(data, null, 2));


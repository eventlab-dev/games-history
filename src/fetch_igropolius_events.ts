import type { Game, GamesHistory } from "./types";

type IgropoliusGame = {
    status: "completed" | "reroll" | "drop";
    title: string;
    rating: number;
    duration: number;
    review: string;
    cover: string;
    game_id: number;
    created_at: number;
}

type Player = {
    username: string;
    games: IgropoliusGame[]
}

type PlayersResponse = {
    players: Player[]
}

const PLAYERS_URL = 'https://igropolius.eventlab.dev/api/players';

const OUTPUT_FILE = 'events_data/igropolius-2025.json';

function igropoliusGameToGame(game: IgropoliusGame, playerName: string): Game {
    return {
        player_nickname: playerName.toLowerCase(),
        game_title: game.title,
        game_cover: game.cover,
        game_link: '',
        completion_status: game.status,
        date: new Date(game.created_at * 1000).toISOString(),
        event_name: "igropolius-2025",
        review: game.review,
        rating: `${game.rating}/10`,
        game_time: game.duration,
        igdb_id: game.game_id,
        steam_id: null,
        hltb_id: null,
    };
}

async function fetch_players() {
    const response = await fetch(PLAYERS_URL);
    const data = await response.json() as PlayersResponse;
    const games: Game[] = [];
    for (const player of data.players) {
        for (const game of player.games) {
            games.push(igropoliusGameToGame(game, player.username));
        }
    }
    return games;
}

const games = await fetch_players();

const gamesHistory: GamesHistory = {
    games,
};

const outFile = Bun.file(OUTPUT_FILE);
await outFile.write(JSON.stringify(gamesHistory, null, 2));


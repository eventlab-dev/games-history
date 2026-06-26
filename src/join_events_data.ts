import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { CompletionStatus, HistoryGame, GamesHistory } from "./types";

export async function joinEventsData(outputFile: string): Promise<void> {
	const eventsData: HistoryGame[] = [];
	const statuses = new Set<CompletionStatus>(["drop", "reroll", "completed"]);

	const files = await readdir("events_data");
	files.sort();

	for (const filename of files) {
		if (!filename.endsWith(".json")) {
			continue;
		}

		const data = (await Bun.file(join("events_data", filename)).json()) as GamesHistory;

		const filteredGames = (data.games ?? []).filter((game) =>
			statuses.has(game.completion_status),
		);

		eventsData.push(...filteredGames);
	}

	await Bun.write(
		outputFile,
		JSON.stringify({ games: eventsData }, null, 2),
	);
}

await joinEventsData("games_history.json");

import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { type CompletionStatus, type HistoryGame, GamesHistory } from "./types";
import { type as arktype } from "arktype";

const SCHEMA_FILE = "games_history_schema.json";

async function joinEventsData(outputFile: string): Promise<void> {
	const eventsData: HistoryGame[] = [];
	const statuses = new Set<CompletionStatus>(["drop", "reroll", "completed"]);

	const files = await readdir("events_data");
	files.sort();

	for (const filename of files) {
		if (!filename.endsWith(".json")) {
			continue;
		}

		console.log(`Processing ${filename}`);

		const data = await Bun.file(join("events_data", filename)).json();
		const parsedData = GamesHistory(data);

		if (parsedData instanceof arktype.errors) {
			console.error(
				`Error parsing ${filename}: ${parsedData.summary}, ${parsedData.issues}`,
			);
			continue;
		}

		const filteredGames = (parsedData.games ?? []).filter((game) =>
			statuses.has(game.completion_status),
		);

		eventsData.push(...filteredGames);
	}

	await Bun.write(
		outputFile,
		JSON.stringify(
			{
				"$schema": `https://raw.githubusercontent.com/eventlab-dev/games-history/refs/heads/main/${SCHEMA_FILE}`,
				games: eventsData,
			},
			null,
			2,
		),
	);
}

async function genSchemaFile() {
	const schema = GamesHistory.toJsonSchema();
	await Bun.write(SCHEMA_FILE, JSON.stringify(schema, null, 2));
}

await joinEventsData("games_history.json");
await genSchemaFile();
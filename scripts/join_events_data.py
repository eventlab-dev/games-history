import json
import os


def join_events(output_file):
    """
    Joins multiple event data files into a single JSON file.

    Args:
        output_file (str): The path to the output JSON file.
    """

    events_data = []
    statuses = {"drop", "reroll", "completed"}

    for filename in os.listdir("events_data"):
        if filename.endswith(".json"):
            with open(
                os.path.join("events_data", filename), "r", encoding="utf-8"
            ) as file:
                data = json.load(file)
                data_games = data.get("games", [])
                filtered_games = [
                    game for game in data_games if game["completion_status"] in statuses
                ]
                events_data.extend(filtered_games)

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump({"games": events_data}, file, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    join_events("games_history.json")

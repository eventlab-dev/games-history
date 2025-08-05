import json
import os


def join_events(output_file):
    """
    Joins multiple event data files into a single JSON file.

    Args:
        output_file (str): The path to the output JSON file.
    """

    events_data = []

    for filename in os.listdir("events_data"):
        if filename.endswith(".json"):
            with open(
                os.path.join("events_data", filename), "r", encoding="utf-8"
            ) as file:
                data = json.load(file)
                events_data.extend(data.get("games", []))

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump({"games": events_data}, file, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    join_events("games_history.json")

from dataclasses import asdict
import json
import requests
from datetime import datetime

from .models import CompletionStatus, Game

MGE_DATA_URL = "https://mge.family/api/gameData.json"


def calculate_time_difference_seconds(created_at, updated_at):
    """
    Calculates the difference in seconds between two ISO format datetime strings.

    Args:
      created_at: The 'created_at' datetime string in ISO format (e.g., "2024-09-04T18:22:51.948Z").
      updated_at: The 'updated_at' datetime string in ISO format (e.g., "2024-09-05T17:11:43.182Z").

    Returns:
      The difference in seconds as a float, or None if an error occurred during parsing.
    """
    try:
        # Parse the datetime strings into datetime objects
        created_at_datetime = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        updated_at_datetime = datetime.fromisoformat(updated_at.replace("Z", "+00:00"))

        # Calculate the time difference
        time_difference = updated_at_datetime - created_at_datetime

        # Return the difference in seconds
        return int(time_difference.total_seconds())
    except ValueError:
        return 0


StatusesMap: dict[str, CompletionStatus] = {
    "playing": "drop",
    "freeDropped": "drop",
    "dropped": "drop",
    "completed": "completed",
    "rerolled": "reroll",
}


def fetch_data(output_file):
    mge_data = requests.get(MGE_DATA_URL).json()

    game_data = []
    for player in mge_data.get("players", []):
        for game in player.get("gameLogs", []):
            game_details = game.get("game", {})
            game_start = game["createdAt"]
            game_end = game["updatedAt"]
            game_time = calculate_time_difference_seconds(game_start, game_end)
            status = StatusesMap[game["status"]]

            game_info = Game(
                player_nickname=player["name"].lower(),
                game_title=game_details["name"],
                game_cover=game_details.get("image", ""),
                game_link=game_details.get("link", ""),
                completion_status=status,
                date=game["createdAt"],
                event_name="MGE",
                review=game.get("review", ""),
                game_time=game_time,
                rating=-1,
            )
            game_data.append(asdict(game_info))

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump({"games": game_data}, file, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    fetch_data("mge_game_data.json")

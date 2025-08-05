from dataclasses import asdict
import json
import requests
from datetime import datetime

from .models import CompletionStatus, Game

MOVES_URL = "https://aukus-frontend.onrender.com/api/moves.json"
PLAYERS_URL = "https://aukus-frontend.onrender.com/api/players.json"

AUKUS_DATE_FORMAT = "%a, %d %b %Y %H:%M:%S %Z"
COMMON_DATE_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"


def transform_date_format(
    date_string, input_format=AUKUS_DATE_FORMAT, output_format=COMMON_DATE_FORMAT
):
    """
    Transforms a date string from one format to another.

    Args:
      date_string: The date string to transform.
      input_format: The format of the input date string.
      output_format: The desired output format.

    Returns:
      The transformed date string, or None if an error occurred.
    """

    date_object = datetime.strptime(date_string, input_format)
    transformed_date_string = date_object.strftime(output_format)
    return transformed_date_string


StatusesMap: dict[str, CompletionStatus] = {
    "drop": "drop",
    "completed": "completed",
    "reroll": "reroll",
    "sheikh": "drop",
}


def fetch_data(output_file):
    moves_data = requests.get(MOVES_URL).json()
    players_data = requests.get(PLAYERS_URL).json()

    players_by_id = {player["id"]: player for player in players_data.get("players", [])}

    game_data = []
    for move in moves_data.get("moves", []):
        player = players_by_id.get(move.get("player_id"), {})
        if move.get("type") in ["movie"]:
            continue

        game_info = Game(
            player_nickname=player["name"].lower(),
            game_title=move["item_title"],
            game_cover=move["item_image"],
            game_link="",
            completion_status=StatusesMap[move["type"]],
            date=transform_date_format(
                move["created_at"],
            ),
            event_name="Aukus3",
            review=move.get("item_review", ""),
            game_time=int(move.get("stream_title_category_duration", 0)),
            rating=move.get("item_rating", -1),
        )
        game_data.append(asdict(game_info))

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump({"games": game_data}, file, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    fetch_data("aukus_game_data.json")

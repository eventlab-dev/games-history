import json
import requests

MGE_DATA_URL = "https://mge.family/api/gameData.json"


def fetch_mge_data(output_file):
    mge_data = requests.get(MGE_DATA_URL).json()

    game_data = []
    for player in mge_data.get("players", []):
        for game in player.get("gameLogs", []):
            game_details = game.get("game", {})
            game_info = {
                "player_nickname": player.get("name").lower(),
                "game_title": game_details.get("name"),
                "game_cover": game_details.get("image"),
                "game_link": game_details.get("link"),
                "completion_status": game.get("status"),
                "date": game.get("createdAt"),
                "event_name": "MGE",
                "review": game.get("review", ""),
            }
            game_data.append(game_info)

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump({"games": game_data}, file, ensure_ascii=False, indent=4)


if __name__ == "__main__":
    fetch_mge_data("mge_game_data.json")

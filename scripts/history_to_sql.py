import json
from datetime import datetime
import re
from typing import Tuple, Optional


with open("../games_history.json") as f:
    data = json.load(f)


def iso_to_timestamp(iso_str):
    return int(datetime.fromisoformat(iso_str.replace("Z", "+00:00")).timestamp())


def extract_year_from_title(title: str) -> Tuple[str, Optional[int]]:
    """
    Extracts a 4-digit year (1900–2099) at the end of a title in parentheses.
    Example: "Deus Ex: Human Revolution (2011)" -> ("Deus Ex: Human Revolution", 2011)
    If no valid year is found, returns the original title and None.
    """
    match = re.search(r"\((19|20)\d{2}\)\s*$", title)
    if match:
        year = int(match.group(0)[1:5])  # extract the 4-digit number
        clean_title = re.sub(r"\s*\((19|20)\d{2}\)\s*$", "", title).strip()
        return clean_title, year
    return title.strip(), None


with open("insert_games.sql", "w") as out:
    for item in data["games"]:
        date = item["date"]
        ts = iso_to_timestamp(date) if date else None
        title, year = extract_year_from_title(item.get("game_title", ""))
        sql = f"""
          INSERT INTO games_history
          (player_name, game_title, game_cover, game_link, completion_status,
           event_name, timestamp, review, rating, game_time, difficulty, game_id, game_year)
          VALUES (
              '{item.get("player_nickname", "").replace("'", "''")}',
              '{title.replace("'", "''")}',
              '{item.get("game_cover", "")}',
              '{item.get("game_link", "")}',
              '{item.get("completion_status", "")}',
              '{item.get("event_name", "")}',
              {ts if ts else "NULL"},
              '{item.get("review", "").replace("'", "''")}',
              '{item.get("rating", "")}',
              {item.get("game_time", 0)},
              '{item.get("difficulty", "")}',
              NULL,
              {year if year else "NULL"}
          );
          """
        out.write(sql)

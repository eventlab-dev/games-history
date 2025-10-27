from dataclasses import dataclass
from typing import Literal


CompletionStatus = Literal["completed", "reroll", "drop"]


@dataclass
class Game:
    player_nickname: str
    game_title: str
    game_cover: str
    game_link: str
    completion_status: CompletionStatus
    date: str
    event_name: Literal["MGE", "aukus3", "aukus2", "Aukus1"]
    review: str
    rating: str
    game_time: int

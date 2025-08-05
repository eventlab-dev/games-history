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
    event_name: Literal["MGE", "Aukus3", "Aukus2", "Aukus1"]
    review: str
    rating: float
    game_time: int

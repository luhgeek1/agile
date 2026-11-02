from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True, slots=True)
class FeedbackDraft:
    usefulness: int
    difficulty: Literal["easy", "okay", "hard"]
    comment: str = ""

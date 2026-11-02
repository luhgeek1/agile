from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class CurrentFamily:
    id: str
    nickname: str

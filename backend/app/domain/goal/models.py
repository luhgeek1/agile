from dataclasses import dataclass
from typing import Literal

Illustration = Literal["bike", "book", "skates", "star"]


@dataclass(frozen=True, slots=True)
class GoalDraft:
    title: str
    target: int
    illustration: Illustration = "bike"


@dataclass(frozen=True, slots=True)
class GoalProgress:
    title: str
    target: int
    saved: int
    remaining: int
    progress: int
    achieved: bool
    illustration: Illustration


def goal_progress(goal: GoalDraft, saved: int) -> GoalProgress:
    return GoalProgress(
        title=goal.title,
        target=goal.target,
        saved=saved,
        remaining=max(0, goal.target - saved),
        progress=min(100, saved * 100 // goal.target),
        achieved=saved >= goal.target,
        illustration=goal.illustration,
    )

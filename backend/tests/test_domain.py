import pytest

from app.domain.goal.models import GoalDraft, goal_progress


@pytest.mark.parametrize(
    ("saved", "remaining", "progress", "achieved"),
    [(0, 250000, 0, False), (125000, 125000, 50, False), (250000, 0, 100, True), (300000, 0, 100, True)],
)
def test_goal_progress_uses_actual_balance(saved, remaining, progress, achieved):
    result = goal_progress(GoalDraft("Велосипед", 250000), saved)
    assert (result.remaining, result.progress, result.achieved) == (remaining, progress, achieved)
    assert result.saved == saved

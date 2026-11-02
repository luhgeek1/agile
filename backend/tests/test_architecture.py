import ast
from pathlib import Path

import pytest

APP = Path(__file__).resolve().parents[1] / "app"


def imports(path: Path) -> set[str]:
    modules = set()
    for node in ast.walk(ast.parse(path.read_text())):
        if isinstance(node, ast.Import):
            modules.update(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            modules.add(node.module)
    return modules


@pytest.mark.parametrize(
    "layer,forbidden",
    [
        ("domain", ("fastapi", "starlette", "sqlalchemy", "pydantic", "app.api", "app.db", "app.service")),
        ("service", ("fastapi", "starlette", "app.api")),
        ("db", ("fastapi", "starlette", "app.api", "app.service")),
        ("seeds", ("fastapi", "starlette", "app.api", "app.service")),
        ("api/v1", ("sqlalchemy", "app.db")),
        ("api/schemas", ("sqlalchemy", "app.db", "app.service")),
    ],
)
def test_architecture_dependencies_follow_robomera_layers(layer, forbidden):
    for path in (APP / layer).rglob("*.py"):
        for module in imports(path):
            assert not any(module == prefix or module.startswith(prefix + ".") for prefix in forbidden), (
                f"{path.relative_to(APP)} imports forbidden dependency {module}"
            )


def test_only_unit_of_work_controls_transaction_boundaries():
    for layer in ("service", "seeds", "db/repositories", "api/v1"):
        for path in (APP / layer).rglob("*.py"):
            for node in ast.walk(ast.parse(path.read_text())):
                if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
                    assert node.func.attr not in {"commit", "rollback"}, path.relative_to(APP)

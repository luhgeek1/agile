"""Store parent access credentials for each demo family."""

import sqlalchemy as sa
from alembic import op

revision = "003_parent_access"
down_revision = "002_transfer_destination"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("families", sa.Column("parent_pin_hash", sa.String(97)))
    op.add_column("families", sa.Column("parent_token_hash", sa.String(64)))
    op.add_column("families", sa.Column("parent_token_expires_at", sa.DateTime(timezone=True)))
    op.add_column(
        "families",
        sa.Column("parent_failed_attempts", sa.Integer, server_default=sa.text("0"), nullable=False),
    )
    op.add_column("families", sa.Column("parent_blocked_until", sa.DateTime(timezone=True)))


def downgrade():
    for column in (
        "parent_blocked_until",
        "parent_failed_attempts",
        "parent_token_expires_at",
        "parent_token_hash",
        "parent_pin_hash",
    ):
        op.drop_column("families", column)

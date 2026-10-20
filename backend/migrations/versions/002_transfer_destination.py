"""Reject NULL destinations in transfers at the database boundary."""

from alembic import op

revision = "002_transfer_destination"
down_revision = "d35cee9cd93b"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("transactions") as batch:
        batch.drop_constraint("transfer_destination", type_="check")
        batch.create_check_constraint(
            "transfer_destination",
            "(kind = 'transfer' AND destination IS NOT NULL AND destination IN ('save','spend','help') "
            "AND destination <> category) OR (kind <> 'transfer' AND destination IS NULL)",
        )


def downgrade():
    with op.batch_alter_table("transactions") as batch:
        batch.drop_constraint("transfer_destination", type_="check")
        batch.create_check_constraint(
            "transfer_destination",
            "(kind = 'transfer' AND destination IN ('save','spend','help') "
            "AND destination <> category) OR (kind <> 'transfer' AND destination IS NULL)",
        )

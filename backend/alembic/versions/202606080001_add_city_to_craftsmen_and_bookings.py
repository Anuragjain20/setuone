"""add city to craftsmen and bookings

Revision ID: 202606080001
Revises: 202605050001
Create Date: 2026-06-08
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "202606080001"
down_revision: Union[str, None] = "202605050001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("craftsmen", sa.Column("city", sa.String(), nullable=True))
    op.add_column("bookings", sa.Column("city", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("craftsmen", "city")
    op.drop_column("bookings", "city")

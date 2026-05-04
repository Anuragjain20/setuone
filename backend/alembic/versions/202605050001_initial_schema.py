"""initial schema

Revision ID: 202605050001
Revises:
Create Date: 2026-05-05
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "202605050001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("phone", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("last_otp", sa.String(), nullable=True),
        sa.Column("otp_expires_at", sa.DateTime(), nullable=True),
        sa.Column("is_verified", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_phone"), "users", ["phone"], unique=True)

    op.create_table(
        "services",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("avg_min_price", sa.Integer(), nullable=False),
        sa.Column("avg_max_price", sa.Integer(), nullable=False),
        sa.Column("priority", sa.String(), nullable=False),
        sa.Column("icon_name", sa.String(), nullable=False),
        sa.Column("image_url", sa.String(), nullable=True),
    )
    op.create_index(op.f("ix_services_id"), "services", ["id"], unique=False)

    op.create_table(
        "craftsmen",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=False),
        sa.Column("photo_url", sa.String(), nullable=True),
        sa.Column("skills", sa.Text(), nullable=False),
        sa.Column("service_areas", sa.Text(), nullable=False),
        sa.Column("rating", sa.Float(), nullable=False),
        sa.Column("total_jobs", sa.Integer(), nullable=False),
        sa.Column("is_verified", sa.Boolean(), nullable=False),
        sa.Column("is_available", sa.Boolean(), nullable=False),
        sa.Column("experience", sa.Integer(), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("application_status", sa.String(), nullable=False),
        sa.Column("joined_at", sa.DateTime(), nullable=False),
    )
    op.create_index(op.f("ix_craftsmen_id"), "craftsmen", ["id"], unique=False)

    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("customer_name", sa.String(), nullable=False),
        sa.Column("customer_phone", sa.String(), nullable=False),
        sa.Column("service_category", sa.String(), nullable=False),
        sa.Column("service_name", sa.String(), nullable=False),
        sa.Column("address", sa.String(), nullable=False),
        sa.Column("scheduled_date", sa.String(), nullable=False),
        sa.Column("time_slot", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("craftsman_id", sa.Integer(), sa.ForeignKey("craftsmen.id"), nullable=True),
        sa.Column("craftsman_name", sa.String(), nullable=True),
        sa.Column("total_amount", sa.Integer(), nullable=True),
        sa.Column("platform_fee", sa.Integer(), nullable=True),
        sa.Column("convenience_fee", sa.Integer(), nullable=True),
        sa.Column("rating", sa.Float(), nullable=True),
        sa.Column("review", sa.String(), nullable=True),
        sa.Column("is_flagged", sa.Boolean(), nullable=False),
        sa.Column("flag_reason", sa.String(), nullable=True),
        sa.Column("completion_notes", sa.String(), nullable=True),
        sa.Column("completion_photo_url", sa.String(), nullable=True),
        sa.Column("payment_status", sa.String(), nullable=True),
        sa.Column("payment_method", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index(op.f("ix_bookings_id"), "bookings", ["id"], unique=False)

    op.create_table(
        "testimonials",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("location", sa.String(), nullable=False),
        sa.Column("text", sa.String(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("avatar_url", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index(op.f("ix_testimonials_id"), "testimonials", ["id"], unique=False)

    op.create_table(
        "site_config",
        sa.Column("key", sa.String(), primary_key=True),
        sa.Column("value", sa.Text(), nullable=False),
    )
    op.create_index(op.f("ix_site_config_key"), "site_config", ["key"], unique=False)

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_phone", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("message", sa.String(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index(op.f("ix_notifications_id"), "notifications", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_notifications_id"), table_name="notifications")
    op.drop_table("notifications")
    op.drop_index(op.f("ix_site_config_key"), table_name="site_config")
    op.drop_table("site_config")
    op.drop_index(op.f("ix_testimonials_id"), table_name="testimonials")
    op.drop_table("testimonials")
    op.drop_index(op.f("ix_bookings_id"), table_name="bookings")
    op.drop_table("bookings")
    op.drop_index(op.f("ix_craftsmen_id"), table_name="craftsmen")
    op.drop_table("craftsmen")
    op.drop_index(op.f("ix_services_id"), table_name="services")
    op.drop_table("services")
    op.drop_index(op.f("ix_users_phone"), table_name="users")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_table("users")

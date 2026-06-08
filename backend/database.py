from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import logging

logger = logging.getLogger("snapfix.db")


def _resolve_db_url() -> str:
    # Prefer explicit DATABASE_URL, then Supabase non-pooling (direct connection),
    # then Supabase pooler, then SQLite for local dev.
    url = (
        os.getenv("DATABASE_URL")
        or os.getenv("POSTGRES_URL_NON_POOLING")
        or os.getenv("POSTGRES_URL")
        or "sqlite:///./dev.db"
    )
    # SQLAlchemy requires "postgresql://" — Supabase/Heroku use the older "postgres://" scheme.
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    return url


db_url = _resolve_db_url()
is_vercel = bool(os.getenv("VERCEL") or os.getenv("VERCEL_ENV"))

if is_vercel and db_url.startswith("sqlite:///"):
    import shutil
    local_path = db_url.replace("sqlite:///", "")
    tmp_path = "/tmp/" + os.path.basename(local_path)
    if os.path.exists(local_path) and not os.path.exists(tmp_path):
        try:
            shutil.copy2(local_path, tmp_path)
        except Exception:
            pass
    db_url = f"sqlite:///{tmp_path}"

SQLALCHEMY_DATABASE_URL = db_url

# Log which database is in use so Vercel Function Logs confirm the right backend
_safe_url = SQLALCHEMY_DATABASE_URL.split("@")[-1] if "@" in SQLALCHEMY_DATABASE_URL else SQLALCHEMY_DATABASE_URL
logger.info("Database: %s", _safe_url)

connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

if is_vercel and not SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    # Serverless functions don't persist between invocations; NullPool avoids
    # exhausting Postgres connections across cold-start cycles.
    from sqlalchemy.pool import NullPool
    engine = create_engine(SQLALCHEMY_DATABASE_URL, poolclass=NullPool)
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db():
    """Create tables if they do not exist (required on Vercel where dev.db is not bundled)."""
    import models  # noqa: F401 — register all ORM tables on Base.metadata

    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

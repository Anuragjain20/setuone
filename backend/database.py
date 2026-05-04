from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Vercel and other serverless environments use a read-only filesystem, except for /tmp
default_db_url = "sqlite:////tmp/sql_app.db" if os.getenv("VERCEL") or os.getenv("VERCEL_ENV") else "sqlite:///./sql_app.db"
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", default_db_url)

connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

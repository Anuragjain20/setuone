from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Vercel and other serverless environments use a read-only filesystem, except for /tmp
is_vercel = os.getenv("VERCEL") or os.getenv("VERCEL_ENV")
db_url = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

if is_vercel and db_url.startswith("sqlite:///"):
    import shutil
    # Get the local file path (e.g., ./dev.db)
    local_path = db_url.replace("sqlite:///", "")
    tmp_path = "/tmp/" + os.path.basename(local_path)
    
    # If the file exists in the deployment, copy it to /tmp to make it writable
    if os.path.exists(local_path) and not os.path.exists(tmp_path):
        try:
            shutil.copy2(local_path, tmp_path)
        except Exception:
            pass
            
    db_url = f"sqlite:///{tmp_path}"

SQLALCHEMY_DATABASE_URL = db_url

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

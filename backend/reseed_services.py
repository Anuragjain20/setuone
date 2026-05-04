import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal
import models
from seed import SERVICES

def reseed():
    db = SessionLocal()
    try:
        # Delete existing services
        db.query(models.Service).delete()
        print("[OK] Cleared existing services")

        for s in SERVICES:
            db.add(models.Service(**s))
        db.commit()
        print(f"[OK] Seeded {len(SERVICES)} services successfully.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Reseed failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reseed()

import os
import sys
import tempfile
from pathlib import Path

os.environ["DATABASE_URL"] = f"sqlite:///{tempfile.NamedTemporaryFile(delete=False).name}"
os.environ["ENVIRONMENT"] = "testing"
os.environ["SESSION_SECRET"] = "test-session-secret"
os.environ["ADMIN_USERNAME"] = "admin"
os.environ["ADMIN_PASSWORD"] = "strong-password"
os.environ["UPLOAD_DIR"] = tempfile.mkdtemp()
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

import models
from database import SessionLocal, engine
from main import app

models.Base.metadata.create_all(bind=engine)


def reset_db():
    db = SessionLocal()
    try:
        for table in reversed(models.Base.metadata.sorted_tables):
            db.execute(table.delete())
        db.commit()
    finally:
        db.close()


def test_otp_auth_flow():
    reset_db()
    client = TestClient(app)

    otp_response = client.post("/api/auth/request-otp", json={"phone": "9876543210"})
    assert otp_response.status_code == 200
    otp = otp_response.json()["devOtp"]

    verify_response = client.post(
        "/api/auth/verify-otp",
        json={"phone": "9876543210", "otp": otp, "name": "Priya"},
    )
    assert verify_response.status_code == 200
    assert verify_response.json()["user"]["name"] == "Priya"

    me_response = client.get("/api/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["user"]["phone"] == "9876543210"


def test_booking_flow_by_phone():
    reset_db()
    client = TestClient(app)

    create_response = client.post(
        "/api/bookings",
        json={
            "customerName": "Amit",
            "customerPhone": "9999999999",
            "serviceCategory": "Plumber",
            "serviceName": "Plumber",
            "address": "MG Road, Indore",
            "scheduledDate": "2026-05-06",
            "timeSlot": "morning",
            "description": "Tap leakage",
        },
    )
    assert create_response.status_code == 200
    booking_id = create_response.json()["id"]

    list_response = client.get("/api/bookings?phone=9999999999")
    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == booking_id


def test_admin_routes_require_server_session():
    reset_db()
    client = TestClient(app)

    assert client.get("/api/admin/dashboard").status_code == 401
    assert client.get("/api/bookings").status_code == 401

    login_response = client.post(
        "/api/admin/login",
        json={"username": "admin", "password": "strong-password"},
    )
    assert login_response.status_code == 200
    assert client.get("/api/admin/dashboard").status_code == 200


def test_payment_endpoint_disabled():
    reset_db()
    client = TestClient(app)
    create_response = client.post(
        "/api/bookings",
        json={
            "customerName": "Amit",
            "customerPhone": "9999999999",
            "serviceCategory": "Plumber",
            "serviceName": "Plumber",
            "address": "MG Road, Indore",
            "scheduledDate": "2026-05-06",
            "timeSlot": "morning",
            "description": "Tap leakage",
        },
    )
    booking_id = create_response.json()["id"]

    pay_response = client.post(f"/api/bookings/{booking_id}/pay", json={"method": "upi"})
    assert pay_response.status_code == 410


def test_upload_requires_admin_and_rejects_svg():
    reset_db()
    client = TestClient(app)

    unauthorized = client.post(
        "/api/upload",
        files={"file": ("bad.svg", b"<svg></svg>", "image/svg+xml")},
    )
    assert unauthorized.status_code == 401

    client.post("/api/admin/login", json={"username": "admin", "password": "strong-password"})
    rejected = client.post(
        "/api/upload",
        files={"file": ("bad.svg", b"<svg></svg>", "image/svg+xml")},
    )
    assert rejected.status_code == 400

    accepted = client.post(
        "/api/upload",
        files={"file": ("ok.jpg", b"not really a jpg", "image/jpeg")},
    )
    assert accepted.status_code == 200
    assert accepted.json()["url"].endswith(".jpg")

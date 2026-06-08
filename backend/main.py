import os
import random
import datetime
import uuid
import logging
import secrets
from typing import Optional
from collections import defaultdict

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func
from starlette.middleware.sessions import SessionMiddleware

import models
from database import get_db

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("snapfix")

app = FastAPI(title="SnapFix API")

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
SESSION_SECRET = os.getenv("SESSION_SECRET", "change-me-in-production")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin" if ENVIRONMENT != "production" else "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin" if ENVIRONMENT != "production" else "")

if ENVIRONMENT == "production" and SESSION_SECRET in {"", "change-me-in-production", "change-me-use-a-real-secret"}:
    raise RuntimeError("SESSION_SECRET must be set to a strong unique value in production")
if ENVIRONMENT == "production" and (not ADMIN_USERNAME or not ADMIN_PASSWORD):
    raise RuntimeError("ADMIN_USERNAME and ADMIN_PASSWORD must be set in production")

app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ENVIRONMENT == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# File uploads
# ---------------------------------------------------------------------------
# Vercel and other serverless environments use a read-only filesystem, except for /tmp
default_upload_dir = "/tmp/uploads" if os.getenv("VERCEL") or os.getenv("VERCEL_ENV") else "uploads"
UPLOAD_DIR = os.getenv("UPLOAD_DIR", default_upload_dir)
MAX_UPLOAD_MB = 10
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"}

try:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
except OSError as e:
    logger.warning(f"Failed to create or mount upload directory {UPLOAD_DIR}: {e}")


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
ADMIN_PHONES = set(os.getenv("ADMIN_PHONES", "").split(",")) - {""}

# Safe fields that PATCH endpoints are allowed to modify
BOOKING_SAFE_FIELDS = {
    "status", "craftsman_id", "craftsman_name", "total_amount",
    "platform_fee", "convenience_fee", "rating", "review",
    "is_flagged", "flag_reason", "completion_notes", "completion_photo_url",
    "payment_status", "payment_method",
}
CRAFTSMAN_SAFE_FIELDS = {
    "name", "phone", "photo_url", "city", "rating", "total_jobs",
    "is_verified", "is_available", "experience", "bio", "application_status",
}


def clamp_mvp_price(value) -> int:
    return max(100, min(200, int(value)))


def get_current_user(request: Request, db: Session):
    uid = request.session.get("user_id")
    if not uid:
        return None
    return db.query(models.User).filter(models.User.id == uid).first()


def require_auth(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(401, "Authentication required")
    return user


def require_admin(request: Request, db: Session = Depends(get_db)):
    if request.session.get("admin_auth") is True:
        return {"admin": True}
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(401, "Authentication required")
    if not ADMIN_PHONES or user.phone not in ADMIN_PHONES:
        raise HTTPException(403, "Admin access required")
    return user


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), _admin=Depends(require_admin)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"File type {ext} not allowed. Use: {', '.join(ALLOWED_EXTENSIONS)}")
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(400, f"File too large. Max {MAX_UPLOAD_MB}MB.")
    unique_name = f"{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, unique_name)
    with open(path, "wb") as f:
        f.write(contents)
    logger.info(f"File uploaded: {unique_name} ({len(contents)} bytes)")
    return {"url": f"/uploads/{unique_name}"}


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/api/health")
@app.get("/api/healthz")
def health_check():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
@app.post("/api/auth/request-otp")
def request_otp(data: dict, db: Session = Depends(get_db)):
    phone = (data.get("phone") or "").replace(" ", "")
    if not phone or len(phone) != 10 or not phone.isdigit():
        raise HTTPException(400, "Valid 10-digit phone number required")
    otp = str(random.randint(1000, 9999))
    expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    user = db.query(models.User).filter(models.User.phone == phone).first()
    if user:
        user.last_otp = otp
        user.otp_expires_at = expires
    else:
        user = models.User(phone=phone, last_otp=otp, otp_expires_at=expires)
        db.add(user)
    notification = models.Notification(user_phone=phone, title="OTP", message=f"Your SnapFix OTP is {otp}", type="info")
    db.add(notification)
    db.commit()
    logger.info(f"OTP requested for {phone[:4]}****")
    result = {"ok": True, "message": "OTP sent"}
    if ENVIRONMENT != "production":
        result["devOtp"] = otp
    return result


@app.post("/api/auth/verify-otp")
def verify_otp(data: dict, request: Request, db: Session = Depends(get_db)):
    phone = (data.get("phone") or "").replace(" ", "")
    otp = data.get("otp")
    name = data.get("name")
    user = db.query(models.User).filter(models.User.phone == phone).first()
    if not user:
        raise HTTPException(401, "Phone not registered. Request OTP first.")
    if user.last_otp != otp:
        raise HTTPException(401, "Invalid OTP")
    if user.otp_expires_at and user.otp_expires_at < datetime.datetime.utcnow():
        raise HTTPException(401, "OTP expired")
    user.is_verified = True
    if name:
        user.name = name
    user.last_otp = None
    user.otp_expires_at = None
    db.commit()
    request.session["user_id"] = user.id
    request.session["user_phone"] = user.phone
    request.session["user_name"] = user.name
    return {"ok": True, "user": {"id": user.id, "phone": user.phone, "name": user.name}}


@app.get("/api/auth/me")
def get_me(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    if not user:
        return {"user": None}
    return {"user": {"id": user.id, "phone": user.phone, "name": user.name}}


@app.patch("/api/auth/me")
def update_me(data: dict, request: Request, db: Session = Depends(get_db)):
    """Update current user's name (called after first OTP login)."""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(401, "Not authenticated")
    if "name" in data and data["name"]:
        user.name = str(data["name"]).strip()[:100]
    db.commit()
    request.session["user_name"] = user.name
    return {"ok": True, "user": {"id": user.id, "phone": user.phone, "name": user.name}}


@app.post("/api/auth/logout")
def logout(request: Request):
    request.session.clear()
    return {"ok": True}


@app.post("/api/admin/login")
def admin_login(data: dict, request: Request):
    username = str(data.get("username") or "")
    password = str(data.get("password") or "")
    if not (
        ADMIN_USERNAME
        and ADMIN_PASSWORD
        and secrets.compare_digest(username, ADMIN_USERNAME)
        and secrets.compare_digest(password, ADMIN_PASSWORD)
    ):
        raise HTTPException(401, "Invalid admin credentials")
    request.session["admin_auth"] = True
    return {"ok": True}


@app.post("/api/admin/logout")
def admin_logout(request: Request):
    request.session.pop("admin_auth", None)
    return {"ok": True}


@app.get("/api/admin/me")
def admin_me(request: Request):
    return {"admin": request.session.get("admin_auth") is True}


# ---------------------------------------------------------------------------
# Services
# ---------------------------------------------------------------------------
@app.get("/api/services")
def get_services(db: Session = Depends(get_db)):
    services = db.query(models.Service).all()
    return [
        {
            "id": s.id, "category": s.category, "name": s.name,
            "description": s.description, "avgMinPrice": s.avg_min_price,
            "avgMaxPrice": s.avg_max_price, "priority": s.priority,
            "iconName": s.icon_name, "imageUrl": s.image_url,
        }
        for s in services
    ]


@app.post("/api/services")
def create_service(data: dict, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    svc = models.Service(
        category=data["category"], name=data["name"], description=data.get("description", ""),
        avg_min_price=clamp_mvp_price(data["avgMinPrice"]), avg_max_price=clamp_mvp_price(data["avgMaxPrice"]),
        priority=data.get("priority", "P0"), icon_name=data.get("iconName", "wrench"),
        image_url=data.get("imageUrl"),
    )
    db.add(svc)
    db.commit()
    db.refresh(svc)
    return {"id": svc.id, "category": svc.category, "name": svc.name}


@app.patch("/api/services/{service_id}")
def update_service(service_id: int, data: dict, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    svc = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not svc:
        raise HTTPException(404, "Service not found")
    field_map = {"imageUrl": "image_url", "iconName": "icon_name", "avgMinPrice": "avg_min_price", "avgMaxPrice": "avg_max_price"}
    for k, v in data.items():
        col = field_map.get(k, k)
        if hasattr(svc, col):
            if col in {"avg_min_price", "avg_max_price"}:
                v = clamp_mvp_price(v)
            setattr(svc, col, v)
    db.commit()
    db.refresh(svc)
    return {"ok": True}


@app.delete("/api/services/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    svc = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not svc:
        raise HTTPException(404, "Service not found")
    db.delete(svc)
    db.commit()
    return {"ok": True}


# ---------------------------------------------------------------------------
# Craftsmen
# ---------------------------------------------------------------------------
@app.get("/api/cities")
def get_cities():
    return [
        {"slug": "indore", "name": "Indore", "state": "Madhya Pradesh"},
        {"slug": "bhopal", "name": "Bhopal", "state": "Madhya Pradesh"},
        {"slug": "jaipur", "name": "Jaipur", "state": "Rajasthan"},
        {"slug": "lucknow", "name": "Lucknow", "state": "Uttar Pradesh"},
        {"slug": "nagpur", "name": "Nagpur", "state": "Maharashtra"},
        {"slug": "mumbai", "name": "Mumbai", "state": "Maharashtra"},
        {"slug": "pune", "name": "Pune", "state": "Maharashtra"},
        {"slug": "delhi", "name": "Delhi", "state": "Delhi"},
        {"slug": "bangalore", "name": "Bangalore", "state": "Karnataka"},
        {"slug": "hyderabad", "name": "Hyderabad", "state": "Telangana"},
    ]


@app.get("/api/craftsmen")
def get_craftsmen(request: Request, skill: Optional[str] = None, available: Optional[bool] = None, city: Optional[str] = None, applicationStatus: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Craftsman)
    is_admin = request.session.get("admin_auth") is True
    if not is_admin:
        query = query.filter(models.Craftsman.application_status == "approved", models.Craftsman.is_verified == True)
    if available is not None:
        query = query.filter(models.Craftsman.is_available == available)
    if city:
        query = query.filter(models.Craftsman.city == city)
    if applicationStatus:
        if not is_admin:
            raise HTTPException(403, "Admin access required")
        query = query.filter(models.Craftsman.application_status == applicationStatus)
    results = query.all()
    if skill:
        results = [c for c in results if skill.lower() in [s.lower() for s in c.skills]]
    return [c.to_dict() for c in results]


@app.get("/api/craftsmen/my-jobs")
def get_craftsman_jobs(phone: str, db: Session = Depends(get_db)):
    craftsman = db.query(models.Craftsman).filter(models.Craftsman.phone == phone).first()
    if not craftsman:
        raise HTTPException(404, detail="Craftsman not found")
    jobs = db.query(models.Booking).filter(models.Booking.craftsman_id == craftsman.id).order_by(models.Booking.created_at.desc()).all()
    return {"craftsman": craftsman.to_dict(), "jobs": [j.to_dict() for j in jobs]}


@app.post("/api/craftsmen/apply")
def apply_craftsman(data: dict, db: Session = Depends(get_db)):
    phone = data.get("phone", "").replace(" ", "")
    existing = db.query(models.Craftsman).filter(models.Craftsman.phone == phone).first()
    if existing:
        raise HTTPException(409, "A craftsman with this phone already exists")
    c = models.Craftsman(
        name=data["name"], phone=phone, photo_url=data.get("photoUrl"),
        bio=data.get("bio"), experience=data.get("experience", 0),
        city=data.get("city"),
        application_status="pending", is_available=False, is_verified=False,
    )
    c.skills = data.get("skills", [])
    c.service_areas = data.get("serviceAreas", data.get("service_areas", []))
    db.add(c)
    db.commit()
    db.refresh(c)
    logger.info(f"Craftsman application: {c.name} ({phone[:4]}****)")
    return c.to_dict()


@app.post("/api/craftsmen")
def create_craftsman(data: dict, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    phone = data.get("phone", "").replace(" ", "")
    existing = db.query(models.Craftsman).filter(models.Craftsman.phone == phone).first()
    if existing:
        raise HTTPException(409, "A craftsman with this phone already exists")
    c = models.Craftsman(
        name=data["name"], phone=phone, photo_url=data.get("photoUrl"),
        bio=data.get("bio"), experience=data.get("experience", 0),
        city=data.get("city"),
        application_status="approved", is_available=True, is_verified=True,
    )
    c.skills = data.get("skills", [])
    c.service_areas = data.get("serviceAreas", data.get("service_areas", []))
    db.add(c)
    db.commit()
    db.refresh(c)
    return c.to_dict()


@app.get("/api/craftsmen/{craftsman_id}")
def get_craftsman(craftsman_id: int, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    c = db.query(models.Craftsman).filter(models.Craftsman.id == craftsman_id).first()
    if not c:
        raise HTTPException(404, "Craftsman not found")
    return c.to_dict()


@app.patch("/api/craftsmen/{craftsman_id}")
def update_craftsman(craftsman_id: int, data: dict, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    c = db.query(models.Craftsman).filter(models.Craftsman.id == craftsman_id).first()
    if not c:
        raise HTTPException(404, "Craftsman not found")
    if "skills" in data:
        c.skills = data.pop("skills")
    if "serviceAreas" in data or "service_areas" in data:
        c.service_areas = data.pop("serviceAreas", data.pop("service_areas", []))
    camel_map = {"photoUrl": "photo_url", "isVerified": "is_verified", "isAvailable": "is_available", "applicationStatus": "application_status", "totalJobs": "total_jobs", "city": "city"}
    for k, v in data.items():
        col = camel_map.get(k, k)
        if col in CRAFTSMAN_SAFE_FIELDS:
            setattr(c, col, v)
    db.commit()
    db.refresh(c)
    return c.to_dict()


@app.delete("/api/craftsmen/{craftsman_id}")
def delete_craftsman(craftsman_id: int, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    c = db.query(models.Craftsman).filter(models.Craftsman.id == craftsman_id).first()
    if not c:
        raise HTTPException(404, "Craftsman not found")
    db.delete(c)
    db.commit()
    return {"ok": True}


# ---------------------------------------------------------------------------
# Bookings
# ---------------------------------------------------------------------------
@app.get("/api/bookings")
def get_bookings(request: Request, phone: Optional[str] = None, db: Session = Depends(get_db)):
    if not phone:
        require_admin(request, db)
    query = db.query(models.Booking)
    if phone:
        query = query.filter(models.Booking.customer_phone == phone)
    return [b.to_dict() for b in query.order_by(models.Booking.created_at.desc()).all()]


@app.get("/api/bookings/{booking_id}")
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    b = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    return b.to_dict()


@app.post("/api/bookings")
def create_booking(data: dict, db: Session = Depends(get_db)):
    b = models.Booking(
        customer_name=data["customerName"], customer_phone=data["customerPhone"],
        service_category=data["serviceCategory"], service_name=data.get("serviceName", data["serviceCategory"]),
        city=data.get("city"),
        address=data["address"], scheduled_date=data["scheduledDate"],
        time_slot=data["timeSlot"], description=data["description"],
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    logger.info(f"Booking #{b.id} created: {b.service_category} by {b.customer_name}")
    return b.to_dict()


@app.patch("/api/bookings/{booking_id}")
def update_booking(booking_id: int, data: dict, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    b = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    camel_map = {
        "craftsmanId": "craftsman_id", "craftsmanName": "craftsman_name",
        "totalAmount": "total_amount", "platformFee": "platform_fee",
        "convenienceFee": "convenience_fee", "isFlagged": "is_flagged",
        "flagReason": "flag_reason", "completionNotes": "completion_notes",
        "completionPhotoUrl": "completion_photo_url", "paymentStatus": "payment_status",
        "paymentMethod": "payment_method",
    }
    for k, v in data.items():
        col = camel_map.get(k, k)
        if col in BOOKING_SAFE_FIELDS:
            setattr(b, col, v)
    db.commit()
    db.refresh(b)
    return b.to_dict()


@app.post("/api/bookings/{booking_id}/cancel")
def cancel_booking(booking_id: int, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    b = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    if b.status in ("completed", "cancelled"):
        raise HTTPException(400, f"Cannot cancel a {b.status} booking")
    b.status = "cancelled"
    db.commit()
    return {"ok": True}


@app.post("/api/bookings/{booking_id}/complete")
def complete_booking(booking_id: int, data: dict, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    """Mark a booking as completed (called by craftsman portal)."""
    b = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    b.status = "completed"
    if data.get("completionNotes"):
        b.completion_notes = str(data["completionNotes"])[:500]
    if data.get("totalAmount"):
        b.total_amount = max(100, min(200, int(data["totalAmount"])))
        b.platform_fee = 0
        b.convenience_fee = 0
    db.commit()
    logger.info(f"Booking #{b.id} completed. Amount: {b.total_amount}")
    return b.to_dict()


@app.post("/api/bookings/{booking_id}/pay")
def pay_booking(booking_id: int, data: dict, db: Session = Depends(get_db)):
    raise HTTPException(410, "Online payments are disabled for this MVP")


@app.post("/api/bookings/{booking_id}/flag")
def flag_booking(booking_id: int, data: dict, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    """Flag a booking for review."""
    b = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not b:
        raise HTTPException(404, "Booking not found")
    reason = (data.get("reason") or "").strip()
    if not reason:
        raise HTTPException(400, "Reason is required")
    b.is_flagged = True
    b.flag_reason = reason[:500]
    db.commit()
    logger.info(f"Booking #{b.id} flagged: {reason[:50]}")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Testimonials
# ---------------------------------------------------------------------------
@app.get("/api/testimonials")
def get_testimonials(db: Session = Depends(get_db)):
    ts = db.query(models.Testimonial).order_by(models.Testimonial.sort_order).all()
    return [t.to_dict() for t in ts]


@app.post("/api/testimonials")
def create_testimonial(data: dict, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    t = models.Testimonial(
        name=data["name"], location=data.get("location", ""),
        text=data["text"], rating=int(data.get("rating", 5)),
        avatar_url=data.get("avatarUrl"), is_active=True,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return t.to_dict()


@app.patch("/api/testimonials/{tid}")
def update_testimonial(tid: int, data: dict, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    t = db.query(models.Testimonial).filter(models.Testimonial.id == tid).first()
    if not t:
        raise HTTPException(404, "Testimonial not found")
    field_map = {"isActive": "is_active", "avatarUrl": "avatar_url", "sortOrder": "sort_order"}
    safe = {"name", "location", "text", "rating", "is_active", "avatar_url", "sort_order"}
    for k, v in data.items():
        col = field_map.get(k, k)
        if col in safe:
            setattr(t, col, v)
    db.commit()
    db.refresh(t)
    return t.to_dict()


@app.delete("/api/testimonials/{tid}")
def delete_testimonial(tid: int, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    t = db.query(models.Testimonial).filter(models.Testimonial.id == tid).first()
    if not t:
        raise HTTPException(404, "Testimonial not found")
    db.delete(t)
    db.commit()
    return {"ok": True}


# ---------------------------------------------------------------------------
# Site Config
# ---------------------------------------------------------------------------
@app.get("/api/site-config")
def get_site_config(db: Session = Depends(get_db)):
    return {c.key: c.value for c in db.query(models.SiteConfig).all()}


@app.patch("/api/site-config")
def update_site_config(data: dict, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    for key, value in data.items():
        cfg = db.query(models.SiteConfig).filter(models.SiteConfig.key == key).first()
        if cfg:
            cfg.value = str(value)
        else:
            db.add(models.SiteConfig(key=key, value=str(value)))
    db.commit()
    return {"ok": True}


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------
@app.get("/api/notifications")
def get_notifications(limit: int = 100, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    ns = db.query(models.Notification).order_by(models.Notification.created_at.desc()).limit(limit).all()
    return [n.to_dict() for n in ns]


# ---------------------------------------------------------------------------
# Admin Dashboard
# ---------------------------------------------------------------------------
@app.get("/api/admin/dashboard")
def get_dashboard(db: Session = Depends(get_db), _admin=Depends(require_admin)):
    total = db.query(func.count(models.Booking.id)).scalar() or 0
    pending = db.query(func.count(models.Booking.id)).filter(models.Booking.status == "pending").scalar() or 0
    completed = db.query(func.count(models.Booking.id)).filter(models.Booking.status == "completed").scalar() or 0
    active = db.query(func.count(models.Booking.id)).filter(models.Booking.status.in_(["in_progress", "confirmed"])).scalar() or 0

    revenue_row = db.query(
        func.coalesce(func.sum(models.Booking.platform_fee), 0) + func.coalesce(func.sum(models.Booking.convenience_fee), 0),
        func.coalesce(func.sum(models.Booking.total_amount), 0),
    ).filter(models.Booking.status == "completed").first()
    revenue = int(revenue_row[0]) if revenue_row else 0
    gmv = int(revenue_row[1]) if revenue_row else 0

    total_c = db.query(func.count(models.Craftsman.id)).scalar() or 0
    verified_c = db.query(func.count(models.Craftsman.id)).filter(models.Craftsman.is_verified == True).scalar() or 0
    available_c = db.query(func.count(models.Craftsman.id)).filter(models.Craftsman.is_available == True).scalar() or 0
    pending_apps = db.query(func.count(models.Craftsman.id)).filter(models.Craftsman.application_status == "pending").scalar() or 0

    avg_rating = db.query(func.avg(models.Booking.rating)).filter(models.Booking.rating.isnot(None)).scalar()

    cats = db.query(models.Booking.service_category, func.count(models.Booking.id)).group_by(models.Booking.service_category).all()
    by_cat = [{"category": c[0], "count": c[1]} for c in cats]

    return {
        "totalBookings": total, "pendingBookings": pending,
        "completedBookings": completed, "activeBookings": active,
        "totalCraftsmen": total_c, "verifiedCraftsmen": verified_c,
        "availableCraftsmen": available_c, "pendingApplications": pending_apps,
        "gmvThisMonth": gmv, "revenueThisMonth": revenue,
        "avgRating": round(avg_rating, 1) if avg_rating else 0.0,
        "bookingsByCategory": by_cat,
    }


@app.get("/api/admin/customers")
def get_customers(db: Session = Depends(get_db), _admin=Depends(require_admin)):
    """All customers derived from booking records, cross-referenced with registered users."""
    bookings = db.query(models.Booking).order_by(models.Booking.created_at.desc()).all()
    customer_map: dict = {}
    for b in bookings:
        phone = b.customer_phone
        if phone not in customer_map:
            customer_map[phone] = {
                "phone": phone, "name": b.customer_name, "city": b.city,
                "totalBookings": 0, "completedBookings": 0, "totalSpent": 0,
                "lastBookingDate": None, "isRegistered": False,
            }
        entry = customer_map[phone]
        entry["totalBookings"] += 1
        if b.status == "completed":
            entry["completedBookings"] += 1
            entry["totalSpent"] += b.total_amount or 0
        if entry["lastBookingDate"] is None:
            entry["lastBookingDate"] = b.created_at.isoformat() if b.created_at else None
    registered_phones = {u.phone for u in db.query(models.User.phone).all()}
    for phone, entry in customer_map.items():
        entry["isRegistered"] = phone in registered_phones
    return sorted(customer_map.values(), key=lambda x: x["totalBookings"], reverse=True)


@app.get("/api/admin/city-stats")
def get_city_stats(db: Session = Depends(get_db), _admin=Depends(require_admin)):
    """Per-city breakdown: bookings, craftsmen, GMV."""
    booking_rows = db.query(models.Booking.city, func.count(models.Booking.id)).group_by(models.Booking.city).all()
    craftsmen_rows = db.query(models.Craftsman.city, func.count(models.Craftsman.id)).group_by(models.Craftsman.city).all()
    gmv_rows = db.query(
        models.Booking.city,
        func.coalesce(func.sum(models.Booking.total_amount), 0),
    ).filter(models.Booking.status == "completed").group_by(models.Booking.city).all()

    city_map: dict = {}
    for city, count in booking_rows:
        name = city or "Unknown"
        city_map.setdefault(name, {"city": name, "bookings": 0, "craftsmen": 0, "gmv": 0})
        city_map[name]["bookings"] = count
    for city, count in craftsmen_rows:
        name = city or "Unknown"
        city_map.setdefault(name, {"city": name, "bookings": 0, "craftsmen": 0, "gmv": 0})
        city_map[name]["craftsmen"] = count
    for city, gmv in gmv_rows:
        name = city or "Unknown"
        city_map.setdefault(name, {"city": name, "bookings": 0, "craftsmen": 0, "gmv": 0})
        city_map[name]["gmv"] = int(gmv)

    return sorted(city_map.values(), key=lambda x: x["bookings"], reverse=True)


@app.get("/api/admin/revenue")
def get_revenue_report(days: int = 14, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    """Daily revenue breakdown for the admin chart."""
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=days)
    bookings = db.query(models.Booking).filter(
        models.Booking.status == "completed",
        models.Booking.created_at >= cutoff,
    ).all()
    daily = defaultdict(int)
    for b in bookings:
        day = b.created_at.strftime("%Y-%m-%d") if b.created_at else "unknown"
        daily[day] += (b.platform_fee or 0) + (b.convenience_fee or 0)
    result = []
    for i in range(days):
        d = (datetime.datetime.utcnow() - datetime.timedelta(days=days - 1 - i)).strftime("%Y-%m-%d")
        result.append({"date": d, "revenue": daily.get(d, 0)})
    return result


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

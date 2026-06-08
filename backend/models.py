from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime
import json


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    last_otp = Column(String)
    otp_expires_at = Column(DateTime)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)


class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    avg_min_price = Column(Integer, nullable=False)
    avg_max_price = Column(Integer, nullable=False)
    priority = Column(String, default="P0", nullable=False)
    icon_name = Column(String, nullable=False)
    image_url = Column(String)


class Craftsman(Base):
    __tablename__ = "craftsmen"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    photo_url = Column(String)
    city = Column(String)
    _skills = Column("skills", Text, nullable=False, default="[]")
    _service_areas = Column("service_areas", Text, nullable=False, default="[]")
    rating = Column(Float, default=0.0, nullable=False)
    total_jobs = Column(Integer, default=0, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)
    experience = Column(Integer, default=0, nullable=False)
    bio = Column(Text)
    application_status = Column(String, default="approved", nullable=False)
    joined_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    @property
    def skills(self):
        try:
            return json.loads(self._skills) if self._skills else []
        except (json.JSONDecodeError, TypeError):
            return []

    @skills.setter
    def skills(self, value):
        self._skills = json.dumps(value if isinstance(value, list) else [])

    @property
    def service_areas(self):
        try:
            return json.loads(self._service_areas) if self._service_areas else []
        except (json.JSONDecodeError, TypeError):
            return []

    @service_areas.setter
    def service_areas(self, value):
        self._service_areas = json.dumps(value if isinstance(value, list) else [])

    def to_dict(self):
        """Serialize with proper skills/service_areas as lists instead of JSON strings."""
        return {
            "id": self.id,
            "name": self.name,
            "phone": self.phone,
            "photoUrl": self.photo_url,
            "city": self.city,
            "skills": self.skills,
            "serviceAreas": self.service_areas,
            "rating": self.rating,
            "totalJobs": self.total_jobs,
            "isVerified": self.is_verified,
            "isAvailable": self.is_available,
            "experience": self.experience,
            "bio": self.bio,
            "applicationStatus": self.application_status,
            "joinedAt": self.joined_at.isoformat() if self.joined_at else None,
        }


class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    service_category = Column(String, nullable=False)
    service_name = Column(String, nullable=False)
    city = Column(String)
    address = Column(String, nullable=False)
    scheduled_date = Column(String, nullable=False)
    time_slot = Column(String, nullable=False)
    description = Column(String, nullable=False)
    status = Column(String, default="pending", nullable=False)
    craftsman_id = Column(Integer, ForeignKey("craftsmen.id"))
    craftsman_name = Column(String)
    total_amount = Column(Integer)
    platform_fee = Column(Integer)
    convenience_fee = Column(Integer)
    rating = Column(Float)
    review = Column(String)
    is_flagged = Column(Boolean, default=False, nullable=False)
    flag_reason = Column(String)
    completion_notes = Column(String)
    completion_photo_url = Column(String)
    payment_status = Column(String, default="unpaid")
    payment_method = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    def to_dict(self):
        """Serialize booking to camelCase dict for the frontend."""
        return {
            "id": self.id,
            "customerName": self.customer_name,
            "customerPhone": self.customer_phone,
            "serviceCategory": self.service_category,
            "serviceName": self.service_name,
            "city": self.city,
            "address": self.address,
            "scheduledDate": self.scheduled_date,
            "timeSlot": self.time_slot,
            "description": self.description,
            "status": self.status,
            "craftsmanId": self.craftsman_id,
            "craftsmanName": self.craftsman_name,
            "totalAmount": self.total_amount,
            "platformFee": self.platform_fee,
            "convenienceFee": self.convenience_fee,
            "rating": self.rating,
            "review": self.review,
            "isFlagged": self.is_flagged,
            "flagReason": self.flag_reason,
            "completionNotes": self.completion_notes,
            "completionPhotoUrl": self.completion_photo_url,
            "paymentStatus": self.payment_status,
            "paymentMethod": self.payment_method,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Testimonial(Base):
    __tablename__ = "testimonials"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    text = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)
    avatar_url = Column(String)
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "text": self.text,
            "rating": self.rating,
            "avatarUrl": self.avatar_url,
            "isActive": self.is_active,
            "sortOrder": self.sort_order,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class SiteConfig(Base):
    __tablename__ = "site_config"
    key = Column(String, primary_key=True, index=True)
    value = Column(Text, nullable=False)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_phone = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False)  # info, success, warning, error
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "userPhone": self.user_phone,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "isRead": self.is_read,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

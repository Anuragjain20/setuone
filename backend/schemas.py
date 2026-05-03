# Schemas are no longer used for response models since we use model.to_dict()
# for proper camelCase serialization. This file is kept for potential future
# use with request validation.

from pydantic import BaseModel
from typing import List, Optional


class BookingCreate(BaseModel):
    """Request schema for creating a booking."""
    customerName: str
    customerPhone: str
    serviceCategory: str
    serviceName: Optional[str] = None
    address: str
    scheduledDate: str
    timeSlot: str
    description: str


class CraftsmanApply(BaseModel):
    """Request schema for craftsman application."""
    name: str
    phone: str
    photoUrl: Optional[str] = None
    skills: List[str] = []
    serviceAreas: List[str] = []
    experience: int = 0
    bio: Optional[str] = None

"""Seed the database with initial services and demo data."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal
import models

SERVICES = [
    {"category": "Plumbing", "name": "Plumbing", "description": "Tap repair, pipe fitting, leak fixing, bathroom installation", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "wrench", "priority": "P0"},
    {"category": "Electrical", "name": "Electrical", "description": "Wiring, switchboard, fan installation, MCB repair", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "zap", "priority": "P0"},
    {"category": "Carpentry", "name": "Carpentry", "description": "Furniture repair, door fixing, cabinet work, custom woodwork", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "hammer", "priority": "P0"},
    {"category": "Painting", "name": "Painting", "description": "Wall painting, waterproofing, texture, POP work", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "paint", "priority": "P0"},
    {"category": "AC Service", "name": "AC Service", "description": "AC repair, gas refill, installation, deep cleaning", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "wind", "priority": "P0"},
    {"category": "Home Cleaning", "name": "Home Cleaning", "description": "Deep cleaning, sofa cleaning, kitchen cleaning, bathroom", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "sparkles", "priority": "P0"},
    {"category": "Flooring", "name": "Flooring", "description": "Tile, marble, wooden flooring installation and repair", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "hammer", "priority": "P1"},
    {"category": "Ceiling Work", "name": "Ceiling Work", "description": "False ceiling installation and repair", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "hammer", "priority": "P1"},
    {"category": "Wallpaper", "name": "Wallpaper", "description": "Wallpaper installation and removal", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "sparkles", "priority": "P1"},
    {"category": "Window & Glass", "name": "Window & Glass", "description": "Glass, aluminum, sliding window installation", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "wrench", "priority": "P1"},
    {"category": "Welding & Fabrication", "name": "Welding & Fabrication", "description": "Welding, grill work, metal fabrication", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "wrench", "priority": "P1"},
    {"category": "Gardening", "name": "Gardening", "description": "Plantation, lawn maintenance, landscaping", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "sparkles", "priority": "P1"},
]

SITE_CONFIG = {
    "company_name": "SnapFix",
    "company_tagline": "Book a Fix in a Snap",
    "company_phone": "+91 77777 77777",
    "company_whatsapp": "917777777777",
    "hero_headline": "The fastest way to fix your home.",
    "hero_subheadline": "Verified plumbers, electricians, carpenters & more — dispatched to your door in hours. Fair prices, real reviews, a satisfaction guarantee.",
    "hero_craftsman_name": "Ramesh Sharma",
    "hero_craftsman_title": "Master Plumber",
    "hero_stat_pros": "200+",
    "hero_stat_jobs": "5k",
    "hero_stat_rating": "4.8",
    "pricing_amc_standard_price": "1999",
    "pricing_amc_premium_price": "2999",
    "how_it_works_title": "Three steps. Done in under an hour.",
    "craftsmen_section_title": "Real pros. Verified skills. At your door.",
    "testimonials_section_title": "Trusted by 5,000+ households across India.",
}

DEMO_CRAFTSMEN = [
    # Indore
    {"name": "Ramesh Sharma", "phone": "9876543210", "city": "Indore", "skills": ["Plumbing"], "service_areas": ["Vijay Nagar", "Sukhliya", "Scheme 54"], "rating": 4.8, "total_jobs": 142, "experience": 12, "bio": "Master plumber with 12 years experience. Specializes in bathroom renovation and leak detection.", "is_verified": True, "is_available": True, "application_status": "approved"},
    {"name": "Sunil Yadav", "phone": "9876543211", "city": "Indore", "skills": ["Electrical"], "service_areas": ["Palasia", "AB Road", "New Palasia"], "rating": 4.6, "total_jobs": 98, "experience": 8, "bio": "Certified electrician. Expert in home wiring and smart home setup.", "is_verified": True, "is_available": True, "application_status": "approved"},
    {"name": "Mohan Patel", "phone": "9876543212", "city": "Indore", "skills": ["Carpentry", "Painting"], "service_areas": ["Scheme 54", "Nipania", "Rajendra Nagar"], "rating": 4.9, "total_jobs": 210, "experience": 15, "bio": "Furniture maker and painter. Custom woodwork and wall art specialist.", "is_verified": True, "is_available": True, "application_status": "approved"},
    # Mumbai
    {"name": "Vijay Nair", "phone": "9876543213", "city": "Mumbai", "skills": ["Plumbing", "Home Cleaning"], "service_areas": ["Andheri", "Bandra", "Powai"], "rating": 4.7, "total_jobs": 320, "experience": 10, "bio": "Experienced plumber and cleaning expert serving western Mumbai.", "is_verified": True, "is_available": True, "application_status": "approved"},
    {"name": "Prakash Desai", "phone": "9876543214", "city": "Mumbai", "skills": ["Electrical", "AC Service"], "service_areas": ["Thane", "Mulund", "Kurla"], "rating": 4.5, "total_jobs": 185, "experience": 7, "bio": "Certified electrician with AC repair specialization.", "is_verified": True, "is_available": True, "application_status": "approved"},
    # Delhi
    {"name": "Deepak Verma", "phone": "9876543215", "city": "Delhi", "skills": ["Carpentry", "Flooring"], "service_areas": ["Dwarka", "Janakpuri", "Vasant Kunj"], "rating": 4.8, "total_jobs": 267, "experience": 14, "bio": "Expert carpenter and flooring specialist in South-West Delhi.", "is_verified": True, "is_available": True, "application_status": "approved"},
    {"name": "Arvind Kumar", "phone": "9876543216", "city": "Delhi", "skills": ["Painting", "Wallpaper"], "service_areas": ["Rohini", "Pitampura", "Saket"], "rating": 4.6, "total_jobs": 142, "experience": 9, "bio": "Wall painting and wallpaper expert with premium finish quality.", "is_verified": True, "is_available": True, "application_status": "approved"},
    # Bangalore
    {"name": "Ravi Kumar", "phone": "9876543217", "city": "Bangalore", "skills": ["Electrical", "Home Cleaning"], "service_areas": ["Indiranagar", "Koramangala", "HSR Layout"], "rating": 4.9, "total_jobs": 398, "experience": 11, "bio": "Top-rated electrician in Bangalore with expertise in smart homes.", "is_verified": True, "is_available": True, "application_status": "approved"},
    {"name": "Srinivas Rao", "phone": "9876543218", "city": "Bangalore", "skills": ["Plumbing", "Flooring"], "service_areas": ["Whitefield", "Marathahalli", "Electronic City"], "rating": 4.7, "total_jobs": 215, "experience": 8, "bio": "Plumbing and flooring professional for Bangalore's tech corridor.", "is_verified": True, "is_available": True, "application_status": "approved"},
    # Pune
    {"name": "Ganesh Shinde", "phone": "9876543219", "city": "Pune", "skills": ["Carpentry", "Ceiling Work"], "service_areas": ["Kothrud", "Baner", "Aundh"], "rating": 4.7, "total_jobs": 178, "experience": 12, "bio": "Expert carpenter and false ceiling installer serving West Pune.", "is_verified": True, "is_available": True, "application_status": "approved"},
    # Hyderabad
    {"name": "Naresh Reddy", "phone": "9876543220", "city": "Hyderabad", "skills": ["AC Service", "Electrical"], "service_areas": ["Gachibowli", "Madhapur", "Hitech City"], "rating": 4.8, "total_jobs": 302, "experience": 10, "bio": "AC and electrical specialist in Hyderabad's tech district.", "is_verified": True, "is_available": True, "application_status": "approved"},
    # Jaipur
    {"name": "Rajendra Joshi", "phone": "9876543221", "city": "Jaipur", "skills": ["Painting", "Flooring"], "service_areas": ["Vaishali Nagar", "Mansarovar", "C-Scheme"], "rating": 4.6, "total_jobs": 134, "experience": 9, "bio": "Painting and flooring expert with 9 years in Jaipur.", "is_verified": True, "is_available": True, "application_status": "approved"},
]

DEMO_TESTIMONIALS = [
    {"name": "Priya Mehta", "location": "Vijay Nagar, Indore", "text": "Called SnapFix at 9 AM for a kitchen leak. Ramesh ji arrived by 11 AM and fixed it in under an hour. Fair price, no drama. Will use again!", "rating": 5},
    {"name": "Aditya Sinha", "location": "Koramangala, Bangalore", "text": "Got my entire flat rewired through SnapFix. The electrician was professional, clean, and finished ahead of schedule. The online booking made it so easy.", "rating": 5},
    {"name": "Sneha Kulkarni", "location": "Baner, Pune", "text": "Ganesh built custom shelves for my study. Beautiful work, exactly what I wanted. SnapFix's verification gave me confidence to let a stranger into my home.", "rating": 4},
    {"name": "Rahul Verma", "location": "Dwarka, Delhi", "text": "Had new flooring done for my entire apartment through SnapFix. Deepak and his team were fast, tidy, and the quality exceeded expectations. Highly recommend!", "rating": 5},
    {"name": "Neha Sharma", "location": "Andheri, Mumbai", "text": "AC stopped working in peak summer. SnapFix sent a technician the same evening. Fixed in 45 minutes. Amazing service!", "rating": 5},
]



def seed():
    db = SessionLocal()
    try:
        # Services — only seed if the table is empty
        if db.query(models.Service).count() == 0:
            for s in SERVICES:
                db.add(models.Service(**s))
            print(f"[OK] Seeded {len(SERVICES)} services")
        else:
            print("[SKIP] Services already exist, skipping")

        # Site Config — only insert keys that don't exist yet; never overwrite
        # admin-edited values so that changes made in the admin panel persist.
        added = 0
        for k, v in SITE_CONFIG.items():
            if not db.query(models.SiteConfig).filter(models.SiteConfig.key == k).first():
                db.add(models.SiteConfig(key=k, value=v))
                added += 1
        # Remove legacy key no longer used
        old_city = db.query(models.SiteConfig).filter(models.SiteConfig.key == "company_city").first()
        if old_city:
            db.delete(old_city)
        if added:
            print(f"[OK] Site config: inserted {added} missing keys")
        else:
            print("[SKIP] Site config already complete, skipping")

        # Demo Craftsmen — only seed if the table is empty
        if db.query(models.Craftsman).count() == 0:
            for data in DEMO_CRAFTSMEN:
                data = dict(data)
                skills = data.pop("skills")
                areas = data.pop("service_areas")
                c = models.Craftsman(**data)
                c.skills = skills
                c.service_areas = areas
                db.add(c)
            print(f"[OK] Seeded {len(DEMO_CRAFTSMEN)} demo craftsmen across multiple cities")
        else:
            print(f"[SKIP] Craftsmen already exist, skipping")

        # Demo Testimonials — only seed if the table is empty
        if db.query(models.Testimonial).count() == 0:
            for t in DEMO_TESTIMONIALS:
                db.add(models.Testimonial(**t))
            print(f"[OK] Seeded {len(DEMO_TESTIMONIALS)} testimonials")
        else:
            print("[SKIP] Testimonials already exist, skipping")

        db.commit()
        print("\n[DONE] Database seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()

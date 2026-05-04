"""Seed the database with initial services and demo data."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal
import models

SERVICES = [
    {"category": "Carpenter", "name": "Carpenter", "description": "Furniture repair, door fixing, cabinet work, woodwork", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "hammer", "priority": "P0"},
    {"category": "Painter", "name": "Painter", "description": "Wall painting, waterproofing, texture, POP work", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "paint", "priority": "P0"},
    {"category": "Wallpaper", "name": "Wallpaper", "description": "Wallpaper installation and removal", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "sparkles", "priority": "P1"},
    {"category": "Plumber", "name": "Plumber", "description": "Tap repair, pipe fitting, leak fixing, bathroom installation", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "wrench", "priority": "P0"},
    {"category": "Electrician", "name": "Electrician", "description": "Wiring, switchboard, fan installation, MCB repair", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "zap", "priority": "P0"},
    {"category": "AC Repair", "name": "AC Repair", "description": "AC repair, gas refill, installation, deep cleaning", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "wind", "priority": "P0"},
    {"category": "Flooring", "name": "Flooring", "description": "Tile, marble, wooden flooring installation and repair", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "hammer", "priority": "P1"},
    {"category": "Ceiling", "name": "Ceiling", "description": "False ceiling installation and repair", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "hammer", "priority": "P1"},
    {"category": "Window Installation Services", "name": "Window Installation Services", "description": "Glass, aluminum, sliding window installation", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "wrench", "priority": "P1"},
    {"category": "Cleaning Services", "name": "Cleaning Services", "description": "Deep cleaning, sofa cleaning, kitchen cleaning, bathroom", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "sparkles", "priority": "P1"},
    {"category": "Fabrication Services", "name": "Fabrication Services", "description": "Welding, grill work, metal fabrication", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "wrench", "priority": "P1"},
    {"category": "Gardening", "name": "Gardening", "description": "Plantation, lawn maintenance, landscaping", "avg_min_price": 100, "avg_max_price": 200, "icon_name": "sparkles", "priority": "P1"},
]

SITE_CONFIG = {
    "company_name": "SetuOne",
    "company_tagline": "Bharosemand Karigar, Ek Call Par",
    "company_phone": "+91 77777 77777",
    "company_whatsapp": "917777777777",
    "company_city": "Indore",
    "hero_headline": "The trusted hand for every home in Indore.",
    "hero_subheadline": "Verified plumbers, electricians, carpenters & more — dispatched to your door in hours. Fair prices, real reviews, a no-drain guarantee.",
    "hero_craftsman_name": "Ramesh Sharma",
    "hero_craftsman_title": "Master Plumber",
    "hero_stat_pros": "50+",
    "hero_stat_jobs": "1.3k",
    "hero_stat_rating": "4.8",
    "pricing_amc_standard_price": "1999",
    "pricing_amc_premium_price": "2999",
    "how_it_works_title": "Three steps. No phone calls to ten different people.",
    "craftsmen_section_title": "Real people. Real skill. Right here in Indore.",
    "testimonials_section_title": "Trusted by 1,000+ households across Indore.",
}

DEMO_CRAFTSMEN = [
    {"name": "Ramesh Sharma", "phone": "9876543210", "skills": ["Plumbing"], "service_areas": ["Vijay Nagar", "Sukhliya"], "rating": 4.8, "total_jobs": 142, "experience": 12, "bio": "Master plumber with 12 years experience. Specializes in bathroom renovation.", "is_verified": True, "is_available": True, "application_status": "approved"},
    {"name": "Sunil Yadav", "phone": "9876543211", "skills": ["Electrical"], "service_areas": ["Palasia", "AB Road"], "rating": 4.6, "total_jobs": 98, "experience": 8, "bio": "Certified electrician. Expert in home wiring and smart home setup.", "is_verified": True, "is_available": True, "application_status": "approved"},
    {"name": "Mohan Patel", "phone": "9876543212", "skills": ["Carpentry", "Painting"], "service_areas": ["Scheme 54", "New Palasia"], "rating": 4.9, "total_jobs": 210, "experience": 15, "bio": "Furniture maker and painter. Custom woodwork and wall art.", "is_verified": True, "is_available": True, "application_status": "approved"},
]

DEMO_TESTIMONIALS = [
    {"name": "Priya Mehta", "location": "Vijay Nagar, Indore", "text": "Called SetuOne at 9 AM for a kitchen leak. Ramesh ji arrived by 11 AM and fixed it in under an hour. Fair price, no drama. Will use again!", "rating": 5},
    {"name": "Rajesh Gupta", "location": "Palasia, Indore", "text": "Got my entire house rewired through SetuOne. Sunil was professional, clean, and finished ahead of schedule. The online booking made it so easy.", "rating": 5},
    {"name": "Anita Joshi", "location": "Scheme 54, Indore", "text": "Mohan built custom shelves for my study. Beautiful work, exactly what I wanted. SetuOne's verification gave me confidence to let a stranger into my home.", "rating": 4},
]


def seed():
    db = SessionLocal()
    try:
        # Services
        existing = db.query(models.Service).count()
        if existing == 0:
            for s in SERVICES:
                db.add(models.Service(**s))
            print(f"[OK] Seeded {len(SERVICES)} services")
        else:
            for svc in db.query(models.Service).all():
                svc.avg_min_price = 100
                svc.avg_max_price = 200
            print(f"[OK] Updated {existing} existing services to the INR 100-200 MVP price band")

        # Site Config
        existing_cfg = db.query(models.SiteConfig).count()
        if existing_cfg == 0:
            for k, v in SITE_CONFIG.items():
                db.add(models.SiteConfig(key=k, value=v))
            print(f"[OK] Seeded {len(SITE_CONFIG)} site config keys")
        else:
            for key in ("company_name", "pricing_amc_standard_price", "pricing_amc_premium_price"):
                cfg = db.query(models.SiteConfig).filter(models.SiteConfig.key == key).first()
                if cfg:
                    cfg.value = SITE_CONFIG[key]
                else:
                    db.add(models.SiteConfig(key=key, value=SITE_CONFIG[key]))
            print(f"[OK] Site config already exists ({existing_cfg}); refreshed MVP pricing keys")

        # Demo Craftsmen
        existing_c = db.query(models.Craftsman).count()
        if existing_c == 0:
            for data in DEMO_CRAFTSMEN:
                skills = data.pop("skills")
                areas = data.pop("service_areas")
                c = models.Craftsman(**data)
                c.skills = skills
                c.service_areas = areas
                db.add(c)
            print(f"[OK] Seeded {len(DEMO_CRAFTSMEN)} demo craftsmen")
        else:
            print(f"[SKIP]  Craftsmen already exist ({existing_c}), skipping")

        # Demo Testimonials
        existing_t = db.query(models.Testimonial).count()
        if existing_t == 0:
            for t in DEMO_TESTIMONIALS:
                db.add(models.Testimonial(**t))
            print(f"[OK] Seeded {len(DEMO_TESTIMONIALS)} testimonials")
        else:
            for testimonial in db.query(models.Testimonial).all():
                testimonial.text = testimonial.text.replace("SevaSetu", "SetuOne")
            print(f"[SKIP]  Testimonials already exist ({existing_t}), skipping")

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

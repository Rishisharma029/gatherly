import json
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from .models import Event, BudgetCategory, Expense, Task, Vendor, AIGeneration, ActivityLog
from .services.ai_service import calculate_deterministic_categories

def seed_database(db: Session):
    # 1. Aarav's 21st Birthday
    aarav_event = db.query(Event).filter(Event.name == "Aarav's 21st Birthday").first()
    if not aarav_event:
        today = date.today()
        future_date = (today + timedelta(days=30)).strftime("%Y-%m-%d")
        aarav_event = Event(
            name="Aarav's 21st Birthday",
            event_type="Birthday",
            event_date=future_date,
            city="Faridabad",
            venue_type="Home, restaurant or outdoor",
            guest_count=40,
            total_budget=25000.0,
            currency="₹",
            theme="Black and gold",
            atmosphere="Minimal, elegant",
            preferences_json=json.dumps({
                "preferences": "Vegetarian menu, music, accessibility needs",
                "dietary_requirements": "Strict vegetarian, no onion/garlic option for 4 elders",
                "accessibility_requirements": "Ground floor or lift access for senior relatives"
            }),
            status="PLANNING",
            icon="🎉"
        )
        db.add(aarav_event)
        db.commit()
        db.refresh(aarav_event)

        # Budget categories using Birthday deterministic preset (sums exactly to ₹25,000)
        preset_cats = calculate_deterministic_categories(25000.0, "birthday")
        cat_map = {}
        for c in preset_cats:
            cat_obj = BudgetCategory(
                event_id=aarav_event.id,
                name=c.name,
                allocated_amount=c.allocated_amount
            )
            db.add(cat_obj)
            db.flush()
            cat_map[c.name.lower()] = cat_obj.id

        # Starter expenses demonstrating real-time variance and deposits
        catering_cat_id = cat_map.get("food and catering")
        decor_cat_id = cat_map.get("decor & balloons / tableware")

        db.add(Expense(
            event_id=aarav_event.id,
            category_id=catering_cat_id,
            description="Artisan Spice Hospitality (Vegetarian Buffet for 40)",
            estimated_amount=7500.0,
            actual_amount=6500.0,
            paid_deposit=2000.0,
            payment_status="deposit_paid",
            notes="Secured discount for advance booking. Balance ₹4,500 due on event day."
        ))

        db.add(Expense(
            event_id=aarav_event.id,
            category_id=decor_cat_id,
            description="Black & Gold Shimmer Focal Wall & Balloons",
            estimated_amount=3750.0,
            actual_amount=2500.0,
            paid_deposit=1000.0,
            payment_status="deposit_paid",
            notes="Minimalist backdrop with fairy lights."
        ))

        # 30-Day Timeline tasks matching user requirements
        timeline_tasks = [
            Task(
                event_id=aarav_event.id,
                title="Confirm budget and guest estimate",
                description="Finalized ₹25,000 budget ceiling and 40-person guest roster.",
                category="planning",
                due_date=today.strftime("%Y-%m-%d"),
                priority="High",
                status="COMPLETED",
                is_milestone=True
            ),
            Task(
                event_id=aarav_event.id,
                title="Shortlist venues and vendors",
                description="Review Faridabad restaurant private dining halls and outdoor terraces.",
                category="venue",
                due_date=(today + timedelta(days=9)).strftime("%Y-%m-%d"),
                priority="High",
                status="IN_PROGRESS",
                is_milestone=True
            ),
            Task(
                event_id=aarav_event.id,
                title="Confirm menu and decorations",
                description="Vegetarian courses, mocktails, and black/gold photo wall.",
                category="catering",
                due_date=(today + timedelta(days=16)).strftime("%Y-%m-%d"),
                priority="Medium",
                status="TODO",
                is_milestone=True
            ),
            Task(
                event_id=aarav_event.id,
                title="Finalize guest attendance",
                description="Collect all RSVPs and dietary count via digital invites.",
                category="invitation/printing",
                due_date=(today + timedelta(days=23)).strftime("%Y-%m-%d"),
                priority="High",
                status="TODO",
                is_milestone=True
            ),
            Task(
                event_id=aarav_event.id,
                title="Confirm all bookings",
                description="Re-confirm caterer arrival, sound setup, and cake delivery.",
                category="entertainment",
                due_date=(today + timedelta(days=28)).strftime("%Y-%m-%d"),
                priority="High",
                status="TODO",
                is_milestone=True
            ),
            Task(
                event_id=aarav_event.id,
                title="Follow the event-day schedule",
                description="Host guests, coordinate photography cues, and enjoy the celebration.",
                category="general",
                due_date=future_date,
                priority="High",
                status="TODO",
                is_milestone=True
            )
        ]
        for t in timeline_tasks:
            db.add(t)

        # Vendors matching Section 5.D
        vendors = [
            Vendor(
                event_id=aarav_event.id,
                name="Faridabad Sky Lounge & Garden",
                category="venue",
                contact_name="Aman Verma",
                email="events@skyloungefaridabad.example.com",
                phone="+91 98111 22334",
                quoted_amount=5000.0,
                deposit_amount=1000.0,
                deposit_paid=False,
                balance_due=5000.0,
                booking_status="shortlisted",
                notes="Outdoor terrace dining area with lift access for elders."
            ),
            Vendor(
                event_id=aarav_event.id,
                name="Artisan Spice Hospitality",
                category="catering",
                contact_name="Chef Ramesh",
                email="ramesh@artisanspice.example.com",
                phone="+91 98222 33445",
                quoted_amount=6500.0,
                deposit_amount=2000.0,
                deposit_paid=True,
                balance_due=4500.0,
                booking_status="booked",
                notes="Pure vegetarian buffet with live chaat counter and Jain options."
            ),
            Vendor(
                event_id=aarav_event.id,
                name="Luxe Decor & Balloon Stylists",
                category="decoration",
                contact_name="Neha Kapoor",
                email="neha@luxedecor.example.com",
                phone="+91 98333 44556",
                quoted_amount=2500.0,
                deposit_amount=1000.0,
                deposit_paid=True,
                balance_due=1500.0,
                booking_status="booked",
                notes="Matte black and mirrored gold balloon garland and entrance arch."
            )
        ]
        for v in vendors:
            db.add(v)

        # AI Generation Plan
        db.add(AIGeneration(
            event_id=aarav_event.id,
            generation_type="plan",
            model="Gatherly-AI-v1",
            status="completed",
            content_json=json.dumps({
                "theme": "Black and gold",
                "color_palette": ["#1F5147", "#E9A477", "#252923", "#F8F7F2"],
                "ideas": [
                    {
                        "title": "Matte Black & Mirrored Gold Photo Backdrop",
                        "description": "Create a photogenic focal wall with warm fairy lights and gold 21 numerals.",
                        "category": "Decoration plans",
                        "mode": "Decoration plans",
                        "estimated_cost_range": "₹2,500 – ₹4,000",
                        "prep_effort": "Low (1.5 hours)",
                        "required_materials": "Black backdrop, fairy lights, balloon arch",
                        "why_it_suits": "Fits the minimal, elegant atmosphere."
                    },
                    {
                        "title": "Curated Mocktail & Signature Spritz Station",
                        "description": "Self-serve beverage bar with Sparkling Elderberry Spritz and fresh mint.",
                        "category": "Menu suggestions",
                        "mode": "Menu suggestions",
                        "estimated_cost_range": "₹2,000 – ₹3,500",
                        "prep_effort": "Low (45 mins)",
                        "required_materials": "Glass dispensers, gold rim cups, soda",
                        "why_it_suits": "Fits vegetarian preferences at half the cost of an open bar."
                    }
                ]
            })
        ))

        # Activity Logs
        logs = [
            ActivityLog(
                event_id=aarav_event.id,
                user_name="Event Planner",
                action='Created event "Aarav\'s 21st Birthday" (₹25,000)',
                entity_type="Event",
                entity_id=aarav_event.id,
                timestamp_label="10:00 am"
            ),
            ActivityLog(
                event_id=aarav_event.id,
                user_name="Gatherly AI",
                action="Generated AI plan with 6 timeline milestones and 9 budget categories",
                entity_type="Plan",
                entity_id=aarav_event.id,
                timestamp_label="10:01 am"
            ),
            ActivityLog(
                event_id=aarav_event.id,
                user_name="Event Planner",
                action='Completed task "Confirm budget and guest estimate"',
                entity_type="Task",
                entity_id=aarav_event.id,
                timestamp_label="10:30 am"
            ),
            ActivityLog(
                event_id=aarav_event.id,
                user_name="Event Planner",
                action='Booked caterer "Artisan Spice Hospitality" (₹2,000 deposit paid)',
                entity_type="Vendor",
                entity_id=aarav_event.id,
                timestamp_label="11:15 am"
            )
        ]
        for l in logs:
            db.add(l)

        db.commit()

    # 2. John & Jane Wedding (to satisfy tests and demonstrate wedding preset)
    wedding_event = db.query(Event).filter(Event.name == "John & Jane Wedding").first()
    if not wedding_event:
        wedding_date = (date.today() + timedelta(days=90)).strftime("%Y-%m-%d")
        wedding_event = Event(
            name="John & Jane Wedding",
            event_type="Wedding",
            event_date=wedding_date,
            city="Delhi NCR",
            venue_type="Heritage Resort or Banquet Hall",
            guest_count=200,
            total_budget=500000.0,
            currency="₹",
            theme="Royal Marigold & Ivory",
            atmosphere="Festive, opulent, welcoming",
            preferences_json=json.dumps({
                "preferences": "Fusion catering, traditional live musicians",
                "dietary_requirements": "Separate vegan & vegetarian buffet lines"
            }),
            status="PLANNING",
            icon="💍"
        )
        db.add(wedding_event)
        db.commit()
        db.refresh(wedding_event)

        # Budget categories
        preset_cats = calculate_deterministic_categories(500000.0, "wedding")
        for c in preset_cats:
            db.add(BudgetCategory(
                event_id=wedding_event.id,
                name=c.name,
                allocated_amount=c.allocated_amount
            ))

        # Starter tasks
        wedding_tasks = [
            Task(
                event_id=wedding_event.id,
                title="Book wedding resort & mandap venue",
                description="Finalize 2-day booking in Delhi NCR for 200 guests.",
                category="venue",
                due_date=(date.today() + timedelta(days=15)).strftime("%Y-%m-%d"),
                priority="High",
                status="IN_PROGRESS",
                is_milestone=True
            ),
            Task(
                event_id=wedding_event.id,
                title="Schedule catering tasting",
                description="Sample North Indian and Continental fusion menus.",
                category="catering",
                due_date=(date.today() + timedelta(days=30)).strftime("%Y-%m-%d"),
                priority="Medium",
                status="TODO",
                is_milestone=True
            )
        ]
        for t in wedding_tasks:
            db.add(t)

        db.commit()

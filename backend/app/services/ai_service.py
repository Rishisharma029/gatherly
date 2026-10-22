import os
import json
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Tuple
from ..schemas import TaskCreate, BudgetCategoryCreate, ExpenseCreate, VendorCreate, IdeaItem, AIGeneratePlanResponse

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# 1. DETERMINISTIC BUDGET PRESETS (Verified 100% sum)
BUDGET_PRESETS = {
    "birthday": [
        ("Venue Rental / Space Booking", 20.0),
        ("Food and Catering", 30.0),
        ("Decor & Balloons / Tableware", 15.0),
        ("Photography / Media", 8.0),
        ("Entertainment / Sound System", 10.0),
        ("Digital Invitations & Favors", 3.0),
        ("Attire & Personal Styling", 4.0),
        ("Miscellaneous & Disposables", 5.0),
        ("Contingency Reserve (Buffer)", 5.0),
    ],
    "wedding": [
        ("Ceremony & Reception Venue", 25.0),
        ("Catering & Beverages", 30.0),
        ("Floral & Stage Decoration", 12.0),
        ("Photography & Cinematography", 10.0),
        ("Music & Entertainment", 5.0),
        ("Invitations & Stationery", 2.0),
        ("Attire, Hair & Makeup", 8.0),
        ("Transport & Gifts", 3.0),
        ("Contingency Reserve (Buffer)", 5.0),
    ],
    "community": [
        ("Community Hall / Ground Booking", 15.0),
        ("Community Refreshments & Snacks", 25.0),
        ("Banners & Signage", 5.0),
        ("Event Coverage Photography", 5.0),
        ("PA System & Stage Equipment", 15.0),
        ("Community Outreach & Flyers", 10.0),
        ("Logistics & Volunteer Badges", 15.0),
        ("First Aid & Clean-up Supplies", 5.0),
        ("Contingency Reserve", 5.0),
    ]
}

def verify_and_get_preset(event_type: str) -> List[Tuple[str, float]]:
    e_low = event_type.lower()
    if "wedding" in e_low:
        preset = BUDGET_PRESETS["wedding"]
    elif any(k in e_low for k in ["community", "charity", "fundraiser"]):
        preset = BUDGET_PRESETS["community"]
    else:
        preset = BUDGET_PRESETS["birthday"]

    total_pct = sum(pct for _, pct in preset)
    if abs(total_pct - 100.0) > 0.001:
        raise ValueError(f"Preset error: Percentages sum to {total_pct}%, not 100%")
    return preset


# 2. DETERMINISTIC BUDGET ALLOCATION (Paise Safe)
def calculate_deterministic_categories(total_budget: float, event_type: str) -> List[BudgetCategoryCreate]:
    preset = verify_and_get_preset(event_type)
    categories: List[BudgetCategoryCreate] = []

    # Total in paise
    total_paise = int(round(total_budget * 100))
    allocated_paise_sum = 0

    for idx, (name, pct) in enumerate(preset):
        if idx == len(preset) - 1:
            # Assign remainder to contingency to ensure exact 100% total
            cat_paise = max(0, total_paise - allocated_paise_sum)
        else:
            cat_paise = int(round(total_paise * (pct / 100.0)))
            allocated_paise_sum += cat_paise

        allocated_amount = round(cat_paise / 100.0, 2)
        categories.append(
            BudgetCategoryCreate(
                name=name,
                allocated_amount=allocated_amount
            )
        )
    return categories

# Alias for backwards compatibility
calculate_deterministic_budget = calculate_deterministic_categories


# 3. DYNAMIC TIME-AWARE TIMELINE GENERATOR
def generate_time_aware_tasks(event_date_str: str, event_type: str, guest_count: int, city: str) -> Tuple[List[TaskCreate], int, bool]:
    today = datetime.now().date()
    try:
        event_date = datetime.strptime(event_date_str, "%Y-%m-%d").date()
    except Exception:
        event_date = today + timedelta(days=30)

    days_left = (event_date - today).days
    is_urgent = days_left <= 7
    tasks: List[TaskCreate] = []

    def calc_due_date(days_prior: int) -> str:
        """Never creates impossible past dates: clamps to today."""
        target = event_date - timedelta(days=days_prior)
        if target < today:
            return today.strftime("%Y-%m-%d")
        return target.strftime("%Y-%m-%d")

    # Compressed / urgent timeline when event is in 1-7 days
    if days_left <= 3:
        tasks = [
            TaskCreate(
                title="URGENT: Lock Venue & Confirmation",
                description=f"Immediate confirmation for {guest_count} guests in {city}.",
                category="venue",
                due_date=today.strftime("%Y-%m-%d"),
                priority="High",
                is_milestone=True,
                is_urgent=True,
                status="TODO"
            ),
            TaskCreate(
                title="URGENT: Confirm Caterer & Menu Headcount",
                description="Finalize fixed menu and emergency dietary requirements.",
                category="catering",
                due_date=today.strftime("%Y-%m-%d"),
                priority="High",
                is_milestone=True,
                is_urgent=True,
                status="TODO"
            ),
            TaskCreate(
                title="Digital RSVP Broadcast via WhatsApp/SMS",
                description=f"Send direct digital invites for {guest_count} attendees with location pin.",
                category="invitation/printing",
                due_date=today.strftime("%Y-%m-%d"),
                priority="High",
                is_milestone=True,
                is_urgent=True,
                status="TODO"
            ),
            TaskCreate(
                title="Day-of Schedule & Setup Coordination",
                description="Arrive 2 hours early to coordinate arrival and equipment.",
                category="logistics",
                due_date=event_date.strftime("%Y-%m-%d"),
                priority="High",
                is_milestone=True,
                is_urgent=True,
                status="TODO"
            ),
        ]
    elif days_left <= 14:
        tasks = [
            TaskCreate(
                title="Confirm budget and guest estimate",
                description=f"Target: {guest_count} guests in {city}.",
                category="planning",
                due_date=calc_due_date(12),
                priority="High",
                is_milestone=True,
                status="COMPLETED" if days_left < 10 else "TODO"
            ),
            TaskCreate(
                title="Finalize venue and primary catering",
                description="Sign contract and pay initial booking deposit.",
                category="venue",
                due_date=calc_due_date(9),
                priority="High",
                is_milestone=True,
                status="TODO"
            ),
            TaskCreate(
                title="Confirm menu, cake, and decoration theme",
                description="Lock color palette and dietary adjustments.",
                category="decoration",
                due_date=calc_due_date(6),
                priority="Medium",
                is_milestone=True,
                status="TODO"
            ),
            TaskCreate(
                title="Finalize guest attendance & follow up RSVPs",
                description="Lock final headcount for caterer.",
                category="invitation/printing",
                due_date=calc_due_date(3),
                priority="High",
                is_milestone=True,
                status="TODO"
            ),
            TaskCreate(
                title="Confirm all bookings & equipment check",
                description="Sound check, playlist, arrival timing.",
                category="entertainment",
                due_date=calc_due_date(1),
                priority="High",
                is_milestone=True,
                status="TODO"
            ),
            TaskCreate(
                title="Follow the event-day schedule",
                description="Host guests, manage run-of-show cues, and celebrate!",
                category="general",
                due_date=event_date.strftime("%Y-%m-%d"),
                priority="High",
                is_milestone=True,
                status="TODO"
            )
        ]
    else:
        # Standard timeline (30+ days away matching user specification)
        tasks = [
            TaskCreate(
                title="Confirm budget and guest estimate",
                description=f"Lock initial ₹ budget and guest list ({guest_count} people).",
                category="planning",
                due_date=calc_due_date(min(30, days_left)),
                priority="High",
                is_milestone=True,
                status="COMPLETED"
            ),
            TaskCreate(
                title="Shortlist venues and vendors",
                description=f"Inspect options in {city} for {guest_count} attendees.",
                category="venue",
                due_date=calc_due_date(min(21, days_left - 5)),
                priority="High",
                is_milestone=True,
                status="IN_PROGRESS"
            ),
            TaskCreate(
                title="Confirm menu and decorations",
                description="Approve tasting, balloons/floral arrangements, and setup.",
                category="catering",
                due_date=calc_due_date(min(14, days_left - 10)),
                priority="Medium",
                is_milestone=True,
                status="TODO"
            ),
            TaskCreate(
                title="Finalize guest attendance",
                description="Collect all RSVPs and dietary preferences.",
                category="invitation/printing",
                due_date=calc_due_date(7),
                priority="High",
                is_milestone=True,
                status="TODO"
            ),
            TaskCreate(
                title="Confirm all bookings",
                description="Review deposit balances, delivery times, and vendor contacts.",
                category="entertainment",
                due_date=calc_due_date(2),
                priority="High",
                is_milestone=True,
                status="TODO"
            ),
            TaskCreate(
                title="Follow the event-day schedule",
                description="Execute day-of schedule and enjoy the celebration.",
                category="general",
                due_date=event_date.strftime("%Y-%m-%d"),
                priority="High",
                is_milestone=True,
                status="TODO"
            )
        ]

    return tasks, max(0, days_left), is_urgent


# 4. PRACTICAL PERSONALIZED IDEAS GENERATOR
def generate_personalized_ideas(
    event_type: str,
    name: str,
    theme: str,
    atmosphere: str,
    guest_count: int,
    total_budget: float,
    city: str,
    preferences: str
) -> List[IdeaItem]:
    currency = "₹"
    is_birthday = "birthday" in event_type.lower()

    if is_birthday:
        return [
            IdeaItem(
                title="Matte Black & Mirrored Gold Photo Backdrop",
                description="Create a photogenic focal wall using matte black draping, warm fairy lights, and an oversized gold 21 numeral or neon script.",
                category="Decoration plans",
                mode="Decoration plans",
                estimated_cost_range=f"{currency}2,500 – {currency}4,000",
                prep_effort="Low (1.5 hours)",
                required_materials="Black seamless backdrop, gold geometric balloon arch, fairy curtain lights, stand",
                why_it_suits=f"Complements the '{theme or 'Black and gold'}' theme and '{atmosphere or 'Minimal, elegant'}' atmosphere without consuming excessive budget.",
                tags="photo-wall,black-and-gold,decor"
            ),
            IdeaItem(
                title="Curated Mocktail & Signature Spritz Station",
                description="Offer a self-serve beverage bar featuring Sparkling Elderberry Lemonade and Spiced Pomegranate Spritz with fresh mint and edible gold dust.",
                category="Menu suggestions",
                mode="Menu suggestions",
                estimated_cost_range=f"{currency}2,000 – {currency}3,500",
                prep_effort="Low (45 mins)",
                required_materials="Glass beverage dispensers, gold rim cups, fresh garnishes, sparkling soda",
                why_it_suits=f"Fits {preferences or 'vegetarian/party menu'} preferences and keeps guest refreshments festive at 50% less cost than an open bar.",
                tags="drinks,mocktails,refreshment"
            ),
            IdeaItem(
                title="21st Milestone Trivia & Memory Box",
                description="An interactive 15-minute game with customized trivia questions about Aarav's past 21 years, followed by guests dropping Polaroid notes in a keepsake chest.",
                category="Activity ideas",
                mode="Activity ideas",
                estimated_cost_range=f"{currency}800 – {currency}1,500",
                prep_effort="Medium (1 hour)",
                required_materials="Cardstock trivia cards, retro wooden chest, mini instant camera",
                why_it_suits=f"Engages all {guest_count} guests meaningfully without requiring hired entertainers.",
                tags="games,interactive,trivia"
            ),
            IdeaItem(
                title="Boutique Local Bakery Cake with Gold Leaf Accents",
                description="Single or two-tier dark chocolate truffle cake with elegant textured black ganache and edible 24k gold leaf foil flakes.",
                category="Affordable alternatives",
                mode="Affordable alternatives",
                estimated_cost_range=f"{currency}2,500 – {currency}4,000",
                prep_effort="Low (Order 3 days ahead)",
                required_materials="Custom cake topper, gold cake stand",
                why_it_suits=f"Provides a luxury centerpiece in {city} while adhering comfortably to the {currency}{total_budget:,.0f} budget cap.",
                tags="cake,dessert,budget-friendly"
            )
        ]

    return [
        IdeaItem(
            title="Signature Sensory Welcoming Experience",
            description="Greet arriving guests with bespoke welcome drinks and ambient acoustic melodies tailored to the setting.",
            category="Theme inspiration",
            mode="Theme inspiration",
            estimated_cost_range=f"{currency}3,000 – {currency}5,000",
            prep_effort="Medium (2 hours)",
            required_materials="Welcome signage, drink trays, acoustic playlist",
            why_it_suits=f"Instantly establishes the '{atmosphere}' mood for {guest_count} guests.",
            tags="welcome,atmosphere,sensory"
        ),
        IdeaItem(
            title="Shared Family-Style Gourmet Platters",
            description="Serve vibrant artisan tapas and shared antipasto platters directly at tables instead of long buffet queues.",
            category="Menu suggestions",
            mode="Menu suggestions",
            estimated_cost_range=f"{currency}6,000 – {currency}10,000",
            prep_effort="Low (Coordinated with caterer)",
            required_materials="Wooden serving boards, ceramic bowls, dietary labels",
            why_it_suits=f"Fosters natural conversation and fulfills {preferences}.",
            tags="catering,food,interactive"
        )
    ]


# 5. VENDOR STARTER CHECKLIST
def generate_vendor_checklist(total_budget: float, city: str) -> List[VendorCreate]:
    """Generates non-verified starter vendor records matching official categories."""
    return [
        VendorCreate(
            name=f"City Lights Event Venue ({city})",
            category="venue",
            contact_name="Reservations Desk",
            email="bookings@cityvenue.example.com",
            phone="+91 98100 00000",
            quoted_amount=round(total_budget * 0.20, 2),
            deposit_amount=round(total_budget * 0.05, 2),
            deposit_paid=False,
            balance_due=round(total_budget * 0.20, 2),
            booking_status="shortlisted",
            notes="Requires inquiry for weekend evening slot. Not a verified booking."
        ),
        VendorCreate(
            name="Artisan Spice Hospitality",
            category="catering",
            contact_name="Head Chef",
            email="catering@artisanspice.example.com",
            phone="+91 98200 00000",
            quoted_amount=round(total_budget * 0.30, 2),
            deposit_amount=round(total_budget * 0.10, 2),
            deposit_paid=False,
            balance_due=round(total_budget * 0.30, 2),
            booking_status="contacted",
            notes="Discussing vegetarian menu items and guest count tiers."
        ),
        VendorCreate(
            name="Luxe Decor & Balloon Stylists",
            category="decoration",
            contact_name="Lead Stylist",
            email="stylist@luxedecor.example.com",
            phone="+91 98300 00000",
            quoted_amount=round(total_budget * 0.15, 2),
            deposit_amount=round(total_budget * 0.05, 2),
            deposit_paid=False,
            balance_due=round(total_budget * 0.15, 2),
            booking_status="quoted",
            notes="Sent moodboard for black and gold minimal aesthetic."
        )
    ]


# 6. UNIFIED GENAI PLAN ORCHESTRATION
async def generate_event_plan(
    event_type: str,
    name: str,
    date_str: str,
    city: str = "Faridabad",
    currency: str = "₹",
    guest_count: int = 40,
    total_budget: float = 25000.0,
    theme: str = "Black and gold",
    atmosphere: str = "Minimal, elegant",
    preferences: str = "Vegetarian menu, music, accessibility needs",
    venue_type: str = "Home, restaurant or outdoor"
) -> Dict[str, Any]:
    # 1. Deterministic budget allocation
    categories = calculate_deterministic_categories(total_budget, event_type)

    # 2. Dynamic time-aware tasks
    tasks, days_left, is_urgent = generate_time_aware_tasks(date_str, event_type, guest_count, city)

    # 3. Vendors
    vendors = generate_vendor_checklist(total_budget, city)

    # 4. Ideas
    ideas = generate_personalized_ideas(
        event_type=event_type,
        name=name,
        theme=theme,
        atmosphere=atmosphere,
        guest_count=guest_count,
        total_budget=total_budget,
        city=city,
        preferences=preferences
    )

    # OpenAI enhancement (optional, strictly following Gatherly AI system prompt)
    if OPENAI_API_KEY:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=OPENAI_API_KEY)
            system_instruction = """You are Gatherly AI, an event planning assistant.
Create practical, personalized plans using only the event details and constraints supplied by the application.
Requirements:
1. Respect the user's budget, guest count and event date.
2. Tailor ideas to the event type, theme and preferences.
3. Return valid JSON matching the requested schema.
4. Do not invent verified businesses, quotes or bookings.
5. Distinguish estimates from confirmed expenses.
6. Prioritize tasks realistically based on time remaining."""

            prompt = f"""Context:
Event: {name}
Type: {event_type}
Date: {date_str} (Days remaining: {days_left})
City: {city}
Currency: {currency}
Guest count: {guest_count}
Budget: {currency}{total_budget:,.2f}
Theme: {theme}
Atmosphere: {atmosphere}
Preferences: {preferences}

Return JSON with keys:
- recommended_theme (string)
- color_palette (array of 4 hex codes)
- ideas (array of objects with title, description, category, mode, estimated_cost_range, prep_effort, required_materials, why_it_suits, tags)"""

            res = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7
            )
            data = json.loads(res.choices[0].message.content)
            if "ideas" in data and isinstance(data["ideas"], list) and len(data["ideas"]) > 0:
                ideas = [IdeaItem(**i) for i in data["ideas"][:6]]
        except Exception as e:
            print(f"Gatherly AI OpenAI enhancement bypassed safely: {e}")

    return {
        "recommended_theme": theme or "Black and gold",
        "color_palette": ["#1F5147", "#E9A477", "#252923", "#F8F7F2"],
        "tasks": tasks,
        "categories": categories,
        "vendors": vendors,
        "ideas": [i.model_dump() for i in ideas],
        "time_remaining_days": days_left,
        "urgent_compressed_schedule": is_urgent
    }


# 7. GATHERLY AI CHAT EXPERT
async def chat_with_coorda(message: str, event_context: Dict[str, Any] = None) -> Dict[str, Any]:
    """Gatherly AI Chat Assistant for budget trade-offs, checklist items, and alternatives."""
    event_name = event_context.get("name", "your event") if event_context else "your event"
    budget = event_context.get("total_budget", 25000) if event_context else 25000
    currency = event_context.get("currency", "₹") if event_context else "₹"
    days_left = event_context.get("days_to_go", 30) if event_context else 30

    if OPENAI_API_KEY:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=OPENAI_API_KEY)
            system_instruction = f"""You are Gatherly AI, a practical event-management advisor.
Current Event Context: {json.dumps(event_context or {})}
Tone: Warm, premium, productivity-focused, practical.
Explain budget trade-offs realistically. Suggest checklist items and lower-cost alternatives.
Do not invent verified businesses or claims of live quotes. Format clean markdown."""

            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": message}
                ],
                temperature=0.7
            )
            return {
                "reply": response.choices[0].message.content,
                "suggested_actions": [
                    "Review budget allocation",
                    "Adjust timeline deadline",
                    "Explore lower-cost alternatives"
                ]
            }
        except Exception as e:
            print(f"Gatherly AI chat fallback: {e}")

    msg_lower = message.lower()
    if any(k in msg_lower for k in ["budget", "cost", "save", "shortfall", "expensive"]):
        reply = f"""### 💡 Gatherly AI Budget Guidance for **{event_name}**

Your current total budget is **{currency}{budget:,.0f}**. Here are practical trade-offs to stay on target:

1. **Prioritize Food & Venue Quality Over Elaborate Props**: Catering (30%) leaves the strongest impression. Keep decoration to a focused focal wall rather than decorating every perimeter table.
2. **Reserve Contingency (5%) Separately**: Ensure your {currency}{budget * 0.05:,.0f} contingency remains untouched until the final 48 hours to absorb unexpected transport or disposable fees.
3. **Digital Invitations & RSVPs**: Sending digital animated invites via WhatsApp saves ~{currency}1,500 in printing and postage fees while offering real-time tracking."""
        actions = ["Apply Birthday 100% Preset", "Check category variances", "Add 5% contingency buffer"]

    elif any(k in msg_lower for k in ["timeline", "deadline", "urgent", "schedule", "time"]):
        reply = f"""### ⏱️ Gatherly AI Timeline Strategy ({days_left} days remaining)

{"⚠️ **Note: The event is very close!** Urgent prioritization is required." if days_left <= 7 else "You have ample planning runway."}

- **Lock High-Dependency Vendors First**: Venue and catering cannot be easily replaced 48 hours prior. Confirm these before finalizing stationery.
- **Buffer 15-Minute Intervals**: Build a 15-minute buffer between guest arrival and cake cutting to accommodate delayed guests.
- **Day-of Coordinator**: Appoint a close friend or family member to hold vendor phone numbers so you can fully enjoy the event."""
        actions = ["View time-aware milestones", "Prioritize urgent tasks", "Export run of show"]

    else:
        reply = f"""### 🌿 Welcome to Gatherly AI

I'm ready to assist with planning **{event_name}**:
- **Budget Balancing**: Compare allocated vs actual costs and resolve shortfalls.
- **Dynamic Timelines**: Prioritize tasks according to how many days remain.
- **Vendor Tracking**: Monitor quotes, deposits paid, and follow-up dates.
- **Creative Themes**: Curate decoration plans, menu ideas, and entertainment schedules.

What would you like to review?"""
        actions = ["Check budget balance", "Review timeline deadlines", "Brainstorm theme ideas"]

    return {"reply": reply, "suggested_actions": actions}

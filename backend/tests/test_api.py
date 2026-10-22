import pytest
from datetime import datetime, date, timedelta
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.seed import seed_database

@pytest.fixture(scope="session", autouse=True)
def init_db():
    db = SessionLocal()
    seed_database(db)
    db.close()

def test_health():
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

def test_get_events():
    with TestClient(app) as client:
        response = client.get("/api/events")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2
        event_names = [e["name"] for e in data]
        assert "Aarav's 21st Birthday" in event_names
        assert "John & Jane Wedding" in event_names

def test_get_dashboard():
    with TestClient(app) as client:
        response = client.get("/api/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert "total_events" in data
        assert "total_planned_spending" in data
        assert "upcoming_events" in data

def test_aarav_birthday_budget_and_timeline():
    with TestClient(app) as client:
        events_res = client.get("/api/events")
        events = events_res.json()
        aarav = next(e for e in events if e["name"] == "Aarav's 21st Birthday")
        event_id = aarav["id"]

        detail_res = client.get(f"/api/events/{event_id}")
        assert detail_res.status_code == 200
        detail = detail_res.json()
        assert detail["name"] == "Aarav's 21st Birthday"
        assert detail["city"] == "Faridabad"
        assert detail["guest_count"] == 40
        assert detail["total_budget"] == 25000.0
        assert detail["currency"] == "₹"
        assert detail["stats"]["total_milestones"] == 6

        # Test budget endpoint
        budget_res = client.get(f"/api/events/{event_id}/budget")
        assert budget_res.status_code == 200
        b_data = budget_res.json()
        assert b_data["total_budget"] == 25000.0
        assert b_data["currency"] == "₹"
        assert len(b_data["categories"]) >= 8

def test_ai_chat():
    with TestClient(app) as client:
        response = client.post("/api/ai/chat", json={
            "message": "How can I optimize our catering and decor budget for Aarav's birthday?"
        })
        assert response.status_code == 200
        data = response.json()
        assert "reply" in data
        assert "suggested_actions" in data

def test_event_crud_and_validation():
    with TestClient(app) as client:
        today = date.today()
        future_date = (today + timedelta(days=45)).strftime("%Y-%m-%d")
        past_date = (today - timedelta(days=5)).strftime("%Y-%m-%d")

        # 1. Validation: Reject past date for non-draft
        bad_res = client.post("/api/events", json={
            "name": "Past Event",
            "event_date": past_date,
            "guest_count": 10,
            "total_budget": 5000.0,
            "status": "PLANNING"
        })
        assert bad_res.status_code == 400

        # 2. Validation: Reject zero/negative guest count
        bad_guests = client.post("/api/events", json={
            "name": "Invalid Guests",
            "event_date": future_date,
            "guest_count": 0,
            "total_budget": 5000.0
        })
        assert bad_guests.status_code == 422 or bad_guests.status_code == 400

        # 3. Validation: Reject negative budget
        bad_budget = client.post("/api/events", json={
            "name": "Invalid Budget",
            "event_date": future_date,
            "guest_count": 25,
            "total_budget": -100.0
        })
        assert bad_budget.status_code == 422 or bad_budget.status_code == 400

        # 4. Create valid event
        create_res = client.post("/api/events?auto_generate_plan=true", json={
            "name": "Corporate Gala 2026",
            "event_type": "Community",
            "event_date": future_date,
            "city": "Gurugram",
            "guest_count": 120,
            "total_budget": 100000.0,
            "theme": "Minimal Blue",
            "atmosphere": "Professional and crisp"
        })
        assert create_res.status_code == 200
        ev = create_res.json()
        ev_id = ev["id"]
        assert ev["name"] == "Corporate Gala 2026"
        assert len(ev["tasks"]) > 0
        assert len(ev["budget_categories"]) > 0

        # 5. Patch event
        patch_res = client.patch(f"/api/events/{ev_id}", json={
            "atmosphere": "Vibrant and celebratory",
            "guest_count": 150
        })
        assert patch_res.status_code == 200
        assert patch_res.json()["atmosphere"] == "Vibrant and celebratory"
        assert patch_res.json()["guest_count"] == 150

        # 6. Expenses CRUD
        exp_res = client.post(f"/api/events/{ev_id}/expenses", json={
            "description": "Welcome Drink Stalls",
            "estimated_amount": 10000.0,
            "actual_amount": 9500.0,
            "paid_deposit": 3000.0,
            "payment_status": "deposit_paid"
        })
        assert exp_res.status_code == 200
        exp = exp_res.json()
        exp_id = exp["id"]

        exp_patch = client.patch(f"/api/expenses/{exp_id}", json={
            "actual_amount": 9200.0
        })
        assert exp_patch.status_code == 200
        assert exp_patch.json()["actual_amount"] == 9200.0

        # 7. Tasks CRUD
        task_res = client.post(f"/api/events/{ev_id}/tasks", json={
            "title": "Print nametags and agendas",
            "priority": "Medium",
            "status": "TODO"
        })
        assert task_res.status_code == 200
        task_id = task_res.json()["id"]

        task_patch = client.patch(f"/api/tasks/{task_id}", json={
            "status": "COMPLETED"
        })
        assert task_patch.status_code == 200
        assert task_patch.json()["status"] == "COMPLETED"

        # 8. Vendors CRUD
        vendor_res = client.post(f"/api/events/{ev_id}/vendors", json={
            "name": "Grand Ballroom Catering",
            "category": "catering",
            "quoted_amount": 40000.0,
            "deposit_amount": 10000.0,
            "deposit_paid": True,
            "booking_status": "booked"
        })
        assert vendor_res.status_code == 200
        vendor_id = vendor_res.json()["id"]
        assert vendor_res.json()["balance_due"] == 30000.0

        vendor_patch = client.patch(f"/api/vendors/{vendor_id}", json={
            "quoted_amount": 38000.0
        })
        assert vendor_patch.status_code == 200
        assert vendor_patch.json()["balance_due"] == 28000.0

        # 9. Ideas endpoint
        ideas_res = client.post(f"/api/events/{ev_id}/ideas")
        assert ideas_res.status_code == 200
        ideas_data = ideas_res.json()
        assert "ideas" in ideas_data
        assert len(ideas_data["ideas"]) > 0

        # Clean up
        del_res = client.delete(f"/api/events/{ev_id}")
        assert del_res.status_code == 200

def test_security_headers_and_rate_limiting():
    with TestClient(app) as client:
        # Check health endpoint returns security info
        health_res = client.get("/api/health")
        assert health_res.status_code == 200
        data = health_res.json()
        assert "security" in data
        assert data["security"]["rate_limiting"] == "enabled"
        assert data["security"]["security_headers"] == "enabled"

        # Check security headers on API responses
        events_res = client.get("/api/events")
        assert events_res.status_code == 200
        assert events_res.headers.get("x-content-type-options") == "nosniff"
        assert events_res.headers.get("x-frame-options") == "DENY"
        assert "x-ratelimit-limit" in events_res.headers
        assert "x-ratelimit-remaining" in events_res.headers


def test_deterministic_budget_presets_and_paise_arithmetic():
    """Verify that all presets sum to exactly 100% and preserve exact paise arithmetic without rounding drift."""
    from backend.app.services.ai_service import BUDGET_PRESETS, calculate_deterministic_categories, verify_and_get_preset

    # 1. Preset percentages must sum to 100.0% exactly
    for preset_name, preset_items in BUDGET_PRESETS.items():
        total_pct = sum(pct for _, pct in preset_items)
        assert abs(total_pct - 100.0) < 1e-6, f"Preset {preset_name} does not sum to 100%"

    # 2. Test paise calculation on arbitrary decimal budgets
    test_budgets = [25000.0, 15340.50, 9999.99, 1000000.0]
    for b in test_budgets:
        for ev_type in ["birthday", "wedding", "community"]:
            cats = calculate_deterministic_categories(b, ev_type)
            total_allocated = sum(c.allocated_amount for c in cats)
            # Must equal within 1 paisa (0.01)
            assert abs(round(total_allocated, 2) - round(b, 2)) <= 0.01, f"Mismatch for budget {b} in {ev_type}"


def test_dynamic_timeline_generation_time_awareness():
    """Verify time-aware timeline compression: urgent (<3 days), intermediate (14 days), and distant (30+ days)."""
    from backend.app.services.ai_service import generate_time_aware_tasks

    today = date.today()

    # 1. Urgent: Event in 2 days
    urgent_date = (today + timedelta(days=2)).strftime("%Y-%m-%d")
    urgent_tasks, days_left, is_urgent = generate_time_aware_tasks(urgent_date, "Birthday", 30, "Faridabad")
    assert is_urgent is True
    assert days_left == 2
    assert len(urgent_tasks) >= 4
    # All task deadlines must be >= today and <= urgent_date
    for t in urgent_tasks:
        task_due = datetime.strptime(t.due_date, "%Y-%m-%d").date() if isinstance(t.due_date, str) else t.due_date
        assert task_due >= today
        assert task_due <= datetime.strptime(urgent_date, "%Y-%m-%d").date()

    # 2. Intermediate: Event in 10 days
    mid_date = (today + timedelta(days=10)).strftime("%Y-%m-%d")
    mid_tasks, mid_days, mid_urgent = generate_time_aware_tasks(mid_date, "Wedding", 80, "Delhi")
    assert mid_urgent is False
    assert mid_days == 10
    assert len(mid_tasks) == 6

    # 3. Standard: Event in 45 days
    future_date = (today + timedelta(days=45)).strftime("%Y-%m-%d")
    standard_tasks, std_days, std_urgent = generate_time_aware_tasks(future_date, "Community", 200, "Mumbai")
    assert std_urgent is False
    assert std_days == 45
    assert len(standard_tasks) >= 6


def test_rate_limiter_in_memory_sliding_window():
    """Unit test the sliding window rate limiter directly."""
    from backend.app.security import InMemoryRateLimiter

    limiter = InMemoryRateLimiter(requests_per_minute=5, burst_limit=5)
    test_ip = "192.168.1.100"

    # 5 requests should pass
    for i in range(5):
        allowed, rem, retry_after = limiter.is_allowed(test_ip)
        assert allowed is True
        assert rem == (4 - i)

    # 6th request must be rejected
    allowed, rem, retry_after = limiter.is_allowed(test_ip)
    assert allowed is False
    assert rem == 0
    assert retry_after > 0


def test_overbudget_shortfall_calculation():
    """Test decimal-safe expense aggregation and shortfall trigger."""
    with TestClient(app) as client:
        today = date.today()
        event_date = (today + timedelta(days=20)).strftime("%Y-%m-%d")

        # Create event with 10,000 budget
        ev_res = client.post("/api/events?auto_generate_plan=false", json={
            "name": "Budget Boundary Test Event",
            "event_type": "Birthday",
            "event_date": event_date,
            "guest_count": 20,
            "total_budget": 10000.0,
            "currency": "₹"
        })
        assert ev_res.status_code == 200
        ev_id = ev_res.json()["id"]

        # Add expense exceeding total budget
        exp_res = client.post(f"/api/events/{ev_id}/expenses", json={
            "description": "Premium DJ & AV",
            "estimated_amount": 7000.0,
            "actual_amount": 12500.0,
            "paid_deposit": 5000.0,
            "payment_status": "deposit_paid"
        })
        assert exp_res.status_code == 200

        # Fetch budget summary
        budget_res = client.get(f"/api/events/{ev_id}/budget")
        assert budget_res.status_code == 200
        b_data = budget_res.json()
        assert b_data["is_over_budget"] is True
        assert b_data["total_spent"] == 12500.0
        assert b_data["shortfall"] == 2500.0
        assert b_data["remaining_balance"] == 0.0

        # Clean up
        client.delete(f"/api/events/{ev_id}")


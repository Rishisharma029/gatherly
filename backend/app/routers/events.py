import json
from datetime import datetime, date, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Event, BudgetCategory, Expense, Task, Vendor, AIGeneration, ActivityLog
from ..schemas import (
    EventCreate, EventUpdate, EventResponse, EventDetailResponse,
    EventStats, AIGeneratePlanResponse, IdeasListResponse, IdeaItem
)
from ..services.ai_service import generate_event_plan, generate_personalized_ideas

router = APIRouter(prefix="/api/events", tags=["events"])

def calculate_stats(event: Event) -> EventStats:
    tasks = event.tasks or []
    milestones = [t for t in tasks if t.is_milestone]
    completed_milestones = [t for t in milestones if t.status == "COMPLETED"]
    total_m = len(milestones)
    comp_m = len(completed_milestones)
    m_pct = int((comp_m / total_m * 100)) if total_m > 0 else 0

    regular_tasks = [t for t in tasks if not t.is_milestone]
    eval_tasks = regular_tasks if regular_tasks else tasks
    completed_tasks = [t for t in eval_tasks if t.status == "COMPLETED"]
    total_t = len(eval_tasks)
    comp_t = len(completed_tasks)
    t_pct = int((comp_t / total_t * 100)) if total_t > 0 else 0

    budget_cats = event.budget_categories or []
    expenses = event.expenses or []

    budget_allocated = sum(c.allocated_amount for c in budget_cats)
    committed_budget = sum(e.actual_amount for e in expenses)
    paid_deposits = sum(e.paid_deposit for e in expenses)
    remaining_budget = max(0.0, event.total_budget - committed_budget)
    shortfall = max(0.0, committed_budget - event.total_budget)
    is_over_budget = committed_budget > event.total_budget

    # Date calculation & warning
    date_warning = None
    days_to_go = 30
    try:
        ev_date = datetime.strptime(event.event_date, "%Y-%m-%d").date()
        today = date.today()
        diff = (ev_date - today).days
        if diff < 0:
            date_warning = f"Event date ({event.event_date}) is in the past."
            days_to_go = 0
        else:
            days_to_go = diff
    except Exception:
        pass

    return EventStats(
        total_milestones=total_m,
        completed_milestones=comp_m,
        milestone_percentage=m_pct,
        total_tasks=total_t,
        completed_tasks=comp_t,
        task_percentage=t_pct,
        total_budget=event.total_budget,
        budget_allocated=budget_allocated,
        budget_committed=committed_budget,
        budget_remaining=remaining_budget,
        shortfall=shortfall,
        is_over_budget=is_over_budget,
        total_paid_deposits=paid_deposits,
        total_vendors=len(event.vendors or []),
        days_to_go=days_to_go,
        date_warning=date_warning
    )


@router.get("", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db)):
    events = db.query(Event).order_by(Event.event_date.asc()).all()
    results = []
    for e in events:
        resp = EventResponse.model_validate(e)
        resp.stats = calculate_stats(e)
        results.append(resp)
    return results


@router.get("/{event_id}", response_model=EventDetailResponse)
def get_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    resp = EventDetailResponse.model_validate(event)
    resp.stats = calculate_stats(event)
    return resp


@router.post("", response_model=EventDetailResponse)
async def create_event(
    event_in: EventCreate,
    auto_generate_plan: bool = Query(True),
    db: Session = Depends(get_db)
):
    today = date.today()
    try:
        ev_date = datetime.strptime(event_in.event_date, "%Y-%m-%d").date()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    if ev_date < today and event_in.status != "DRAFT":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot schedule an event in the past ({event_in.event_date}). Please select today or a future date."
        )

    if event_in.guest_count <= 0:
        raise HTTPException(status_code=400, detail="Guest count must be greater than 0.")

    if event_in.total_budget < 0:
        raise HTTPException(status_code=400, detail="Total budget cannot be negative.")

    event_data = event_in.model_dump(exclude={"date", "preferences", "dietary_requirements", "accessibility_requirements"})
    event = Event(**event_data)
    db.add(event)
    db.commit()
    db.refresh(event)

    # Activity log
    log = ActivityLog(
        event_id=event.id,
        user_name="Event Planner",
        action=f'Created event "{event.name}" ({event.currency}{event.total_budget:,.0f})',
        entity_type="Event",
        entity_id=event.id,
        timestamp_label=datetime.now(timezone.utc).strftime("%I:%M %p").lower()
    )
    db.add(log)

    if auto_generate_plan:
        plan_data = await generate_event_plan(
            event_type=event.event_type,
            name=event.name,
            date_str=event.event_date,
            city=event.city or "Faridabad",
            currency=event.currency or "₹",
            guest_count=event.guest_count or 40,
            total_budget=event.total_budget or 25000.0,
            theme=event.theme or "Black and gold",
            atmosphere=event.atmosphere or "Minimal, elegant",
            preferences=event.preferences_json or "",
            venue_type=event.venue_type or "Home, restaurant or outdoor"
        )

        # Save categories
        cat_map = {}
        for c in plan_data["categories"]:
            cat_obj = BudgetCategory(
                event_id=event.id,
                name=c.name,
                allocated_amount=c.allocated_amount
            )
            db.add(cat_obj)
            db.flush()
            cat_map[c.name.lower()] = cat_obj.id

        # Save starter tasks
        for t in plan_data["tasks"]:
            db.add(Task(event_id=event.id, **t.model_dump(exclude={"deadline"})))

        # Save starter vendors
        for v in plan_data["vendors"]:
            db.add(Vendor(event_id=event.id, **v.model_dump(exclude={"status", "estimated_quote", "final_quote"})))

        # Save AI generation record
        gen_record = AIGeneration(
            event_id=event.id,
            generation_type="plan",
            model="Gatherly-AI-v1",
            status="completed",
            content_json=json.dumps({
                "theme": plan_data["recommended_theme"],
                "color_palette": plan_data["color_palette"],
                "ideas": plan_data["ideas"]
            })
        )
        db.add(gen_record)

    db.commit()
    db.refresh(event)
    resp = EventDetailResponse.model_validate(event)
    resp.stats = calculate_stats(event)
    return resp


@router.patch("/{event_id}", response_model=EventDetailResponse)
@router.put("/{event_id}", response_model=EventDetailResponse)
def update_event(event_id: str, event_update: EventUpdate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = event_update.model_dump(
        exclude_unset=True,
        exclude={"date", "preferences", "dietary_requirements", "accessibility_requirements"}
    )
    for key, value in update_data.items():
        setattr(event, key, value)

    event.updated_at = datetime.now(timezone.utc)

    log = ActivityLog(
        event_id=event.id,
        user_name="Event Planner",
        action=f'Updated event details for "{event.name}"',
        entity_type="Event",
        entity_id=event.id,
        timestamp_label=datetime.now(timezone.utc).strftime("%I:%M %p").lower()
    )
    db.add(log)

    db.commit()
    db.refresh(event)
    resp = EventDetailResponse.model_validate(event)
    resp.stats = calculate_stats(event)
    return resp


@router.delete("/{event_id}")
def delete_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"message": f"Event {event_id} deleted successfully"}


@router.post("/{event_id}/generate-plan", response_model=AIGeneratePlanResponse)
async def generate_plan_for_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    plan_data = await generate_event_plan(
        event_type=event.event_type,
        name=event.name,
        date_str=event.event_date,
        city=event.city or "Faridabad",
        currency=event.currency or "₹",
        guest_count=event.guest_count or 40,
        total_budget=event.total_budget or 25000.0,
        theme=event.theme or "Black and gold",
        atmosphere=event.atmosphere or "Minimal, elegant",
        preferences=event.preferences_json or "",
        venue_type=event.venue_type or "Home, restaurant or outdoor"
    )

    # If no categories exist, populate them
    if not event.budget_categories:
        for c in plan_data["categories"]:
            db.add(BudgetCategory(event_id=event.id, name=c.name, allocated_amount=c.allocated_amount))

    # If no tasks exist, populate them
    if not event.tasks:
        for t in plan_data["tasks"]:
            db.add(Task(event_id=event.id, **t.model_dump(exclude={"deadline"})))

    # If no vendors exist, populate them
    if not event.vendors:
        for v in plan_data["vendors"]:
            db.add(Vendor(event_id=event.id, **v.model_dump(exclude={"status", "estimated_quote", "final_quote"})))

    gen_record = AIGeneration(
        event_id=event.id,
        generation_type="plan",
        model="Gatherly-AI-v1",
        status="completed",
        content_json=json.dumps({
            "theme": plan_data["recommended_theme"],
            "color_palette": plan_data["color_palette"],
            "ideas": plan_data["ideas"]
        })
    )
    db.add(gen_record)

    log = ActivityLog(
        event_id=event.id,
        user_name="Gatherly AI",
        action=f"Generated AI event plan ({len(plan_data['tasks'])} tasks, {len(plan_data['categories'])} budget categories)",
        entity_type="Plan",
        entity_id=gen_record.id,
        timestamp_label=datetime.now(timezone.utc).strftime("%I:%M %p").lower()
    )
    db.add(log)

    db.commit()
    db.refresh(event)

    return AIGeneratePlanResponse(
        event_id=event.id,
        recommended_theme=plan_data["recommended_theme"],
        color_palette=plan_data["color_palette"],
        tasks_count=len(event.tasks),
        budget_categories_count=len(event.budget_categories),
        expenses_count=len(event.expenses),
        vendors_count=len(event.vendors),
        ideas=plan_data["ideas"],
        time_remaining_days=plan_data["time_remaining_days"],
        urgent_compressed_schedule=plan_data["urgent_compressed_schedule"]
    )


@router.post("/{event_id}/ideas", response_model=IdeasListResponse)
def generate_ideas_endpoint(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    ideas = generate_personalized_ideas(
        event_type=event.event_type,
        name=event.name,
        theme=event.theme or "Black and gold",
        atmosphere=event.atmosphere or "Minimal, elegant",
        guest_count=event.guest_count or 40,
        total_budget=event.total_budget or 25000.0,
        city=event.city or "Faridabad",
        preferences=event.preferences_json or ""
    )

    gen_record = AIGeneration(
        event_id=event.id,
        generation_type="ideas",
        model="Gatherly-AI-v1",
        status="completed",
        content_json=json.dumps([i.model_dump() for i in ideas])
    )
    db.add(gen_record)

    log = ActivityLog(
        event_id=event.id,
        user_name="Gatherly AI",
        action=f"Generated {len(ideas)} personalized ideas",
        entity_type="Ideas",
        entity_id=gen_record.id,
        timestamp_label=datetime.now(timezone.utc).strftime("%I:%M %p").lower()
    )
    db.add(log)

    db.commit()
    return IdeasListResponse(
        event_id=event.id,
        generation_id=gen_record.id,
        ideas=ideas
    )


@router.get("/{event_id}/ideas", response_model=IdeasListResponse)
def get_ideas_endpoint(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    latest_gen = (
        db.query(AIGeneration)
        .filter(AIGeneration.event_id == event_id, AIGeneration.generation_type.in_(["ideas", "plan"]))
        .order_by(AIGeneration.created_at.desc())
        .first()
    )

    if latest_gen and latest_gen.content_json:
        try:
            data = json.loads(latest_gen.content_json)
            ideas_raw = data if isinstance(data, list) else data.get("ideas", [])
            ideas = [IdeaItem(**i) for i in ideas_raw]
            return IdeasListResponse(
                event_id=event.id,
                generation_id=latest_gen.id,
                ideas=ideas
            )
        except Exception:
            pass

    # Fallback: generate deterministic ideas
    ideas = generate_personalized_ideas(
        event_type=event.event_type,
        name=event.name,
        theme=event.theme or "Black and gold",
        atmosphere=event.atmosphere or "Minimal, elegant",
        guest_count=event.guest_count or 40,
        total_budget=event.total_budget or 25000.0,
        city=event.city or "Faridabad",
        preferences=event.preferences_json or ""
    )
    return IdeasListResponse(
        event_id=event.id,
        generation_id=None,
        ideas=ideas
    )

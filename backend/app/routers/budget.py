from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Event, BudgetCategory, Expense, ActivityLog
from ..schemas import (
    BudgetCategoryCreate, BudgetCategoryUpdate, BudgetCategoryResponse,
    ExpenseCreate, ExpenseUpdate, ExpenseResponse,
    BudgetSummaryResponse, CategoryBudgetSummary
)

router = APIRouter(tags=["budget"])


# 1. GET /api/events/{event_id}/budget
@router.get("/api/events/{event_id}/budget", response_model=BudgetSummaryResponse)
def get_event_budget(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    categories = db.query(BudgetCategory).filter(BudgetCategory.event_id == event_id).all()
    expenses = db.query(Expense).filter(Expense.event_id == event_id).all()

    # Precise arithmetic
    total_budget_paise = int(round(event.total_budget * 100))
    total_allocated_paise = sum(int(round(c.allocated_amount * 100)) for c in categories)
    total_spent_paise = sum(int(round(e.actual_amount * 100)) for e in expenses)
    total_deposits_paise = sum(int(round(e.paid_deposit * 100)) for e in expenses)

    total_allocated = round(total_allocated_paise / 100.0, 2)
    total_spent = round(total_spent_paise / 100.0, 2)
    total_deposits_paid = round(total_deposits_paise / 100.0, 2)
    remaining_balance = max(0.0, round((total_budget_paise - total_spent_paise) / 100.0, 2))
    unallocated_budget = max(0.0, round((total_budget_paise - total_allocated_paise) / 100.0, 2))

    is_over_budget = total_spent > event.total_budget
    shortfall = max(0.0, round(total_spent - event.total_budget, 2))

    cat_map: Dict[str, Dict[str, Any]] = {}
    for c in categories:
        cat_map[c.id] = {
            "category_id": c.id,
            "category": c.name,
            "allocated": c.allocated_amount,
            "actual": 0.0,
            "deposit": 0.0,
            "item_count": 0,
        }

    misc_expenses_actual = 0.0
    misc_expenses_deposit = 0.0
    misc_count = 0

    for e in expenses:
        if e.category_id and e.category_id in cat_map:
            cat_map[e.category_id]["actual"] += e.actual_amount
            cat_map[e.category_id]["deposit"] += e.paid_deposit
            cat_map[e.category_id]["item_count"] += 1
        else:
            misc_expenses_actual += e.actual_amount
            misc_expenses_deposit += e.paid_deposit
            misc_count += 1

    category_summaries: List[CategoryBudgetSummary] = []
    reduction_suggestions: List[str] = []

    for c_id, val in cat_map.items():
        alloc = round(val["allocated"], 2)
        act = round(val["actual"], 2)
        dep = round(val["deposit"], 2)
        variance = round(alloc - act, 2)
        cat_over = act > alloc and alloc > 0
        pct = round((alloc / event.total_budget * 100.0), 1) if event.total_budget > 0 else 0.0

        if cat_over:
            reduction_suggestions.append(
                f"Reduce '{val['category']}' spending by {event.currency}{abs(variance):,.2f} to return to category limit."
            )
        elif act > 0 and shortfall > 0:
            reduction_suggestions.append(
                f"Consider scaling back '{val['category']}' (current spending: {event.currency}{act:,.2f})."
            )

        category_summaries.append(CategoryBudgetSummary(
            category_id=c_id,
            category=val["category"],
            allocated=alloc,
            actual=act,
            deposit=dep,
            item_count=val["item_count"],
            percentage=pct,
            is_over_budget=cat_over,
            variance=variance
        ))

    if misc_count > 0:
        category_summaries.append(CategoryBudgetSummary(
            category_id=None,
            category="Uncategorized Expenses",
            allocated=0.0,
            actual=round(misc_expenses_actual, 2),
            deposit=round(misc_expenses_deposit, 2),
            item_count=misc_count,
            percentage=0.0,
            is_over_budget=misc_expenses_actual > 0,
            variance=-round(misc_expenses_actual, 2)
        ))

    # Build expense responses with category_name
    cat_name_lookup = {c.id: c.name for c in categories}
    expense_responses = []
    for e in expenses:
        er = ExpenseResponse.model_validate(e)
        if e.category_id and e.category_id in cat_name_lookup:
            er.category_name = cat_name_lookup[e.category_id]
        expense_responses.append(er)

    return BudgetSummaryResponse(
        event_id=event.id,
        currency=event.currency or "₹",
        total_budget=event.total_budget,
        total_allocated=total_allocated,
        total_spent=total_spent,
        total_deposits_paid=total_deposits_paid,
        remaining_balance=remaining_balance,
        unallocated_budget=unallocated_budget,
        is_over_budget=is_over_budget,
        shortfall=shortfall,
        reduction_suggestions=reduction_suggestions,
        categories=category_summaries,
        expenses=expense_responses
    )


# 2. POST /api/events/{event_id}/expenses
@router.post("/api/events/{event_id}/expenses", response_model=ExpenseResponse)
def create_expense(event_id: str, expense_in: ExpenseCreate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    expense_data = expense_in.model_dump(exclude={"category_name"})
    expense = Expense(event_id=event_id, **expense_data)
    db.add(expense)

    log = ActivityLog(
        event_id=event_id,
        user_name="Event Planner",
        action=f'Logged expense "{expense.description}" ({event.currency}{expense.actual_amount:,.2f})',
        entity_type="Expense",
        entity_id=expense.id,
        timestamp_label=datetime.utcnow().strftime("%I:%M %p").lower()
    )
    db.add(log)

    db.commit()
    db.refresh(expense)

    resp = ExpenseResponse.model_validate(expense)
    if expense.category_id:
        cat = db.query(BudgetCategory).filter(BudgetCategory.id == expense.category_id).first()
        if cat:
            resp.category_name = cat.name
    return resp


# 3. PATCH & PUT /api/expenses/{expense_id}
@router.patch("/api/expenses/{expense_id}", response_model=ExpenseResponse)
@router.put("/api/expenses/{expense_id}", response_model=ExpenseResponse)
@router.patch("/api/events/{event_id}/expenses/{expense_id}", response_model=ExpenseResponse)
@router.put("/api/events/{event_id}/expenses/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: str,
    expense_update: ExpenseUpdate,
    event_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Expense).filter(Expense.id == expense_id)
    if event_id:
        query = query.filter(Expense.event_id == event_id)
    expense = query.first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    update_data = expense_update.model_dump(exclude_unset=True, exclude={"category_name"})
    for key, value in update_data.items():
        setattr(expense, key, value)

    expense.updated_at = datetime.utcnow()

    log = ActivityLog(
        event_id=expense.event_id,
        user_name="Event Planner",
        action=f'Updated expense "{expense.description}"',
        entity_type="Expense",
        entity_id=expense.id,
        timestamp_label=datetime.utcnow().strftime("%I:%M %p").lower()
    )
    db.add(log)

    db.commit()
    db.refresh(expense)

    resp = ExpenseResponse.model_validate(expense)
    if expense.category_id:
        cat = db.query(BudgetCategory).filter(BudgetCategory.id == expense.category_id).first()
        if cat:
            resp.category_name = cat.name
    return resp


# 4. DELETE /api/expenses/{expense_id}
@router.delete("/api/expenses/{expense_id}")
@router.delete("/api/events/{event_id}/expenses/{expense_id}")
def delete_expense(expense_id: str, event_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Expense).filter(Expense.id == expense_id)
    if event_id:
        query = query.filter(Expense.event_id == event_id)
    expense = query.first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    ev_id = expense.event_id
    db.delete(expense)

    log = ActivityLog(
        event_id=ev_id,
        user_name="Event Planner",
        action=f'Deleted expense "{expense.description}"',
        entity_type="Expense",
        entity_id=expense_id,
        timestamp_label=datetime.utcnow().strftime("%I:%M %p").lower()
    )
    db.add(log)

    db.commit()
    return {"message": f"Expense {expense_id} deleted successfully"}


# 5. CATEGORY ENDPOINTS
@router.post("/api/events/{event_id}/budget/categories", response_model=BudgetCategoryResponse)
def create_budget_category(event_id: str, category_in: BudgetCategoryCreate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    cat = BudgetCategory(event_id=event_id, **category_in.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.patch("/api/budget/categories/{category_id}", response_model=BudgetCategoryResponse)
def update_budget_category(category_id: str, cat_update: BudgetCategoryUpdate, db: Session = Depends(get_db)):
    cat = db.query(BudgetCategory).filter(BudgetCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    for k, v in cat_update.model_dump(exclude_unset=True).items():
        setattr(cat, k, v)
    cat.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(cat)
    return cat

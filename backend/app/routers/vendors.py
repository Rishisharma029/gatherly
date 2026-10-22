from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Event, Vendor, ActivityLog
from ..schemas import VendorCreate, VendorUpdate, VendorResponse

router = APIRouter(tags=["vendors"])


# 1. GET /api/events/{event_id}/vendors
@router.get("/api/events/{event_id}/vendors", response_model=List[VendorResponse])
def get_vendors(event_id: str, db: Session = Depends(get_db)):
    return db.query(Vendor).filter(Vendor.event_id == event_id).order_by(Vendor.created_at.asc()).all()


# 2. POST /api/events/{event_id}/vendors
@router.post("/api/events/{event_id}/vendors", response_model=VendorResponse)
def add_vendor(event_id: str, vendor_in: VendorCreate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    v_data = vendor_in.model_dump(exclude={"status", "estimated_quote", "final_quote"})

    # Calculate balance due
    quote = v_data.get("quoted_amount", 0.0)
    deposit = v_data.get("deposit_amount", 0.0) if v_data.get("deposit_paid", False) else 0.0
    v_data["balance_due"] = max(0.0, round(quote - deposit, 2))

    vendor = Vendor(event_id=event_id, **v_data)
    db.add(vendor)

    log = ActivityLog(
        event_id=event_id,
        user_name="Event Planner",
        action=f'Added vendor "{vendor.name}" ({vendor.category})',
        entity_type="Vendor",
        entity_id=vendor.id,
        timestamp_label=datetime.utcnow().strftime("%I:%M %p").lower()
    )
    db.add(log)

    db.commit()
    db.refresh(vendor)
    return vendor


# 3. PATCH & PUT /api/vendors/{vendor_id}
@router.patch("/api/vendors/{vendor_id}", response_model=VendorResponse)
@router.put("/api/vendors/{vendor_id}", response_model=VendorResponse)
@router.patch("/api/events/{event_id}/vendors/{vendor_id}", response_model=VendorResponse)
@router.put("/api/events/{event_id}/vendors/{vendor_id}", response_model=VendorResponse)
def update_vendor(
    vendor_id: str,
    vendor_update: VendorUpdate,
    event_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Vendor).filter(Vendor.id == vendor_id)
    if event_id:
        query = query.filter(Vendor.event_id == event_id)
    vendor = query.first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    old_status = vendor.booking_status
    update_data = vendor_update.model_dump(
        exclude_unset=True,
        exclude={"status", "estimated_quote", "final_quote"}
    )
    for key, value in update_data.items():
        setattr(vendor, key, value)

    # Recalculate balance due
    deposit = vendor.deposit_amount if vendor.deposit_paid else 0.0
    vendor.balance_due = max(0.0, round(vendor.quoted_amount - deposit, 2))
    vendor.updated_at = datetime.utcnow()

    # Log action
    action_text = f'Updated vendor "{vendor.name}"'
    if "booking_status" in update_data and update_data["booking_status"] != old_status:
        action_text = f'Marked vendor "{vendor.name}" as {update_data["booking_status"]}'

    log = ActivityLog(
        event_id=vendor.event_id,
        user_name="Event Planner",
        action=action_text,
        entity_type="Vendor",
        entity_id=vendor.id,
        timestamp_label=datetime.utcnow().strftime("%I:%M %p").lower()
    )
    db.add(log)

    db.commit()
    db.refresh(vendor)
    return vendor


# 4. DELETE /api/vendors/{vendor_id}
@router.delete("/api/vendors/{vendor_id}")
@router.delete("/api/events/{event_id}/vendors/{vendor_id}")
def delete_vendor(vendor_id: str, event_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Vendor).filter(Vendor.id == vendor_id)
    if event_id:
        query = query.filter(Vendor.event_id == event_id)
    vendor = query.first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    ev_id = vendor.event_id
    db.delete(vendor)

    log = ActivityLog(
        event_id=ev_id,
        user_name="Event Planner",
        action=f'Deleted vendor "{vendor.name}"',
        entity_type="Vendor",
        entity_id=vendor_id,
        timestamp_label=datetime.utcnow().strftime("%I:%M %p").lower()
    )
    db.add(log)

    db.commit()
    return {"message": f"Vendor {vendor_id} deleted successfully"}

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Event(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    name = Column(String(255), nullable=False)
    event_type = Column(String(100), default="Birthday")
    event_date = Column(String(50), nullable=False)  # ISO string YYYY-MM-DD
    city = Column(String(150), default="Faridabad")
    venue_type = Column(String(150), default="Home, restaurant or outdoor")
    guest_count = Column(Integer, default=40)
    total_budget = Column(Float, default=25000.0)
    currency = Column(String(10), default="₹")
    theme = Column(String(200), default="Black and gold")
    atmosphere = Column(String(200), default="Minimal, elegant")
    preferences_json = Column(Text, default="{}")
    status = Column(String(50), default="PLANNING")  # PLANNING, CONFIRMED, COMPLETED, DRAFT
    icon = Column(String(20), default="🎉")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    budget_categories = relationship("BudgetCategory", back_populates="event", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="event", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="event", cascade="all, delete-orphan")
    vendors = relationship("Vendor", back_populates="event", cascade="all, delete-orphan")
    ai_generations = relationship("AIGeneration", back_populates="event", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="event", cascade="all, delete-orphan", order_by="desc(ActivityLog.created_at)")


class BudgetCategory(Base):
    __tablename__ = "budget_categories"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    event_id = Column(String(36), ForeignKey("events.id"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    allocated_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    event = relationship("Event", back_populates="budget_categories")
    expenses = relationship("Expense", back_populates="category", cascade="all, delete-orphan")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    event_id = Column(String(36), ForeignKey("events.id"), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("budget_categories.id"), nullable=True, index=True)
    description = Column(String(255), nullable=False)
    estimated_amount = Column(Float, default=0.0)
    actual_amount = Column(Float, default=0.0)
    payment_status = Column(String(50), default="pending")  # pending, deposit_paid, paid, refunded
    paid_deposit = Column(Float, default=0.0)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    event = relationship("Event", back_populates="expenses")
    category = relationship("BudgetCategory", back_populates="expenses")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    event_id = Column(String(36), ForeignKey("events.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    due_date = Column(String(50), nullable=True)  # YYYY-MM-DD
    priority = Column(String(20), default="Medium")  # High, Medium, Low
    status = Column(String(30), default="TODO")  # TODO, IN_PROGRESS, COMPLETED
    category = Column(String(100), default="general")
    is_milestone = Column(Boolean, default=False)
    is_urgent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    event = relationship("Event", back_populates="tasks")


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    event_id = Column(String(36), ForeignKey("events.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100), default="catering")
    contact_name = Column(String(150), default="")
    email = Column(String(150), default="")
    phone = Column(String(50), default="")
    website = Column(String(200), default="")
    quoted_amount = Column(Float, default=0.0)
    deposit_amount = Column(Float, default=0.0)
    deposit_paid = Column(Boolean, default=False)
    balance_due = Column(Float, default=0.0)
    booking_status = Column(String(50), default="contacted")
    # shortlisted, contacted, quoted, booked, cancelled
    notes = Column(Text, default="")
    follow_up_date = Column(String(50), default="")
    rating = Column(Float, default=5.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    event = relationship("Event", back_populates="vendors")


class AIGeneration(Base):
    __tablename__ = "ai_generations"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    event_id = Column(String(36), ForeignKey("events.id"), nullable=False, index=True)
    generation_type = Column(String(100), default="plan")  # plan, ideas, timeline, chat
    model = Column(String(100), default="gpt-4o-mini")
    status = Column(String(50), default="completed")  # completed, pending, failed
    content_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="ai_generations")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    event_id = Column(String(36), ForeignKey("events.id"), nullable=False, index=True)
    user_name = Column(String(100), default="Planner")
    action = Column(String(300), nullable=False)
    entity_type = Column(String(50), default="General")
    entity_id = Column(String(36), nullable=True)
    timestamp_label = Column(String(50), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="activity_logs")

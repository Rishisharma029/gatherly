import json
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator

# --- Budget Category Schemas ---
class BudgetCategoryBase(BaseModel):
    name: str
    allocated_amount: float = Field(default=0.0, ge=0.0)

class BudgetCategoryCreate(BudgetCategoryBase):
    pass

class BudgetCategoryUpdate(BaseModel):
    name: Optional[str] = None
    allocated_amount: Optional[float] = Field(default=None, ge=0.0)

class BudgetCategoryResponse(BudgetCategoryBase):
    id: str
    event_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Expense Schemas ---
class ExpenseBase(BaseModel):
    description: str = Field(..., min_length=1)
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    estimated_amount: float = Field(default=0.0, ge=0.0)
    actual_amount: float = Field(default=0.0, ge=0.0)
    payment_status: str = Field(default="pending")  # pending, deposit_paid, paid, refunded
    paid_deposit: float = Field(default=0.0, ge=0.0)
    notes: Optional[str] = ""

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    estimated_amount: Optional[float] = Field(default=None, ge=0.0)
    actual_amount: Optional[float] = Field(default=None, ge=0.0)
    payment_status: Optional[str] = None
    paid_deposit: Optional[float] = Field(default=None, ge=0.0)
    notes: Optional[str] = None

class ExpenseResponse(ExpenseBase):
    id: str
    event_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Task Schemas ---
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = ""
    due_date: Optional[str] = None  # YYYY-MM-DD
    deadline: Optional[str] = None  # Alias for backward compatibility
    priority: str = Field(default="Medium")  # High, Medium, Low
    status: str = Field(default="TODO")  # TODO, IN_PROGRESS, COMPLETED
    category: Optional[str] = "general"
    is_milestone: Optional[bool] = False
    is_urgent: Optional[bool] = False

    @model_validator(mode="before")
    @classmethod
    def harmonize_dates(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "deadline" in data and not data.get("due_date"):
                data["due_date"] = data["deadline"]
            elif "due_date" in data and not data.get("deadline"):
                data["deadline"] = data["due_date"]
        return data

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    deadline: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    is_milestone: Optional[bool] = None
    is_urgent: Optional[bool] = None

    @model_validator(mode="before")
    @classmethod
    def harmonize_dates(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "deadline" in data and not data.get("due_date"):
                data["due_date"] = data["deadline"]
        return data

class TaskResponse(TaskBase):
    id: str
    event_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Vendor Schemas ---
class VendorBase(BaseModel):
    name: str = Field(..., min_length=1)
    category: str = Field(default="catering")
    contact_name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    website: Optional[str] = ""
    quoted_amount: float = Field(default=0.0, ge=0.0)
    deposit_amount: float = Field(default=0.0, ge=0.0)
    deposit_paid: bool = False
    balance_due: float = Field(default=0.0, ge=0.0)
    booking_status: str = Field(default="contacted")  # shortlisted, contacted, quoted, booked, cancelled
    follow_up_date: Optional[str] = ""
    notes: Optional[str] = ""
    rating: Optional[float] = 5.0

    @model_validator(mode="before")
    @classmethod
    def harmonize_vendor_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "status" in data and not data.get("booking_status"):
                data["booking_status"] = data["status"]
            if "final_quote" in data and data.get("final_quote"):
                data["quoted_amount"] = data["final_quote"]
            elif "estimated_quote" in data and not data.get("quoted_amount"):
                data["quoted_amount"] = data["estimated_quote"]
            if "quoted_amount" in data and "deposit_amount" in data:
                deposit = data.get("deposit_amount", 0.0) if data.get("deposit_paid", False) else 0.0
                if "balance_due" not in data or data.get("balance_due") is None:
                    data["balance_due"] = max(0.0, round(float(data["quoted_amount"]) - float(deposit), 2))
        return data

class VendorCreate(VendorBase):
    pass

class VendorUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    quoted_amount: Optional[float] = Field(default=None, ge=0.0)
    deposit_amount: Optional[float] = Field(default=None, ge=0.0)
    deposit_paid: Optional[bool] = None
    balance_due: Optional[float] = Field(default=None, ge=0.0)
    booking_status: Optional[str] = None
    status: Optional[str] = None
    follow_up_date: Optional[str] = None
    notes: Optional[str] = None
    rating: Optional[float] = None

    @model_validator(mode="before")
    @classmethod
    def harmonize_vendor_update(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "status" in data and not data.get("booking_status"):
                data["booking_status"] = data["status"]
            if "final_quote" in data and data.get("final_quote") is not None:
                data["quoted_amount"] = data["final_quote"]
            elif "estimated_quote" in data and data.get("quoted_amount") is None:
                data["quoted_amount"] = data["estimated_quote"]
        return data

class VendorResponse(VendorBase):
    id: str
    event_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- AI Generation Schemas ---
class AIGenerationResponse(BaseModel):
    id: str
    event_id: str
    generation_type: str
    model: str
    status: str
    content_json: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Activity Log Schemas ---
class ActivityLogResponse(BaseModel):
    id: str
    event_id: str
    user_name: str
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    timestamp_label: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Event Schemas ---
class EventBase(BaseModel):
    name: str = Field(..., min_length=1)
    event_type: str = "Birthday"
    event_date: str
    date: Optional[str] = None  # alias
    city: Optional[str] = "Faridabad"
    venue_type: Optional[str] = "Home, restaurant or outdoor"
    guest_count: int = Field(default=40, gt=0)
    total_budget: float = Field(default=25000.0, ge=0.0)
    currency: Optional[str] = "₹"
    theme: Optional[str] = "Black and gold"
    atmosphere: Optional[str] = "Minimal, elegant"
    preferences_json: Optional[str] = "{}"
    preferences: Optional[str] = None
    dietary_requirements: Optional[str] = None
    accessibility_requirements: Optional[str] = None
    status: Optional[str] = "PLANNING"
    icon: Optional[str] = "🎉"

    @model_validator(mode="before")
    @classmethod
    def harmonize_event_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "date" in data and not data.get("event_date"):
                data["event_date"] = data["date"]
            elif "event_date" in data and not data.get("date"):
                data["date"] = data["event_date"]
            
            # Pack preference fields into preferences_json if provided
            prefs = {}
            if "preferences" in data and data["preferences"]:
                prefs["preferences"] = data["preferences"]
            if "dietary_requirements" in data and data["dietary_requirements"]:
                prefs["dietary_requirements"] = data["dietary_requirements"]
            if "accessibility_requirements" in data and data["accessibility_requirements"]:
                prefs["accessibility_requirements"] = data["accessibility_requirements"]
            if prefs and (not data.get("preferences_json") or data.get("preferences_json") == "{}"):
                data["preferences_json"] = json.dumps(prefs)
        return data

    @field_validator("event_date")
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("event_date must be in YYYY-MM-DD format")
        return v

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    name: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[str] = None
    date: Optional[str] = None
    city: Optional[str] = None
    venue_type: Optional[str] = None
    guest_count: Optional[int] = Field(default=None, gt=0)
    total_budget: Optional[float] = Field(default=None, ge=0.0)
    currency: Optional[str] = None
    theme: Optional[str] = None
    atmosphere: Optional[str] = None
    preferences_json: Optional[str] = None
    preferences: Optional[str] = None
    dietary_requirements: Optional[str] = None
    accessibility_requirements: Optional[str] = None
    status: Optional[str] = None
    icon: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def harmonize_update_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "date" in data and not data.get("event_date"):
                data["event_date"] = data["date"]
            prefs = {}
            if "preferences" in data and data["preferences"]:
                prefs["preferences"] = data["preferences"]
            if "dietary_requirements" in data and data["dietary_requirements"]:
                prefs["dietary_requirements"] = data["dietary_requirements"]
            if "accessibility_requirements" in data and data["accessibility_requirements"]:
                prefs["accessibility_requirements"] = data["accessibility_requirements"]
            if prefs:
                data["preferences_json"] = json.dumps(prefs)
        return data

class EventStats(BaseModel):
    total_milestones: int
    completed_milestones: int
    milestone_percentage: int
    total_tasks: int
    completed_tasks: int
    task_percentage: int
    total_budget: float
    budget_allocated: float
    budget_committed: float
    budget_remaining: float
    shortfall: float
    is_over_budget: bool
    total_paid_deposits: float
    total_vendors: int
    days_to_go: int
    date_warning: Optional[str] = None

class EventResponse(EventBase):
    id: str
    created_at: datetime
    updated_at: datetime
    stats: Optional[EventStats] = None

    model_config = ConfigDict(from_attributes=True)

class EventDetailResponse(EventResponse):
    budget_categories: List[BudgetCategoryResponse] = []
    expenses: List[ExpenseResponse] = []
    tasks: List[TaskResponse] = []
    vendors: List[VendorResponse] = []
    ai_generations: List[AIGenerationResponse] = []
    activity_logs: List[ActivityLogResponse] = []

    model_config = ConfigDict(from_attributes=True)

class DashboardSummaryResponse(BaseModel):
    total_events: int
    total_planned_spending: float
    total_committed_spending: float
    tasks_due_soon: List[TaskResponse] = []
    upcoming_events: List[EventResponse] = []


# --- Budget Breakdown Response ---
class CategoryBudgetSummary(BaseModel):
    category_id: Optional[str] = None
    category: str
    allocated: float
    actual: float
    deposit: float
    item_count: int
    percentage: float
    is_over_budget: bool
    variance: float

class BudgetSummaryResponse(BaseModel):
    event_id: str
    currency: str
    total_budget: float
    total_allocated: float
    total_spent: float
    total_deposits_paid: float
    remaining_balance: float
    unallocated_budget: float
    is_over_budget: bool
    shortfall: float
    reduction_suggestions: List[str] = []
    categories: List[CategoryBudgetSummary] = []
    expenses: List[ExpenseResponse] = []


# --- AI Schemas ---
class IdeaItem(BaseModel):
    title: str
    description: str
    category: Optional[str] = "Theme inspiration"
    mode: Optional[str] = "Theme inspiration"
    estimated_cost_range: Optional[str] = ""
    prep_effort: Optional[str] = ""
    required_materials: Optional[str] = ""
    why_it_suits: Optional[str] = ""
    tags: Optional[str] = ""

class IdeasListResponse(BaseModel):
    event_id: str
    generation_id: Optional[str] = None
    ideas: List[IdeaItem] = []

class AIChatRequest(BaseModel):
    event_id: Optional[str] = None
    message: str
    context: Optional[dict] = None

class AIChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = None

class AIGeneratePlanResponse(BaseModel):
    event_id: str
    recommended_theme: str
    color_palette: List[str]
    tasks_count: int
    budget_categories_count: int
    expenses_count: int
    vendors_count: int
    ideas: List[dict]
    time_remaining_days: int
    urgent_compressed_schedule: bool

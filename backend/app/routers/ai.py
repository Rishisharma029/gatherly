import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Event, AIGeneration
from ..schemas import AIChatRequest, AIChatResponse, IdeasListResponse, IdeaItem
from ..services.ai_service import chat_with_coorda

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/chat", response_model=AIChatResponse)
async def ask_coorda(request: AIChatRequest, db: Session = Depends(get_db)):
    event_context = {}
    if request.event_id:
        event = db.query(Event).filter(Event.id == request.event_id).first()
        if event:
            event_context = {
                "name": event.name,
                "type": event.event_type,
                "date": event.event_date,
                "city": event.city,
                "total_budget": event.total_budget,
                "guest_count": event.guest_count,
                "theme": event.theme,
                "tasks_count": len(event.tasks or []),
                "vendors_count": len(event.vendors or []),
                "expenses_count": len(event.expenses or [])
            }
    if request.context:
        event_context.update(request.context)

    result = await chat_with_coorda(request.message, event_context)
    return AIChatResponse(**result)

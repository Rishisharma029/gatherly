from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Event, Task, ActivityLog
from ..schemas import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(tags=["tasks"])


# 1. GET /api/events/{event_id}/tasks
@router.get("/api/events/{event_id}/tasks", response_model=List[TaskResponse])
def get_tasks(
    event_id: str,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    is_milestone: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Task).filter(Task.event_id == event_id)
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if category:
        query = query.filter(Task.category == category)
    if is_milestone is not None:
        query = query.filter(Task.is_milestone == is_milestone)

    return query.order_by(Task.due_date.asc().nullslast(), Task.created_at.asc()).all()


# 2. POST /api/events/{event_id}/tasks
@router.post("/api/events/{event_id}/tasks", response_model=TaskResponse)
def create_task(event_id: str, task_in: TaskCreate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    task_data = task_in.model_dump(exclude={"deadline"})
    task = Task(event_id=event_id, **task_data)
    db.add(task)

    log = ActivityLog(
        event_id=event_id,
        user_name="Event Planner",
        action=f'Added {"milestone" if task.is_milestone else "task"} "{task.title}"',
        entity_type="Task",
        entity_id=task.id,
        timestamp_label=datetime.utcnow().strftime("%I:%M %p").lower()
    )
    db.add(log)

    db.commit()
    db.refresh(task)
    return task


# 3. PATCH & PUT /api/tasks/{task_id}
@router.patch("/api/tasks/{task_id}", response_model=TaskResponse)
@router.put("/api/tasks/{task_id}", response_model=TaskResponse)
@router.patch("/api/events/{event_id}/tasks/{task_id}", response_model=TaskResponse)
@router.put("/api/events/{event_id}/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    task_update: TaskUpdate,
    event_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Task).filter(Task.id == task_id)
    if event_id:
        query = query.filter(Task.event_id == event_id)
    task = query.first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    old_status = task.status
    update_data = task_update.model_dump(exclude_unset=True, exclude={"deadline"})
    for key, value in update_data.items():
        setattr(task, key, value)

    task.updated_at = datetime.utcnow()

    # Log action
    action_text = f'Updated task "{task.title}"'
    if "status" in update_data and update_data["status"] != old_status:
        if update_data["status"] == "COMPLETED":
            action_text = f'Completed task "{task.title}"'
        else:
            action_text = f'Marked task "{task.title}" as {update_data["status"]}'

    log = ActivityLog(
        event_id=task.event_id,
        user_name="Event Planner",
        action=action_text,
        entity_type="Task",
        entity_id=task.id,
        timestamp_label=datetime.utcnow().strftime("%I:%M %p").lower()
    )
    db.add(log)

    db.commit()
    db.refresh(task)
    return task


# 4. DELETE /api/tasks/{task_id}
@router.delete("/api/tasks/{task_id}")
@router.delete("/api/events/{event_id}/tasks/{task_id}")
def delete_task(task_id: str, event_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Task).filter(Task.id == task_id)
    if event_id:
        query = query.filter(Task.event_id == event_id)
    task = query.first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    ev_id = task.event_id
    db.delete(task)

    log = ActivityLog(
        event_id=ev_id,
        user_name="Event Planner",
        action=f'Deleted task "{task.title}"',
        entity_type="Task",
        entity_id=task_id,
        timestamp_label=datetime.utcnow().strftime("%I:%M %p").lower()
    )
    db.add(log)

    db.commit()
    return {"message": f"Task {task_id} deleted successfully"}


from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models import Ticket

app = FastAPI(
    title="IT Helpdesk Ticket Management API",
    description="Backend API for managing IT support tickets.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)


class TicketCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5)
    category: str = Field(default="General", max_length=50)
    priority: Literal["Low", "Medium", "High", "Critical"] = "Medium"


class TicketUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = Field(default=None, min_length=5)
    category: str | None = Field(default=None, max_length=50)
    priority: Literal["Low", "Medium", "High", "Critical"] | None = None
    status: Literal["Open", "In Progress", "Resolved", "Closed"] | None = None


@app.get("/")
def home():
    return {
        "message": "Welcome to IT Helpdesk Ticket Management System",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "IT Helpdesk API"}


@app.post("/tickets", status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db),
):
    new_ticket = Ticket(
        title=ticket_data.title,
        description=ticket_data.description,
        category=ticket_data.category,
        priority=ticket_data.priority,
        status="Open",
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return {
        "id": new_ticket.id,
        "title": new_ticket.title,
        "description": new_ticket.description,
        "category": new_ticket.category,
        "priority": new_ticket.priority,
        "status": new_ticket.status,
        "created_at": new_ticket.created_at,
    }


@app.get("/tickets")
def get_all_tickets(db: Session = Depends(get_db)):
    tickets = db.query(Ticket).order_by(Ticket.id.desc()).all()
    return [
        {
            "id": ticket.id,
            "title": ticket.title,
            "description": ticket.description,
            "category": ticket.category,
            "priority": ticket.priority,
            "status": ticket.status,
            "created_at": ticket.created_at,
            "updated_at": ticket.updated_at,
        }
        for ticket in tickets
    ]


@app.get("/tickets/{ticket_id}")
def get_ticket_by_id(
    ticket_id: int,
    db: Session = Depends(get_db),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )
    return {
        "id": ticket.id,
        "title": ticket.title,
        "description": ticket.description,
        "category": ticket.category,
        "priority": ticket.priority,
        "status": ticket.status,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
    }


@app.patch("/tickets/{ticket_id}")
def update_ticket(
    ticket_id: int,
    ticket_data: TicketUpdate,
    db: Session = Depends(get_db),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )
    updates = ticket_data.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )
    if any(value is None for value in updates.values()):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Ticket fields cannot be null",
        )
    for field, value in updates.items():
        setattr(ticket, field, value)
    db.commit()
    db.refresh(ticket)
    return {
        "id": ticket.id,
        "title": ticket.title,
        "description": ticket.description,
        "category": ticket.category,
        "priority": ticket.priority,
        "status": ticket.status,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
    }


@app.delete(
    "/tickets/{ticket_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )
    db.delete(ticket)
    db.commit()

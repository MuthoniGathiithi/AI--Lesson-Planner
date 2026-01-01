from sqlalchemy import Column, Integer, String, DateTime, UUID, ForeignKey
from sqlalchemy.sql import func
from .database import Base
import uuid

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    grade = Column(String, index=True)
    subject = Column(String, index=True)
    topic = Column(String, index=True)
    content = Column(String)
    user_id = Column(UUID(as_uuid=True), index=True)  # In a real app, this would be a ForeignKey to users table
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

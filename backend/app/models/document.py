from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.db.base_class import Base

class DocumentType(enum.Enum):
    PDF = "pdf"
    TEXT = "txt"
    DOCUMENT = "doc"
    IMAGE = "image"

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    file_type = Column(Enum(DocumentType), nullable=False)
    content = Column(Text)  # Extracted text content
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="documents")
    tests = relationship("Test", back_populates="document")
    
    def __repr__(self):
        return f"<Document {self.title}>" 
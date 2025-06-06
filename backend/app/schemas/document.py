from typing import Optional
from pydantic import BaseModel
from app.models.document import DocumentType

class DocumentBase(BaseModel):
    title: str

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(DocumentBase):
    title: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int
    file_path: str
    file_type: DocumentType
    content: Optional[str] = None
    user_id: int

    class Config:
        from_attributes = True 
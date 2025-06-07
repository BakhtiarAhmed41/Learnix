from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentCreate, DocumentResponse
from app.services.document_processor import DocumentProcessor

router = APIRouter()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    file: UploadFile = File(...),
    title: str,
) -> Any:
    """
    Upload a new document.
    """
    # Initialize document processor
    processor = DocumentProcessor()
    
    try:
        # Save and process the uploaded file
        file_path, doc_type = await processor.save_upload_file(file)
        
        # Extract text content
        content = processor.extract_text(file_path, doc_type)
        
        # Create document record
        document = Document(
            title=title,
            file_path=file_path,
            file_type=doc_type,
            content=content,
            user_id=current_user.id
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        # Clean up temporary file
        processor.cleanup_file(file_path)
        
        return document
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error processing document: {str(e)}"
        )

@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve documents for the current user.
    """
    documents = db.query(Document).filter(
        Document.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return documents

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    document_id: int,
) -> Any:
    """
    Get a specific document by ID.
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )
    
    return document

@router.delete("/{document_id}")
def delete_document(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    document_id: int,
) -> Any:
    """
    Delete a document.
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )
    
    # Delete the file
    processor = DocumentProcessor()
    processor.cleanup_file(document.file_path)
    
    # Delete the database record
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"} 
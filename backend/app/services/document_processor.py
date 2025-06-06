import os
from typing import Optional
from fastapi import UploadFile
from PyPDF2 import PdfReader
import pytesseract
from PIL import Image
import magic
from app.core.config import settings
from app.models.document import DocumentType

class DocumentProcessor:
    def __init__(self):
        self.upload_dir = "uploads"
        os.makedirs(self.upload_dir, exist_ok=True)
    
    async def save_upload_file(self, upload_file: UploadFile) -> tuple[str, DocumentType]:
        """Save uploaded file and return file path and type."""
        file_path = os.path.join(self.upload_dir, upload_file.filename)
        
        # Save file
        with open(file_path, "wb") as f:
            content = await upload_file.read()
            f.write(content)
        
        # Determine file type
        mime = magic.Magic(mime=True)
        file_type = mime.from_file(file_path)
        
        # Map MIME type to DocumentType
        if file_type == "application/pdf":
            doc_type = DocumentType.PDF
        elif file_type.startswith("image/"):
            doc_type = DocumentType.IMAGE
        elif file_type == "text/plain":
            doc_type = DocumentType.TEXT
        else:
            doc_type = DocumentType.DOCUMENT
        
        return file_path, doc_type
    
    def extract_text(self, file_path: str, doc_type: DocumentType) -> Optional[str]:
        """Extract text content from document based on its type."""
        try:
            if doc_type == DocumentType.PDF:
                return self._extract_from_pdf(file_path)
            elif doc_type == DocumentType.IMAGE:
                return self._extract_from_image(file_path)
            elif doc_type == DocumentType.TEXT:
                return self._extract_from_text(file_path)
            else:
                return None
        except Exception as e:
            print(f"Error extracting text: {str(e)}")
            return None
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file."""
        text = ""
        with open(file_path, "rb") as f:
            pdf = PdfReader(f)
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return text
    
    def _extract_from_image(self, file_path: str) -> str:
        """Extract text from image using OCR."""
        image = Image.open(file_path)
        return pytesseract.image_to_string(image)
    
    def _extract_from_text(self, file_path: str) -> str:
        """Extract text from text file."""
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    
    def cleanup_file(self, file_path: str):
        """Remove temporary file after processing."""
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error removing file: {str(e)}") 
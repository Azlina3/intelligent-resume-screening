from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ResumeUploadResponse(BaseModel):
    message: str
    filename: str
    status: str

@router.get("/health")
def health_check():
    """Check if the API is running correctly"""
    return {"status": "ok", "service": "Intelligent Resume Screening API"}

@router.post("/resume/parse", response_model=ResumeUploadResponse)
def parse_resume(filename: str = "example.pdf"):
    """
    Placeholder endpoint for resume parsing. 
    Later, this will accept a file upload, extract text, and call an AI service.
    """
    return {
        "message": "Resume received successfully. Parsing will be implemented here.",
        "filename": filename,
        "status": "processing"
    }

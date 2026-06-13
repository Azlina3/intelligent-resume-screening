import os
import io
import json
import pdfplumber
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Intelligent Resume Screening API",
    description="Backend API for parsing resumes using Google GenAI",
    version="1.0.0"
)

# Configure CORS to allow all origins for seamless integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Skills(BaseModel):
    technical: List[str] = Field(description="Array of technical stacks, frameworks, tool keywords, and specific programming languages found.")
    soft: List[str] = Field(description="Array of behavioral soft skills (max 3-5).")

class Language(BaseModel):
    language: str = Field(description="The language name (e.g., English, Mandarin).")
    proficiency: str = Field(description="The proficiency level (e.g., Professional, Native, Basic).")

class WorkExperience(BaseModel):
    company: str = Field(description="The name of the company.")
    role: str = Field(description="The job title or role.")
    duration_months: int = Field(description="Calculated duration of employment in months.")
    summary: str = Field(description="A concise summary of responsibilities and impact in this role.")

# Define the Structured Data Schema using Pydantic
class ExtractedResume(BaseModel):
    full_name: Optional[str] = Field(None, description="The candidate's full name.")
    email: Optional[str] = Field(None, description="Contact email address.")
    phone: Optional[str] = Field(None, description="Primary telephone or contact number.")
    highest_education: str = Field(description="Highest qualification achieved (e.g., Bachelor's Degree in Computer Science, Diploma).")
    years_of_experience: int = Field(description="Calculated total years of relevant domain work experience across all roles.")
    portfolio_links: List[str] = Field(default=[], description="Array of raw URLs like GitHub or LinkedIn profiles.")
    skills: Skills = Field(description="Separated technical and soft skills.")
    work_experience: List[WorkExperience] = Field(description="Structured list of distinct past employment and roles.")
    languages: List[Language] = Field(default=[], description="List of languages known and proficiency levels.")
    achievements: List[str] = Field(default=[], description="List of notable achievements, awards, or hackathon wins.")

@app.post("/api/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    # 1. Basic File Validation
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are accepted.")
    
    # 2. Read file bytes directly (no pdfplumber needed anymore!)
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")
        
    # 3. Parse Document natively using Google GenAI (Supports Image-based PDFs!)
    try:
        client = genai.Client() # Assumes GEMINI_API_KEY is available in environment
        
        prompt = """
        You are an elite AI parsing agent. Your task is to read the attached candidate's resume document, 
        and strictly map it into the defined JSON structure. Extract all relevant information accurately.

        Important Guidelines:
        1. Soft Skills: Extract a maximum of 3-5 behavioral soft skills (e.g., "Public Speaking," "Team Leadership") only if they are explicitly supported by facts in the resume text.
        2. Portfolio Links: Search the header block of the document for any string matching patterns like github.com/* or linkedin.com/in/*. Extract these raw URLs into a standalone string array called portfolio_links.
        3. Work Experience: Loop through their timeline and output a list of structured objects (Company Name, Role Title, duration_months, summary). Ensure the total `years_of_experience` matches the sum of these durations.
        4. Achievements: Extract qualitative achievements (like hackathons, awards, scholarships) into an array of strings.
        5. Languages: Extract known languages and proficiencies if listed.
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(data=file_bytes, mime_type='application/pdf'),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ExtractedResume,
                temperature=0.1, # Low temperature for more deterministic, fact-based extraction
            ),
        )
        
        # The response.text is guaranteed by the SDK to be a JSON string matching the ExtractedResume schema
        parsed_data = json.loads(response.text)
        return parsed_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI parsing connection or generation failed: {str(e)}")

# Add a fast Uvicorn entry block
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

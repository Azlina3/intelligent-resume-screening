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

class Education(BaseModel):
    raw_title: str = Field(description="The exact title of the degree or qualification.")
    normalized_category: str = Field(description="One of: 'No Requirement', 'SPM / O-Level', 'Diploma', 'Bachelor\\'s Degree', 'Master\\'s Degree', 'PhD'.")
    semantic_relevance_score: float = Field(description="A score from 0.0 to 1.0 indicating how relevant this degree is to the tech industry/software development. 1.0 for Computer Science, 0.8 for IT, 0.5 for Engineering, 0.2 for Business, etc.")

class CalculatedMetrics(BaseModel):
    total_epe_months: int = Field(description="Equivalent Professional Experience in months. Formal jobs/internships = 1x duration. Major academic projects = 0.7x weight. Hackathons = 0.5x weight.")


# Define the Structured Data Schema using Pydantic
class ExtractedResume(BaseModel):
    full_name: Optional[str] = Field(None, description="The candidate's full name.")
    email: Optional[str] = Field(None, description="Contact email address.")
    phone: Optional[str] = Field(None, description="Primary telephone or contact number.")
    education: Education = Field(description="Details of the highest education achieved.")
    calculated_metrics: CalculatedMetrics = Field(description="Calculated Equivalent Professional Experience (EPE).")
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
        3. Work Experience: Loop through their timeline and output a list of structured objects (Company Name, Role Title, duration_months, summary).
        4. Achievements: Extract qualitative achievements (like hackathons, awards, scholarships) into an array of strings.
        5. Languages: Extract known languages and proficiencies if listed.
        6. Equivalent Professional Experience (EPE): Calculate `total_epe_months`. Formal jobs/internships = 1x duration. Major academic projects = 0.7x duration. Hackathons = 0.5x duration (e.g., 1 month * 0.5 = 0.5 months). Sum these up in months.
        7. Education: Identify highest education. Provide `raw_title`. Map to `normalized_category` (must be exactly one of: 'No Requirement', 'SPM / O-Level', 'Diploma', 'Bachelor\\'s Degree', 'Master\\'s Degree', 'PhD'). Estimate `semantic_relevance_score` between 0.0 and 1.0 based on relevance to tech/software.
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

class EmbedRequest(BaseModel):
    skills: List[str]

@app.post("/api/embed-skills")
async def embed_skills(request: EmbedRequest):
    """
    Receives a list of skill strings and returns their 768-dimensional float arrays
    using Google's text-embedding-004 model.
    """
    try:
        client = genai.Client()
        if not request.skills:
            return {"embeddings": []}
            
        response = client.models.embed_content(
            model='gemini-embedding-001',
            contents=request.skills,
            config=types.EmbedContentConfig(output_dimensionality=768)
        )
        # response.embeddings is a list of Embedding objects. We extract the values.
        # Since we passed a list of strings, it should return a list of embeddings.
        vector_arrays = [e.values for e in response.embeddings]
        
        return {"embeddings": vector_arrays}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate embeddings: {str(e)}")

# Add a fast Uvicorn entry block
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

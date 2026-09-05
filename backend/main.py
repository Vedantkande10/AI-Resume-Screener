from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import fitz
from docx import Document
import io
import os
import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from passlib.context import CryptContext
import bcrypt
from jose import JWTError, jwt

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = FastAPI(title="AI Resume Screener API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-resume-screener-frontend-zus2.onrender.com",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_API_BASE = os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1")
LLM_MODEL = os.environ.get("LLM_MODEL", "gpt-3.5-turbo")
MAX_TOKENS = 2000

SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./ai_resume_screener.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_description = Column(Text, nullable=False)
    resume_texts = Column(Text, nullable=False)
    analysis_results = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="applications")


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_password_hash(password: str) -> str:
    password_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        password_bytes = plain_password.encode("utf-8")[:72]
        return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


def _call_llm(messages):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}",
    }
    payload = {
        "model": LLM_MODEL,
        "messages": messages,
        "max_tokens": MAX_TOKENS,
        "temperature": 0.3,
    }
    data = json.dumps(payload).encode("utf-8")
    url = f"{OPENAI_API_BASE.rstrip('/')}/chat/completions"
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=60) as resp:
        raw = resp.read().decode("utf-8")
    result = json.loads(raw)
    return result["choices"][0]["message"]["content"].strip()


def _safe_json_parse(text):
    try:
        return json.loads(text)
    except Exception:
        return None


@app.get("/")
def home():
    return {
        "message": "AI Resume Screener Backend is running!"
    }


@app.post("/auth/register")
def register(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=email,
        hashed_password=get_password_hash(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
        }
    }


@app.post("/auth/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
        }
    }


@app.get("/auth/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "created_at": current_user.created_at,
    }


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):

    contents = await file.read()

    filename = file.filename.lower()

    if filename.endswith(".pdf"):

        pdf = fitz.open(
            stream=contents,
            filetype="pdf"
        )

        text = ""

        for page in pdf:
            text += page.get_text()

        pdf.close()

    elif filename.endswith(".docx"):

        document = Document(
            io.BytesIO(contents)
        )

        text = "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
        )

    elif filename.endswith(".txt"):

        text = contents.decode("utf-8")

    else:

        return {
            "error": "Only PDF, DOCX and TXT files are supported."
        }

    return {
        "filename": file.filename,
        "message": "Resume uploaded successfully",
        "text": text
    }


@app.post("/analyze-resume")
async def analyze_resume(
    job_description: str = Form(...),
    resume_text: str = Form(...),
):
    if not OPENAI_API_KEY:
        return JSONResponse(
            status_code=503,
            content={
                "error": "LLM_API_KEY_NOT_SET",
                "message": (
                    "OpenAI API key is not configured on the server. "
                    "Set the OPENAI_API_KEY environment variable."
                ),
            },
        )

    system_prompt = (
        "You are an expert AI resume screening assistant. "
        "You analyze how well a candidate's resume matches a given job "
        "description. You respond in valid JSON only."
    )

    user_prompt = (
        "Job Description:\n"
        f"{job_description.strip()}\n\n"
        "Candidate Resume:\n"
        f"{resume_text.strip()}\n\n"
        "Analyze the match between the resume and the job description. "
        "Return a JSON object with these exact fields:\n"
        '- "match_percentage": integer 0-100\n'
        '- "summary": string (2-3 sentence overall fit)\n'
        '- "strengths": array of strings (resume items that align with the job)\n'
        '- "gaps": array of strings (job requirements missing/weak in resume)\n'
        "Output ONLY valid JSON, no markdown or commentary."
    )

    try:
        raw_response = _call_llm([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ])

        parsed = _safe_json_parse(raw_response)
        if parsed is None:
            return JSONResponse(
                status_code=502,
                content={
                    "error": "LLM_PARSE_ERROR",
                    "message": "LLM response was not valid JSON.",
                    "raw_response": raw_response[:1000],
                },
            )

        match_percentage = int(parsed.get("match_percentage", 0))
        if match_percentage < 0:
            match_percentage = 0
        if match_percentage > 100:
            match_percentage = 100

        return {
            "match_percentage": match_percentage,
            "summary": parsed.get("summary", ""),
            "strengths": parsed.get("strengths", []),
            "gaps": parsed.get("gaps", []),
            "model": LLM_MODEL,
        }

    except urllib.error.HTTPError as e:
        return JSONResponse(
            status_code=502,
            content={
                "error": "LLM_API_ERROR",
                "message": f"LLM API request failed: HTTP {e.code}",
            },
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "error": "LLM_INTERNAL_ERROR",
                "message": str(e),
            },
        )


@app.post("/applications")
def save_application(
    job_description: str = Form(...),
    resume_texts: str = Form(...),
    analysis_results: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = Application(
        user_id=current_user.id,
        job_description=job_description,
        resume_texts=resume_texts,
        analysis_results=analysis_results,
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    return {
        "id": application.id,
        "user_id": application.user_id,
        "job_description": application.job_description,
        "resume_texts": application.resume_texts,
        "analysis_results": application.analysis_results,
        "created_at": application.created_at,
    }


@app.get("/applications")
def list_applications(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    applications = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .order_by(Application.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {
        "applications": [
            {
                "id": app.id,
                "job_description": app.job_description,
                "resume_texts": app.resume_texts,
                "analysis_results": app.analysis_results,
                "created_at": app.created_at,
            }
            for app in applications
        ]
    }


@app.get("/applications/{application_id}")
def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if application.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this application")

    return {
        "id": application.id,
        "job_description": application.job_description,
        "resume_texts": application.resume_texts,
        "analysis_results": application.analysis_results,
        "created_at": application.created_at,
    }

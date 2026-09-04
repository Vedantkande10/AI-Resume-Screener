from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import fitz
from docx import Document
import io
import os
import json
import urllib.request
import urllib.error

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


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):

    contents = await file.read()

    filename = file.filename.lower()

    # -------------------------
    # PDF
    # -------------------------
    if filename.endswith(".pdf"):

        pdf = fitz.open(
            stream=contents,
            filetype="pdf"
        )

        text = ""

        for page in pdf:
            text += page.get_text()

        pdf.close()

    # -------------------------
    # DOCX
    # -------------------------
    elif filename.endswith(".docx"):

        document = Document(
            io.BytesIO(contents)
        )

        text = "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
        )

    # -------------------------
    # TXT
    # -------------------------
    elif filename.endswith(".txt"):

        text = contents.decode("utf-8")

    # -------------------------
    # Unsupported file
    # -------------------------
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

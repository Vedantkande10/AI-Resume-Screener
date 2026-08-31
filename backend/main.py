from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import fitz
from docx import Document
import io

app = FastAPI(title="AI Resume Screener API")


# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
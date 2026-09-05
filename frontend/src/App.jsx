import { useState, useCallback } from "react";
import "./App.css";
import ComparisonGraph from "./components/ComparisonGraph.jsx";
import HistoryList from "./components/HistoryList.jsx";
import ApplicationDetails from "./components/ApplicationDetails.jsx";
import Login from "./Login.jsx";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("access_token");
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.reload();
  }

  return response;
}
// ==================================================
// SKILL MATCH PIE CHART
// ==================================================

function SkillMatchPie({ matchedCount, requiredCount }) {
  const matched = Number(matchedCount) || 0;
  const required = Number(requiredCount) || 0;

  const matchPercentage =
    required > 0
      ? Math.round((matched / required) * 100)
      : 0;

  const missingPercentage = 100 - matchPercentage;

  return (
    <div className="skill-pie-container">
      <div
        className="skill-pie"
        style={{
          background: `conic-gradient(
            #5b63f6 0% ${matchPercentage}%,
            #e8ebf5 ${matchPercentage}% 100%
          )`,
        }}
      >
        <div className="skill-pie-inner">
          <strong>{matchPercentage}%</strong>
          <span>Skill Match</span>
        </div>
      </div>

      <div className="skill-pie-legend">
        <div>
          <span className="legend-dot matched"></span>
          Matched: {matched}
        </div>

        <div>
          <span className="legend-dot missing"></span>
          Missing: {required - matched}
        </div>
      </div>
    </div>
  );
}

const skillKeywords = {
  Python: {
    keywords: ["python"],
    weight: 5,
  },

  JavaScript: {
    keywords: ["javascript", "js"],
    weight: 4,
  },

  React: {
    keywords: ["react", "react.js", "reactjs"],
    weight: 5,
  },

  SQL: {
    keywords: ["sql"],
    weight: 4,
  },

  Git: {
    keywords: ["git", "github", "gitlab"],
    weight: 2,
  },

  "REST API": {
    keywords: ["rest api", "restful api"],
    weight: 4,
  },

  Django: {
    keywords: ["django"],
    weight: 4,
  },

  FastAPI: {
    keywords: ["fastapi", "fast api"],
    weight: 4,
  },

  HTML: {
    keywords: ["html", "html5"],
    weight: 2,
  },

  CSS: {
    keywords: ["css", "css3"],
    weight: 2,
  },

  Java: {
    keywords: ["java"],
    weight: 5,
  },

  "C++": {
    keywords: ["c++", "cpp"],
    weight: 5,
  },

  "Machine Learning": {
    keywords: ["machine learning", "machine-learning"],
    weight: 5,
  },

  Pandas: {
    keywords: ["pandas"],
    weight: 3,
  },

  NumPy: {
    keywords: ["numpy"],
    weight: 3,
  },

  "Spring Boot": {
    keywords: ["spring boot"],
    weight: 5,
  },

  MySQL: {
    keywords: ["mysql"],
    weight: 4,
  },

  Docker: {
    keywords: ["docker"],
    weight: 3,
  },

  Kubernetes: {
    keywords: ["kubernetes", "k8s"],
    weight: 3,
  },

  "Node.js": {
    keywords: ["node.js", "nodejs", "node js"],
    weight: 5,
  },

  Express: {
    keywords: ["express.js", "expressjs", "express"],
    weight: 4,
  },

  MongoDB: {
    keywords: ["mongodb", "mongo db"],
    weight: 4,
  },

  PostgreSQL: {
    keywords: ["postgresql", "postgres"],
    weight: 4,
  },

  Flask: {
    keywords: ["flask"],
    weight: 4,
  },

  TypeScript: {
    keywords: ["typescript"],
    weight: 4,
  },

  Angular: {
    keywords: ["angular"],
    weight: 4,
  },

  AWS: {
    keywords: ["aws", "amazon web services"],
    weight: 4,
  },

  Azure: {
    keywords: ["azure", "microsoft azure"],
    weight: 4,
  },

  Linux: {
    keywords: ["linux"],
    weight: 2,
  },

  Firebase: {
    keywords: ["firebase"],
    weight: 3,
  },

  PHP: {
    keywords: ["php"],
    weight: 4,
  },

  Laravel: {
    keywords: ["laravel"],
    weight: 4,
  },

  ".NET": {
    keywords: [".net", "dotnet", "asp.net"],
    weight: 5,
  },

  "Power BI": {
    keywords: ["power bi"],
    weight: 4,
  },

  Excel: {
    keywords: ["excel", "microsoft excel"],
    weight: 2,
  },

  "Data Analysis": {
    keywords: ["data analysis", "data analytics"],
    weight: 4,
  },

  "Deep Learning": {
    keywords: ["deep learning"],
    weight: 5,
  },

  TensorFlow: {
    keywords: ["tensorflow"],
    weight: 4,
  },

  PyTorch: {
    keywords: ["pytorch"],
    weight: 4,
  },

  NLP: {
    keywords: [
      "nlp",
      "natural language processing",
    ],
    weight: 5,
  },

  "Computer Vision": {
    keywords: ["computer vision"],
    weight: 5,
  },
};


// --------------------------------------------------
// Create a safe regular expression for skill matching
// --------------------------------------------------

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


function containsSkill(text, keyword) {
  const escaped = escapeRegex(keyword.trim());

  /*
    This prevents false matches.

    Example:
    "java" will match:
       Java

    But will NOT match:
       JavaScript
       javascriptdeveloper
  */

  const pattern = new RegExp(
    `(?:^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`,
    "i"
  );

  return pattern.test(text);
}


// --------------------------------------------------
// Find whether a skill exists in text
// --------------------------------------------------

function skillExists(text, keywords) {
  return keywords.some((keyword) =>
    containsSkill(text, keyword)
  );
}


// --------------------------------------------------
// Recommendation
// --------------------------------------------------

function getRecommendation(score) {
  if (score >= 85) {
    return {
      text: "Highly Recommended",
      className: "recommendation excellent",
    };
  }

  if (score >= 70) {
    return {
      text: "Recommended",
      className: "recommendation good",
    };
  }

  if (score >= 50) {
    return {
      text: "Consider",
      className: "recommendation average",
    };
  }

  return {
    text: "Not Recommended",
    className: "recommendation poor",
  };
}


// --------------------------------------------------
// Main App
// --------------------------------------------------

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  const [email, setEmail] = useState("");

  // APPLICATION
  const [resumes, setResumes] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [view, setView] = useState("dashboard");
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  const handleLogin = (user) => {
    setIsLoggedIn(true);
  };


  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setResumes([]);
    setAnalysisResults([]);
    setJobDescription("");
    setView("dashboard");
    setSelectedApplicationId(null);
  };


  const saveResultsToBackend = async () => {
    if (!analysisResults || analysisResults.length === 0) {
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      const formData = new FormData();
      formData.append("job_description", jobDescription);
      formData.append("resume_texts", JSON.stringify(resumes.map(r => r.name)));
      formData.append("analysis_results", JSON.stringify(analysisResults));

      const response = await apiCall("/applications", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to save results");
      }

      setSaveMessage("Results saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setSaveMessage("Failed to save results");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewHistory = () => {
    setView("history");
    setSelectedApplicationId(null);
  };

  const handleViewApplication = (id) => {
    setSelectedApplicationId(id);
    setView("details");
  };

  const handleBackToDashboard = () => {
    setView("dashboard");
    setSelectedApplicationId(null);
  };

  // --------------------------------------------------
  // UPLOAD RESUMES
  // --------------------------------------------------

  const handleResumeUpload = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    const allowedFiles = files.filter((file) => {
      const name = file.name.toLowerCase();

      return (
        name.endsWith(".pdf") ||
        name.endsWith(".docx") ||
        name.endsWith(".doc") ||
        name.endsWith(".txt")
      );
    });

    if (allowedFiles.length !== files.length) {
      alert(
        "Some files were ignored. Please upload PDF, DOC, DOCX or TXT files."
      );
    }

    setResumes(allowedFiles);

    // Clear old results
    setAnalysisResults([]);

    setErrorMessage("");
  };


  // --------------------------------------------------
  // REMOVE RESUME
  // --------------------------------------------------

  const removeResume = (index) => {
    setResumes((currentResumes) =>
      currentResumes.filter((_, i) => i !== index)
    );

    setAnalysisResults([]);
  };


  // --------------------------------------------------
  // ANALYZE RESUMES
  // --------------------------------------------------


const handleAnalyze = async () => {
  setErrorMessage("");

  // --------------------------------------------
  // 1. BASIC VALIDATION
  // --------------------------------------------
  if (resumes.length === 0) {
    alert("Please upload at least one resume.");
    return;
  }

  if (!jobDescription.trim()) {
    alert("Please enter the job description.");
    return;
  }

  setIsAnalyzing(true);
  setAnalysisResults([]);

  try {
    // --------------------------------------------
    // 2. NORMALIZE JOB DESCRIPTION
    // --------------------------------------------
    const jobText = jobDescription
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    // --------------------------------------------
    // 3. FUNCTION TO CHECK SKILLS
    //    Prevents false matches
    // --------------------------------------------
    // --------------------------------------------
// 3. ROBUST KEYWORD MATCHING
// --------------------------------------------

// --------------------------------------------
// 3. ROBUST KEYWORD MATCHING
// --------------------------------------------

const containsKeyword = (text, keyword) => {

  if (!text || !keyword) {
    return false;
  }

  // Normalize resume/job text
  const normalizedText = text
    .toLowerCase()
    .replace(/[•●▪]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Normalize keyword
  const normalizedKeyword = keyword
    .toLowerCase()
    .replace(/[._-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Direct matching
  if (normalizedText.includes(normalizedKeyword)) {
    return true;
  }

  // Escape special regex characters
  const escapedKeyword = normalizedKeyword.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  // Allow spaces, dots and hyphens between words
  const flexibleKeyword = escapedKeyword.replace(
    /\s+/g,
    "[\\s._-]*"
  );

  const regex = new RegExp(
    `(^|[^a-z0-9])${flexibleKeyword}([^a-z0-9]|$)`,
    "i"
  );

  return regex.test(normalizedText);
};

    // --------------------------------------------
    // 4. FIND REQUIRED SKILLS FROM JOB DESCRIPTION
    // --------------------------------------------
    const requiredSkills = Object.keys(skillKeywords).filter((skill) => {

  return skillKeywords[skill].keywords.some((keyword) =>
    containsKeyword(jobText, keyword)
  );

});

    console.log("Required Skills:", requiredSkills);

    // --------------------------------------------
    // 5. FIND REQUIRED EXPERIENCE FROM JOB
    // --------------------------------------------
    const extractRequiredExperience = (text) => {
      const patterns = [
        /(\d+)\s*\+?\s*years?\s*(?:of)?\s*(?:relevant\s*)?(?:professional\s*)?experience/i,
        /(\d+)\s*\+?\s*years?\s*(?:of)?\s*experience/i,
        /minimum\s*(?:of)?\s*(\d+)\s*years?/i,
        /at\s*least\s*(\d+)\s*years?/i,
        /(\d+)\s*\+?\s*yrs?/i,
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);

        if (match) {
          return Number(match[1]);
        }
      }

      return 0;
    };

    const requiredExperience = extractRequiredExperience(jobText);

    console.log(
      "Required Experience:",
      requiredExperience,
      "years"
    );

    // --------------------------------------------
    // 6. UPLOAD / EXTRACT ALL RESUMES
    // --------------------------------------------
    const resumeData = [];

    for (const resume of resumes) {
      try {
        const formData = new FormData();
        formData.append("file", resume);

        const response = await fetch(
          `${API_BASE_URL}/upload-resume`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Backend returned ${response.status} for ${resume.name}`
          );
        }

        const data = await response.json();
        console.log("BACKEND RESPONSE:", data);
console.log("EXTRACTED RESUME TEXT:", data.text);

        const resumeText = (data.text || "")
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

        console.log(`Resume text for ${resume.name}:`, resumeText);

        // --------------------------------------------
        // 7. MATCH REQUIRED SKILLS
        // --------------------------------------------
        const matchedSkills = requiredSkills.filter((skill) => {

  return skillKeywords[skill].keywords.some((keyword) =>
    containsKeyword(resumeText, keyword)
  );

});

        const missingSkills = requiredSkills.filter(
          (skill) => !matchedSkills.includes(skill)
        );

        // --------------------------------------------
        // 8. CALCULATE SKILL SCORE
        // --------------------------------------------
        const skillScore =
          requiredSkills.length > 0
            ? (matchedSkills.length / requiredSkills.length) * 100
            : 0;

        // --------------------------------------------
        // 9. EXTRACT CANDIDATE EXPERIENCE
        // --------------------------------------------
        const extractCandidateExperience = (text) => {
          const patterns = [
            /(\d+)\s*\+?\s*years?\s*(?:of)?\s*(?:relevant\s*)?(?:professional\s*)?experience/i,
            /(\d+)\s*\+?\s*years?\s*(?:of)?\s*experience/i,
            /experience\s*[:\-]?\s*(\d+)\s*\+?\s*years?/i,
            /(\d+)\s*\+?\s*yrs?\s*(?:of)?\s*experience/i,
          ];

          for (const pattern of patterns) {
            const match = text.match(pattern);

            if (match) {
              return Number(match[1]);
            }
          }

          // ----------------------------------------
          // Try to calculate experience from dates
          // Example:
          // 2020 - 2024
          // 2021 - Present
          // ----------------------------------------
          const dateMatches = [
            ...text.matchAll(
              /(20\d{2})\s*[-–]\s*(20\d{2}|present)/gi
            ),
          ];

          if (dateMatches.length > 0) {
            let totalYears = 0;

            dateMatches.forEach((match) => {
              const startYear = Number(match[1]);

              const endYear =
                match[2].toLowerCase() === "present"
                  ? new Date().getFullYear()
                  : Number(match[2]);

              if (endYear >= startYear) {
                totalYears += endYear - startYear;
              }
            });

            return totalYears;
          }

          return 0;
        };

        const experienceYears =
          extractCandidateExperience(resumeText);

        // --------------------------------------------
        // 10. AI ANALYSIS
        // --------------------------------------------
        let aiMatchPercentage = null;
        let aiSummary = "";
        let aiStrengths = [];
        let aiGaps = [];

        try {
          const aiFormData = new FormData();
          aiFormData.append(
            "job_description",
            jobDescription
          );
          aiFormData.append("resume_text", data.text || "");

          const aiResponse = await fetch(
            `${API_BASE_URL}/analyze-resume`,
            {
              method: "POST",
              body: aiFormData,
            }
          );

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            aiMatchPercentage = aiData.match_percentage;
            aiSummary = aiData.summary || "";
            aiStrengths = aiData.strengths || [];
            aiGaps = aiData.gaps || [];
          } else if (aiResponse.status === 503) {
            console.warn(
              "AI analysis unavailable (API key not set)."
            );
          } else {
            console.error(
              "AI analysis failed:",
              aiResponse.status
            );
          }
        } catch (aiError) {
          console.error(
            "AI analysis error for resume:",
            aiError
          );
        }

        // --------------------------------------------
        // 11. STORE RAW RESULT
        // --------------------------------------------
        resumeData.push({
          fileName: resume.name,
          score: 0,
          skillScore: Math.round(skillScore),
          experienceScore: 0,
          experienceYears: experienceYears,
          requiredExperience: requiredExperience,
          matchedSkills: matchedSkills,
          missingSkills: missingSkills,
          recommendation: "",
          aiMatchPercentage: aiMatchPercentage,
          aiSummary: aiSummary,
          aiStrengths: aiStrengths,
          aiGaps: aiGaps,
        });
      } catch (resumeError) {
        console.error(
          `Error analyzing ${resume.name}:`,
          resumeError
        );

        resumeData.push({
          fileName: resume.name,
          score: 0,
          skillScore: 0,
          experienceScore: 0,
          experienceYears: 0,
          requiredExperience: requiredExperience,
          matchedSkills: [],
          missingSkills: requiredSkills,
          recommendation: "Analysis Failed",
          error: resumeError.message,
          aiMatchPercentage: null,
          aiSummary: "",
          aiStrengths: [],
          aiGaps: [],
        });
      }
    }

    // --------------------------------------------
    // 11. CALCULATE EXPERIENCE SCORE
    // --------------------------------------------

    const maxCandidateExperience = Math.max(
      ...resumeData.map((candidate) => candidate.experienceYears),
      1
    );

    resumeData.forEach((candidate) => {
      let experienceScore = 0;

      // ------------------------------------------
      // CASE A:
      // Job description contains experience
      // requirement
      // ------------------------------------------
      if (requiredExperience > 0) {
        if (candidate.experienceYears >= requiredExperience) {
          experienceScore = 100;
        } else {
          experienceScore =
            (candidate.experienceYears / requiredExperience) * 100;
        }
      }

      // ------------------------------------------
      // CASE B:
      // Job description does NOT contain
      // experience requirement
      // Compare candidates with each other
      // ------------------------------------------
      else {
        experienceScore =
          (candidate.experienceYears /
            maxCandidateExperience) *
          100;
      }

      candidate.experienceScore = Math.round(
        Math.min(experienceScore, 100)
      );
    });

    // --------------------------------------------
    // 12. FINAL SCORE
    //
    // KEYWORD SCORE = SKILLS 70% + EXPERIENCE 30%
    // AI SCORE      = 40% (when available)
    // FINAL         = KEYWORD 60% + AI 40%
    // --------------------------------------------
    resumeData.forEach((candidate) => {
      const keywordScore =
        candidate.skillScore * 0.70 +
        candidate.experienceScore * 0.30;

      const hasAiScore =
        candidate.aiMatchPercentage !== null &&
        candidate.aiMatchPercentage !== undefined;

      const finalScore = hasAiScore
        ? keywordScore * 0.6 +
          candidate.aiMatchPercentage * 0.4
        : keywordScore;

      candidate.score = Math.round(finalScore);

      // ------------------------------------------
      // RECOMMENDATION
      // ------------------------------------------
      if (candidate.score >= 80) {
        candidate.recommendation = "Highly Recommended";
      } else if (candidate.score >= 65) {
        candidate.recommendation = "Recommended";
      } else if (candidate.score >= 50) {
        candidate.recommendation = "Consider";
      } else {
        candidate.recommendation = "Not Recommended";
      }
    });

    // --------------------------------------------
    // 13. SORT CANDIDATES
    // --------------------------------------------
    resumeData.sort((a, b) => {
      // First priority: final score
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      // Second priority: skill score
      if (b.skillScore !== a.skillScore) {
        return b.skillScore - a.skillScore;
      }

      // Third priority: experience
      return b.experienceYears - a.experienceYears;
    });

    // --------------------------------------------
    // 14. ADD RANK
    // --------------------------------------------
    const finalResults = resumeData.map(
      (candidate, index) => ({
        ...candidate,
        rank: index + 1,
      })
    );

    // --------------------------------------------
    // 15. DEBUG INFORMATION
    // --------------------------------------------
    console.log("=================================");
    console.log("JOB ANALYSIS");
    console.log("Required Skills:", requiredSkills);
    console.log(
      "Required Experience:",
      requiredExperience,
      "years"
    );
    console.log("=================================");

    console.log("FINAL CANDIDATE RANKING:");

    finalResults.forEach((candidate) => {
      console.log({
        rank: candidate.rank,
        candidate: candidate.fileName,
        finalScore: candidate.score,
        skillScore: candidate.skillScore,
        experienceScore: candidate.experienceScore,
        experienceYears: candidate.experienceYears,
        matchedSkills: candidate.matchedSkills,
      });
    });

    // --------------------------------------------
    // 16. SAVE RESULTS
    // --------------------------------------------
    setAnalysisResults(finalResults);

    // Save to backend
    saveResultsToBackend();
  } catch (error) {
    console.error("Analysis error:", error);

    setErrorMessage(
      error.message ||
        "Something went wrong while analyzing the resumes."
    );

    alert(
      "Could not analyze the resumes. Make sure FastAPI is running."
    );
  } finally {
    setIsAnalyzing(false);
  }
};

  // ==================================================
  // LOGIN SCREEN
  // ==================================================

  if (!isLoggedIn) {
    return (
      <Login onLogin={handleLogin} />
    );
  }


  // ==================================================
  // MAIN APPLICATION UI
  // ==================================================

  return (
    <div className="app">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="navbar">

        <div className="brand">

          <div className="brand-icon">
            🤖
          </div>

          <div>
            <strong>
              AI Resume Screener
            </strong>

            <span>
              Smart Hiring Assistant
            </span>
          </div>

        </div>


        <div className="nav-right">

          <span className="user-email">
            {typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}").email || localStorage.getItem("userEmail") : ""}
          </span>

          <button
            className="logout-button"
            onClick={handleViewHistory}
            title="Application History"
          >
            📋 History
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>


      {/* =================================================
          HERO
      ================================================= */}

      <section className="hero">

        <div className="hero-content">

          <span className="hero-label">
            AI-POWERED RECRUITMENT
          </span>

          <h1>
            Find the right candidate
            <br />
            <span>faster and smarter.</span>
          </h1>

          <p>
            Upload multiple resumes, enter the job
            description, and let the system compare
            candidates based on required skills.
          </p>

        </div>

      </section>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="container">

        {view === "dashboard" && (
          <>

        {/* =================================================
            JOB DESCRIPTION
        ================================================= */}

        <section className="input-card">

          <div className="section-heading">

            <div className="step-number">
              01
            </div>

            <div>
              <h2>
                Job Description
              </h2>

              <p>
                Enter the requirements for the position.
              </p>
            </div>

          </div>


          <textarea
            value={jobDescription}
            onChange={(e) =>
              setJobDescription(e.target.value)
            }
            placeholder={
              "Example:\n\nWe are looking for a Python developer with experience in React, SQL, FastAPI, Git and Docker..."
            }
          />

        </section>


        {/* =================================================
            RESUME UPLOAD
        ================================================= */}

        <section className="input-card">

          <div className="section-heading">

            <div className="step-number">
              02
            </div>

            <div>
              <h2>
                Upload Resumes
              </h2>

              <p>
                Upload one or multiple candidate resumes.
              </p>
            </div>

          </div>


          <label
            className="upload-area"
            htmlFor="resume-upload"
          >

            <div className="upload-icon">
              📄
            </div>

            <h3>
              Drop resumes here
            </h3>

            <p>
              or click to browse files
            </p>

            <span>
              PDF, DOC, DOCX or TXT
            </span>

          </label>


          <input
            id="resume-upload"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleResumeUpload}
            hidden
          />


          {/* Uploaded resume list */}

          {resumes.length > 0 && (
            <div className="resume-list">

              <div className="resume-list-header">
                <strong>
                  {resumes.length} Resume
                  {resumes.length > 1
                    ? "s"
                    : ""}{" "}
                  Selected
                </strong>
              </div>


              {resumes.map(
                (resume, index) => (
                  <div
                    className="resume-item"
                    key={`${resume.name}-${index}`}
                  >

                    <div className="resume-file-icon">
                      📄
                    </div>

                    <div className="resume-info">

                      <strong>
                        {resume.name}
                      </strong>

                      <span>
                        {(
                          resume.size /
                          1024
                        ).toFixed(1)}{" "}
                        KB
                      </span>

                    </div>


                    <button
                      className="remove-button"
                      onClick={() =>
                        removeResume(index)
                      }
                      type="button"
                    >
                      ×
                    </button>

                  </div>
                )
              )}

            </div>
          )}

        </section>


        {/* =================================================
            ANALYZE BUTTON
        ================================================= */}

        <button
          className="analyze-button"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >

          {isAnalyzing ? (
            <>
              <span className="spinner"></span>
              Analyzing Candidates...
            </>
          ) : (
            <>
              ✨ Analyze & Rank Candidates
            </>
          )}

        </button>


        {/* Save message */}
        {saveMessage && (
          <div className={`save-message ${saveMessage.includes("Failed") ? "error" : "success"}`}>
            {saveMessage}
          </div>
        )}

        {/* Error */}

        {errorMessage && (
          <div className="error-box">
            ⚠️ {errorMessage}
          </div>
        )}


        {/* =================================================
            RESULTS
        ================================================= */}

        {analysisResults.length > 0 && (
          <section className="results-section">


            {/* RESULTS HEADER */}

            <div className="results-heading">

              <div>

                <span className="hero-label">
                  AI SCREENING RESULTS
                </span>

                <h2>
                  Candidate Ranking
                </h2>

                 <p>
                   Candidates are ranked according
                   to their match with the required
                   job skills, combined with AI-powered
                   resume analysis.
                 </p>

              </div>


              <div className="candidate-count">

                <strong>
                  {analysisResults.length}
                </strong>

                <span>
                  Candidates
                </span>

              </div>

             </div>


             {/* =================================================
                 COMPARISON GRAPH
             ================================================= */}

             <ComparisonGraph
               results={analysisResults}
             />


             {/* =================================================
                 BEST CANDIDATE
            ================================================= */}

            {analysisResults.length > 0 && (
              <div className="best-candidate">

                <div className="best-badge">
                  🏆 BEST MATCH
                </div>


                <div className="best-content">

                  <div className="best-avatar">
                    {analysisResults[0]
                      .fileName
                      .charAt(0)
                      .toUpperCase()}
                  </div>


                  <div className="best-info">

                    <h3>
                      {analysisResults[0].fileName}
                    </h3>

                    <p>
                      Top candidate based on
                      required skill coverage.
                    </p>


                    <div className="skill-badges">

                      {analysisResults[0]
                        .matchedSkills
                        .slice(0, 8)
                        .map((skill) => (
                          <span
                            className="skill-badge matched"
                            key={skill}
                          >
                            ✓ {skill}
                          </span>
                        ))}

                    </div>

                  </div>


                   <div className="best-score">

                     <strong>
                       {analysisResults[0].score}%
                     </strong>

                     <span>
                       Match Score
                     </span>

                     {analysisResults[0].aiMatchPercentage !==
                       null &&
                       analysisResults[0].aiMatchPercentage !==
                       undefined && (
                       <div className="ai-score-inline">
                         <span className="ai-score-value">
                           {analysisResults[0].aiMatchPercentage}%
                         </span>
                         <span className="ai-score-label">
                           AI Match
                         </span>
                       </div>
                      )}

                    </div>

                    {analysisResults[0].aiSummary && (
                     <div className="best-ai-summary">
                       {analysisResults[0].aiSummary}
                     </div>
                   )}

                 </div>

              </div>
            )}


            {/* =================================================
                RANKING TABLE
            ================================================= */}

            <div className="ranking-card">

              <div className="ranking-header">

                <span>
                  Rank
                </span>

                <span>
                  Candidate
                </span>

                <span>
                  Match Score
                </span>

                <span>
                  Skills
                </span>

                <span>
                  Recommendation
                </span>

              </div>


              {analysisResults.map(
                (result, index) => (

                  <div
                    className="ranking-row"
                    key={`${result.fileName}-${index}`}
                  >

                    {/* Rank */}

                    <div className="rank">

                      {index === 0 ? (
                        <span className="rank-medal">
                          🥇
                        </span>
                      ) : (
                        <span>
                          #{index + 1}
                        </span>
                      )}

                    </div>


                    {/* Candidate */}

                    <div className="candidate">

                      <div className="candidate-avatar">
                        {result.fileName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <strong>
                          {result.fileName}
                        </strong>

                        <small>
                          {result.matchedSkills.length}
                          /
                          {result.requiredCount ||
                            result.matchedSkills.length +
                              result.missingSkills.length}{" "}
                          required skills
                        </small>

                      </div>

                    </div>


                    {/* SCORE */}

                    <div className="score-cell">

                      <div className="score-number">
                        {result.score}%
                      </div>

                      <div className="score-bar">

                        <div
                          className="score-fill"
                          style={{
                            width: `${result.score}%`,
                          }}
                        ></div>

                      </div>

                    </div>


                    {/* SKILLS */}

                    <div className="skills-cell">

                      {result.matchedSkills
                        .slice(0, 5)
                        .map((skill) => (
                          <span
                            className="mini-skill"
                            key={skill}
                          >
                            ✓ {skill}
                          </span>
                        ))}


                      {result.matchedSkills.length >
                        5 && (
                        <span className="more-skills">
                          +
                          {result.matchedSkills.length -
                            5}{" "}
                          more
                        </span>
                      )}

                    </div>


                    {/* RECOMMENDATION */}

                    <div>

                      <span
                        className={
                          result.recommendation
                            .className
                        }
                      >
                        {
                          result.recommendation
                            .text
                        }
                      </span>

                    </div>

                  </div>
                )
              )}

            </div>


            {/* =================================================
                DETAILED RESULTS
            ================================================= */}

            <div className="details-title">
              Candidate Skill Analysis
            </div>


            <div className="details-grid">

              {analysisResults.map(
                (result, index) => (

                  <div
                    className="detail-card"
                    key={`detail-${result.fileName}-${index}`}
                  >

                    <div className="detail-header">

                      <div className="detail-avatar">
                        {result.fileName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <h3>
                          {result.fileName}
                        </h3>

                        <span>
                          Rank #{index + 1}
                        </span>

                      </div>

                      <strong className="detail-score">
                        {result.score}%
                      </strong>
                      <SkillMatchPie
  matchedCount={result.matchedSkills?.length || 0}
  requiredCount={
    (result.matchedSkills?.length || 0) +
    (result.missingSkills?.length || 0)
  }
/>

                    </div>


                    {/* Matched */}

                    <div className="skill-section">

                      <h4>
                        ✓ Matched Skills
                      </h4>

                      <div className="skill-badges">

                        {result.matchedSkills.length >
                        0 ? (
                          result.matchedSkills.map(
                            (skill) => (
                              <span
                                className="skill-badge matched"
                                key={skill}
                              >
                                ✓ {skill}
                              </span>
                            )
                          )
                        ) : (
                          <span className="empty-text">
                            No matching skills found
                          </span>
                        )}

                      </div>

                    </div>


                    {/* Missing */}

                    <div className="skill-section">

                      <h4>
                        ⚠ Missing Skills
                      </h4>

                      <div className="skill-badges">

                        {result.missingSkills.length >
                        0 ? (
                          result.missingSkills.map(
                            (skill) => (
                              <span
                                className="skill-badge missing"
                                key={skill}
                              >
                                {skill}
                              </span>
                            )
                          )
                        ) : (
                          <span className="all-match">
                            ✓ All required skills
                            matched
                          </span>
                        )}

                      </div>

                     </div>


                     {/* AI Analysis */}

                     {result.aiMatchPercentage !==
                       null &&
                       result.aiMatchPercentage !==
                       undefined && (
                       <div className="ai-analysis-section">

                         <div className="ai-analysis-header">

                           <h4>
                             🤖 AI Analysis
                           </h4>

                           <div className="ai-score-pill">
                             {result.aiMatchPercentage}%
                           </div>

                         </div>

                         {result.aiSummary && (
                           <p className="ai-summary">
                             {result.aiSummary}
                           </p>
                         )}

                         {result.aiStrengths &&
                           result.aiStrengths.length >
                           0 && (
                           <div className="skill-section">

                             <h4>
                               ✓ AI-Identified Strengths
                             </h4>

                             <div className="skill-badges">

                               {result.aiStrengths.map(
                                 (strength, sIdx) => (
                                   <span
                                     className="skill-badge matched"
                                     key={`strength-${sIdx}`}
                                   >
                                     ✓ {strength}
                                   </span>
                                 )
                               )}

                             </div>

                           </div>
                         )}

                         {result.aiGaps &&
                           result.aiGaps.length >
                           0 && (
                           <div className="skill-section">

                             <h4>
                               ⚠ AI-Identified Gaps
                             </h4>

                             <div className="skill-badges">

                               {result.aiGaps.map(
                                 (gap, gIdx) => (
                                   <span
                                     className="skill-badge missing"
                                     key={`gap-${gIdx}`}
                                   >
                                     {gap}
                                   </span>
                                 )
                               )}

                             </div>

                           </div>
                          )}

                        </div>
                       )}


                     {result.error && (
                       <div className="resume-error">
                         ⚠ {result.error}
                       </div>
                     )}

                   </div>

                 )
              )}

            </div>


          </section>
        )}
          </>
        )}

        {view === "history" && (
          <HistoryList
            accessToken={localStorage.getItem("access_token")}
            onViewApplication={handleViewApplication}
            onBack={handleBackToDashboard}
          />
        )}

        {view === "details" && selectedApplicationId && (
          <ApplicationDetails
            applicationId={selectedApplicationId}
            accessToken={localStorage.getItem("access_token")}
            onBack={handleBackToDashboard}
          />
        )}

      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="footer">

        <p>
          AI Resume Screener • Intelligent
          Candidate Matching System
        </p>

      </footer>

    </div>
  );
}


export default App;
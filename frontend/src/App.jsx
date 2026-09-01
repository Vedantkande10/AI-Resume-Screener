import { useState } from "react";
import "./App.css";
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
  // LOGIN
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const [email, setEmail] = useState("");

  // APPLICATION
  const [resumes, setResumes] = useState([]);
  const [jobDescription, setJobDescription] = useState("");

  const [analysisResults, setAnalysisResults] = useState([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  const handleLogin = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    if (!email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);

    setIsLoggedIn(true);
  };


  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");

    setIsLoggedIn(false);

    setResumes([]);
    setAnalysisResults([]);
    setJobDescription("");
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
  "https://ai-resume-screener-0fmn.onrender.com/upload-resume",
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
        // 10. STORE RAW RESULT
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
    // SKILLS      = 70%
    // EXPERIENCE  = 30%
    // --------------------------------------------
    resumeData.forEach((candidate) => {
      const finalScore =
        candidate.skillScore * 0.70 +
        candidate.experienceScore * 0.30;

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
      <div className="login-page">

        <div className="login-card">

          <div className="login-icon">
            🤖
          </div>

          <h1>
            AI Resume Screener
          </h1>

          <p className="login-subtitle">
            Smart candidate screening and ranking
          </p>


          <form onSubmit={handleLogin}>

            <label>
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <button
              type="submit"
              className="primary-button login-button"
            >
              Continue
            </button>

          </form>


          <p className="login-note">
            No password required
          </p>

        </div>

      </div>
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
            {localStorage.getItem("userEmail")}
          </span>

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
                  job skills.
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

                  </div>

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
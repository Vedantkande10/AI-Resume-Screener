import { useState, useEffect } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function ApplicationDetails({ applicationId, accessToken, onBack }) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadApplication();
  }, []);

  const loadApplication = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please login again.");
          return;
        }
        if (response.status === 404) {
          setError("Application not found.");
          return;
        }
        throw new Error("Failed to load application");
      }

      const data = await response.json();
      setApplication(data);
    } catch (err) {
      setError(err.message || "Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="history-card">
          <div className="loading-spinner"></div>
          <p>Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container">
        <div className="history-card">
          <div className="error-box">
            ⚠️ {error}
          </div>
          <button className="primary-button" onClick={onBack}>
            ← Back to History
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  let analysisResults = [];

  try {
    analysisResults = JSON.parse(application.analysis_results || "[]");
  } catch (e) {
    analysisResults = [];
  }

  let resumeTexts = [];

  try {
    resumeTexts = JSON.parse(application.resume_texts || "[]");
  } catch (e) {
    resumeTexts = [];
  }

  return (
    <div className="history-container">
      <div className="history-card">

        <div className="history-header">

          <div>

            <span className="hero-label">
              APPLICATION DETAILS
            </span>

            <h2>
              Screening Results
            </h2>

            <p>
              {formatDate(application.created_at)}
            </p>

          </div>

          <button
            className="back-button"
            onClick={onBack}
          >
            ← Back to History
          </button>

        </div>

        <div className="details-section">
          <h3>
            Job Description
          </h3>
          <div className="details-text">
            {application.job_description}
          </div>
        </div>

        <div className="details-section">
          <h3>
            Resumes Analyzed ({resumeTexts.length})
          </h3>
          <div className="details-text">
            {resumeTexts.map((resume, index) => (
              <div key={index} className="resume-text-item">
                <strong>{resume.fileName || `Resume ${index + 1}`}</strong>
                <p>{resume.text ? resume.text.slice(0, 500) + "..." : "No text available"}</p>
              </div>
            ))}
          </div>
        </div>

        {analysisResults.length > 0 && (
          <div className="details-section">
            <h3>
              Results Summary
            </h3>
            <div className="details-text">
              {analysisResults.map((result, index) => (
                <div key={index} className="result-item">
                  <div className="result-header">
                    <strong>{result.fileName}</strong>
                    <span className={`recommendation ${result.recommendation.className || ""}`}>
                      {result.recommendation.text || result.recommendation}
                    </span>
                  </div>
                  <div className="result-scores">
                    <div>
                      <strong>{result.score}%</strong>
                      <span>Match Score</span>
                    </div>
                    <div>
                      <strong>{result.skillScore}%</strong>
                      <span>Skill Score</span>
                    </div>
                    <div>
                      <strong>{result.experienceScore}%</strong>
                      <span>Experience Score</span>
                    </div>
                  </div>
                  {result.aiMatchPercentage !== null && result.aiMatchPercentage !== undefined && (
                    <div className="result-ai">
                      <strong>AI Match: {result.aiMatchPercentage}%</strong>
                      {result.aiSummary && <p>{result.aiSummary}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="primary-button" onClick={onBack}>
          ← Back to History
        </button>

      </div>
    </div>
  );
}

export default ApplicationDetails;

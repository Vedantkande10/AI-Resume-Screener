import { useState, useEffect } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function HistoryList({ accessToken, onViewApplication, onBack }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please login again.");
          return;
        }
        throw new Error("Failed to load applications");
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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
          <p>Loading your screening history...</p>
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
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-card">

        <div className="history-header">

          <div>

            <span className="hero-label">
              RECENTLY APPLIED
            </span>

            <h2>
              Application History
            </h2>

            <p>
              View your recently saved resume screening results.
            </p>

          </div>

          <button
            className="back-button"
            onClick={onBack}
          >
            ← Back
          </button>

        </div>

        {applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No applications yet</h3>
            <p>
              Upload resumes and analyze them to see your screening history here.
            </p>
            <button className="primary-button" onClick={onBack}>
              Start Screening
            </button>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((app) => (
              <div
                className="application-item"
                key={app.id}
                onClick={() => onViewApplication(app.id)}
              >
                <div className="application-icon">
                  📄
                </div>

                <div className="application-info">
                  <strong>
                    {app.job_description.slice(0, 60)}
                    {app.job_description.length > 60 ? "..." : ""}
                  </strong>

                  <span>
                    {formatDate(app.created_at)}
                  </span>
                </div>

                <div className="application-arrow">
                  →
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default HistoryList;

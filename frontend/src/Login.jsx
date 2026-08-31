import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    // Empty email validation
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Clear error
    setError("");

    // Login successful
    onLogin(trimmedEmail);
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* LOGO */}
        <div className="login-logo">
          🤖
        </div>

        {/* TITLE */}
        <h1>AI Resume Screener</h1>

        <p className="login-subtitle">
          Sign in to analyze and rank candidates
        </p>

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="login-form">

          <div className="input-group">

            <label htmlFor="email">
              Email Address
            </label>

            <div className="input-wrapper">

              <span className="input-icon">
                ✉
              </span>

              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                autoComplete="email"
              />

            </div>

          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="login-error">
              <span>⚠</span>
              {error}
            </div>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="login-button"
          >
            <span>Continue to Dashboard</span>
            <span className="button-arrow">→</span>
          </button>

        </form>

        {/* FOOTER MESSAGE */}
        <div className="login-footer">

          <span className="secure-icon">
            🔒
          </span>

          <p>
            Your email is used only for accessing
            <br />
            the resume screening dashboard.
          </p>

        </div>

      </div>

      {/* BOTTOM BRANDING */}
      <p className="login-branding">
        AI-powered resume analysis & candidate ranking
      </p>

    </div>
  );
}

export default Login;
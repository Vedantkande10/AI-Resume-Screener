import { useState } from "react";
import "./Login.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||  "https://ai-resume-screener-0fmn.onrender.com";
function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!trimmedPassword) {
      setError("Please enter your password.");
      return;
    }

    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (isRegister) {
      if (trimmedPassword !== confirmPassword.trim()) {
        setError("Passwords do not match.");
        return;
      }

      setLoading(true);

      try {
        const formData = new FormData();
        formData.append("email", trimmedEmail);
        formData.append("password", trimmedPassword);

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Registration failed");
        }

        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data.user);
      } catch (err) {
        setError(err.message || "Registration failed. Please try again.");
      } finally {
        setLoading(false);
      }

      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", trimmedEmail);
      formData.append("password", trimmedPassword);

      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          🤖
        </div>

        <h1>
          {isRegister ? "Create Account" : "AI Resume Screener"}
        </h1>

        <p className="login-subtitle">
          {isRegister
            ? "Sign up to analyze and rank candidates"
            : "Sign in to analyze and rank candidates"}
        </p>

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

          <div className="input-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="input-wrapper">

              <span className="input-icon">
                🔒
              </span>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                autoComplete={isRegister ? "new-password" : "current-password"}
              />

            </div>

          </div>

          {isRegister && (
            <div className="input-group">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  🔒
                </span>

                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError("");
                  }}
                  autoComplete="new-password"
                />

              </div>

            </div>
          )}

          {error && (
            <div className="login-error">
              <span>⚠</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>{isRegister ? "Creating Account..." : "Signing in..."}</span>
              </>
            ) : (
              <>
                <span>{isRegister ? "Create Account" : "Continue to Dashboard"}</span>
                <span className="button-arrow">→</span>
              </>
            )}
          </button>

        </form>

        <div style={{ marginTop: "18px", fontSize: "13px", color: "#64748b" }}>
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#6366f1",
              fontWeight: 700,
              cursor: "pointer",
              padding: 0,
              fontSize: "13px",
            }}
          >
            {isRegister ? "Sign in" : "Register"}
          </button>
        </div>

        <div className="login-footer">

          <span className="secure-icon">
            🔒
          </span>

          <p>
            {isRegister
              ? "Create an account to save and manage your screening results."
              : "Your email is used only for accessing the resume screening dashboard."}
          </p>

        </div>

      </div>

      <p className="login-branding">
        AI-powered resume analysis & candidate ranking
      </p>

    </div>
  );
}

export default Login;

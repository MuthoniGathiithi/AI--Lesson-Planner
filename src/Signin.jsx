"use client"

import { useState } from "react"
import { Link } from "react-router-dom"

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    }
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()

    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        console.log("Signin successful:", formData)
        setLoading(false)
        // Reset form
        setFormData({
          email: "",
          password: "",
          rememberMe: false,
        })
      }, 1500)
    } else {
      setErrors(newErrors)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email Field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={{
                ...styles.input,
                ...(errors.email && styles.inputError),
              }}
            />
            {errors.email && <span style={styles.error}>{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              style={{
                ...styles.input,
                ...(errors.password && styles.inputError),
              }}
            />
            {errors.password && <span style={styles.error}>{errors.password}</span>}
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={styles.optionsContainer}>
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="remember"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <label htmlFor="remember" style={styles.checkboxLabel}>
                Remember me
              </label>
            </div>
            <a href="#forgot" style={styles.link}>
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading && styles.buttonDisabled),
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/signup" style={styles.link}>
            Sign up here
          </Link>
        </div>

        {/* Back to Home Link */}
        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <Link to="/" style={{ ...styles.link, fontSize: "13px" }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f766e 0%, #1e7e74 100%)",
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    padding: "20px",
  },
  formWrapper: {
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
  },
  header: {
    marginBottom: "30px",
    textAlign: "center",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a202c",
    margin: "0 0 10px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#718096",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2d3748",
  },
  input: {
    padding: "12px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "all 0.3s ease",
    outline: "none",
    fontFamily: "inherit",
  },
  inputError: {
    borderColor: "#fc8181",
    backgroundColor: "#fff5f5",
  },
  error: {
    fontSize: "12px",
    color: "#e53e3e",
    marginTop: "4px",
  },
  optionsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkboxGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  checkbox: {
    cursor: "pointer",
    accentColor: "#0f766e",
  },
  checkboxLabel: {
    fontSize: "13px",
    color: "#4a5568",
  },
  button: {
    padding: "12px 20px",
    background: "linear-gradient(135deg, #0f766e 0%, #1e7e74 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "10px",
  },
  buttonDisabled: {
    opacity: "0.7",
    cursor: "not-allowed",
  },
  footer: {
    textAlign: "center",
    fontSize: "14px",
    color: "#4a5568",
    marginTop: "20px",
  },
  link: {
    color: "#0f766e",
    textDecoration: "none",
    fontWeight: "600",
    cursor: "pointer",
  },
}


"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "./supabaseClient"

export default function SignUp() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [infoMessage, setInfoMessage] = useState("")

  // Validation logic
  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Please enter a valid email"
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    if (!formData.agreeTerms) newErrors.agreeTerms = "You must agree to the terms"
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
    setInfoMessage("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setInfoMessage("")
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.name } }
      })

      if (error) {
        // Handle duplicate email nicely
        if (error.message.includes("already registered")) {
          setErrors({ email: "This email is already in use" })
        } else {
          setErrors({ general: error.message })
        }
        setLoading(false)
        return
      }

      // Email verification sent
      if (data.user?.confirmation_sent_at) {
        setInfoMessage("Account created! Please check your email to verify your account before signing in.")
        setLoading(false)
        return
      }

      // If no email verification, automatically sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (signInError) {
        setErrors({ general: signInError.message })
      } else {
        navigate("/dashboard")
      }
    } catch (err) {
      setErrors({ general: "Something went wrong. Please try again." })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join us and start your journey today</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              style={{ ...styles.input, ...(errors.name && styles.inputError) }}
            />
            {errors.name && <span style={styles.error}>{errors.name}</span>}
          </div>

          {/* Email */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={{ ...styles.input, ...(errors.email && styles.inputError) }}
            />
            {errors.email && <span style={styles.error}>{errors.email}</span>}
          </div>

          {/* Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              style={{ ...styles.input, ...(errors.password && styles.inputError) }}
            />
            {errors.password && <span style={styles.error}>{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              style={{ ...styles.input, ...(errors.confirmPassword && styles.inputError) }}
            />
            {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
          </div>

          {/* Terms */}
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="terms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              style={styles.checkbox}
            />
            <label htmlFor="terms" style={styles.checkboxLabel}>
              I agree to the <a href="#" style={styles.link}>Terms of Service</a> and <a href="#" style={styles.link}>Privacy Policy</a>
            </label>
          </div>
          {errors.agreeTerms && <span style={styles.error}>{errors.agreeTerms}</span>}

          {/* General error */}
          {errors.general && <span style={styles.error}>{errors.general}</span>}

          {/* Info message */}
          {infoMessage && <span style={{ ...styles.error, color: "#2d3748" }}>{infoMessage}</span>}

          {/* Submit */}
          <button type="submit" disabled={loading} style={{ ...styles.button, ...(loading && styles.buttonDisabled) }}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/signin" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}


// styles remain the same as your current styles


const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    padding: "20px",
  },
  formWrapper: {
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
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
  checkboxGroup: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    marginTop: "10px",
  },
  checkbox: {
    marginTop: "2px",
    cursor: "pointer",
    accentColor: "#667eea",
  },
  checkboxLabel: {
    fontSize: "13px",
    color: "#4a5568",
    lineHeight: "1.5",
  },
  button: {
    padding: "12px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "600",
    cursor: "pointer",
  },
  dividerWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "20px",
    marginBottom: "14px",
  },
  divider: {
    flex: 1,
    height: "1px",
    background: "#E5E7EB",
  },
  dividerText: {
    fontSize: "13px",
    color: "#9CA3AF",
    whiteSpace: "nowrap",
  },
  socialRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    marginTop: "4px",
  },
  socialButton: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
  },
  socialLabel: {
    color: "#111827",
  },
}



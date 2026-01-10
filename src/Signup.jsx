"use client"

import { useState } from "react"
import { supabase } from "./supabaseClient"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { useNavigate } from "react-router-dom"

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [infoMessage, setInfoMessage] = useState("")

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
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
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
        options: { data: { full_name: formData.name } },
      })

      if (error) {
        if (error.message.includes("already registered")) {
          setErrors({ email: "This email is already in use" })
        } else {
          setErrors({ general: error.message })
        }
        setLoading(false)
        return
      }

      if (data.user?.confirmation_sent_at) {
        setInfoMessage("Account created! Please check your email to verify your account before signing in.")
        setLoading(false)
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
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
      <div style={styles.contentWrapper}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.logoContainer}>
            </div>
            <h1 style={styles.brandTitle}>FunzoIQ</h1>
            <h2 style={styles.title}>Create Account</h2>
            <p style={styles.subtitle}> start your journey today At FunzoIQ</p>
          </div>

          <div style={styles.formContainer}>
            {/* Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrapper}>
                <div style={styles.inputIconWrapper}>
                  <User style={styles.inputIcon} />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  style={{ ...styles.input, ...(errors.name && styles.inputError) }}
                />
              </div>
              {errors.name && <p style={styles.errorText}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Email address</label>
              <div style={styles.inputWrapper}>
                <div style={styles.inputIconWrapper}>
                  <Mail style={styles.inputIcon} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  style={{ ...styles.input, ...(errors.email && styles.inputError) }}
                />
              </div>
              {errors.email && <p style={styles.errorText}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <div style={styles.inputIconWrapper}>
                  <Lock style={styles.inputIcon} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  style={{ ...styles.input, ...(errors.password && styles.inputError) }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.toggleButton}>
                  {showPassword ? <EyeOff style={styles.toggleIcon} /> : <Eye style={styles.toggleIcon} />}
                </button>
              </div>
              {errors.password && <p style={styles.errorText}>{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrapper}>
                <div style={styles.inputIconWrapper}>
                  <Lock style={styles.inputIcon} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  style={{ ...styles.input, ...(errors.confirmPassword && styles.inputError) }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.toggleButton}
                >
                  {showConfirmPassword ? <EyeOff style={styles.toggleIcon} /> : <Eye style={styles.toggleIcon} />}
                </button>
              </div>
              {errors.confirmPassword && <p style={styles.errorText}>{errors.confirmPassword}</p>}
            </div>

            {/* Terms Agreement */}
            <div style={styles.termsWrapper}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxText}>
                  I agree to the{" "}
                  <a href="#" style={styles.link}>
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" style={styles.link}>
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>
            {errors.agreeTerms && <p style={styles.errorText}>{errors.agreeTerms}</p>}

            {/* Info message */}
            {infoMessage && <p style={{ ...styles.errorText, color: "#1e293b" }}>{infoMessage}</p>}

            {/* General error */}
            {errors.general && <p style={styles.errorText}>{errors.general}</p>}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{ ...styles.submitButton, ...(loading && styles.submitButtonDisabled) }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          {/* Footer */}
          <p style={styles.footer}>
            Already have an account?{" "}
            <a href="/signin" style={styles.signupLink}>
              Sign in
            </a>
          </p>
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
    backgroundColor: "#f1f5f9",
    padding: "1.5rem",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: "28rem",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "1.25rem",
    boxShadow:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.05)",
    padding: "3rem 2.5rem",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
  },
  header: {
    textAlign: "center",
    marginBottom: "2.5rem",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  logoCircle: {
    width: "3rem",
    height: "3rem",
    borderRadius: "0.875rem",
    backgroundColor: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.1)",
  },
  logoIcon: {
    width: "1.5rem",
    height: "1.5rem",
    color: "#ffffff",
  },
  brandTitle: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#000",
    marginBottom: "0.5rem",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    fontFamily:"inter, sans-serif"
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "0.5rem",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "0.9375rem",
    lineHeight: "1.6",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "0.5rem",
  },
  inputWrapper: {
    position: "relative",
  },
  inputIconWrapper: {
    position: "absolute",
    top: "50%",
    left: "1rem",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputIcon: {
    width: "1.125rem",
    height: "1.125rem",
    color: "#94a3b8",
  },
  input: {
    width: "100%",
    paddingLeft: "2.75rem",
    paddingRight: "1rem",
    paddingTop: "0.75rem",
    paddingBottom: "0.75rem",
    border: "1px solid #e2e8f0",
    borderRadius: "0.625rem",
    fontSize: "0.9375rem",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
    color: "#0f172a",
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fffafb",
  },
  toggleButton: {
    position: "absolute",
    top: "50%",
    right: "0.75rem",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.25rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
  },
  toggleIcon: {
    width: "1.125rem",
    height: "1.125rem",
  },
  errorText: {
    marginTop: "0.375rem",
    fontSize: "0.8125rem",
    fontWeight: "500",
    color: "#ef4444",
  },
  termsWrapper: {
    marginTop: "0.5rem",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "flex-start",
    cursor: "pointer",
    userSelect: "none",
    gap: "0.5rem",
  },
  checkbox: {
    width: "1rem",
    height: "1rem",
    accentColor: "#0f172a",
    borderRadius: "0.25rem",
    cursor: "pointer",
    marginTop: "0.125rem",
    flexShrink: 0,
  },
  checkboxText: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#64748b",
    lineHeight: "1.5",
  },
  link: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#0f172a",
    textDecoration: "none",
    transition: "color 0.2s",
  },
  submitButton: {
    width: "100%",
    backgroundColor: "#000",
    color: "#ffffff",
    padding: "0.75rem 1rem",
    borderRadius: "0.625rem",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "0.9375rem",
    marginTop: "0.5rem",
    boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.1)",
  },
  submitButtonHover: {
    backgroundColor: "#1e293b",
    boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.2)",
  },
  submitButtonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  footer: {
    textAlign: "center",
    fontSize: "0.875rem",
    color: "#64748b",
    marginTop: "2.5rem",
  },
  signupLink: {
    fontWeight: "600",
    color: "#0f172a",
    textDecoration: "none",
  },
}
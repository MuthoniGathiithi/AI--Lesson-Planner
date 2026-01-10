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
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Please enter a valid email"
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters"
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match"
    if (!formData.agreeTerms)
      newErrors.agreeTerms = "You must agree to the terms"
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
        options: {
          data: { full_name: formData.name },
        },
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
        setInfoMessage(
          "Account created! Please check your email to verify your account before signing in."
        )
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
              <div style={styles.logoCircle}>
                <User style={styles.logoIcon} />
              </div>
            </div>
            <h1 style={styles.brandTitle}>FunzoIQ</h1>
            <h2 style={styles.title}>Create Account</h2>
            <p style={styles.subtitle}>
              Start your journey today at FunzoIQ
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.formContainer}>
            {/* Name */}
            <div style={styles.formGroup}>
              <label htmlFor="name" style={styles.label}>
                Full Name
              </label>
              <div style={styles.inputWrapper}>
                <div style={styles.inputIconWrapper}>
                  <User style={styles.inputIcon} />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.name ? styles.inputError : {}),
                  }}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && <p style={styles.errorText}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Email address
              </label>
              <div style={styles.inputWrapper}>
                <div style={styles.inputIconWrapper}>
                  <Mail style={styles.inputIcon} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.email ? styles.inputError : {}),
                  }}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p style={styles.errorText}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                Password
              </label>
              <div style={styles.inputWrapper}>
                <div style={styles.inputIconWrapper}>
                  <Lock style={styles.inputIcon} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.password ? styles.inputError : {}),
                  }}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.toggleButton}
                >
                  {showPassword ? (
                    <EyeOff style={styles.toggleIcon} />
                  ) : (
                    <Eye style={styles.toggleIcon} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p style={styles.errorText}>{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>
                Confirm Password
              </label>
              <div style={styles.inputWrapper}>
                <div style={styles.inputIconWrapper}>
                  <Lock style={styles.inputIcon} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.confirmPassword ? styles.inputError : {}),
                  }}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  style={styles.toggleButton}
                >
                  {showConfirmPassword ? (
                    <EyeOff style={styles.toggleIcon} />
                  ) : (
                    <Eye style={styles.toggleIcon} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p style={styles.errorText}>{errors.confirmPassword}</p>
              )}
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
                  <a href="/terms" style={styles.link}>
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" style={styles.link}>
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.agreeTerms && (
                <p style={styles.errorText}>{errors.agreeTerms}</p>
              )}
            </div>

            {/* Info message */}
            {infoMessage && (
              <div style={styles.infoMessage}>{infoMessage}</div>
            )}

            {/* General error */}
            {errors.general && (
              <div style={styles.generalError}>{errors.general}</div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {}),
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div style={styles.footer}>
            Already have an account?{" "}
            <a href="/signin" style={styles.signupLink}>
              Sign in
            </a>
          </div>
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
    padding: "1rem",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: "28rem",
    padding: "0 0.75rem",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: "1.25rem",
    boxShadow:
      "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1), 0 20px 25px -5px rgba(0,0,0,0.05)",
    padding: "2.5rem 1.5rem",
    border: "1px solid rgba(226,232,240,0.8)",
    boxSizing: "border-box",
  },
  header: { textAlign: "center", marginBottom: "2rem" },
  logoContainer: { display: "flex", justifyContent: "center", marginBottom: "1rem" },
  logoCircle: {
    width: "3rem",
    height: "3rem",
    borderRadius: "0.875rem",
    backgroundColor: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 15px -3px rgba(15,23,42,0.1)",
  },
  logoIcon: { width: "1.25rem", height: "1.25rem", color: "#fff" },
  brandTitle: { fontSize: "1.5rem", fontWeight: 700, color: "#000", marginBottom: "0.25rem" },
  title: { fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" },
  subtitle: { color: "#64748b", fontSize: "0.875rem", lineHeight: "1.5" },
  formContainer: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  formGroup: { display: "flex", flexDirection: "column" },
  label: { fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" },
  inputWrapper: { position: "relative", width: "100%" },
  inputIconWrapper: {
    position: "absolute",
    top: "50%",
    left: "0.5rem",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  inputIcon: { width: "1rem", height: "1rem", color: "#94a3b8" },
  input: {
    width: "100%",
    paddingLeft: "2rem",
    paddingRight: "2rem",
    paddingTop: "0.5rem",
    paddingBottom: "0.5rem",
    border: "1px solid #e2e8f0",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#fff",
    color: "#0f172a",
  },
  inputError: { borderColor: "#ef4444", backgroundColor: "#fffafb" },
  toggleButton: {
    position: "absolute",
    top: "50%",
    right: "0.5rem",
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
  toggleIcon: { width: "1rem", height: "1rem" },
  errorText: { marginTop: "0.25rem", fontSize: "0.75rem", color: "#ef4444" },
  termsWrapper: { marginTop: "0.25rem" },
  checkboxLabel: { display: "flex", alignItems: "flex-start", gap: "0.5rem", cursor: "pointer" },
  checkbox: { width: "1rem", height: "1rem", accentColor: "#0f172a", borderRadius: "0.25rem" },
  checkboxText: { fontSize: "0.8125rem", fontWeight: 500, color: "#64748b", lineHeight: 1.4 },
  link: { fontSize: "0.8125rem", fontWeight: 600, color: "#0f172a", textDecoration: "none" },
  infoMessage: { padding: "0.5rem", backgroundColor: "#dbeafe", color: "#1e40af", borderRadius: "0.375rem", fontSize: "0.8125rem" },
  generalError: { padding: "0.5rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "0.375rem", fontSize: "0.8125rem" },
  submitButton: {
    width: "100%",
    backgroundColor: "#000",
    color: "#fff",
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  submitButtonDisabled: { opacity: 0.7, cursor: "not-allowed" },
  footer: { textAlign: "center", fontSize: "0.8125rem", color: "#64748b", marginTop: "1.5rem" },
  signupLink: { fontWeight: 600, color: "#0f172a", textDecoration: "none" },
}

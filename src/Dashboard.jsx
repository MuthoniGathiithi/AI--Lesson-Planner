"use client"
import { useState, useEffect, useRef } from "react"
import "./Dashboard.css"
import { getBilingualFields } from "./utils/bilingual"
import { downloadAsPdf } from "./utils/pdf"
import { styles } from "./styles/dashboardStyles"
import {
  Plus,
  ArrowLeft,
  Trash2,
  Download,
  Edit2,
  Check,
  X,
} from "lucide-react"
import { generateLessonPlan } from "./services/api"

export default function LessonCreator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [lessonPlan, setLessonPlan] = useState(null)
  const [editingField, setEditingField] = useState(null)
  const [editingValue, setEditingValue] = useState("")
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const gradeInputRef = useRef(null)

  const [formData, setFormData] = useState({
    schoolName: "",
    subject: "",
    grade: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    timeRange: "",
    boys: "",
    girls: "",
    strand: "",
    subStrand: "",
  })


 const sanitizeTextInput = (value, maxLen = 120) => {
  const s = String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/[<>]/g, "")

  return s.length > maxLen ? s.slice(0, maxLen) : s
}

  const sanitizeNumberInput = (value, maxLen = 4) => {
    const s = String(value ?? "")
      .replace(/[^0-9]/g, "")
      .slice(0, maxLen)
    return s
  }

  const sanitizeTimeInput = (value) => {
    const s = String(value ?? "").trim()
    return /^\d{2}:\d{2}$/.test(s) ? s : ""
  }

  const normalizeHHMM = (raw) => {
    const s = String(raw ?? "").trim()
    if (!s) return ""

    const m1 = s.match(/^\s*(\d{1,2})\s*:\s*(\d{2})\s*$/)
    if (m1) {
      const hh = Number(m1[1])
      const mm = Number(m1[2])
      if (Number.isFinite(hh) && Number.isFinite(mm) && hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
        return String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0")
      }
      return ""
    }

    const m2 = s.match(/^\s*(\d{1,2})(\d{2})\s*$/)
    if (m2) {
      const hh = Number(m2[1])
      const mm = Number(m2[2])
      if (Number.isFinite(hh) && Number.isFinite(mm) && hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
        return String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0")
      }
    }

    return ""
  }

  const parseTimeRange = (raw) => {
    const s = String(raw ?? "").trim()
    if (!s) return { start: "", end: "" }

    const parts = s.split(/-|–|—/)
    if (parts.length !== 2) return { start: "", end: "" }

    const start = normalizeHHMM(parts[0])
    const end = normalizeHHMM(parts[1])
    return { start, end }
  }

  const sanitizeDateInput = (value) => {
    const s = String(value ?? "").trim()
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ""
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  const handleGenerate = async () => {
    const parsed = parseTimeRange(formData.timeRange)
    const effectiveStartTime = parsed.start || String(formData.startTime ?? "").trim()
    const effectiveEndTime = parsed.end || String(formData.endTime ?? "").trim()

    // Validate required fields - FIXED for number inputs
    const errors = []
    
    if (!formData.schoolName?.trim()) errors.push("School")
    if (!formData.subject?.trim()) errors.push("Learning Area")

    


    const gradeValue = String(formData.grade ?? "").replace(/[^0-9]/g, "")  // Only keep numbers
if (gradeValue === "") errors.push("Grade")
  
    if (errors.length > 0) {
      alert(`Please fill in the following required fields:\n- ${errors.join('\n- ')}`)
      return
    }

    setIsGenerating(true)
    try {
      if (String(formData.grade ?? "").trim() === "") {
        const gradeFromDomNow = String(gradeInputRef.current?.value ?? "").trim()
        if (gradeFromDomNow) {
          setFormData((prev) => ({ ...prev, grade: gradeFromDomNow }))
        }
      }

      const requestFormData = {
        ...formData,
        startTime: effectiveStartTime,
        endTime: effectiveEndTime,
      }

      const normalizedFormData = {
        ...requestFormData,
        subject: toSentenceCase(requestFormData.subject),
        strand: toSentenceCase(requestFormData.strand),
        subStrand: toSentenceCase(requestFormData.subStrand),
      }
      const generatedPlan = await generateLessonPlan(normalizedFormData)

      const normalizedPlan = JSON.parse(JSON.stringify(generatedPlan))
      const plan = normalizedPlan?.lessonPlan || normalizedPlan
      if (!plan.suggestedLearningExperiences) plan.suggestedLearningExperiences = {}

      const normalizeExplorationSteps = (exploration) => {
        if (exploration == null) return []
        if (Array.isArray(exploration)) {
          if (exploration.length === 1 && exploration[0] && typeof exploration[0] === "object" && !Array.isArray(exploration[0])) {
            const only = exploration[0]
            const entries = Object.entries(only)
              .map(([k, v]) => {
                const key = String(k)
                const m = key.match(/\d+/)
                const num = m ? Number(m[0]) : Number.NaN
                const value = typeof v === "string" ? v : v == null ? "" : String(v)
                return { key, num, value }
              })
              .filter((e) => /^step\s*\d+$/i.test(e.key) && e.value.trim())
              .sort((a, b) => (a.num || 0) - (b.num || 0))

            if (entries.length > 0) return entries.map((e) => e.value)
          }
          return exploration
        }

        if (typeof exploration === "object") {
          const entries = Object.entries(exploration)
            .map(([k, v]) => {
              const key = String(k)
              const m = key.match(/\d+/)
              const num = m ? Number(m[0]) : Number.NaN
              const value = typeof v === "string" ? v : v == null ? "" : String(v)
              return { key, num, value }
            })
            .filter((e) => /^step\s*\d+$/i.test(e.key) && e.value.trim())
            .sort((a, b) => (a.num || 0) - (b.num || 0))
          if (entries.length > 0) return entries.map((e) => e.value)
          return [JSON.stringify(exploration)]
        }

        return [String(exploration)]
      }

      plan.suggestedLearningExperiences.exploration = normalizeExplorationSteps(
        plan.suggestedLearningExperiences.exploration
      )

      const coerceText = (v) => {
        if (v == null) return ""
        if (typeof v === "string") return v
        if (typeof v !== "object") return String(v)
        return v.text || v.description || v.content || v.activity || ""
      }

    

      if (!plan.weekLesson) plan.weekLesson = "WEEK 1: LESSON 1"

      setLessonPlan(normalizedPlan)
      console.log("Generated lesson plan:", generatedPlan)
    } catch (error) {
      console.error("Error generating lesson plan:", error)
      const message = error?.message ? String(error.message) : String(error)
      alert(`Failed to generate lesson plan:\n${message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const getExplorationStepText = (step, index) => {
    if (step == null) return ""
    if (typeof step === "string") return step
    if (typeof step !== "object") return String(step)

    const stepKey = `Step ${Number(index) + 1}`
    const keyed = typeof stepKey === "string" ? step?.[stepKey] : undefined
    if (typeof keyed === "string" && keyed.trim()) return keyed

    const stepEntries = Object.entries(step || {})
    const anyStepKey = stepEntries.find(([k, v]) => /^step\s*\d+$/i.test(String(k)) && typeof v === "string" && v.trim())
    if (anyStepKey) return anyStepKey[1]

    return (
      step.description ||
      step.text ||
      step.step ||
      step.activity ||
      step.content ||
      step.task ||
      step.teacherActivity ||
      step.learnerActivity ||
      JSON.stringify(step)
    )
  }

  const normalizeToStringArray = (value) => {
    if (Array.isArray(value)) return value.map((v) => String(v ?? "").trim()).filter(Boolean)
    if (typeof value === "string") {
      const trimmed = value.trim()
      if (!trimmed) return []
      return trimmed
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    }
    if (value == null) return []
    if (typeof value === "object") {
      return Object.values(value)
        .flat()
        .map((v) => String(v ?? "").trim())
        .filter(Boolean)
    }
    return [String(value).trim()].filter(Boolean)
  }

  const toSentenceCase = (value) => {
    const s = String(value ?? "").trim()
    if (!s) return ""
    const lower = s.toLowerCase()
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  }

  const normalizeLessonPlanForSave = (lp) => {
    const clone = typeof structuredClone === "function" ? structuredClone(lp) : JSON.parse(JSON.stringify(lp))
    const plan = clone?.lessonPlan || clone
    
    if (plan) {
      // Normalize arrays
      if (plan.learningResources) {
        plan.learningResources = normalizeToStringArray(plan.learningResources)
      }
      if (plan.keyInquiryQuestions) {
        plan.keyInquiryQuestions = normalizeToStringArray(plan.keyInquiryQuestions)
      }
      if (plan.coreCompetenciesToBeDeveloped) {
        plan.coreCompetenciesToBeDeveloped = normalizeToStringArray(plan.coreCompetenciesToBeDeveloped)
      }
      if (plan.linkToValues) {
        plan.linkToValues = normalizeToStringArray(plan.linkToValues)
      }
      if (plan.linksToPCI) {
        plan.linksToPCI = normalizeToStringArray(plan.linksToPCI)
      }

      // Normalize text fields
      if (plan.learningArea != null) plan.learningArea = toSentenceCase(plan.learningArea)
      if (plan.strand != null) plan.strand = toSentenceCase(plan.strand)
      if (plan.subStrand != null) plan.subStrand = toSentenceCase(plan.subStrand)
    }
    
    return clone
  }

  const handleDownload = async (lesson, format = 'pdf') => {
    setIsDownloading(true)
    try {
      const result = await downloadAsPdf(lesson)

      if (result.success) {
        alert(`Lesson plan downloaded successfully as PDF!`)
      } else {
        alert(`Failed to download: ${result.error}`)
      }
    } catch (error) {
      console.error("Download error:", error)
      alert("An error occurred while downloading the lesson plan")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCreateNew = () => {
    setLessonPlan(null)
    setEditingField(null)
    setFormData({
      schoolName: "",
      subject: "",
      grade: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "",
      endTime: "",
      timeRange: "",
      boys: "",
      girls: "",
      strand: "",
      subStrand: "",
    })
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const startEditing = (field, value) => {
    setEditingField(field)
    setEditingValue(value || "")
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditingValue("")
  }

  const setPathValue = (path, value) => {
    if (!lessonPlan) return

    const newPlan = JSON.parse(JSON.stringify(lessonPlan))
    const keys = path.split('.')

    // ✅ Handle lessonPlan.lessonPlan structure
    let current = newPlan
    let startIndex = 0
    
    if (keys[0] === 'lessonPlan' && (newPlan.lessonPlan || newPlan)) {
      current = newPlan.lessonPlan || newPlan
      startIndex = 1
    }

    for (let i = startIndex; i < keys.length - 1; i++) {
      const key = keys[i]
      const nextKey = keys[i + 1]

      if (!isNaN(nextKey)) {
        if (!current[key]) current[key] = []
      } else {
        if (!current[key]) current[key] = {}
      }
      current = current[key]
    }

    const finalKey = keys[keys.length - 1]
    current[finalKey] = value
    setLessonPlan(newPlan)
  }

  const clearSection = (path, emptyValue) => {
    if (!confirm("Remove this section?")) return
    setPathValue(path, emptyValue)
  }

  // ✅ FIX #2: Fixed saveEdit to handle the correct data structure
  const saveEdit = (path) => {
    if (!lessonPlan) return
    
    const newPlan = JSON.parse(JSON.stringify(lessonPlan))
    const keys = path.split('.')
    
    // Handle the lessonPlan.lessonPlan structure
    let current = newPlan
    let startIndex = 0
    
    // If path starts with "lessonPlan", navigate into the nested structure if it exists
    if (keys[0] === 'lessonPlan' && (newPlan.lessonPlan || newPlan)) {
      current = newPlan.lessonPlan || newPlan
      startIndex = 1
    }
    
    // Navigate to the parent of the field we want to edit
    for (let i = startIndex; i < keys.length - 1; i++) {
      const key = keys[i]
      const nextKey = keys[i + 1]
      
      if (!isNaN(nextKey)) {
        if (!current[key]) current[key] = []
      } else {
        if (!current[key]) current[key] = {}
      }
      current = current[key]
    }
    
    const finalKey = keys[keys.length - 1]
    current[finalKey] = editingValue
    
    setLessonPlan(newPlan)
    setEditingField(null)
    setEditingValue("")
  }

  // ============ NEW STRUCTURE HELPER FUNCTIONS ============
  
  const addLearningOutcome = () => {
    if (!lessonPlan) return
    
    const fields = getBilingualFields(lessonPlan)
    const outcomesData = fields.data.specificLearningOutcomes || { 
      statement: fields.labels.outcomeStatement, 
      outcomes: [] 
    }
    const outcomes = outcomesData.outcomes || []
    
    const newOutcomes = [...outcomes]
    const nextLetter = String.fromCharCode(97 + newOutcomes.length)
    newOutcomes.push({
      id: nextLetter,
      outcome: "New learning outcome - click to edit"
    })
    
    const plan = lessonPlan.lessonPlan || lessonPlan
    if (!plan.specificLearningOutcomes) {
      plan.specificLearningOutcomes = { 
        statement: fields.labels.outcomeStatement, 
        outcomes: [] 
      }
    }
    plan.specificLearningOutcomes.outcomes = newOutcomes
    
    setLessonPlan({...lessonPlan})
  }

  const deleteLearningOutcome = (index) => {
    if (!lessonPlan) return
    
    const fields = getBilingualFields(lessonPlan)
    const outcomesData = fields.data.specificLearningOutcomes || {}
    const outcomes = outcomesData.outcomes || []
    
    const newOutcomes = outcomes.filter((_, i) => i !== index)
    const renumbered = newOutcomes.map((outcome, i) => ({
      ...outcome,
      id: String.fromCharCode(97 + i)
    }))
    
    const plan = lessonPlan.lessonPlan || lessonPlan
    if (plan.specificLearningOutcomes) {
      plan.specificLearningOutcomes.outcomes = renumbered
    }
    
    setLessonPlan({...lessonPlan})
  }

  const addInquiryQuestion = () => {
    if (!lessonPlan) return
    const fields = getBilingualFields(lessonPlan)
    const questions = [...(fields.data.keyInquiryQuestions || [])]
    questions.push("New question - click to edit")
    
    const plan = lessonPlan.lessonPlan || lessonPlan
    plan.keyInquiryQuestions = questions
    setLessonPlan({...lessonPlan})
  }

  const deleteInquiryQuestion = (index) => {
    if (!lessonPlan) return
    const fields = getBilingualFields(lessonPlan)
    const questions = (fields.data.keyInquiryQuestions || []).filter((_, i) => i !== index)
    
    const plan = lessonPlan.lessonPlan || lessonPlan
    plan.keyInquiryQuestions = questions
    setLessonPlan({...lessonPlan})
  }

  const addCoreCompetency = () => {
    if (!lessonPlan) return
    const fields = getBilingualFields(lessonPlan)
    const competencies = [...(fields.data.coreCompetencies || [])]
    competencies.push("New competency - click to edit")
    
    const plan = lessonPlan.lessonPlan || lessonPlan
    plan.coreCompetenciesToBeDeveloped = competencies
    setLessonPlan({...lessonPlan})
  }

  const deleteCoreCompetency = (index) => {
    if (!lessonPlan) return
    const fields = getBilingualFields(lessonPlan)
    const competencies = (fields.data.coreCompetencies || []).filter((_, i) => i !== index)
    
    const plan = lessonPlan.lessonPlan || lessonPlan
    plan.coreCompetenciesToBeDeveloped = competencies
    setLessonPlan({...lessonPlan})
  }

  const addValue = () => {
    if (!lessonPlan) return
    const fields = getBilingualFields(lessonPlan)
    const values = [...(fields.data.linkToValues || [])]
    values.push("New value - click to edit")
    
    const plan = lessonPlan.lessonPlan || lessonPlan
    plan.linkToValues = values
    setLessonPlan({...lessonPlan})
  }

  const deleteValue = (index) => {
    if (!lessonPlan) return
    const fields = getBilingualFields(lessonPlan)
    const values = (fields.data.linkToValues || []).filter((_, i) => i !== index)
    
    const plan = lessonPlan.lessonPlan || lessonPlan
    plan.linkToValues = values
    setLessonPlan({...lessonPlan})
  }

  const addPCI = () => {
    if (!lessonPlan) return
    const fields = getBilingualFields(lessonPlan)
    const pcis = [...(fields.data.linksToPCI || [])]
    pcis.push("New PCI - click to edit")
    
    const plan = lessonPlan.lessonPlan || lessonPlan
    plan.linksToPCI = pcis
    setLessonPlan({...lessonPlan})
  }

  const deletePCI = (index) => {
    if (!lessonPlan) return
    const fields = getBilingualFields(lessonPlan)
    const pcis = (fields.data.linksToPCI || []).filter((_, i) => i !== index)
    
    const plan = lessonPlan.lessonPlan || lessonPlan
    plan.linksToPCI = pcis
    setLessonPlan({...lessonPlan})
  }

  const addExplorationStep = () => {
    if (!lessonPlan) return
    const fields = getBilingualFields(lessonPlan)
    const experiences = fields.data.suggestedLearningExperiences || {}
    const exploration = [...(experiences.exploration || [])]
    exploration.push("Step description - click to edit")
    
    const plan = lessonPlan.lessonPlan || lessonPlan
    if (!plan.suggestedLearningExperiences) plan.suggestedLearningExperiences = {}
    plan.suggestedLearningExperiences.exploration = exploration
    setLessonPlan({...lessonPlan})
  }

  const deleteExplorationStep = (index) => {
    if (!lessonPlan) return
    const fields = getBilingualFields(lessonPlan)
    const experiences = fields.data.suggestedLearningExperiences || {}
    const exploration = (experiences.exploration || []).filter((_, i) => i !== index)
    
    const plan = lessonPlan.lessonPlan || lessonPlan
    if (plan.suggestedLearningExperiences) {
      plan.suggestedLearningExperiences.exploration = exploration
    }
    setLessonPlan({...lessonPlan})
  }

  const renderEditableField = (path, value, multiline = false, placeholder = "Click to edit") => {
    const fieldKey = path
    const isEditing = editingField === fieldKey
    const displayValue = typeof value === "string" ? value.trim() : value
    
    return (
      <div style={styles.editableContainer}>
        {isEditing ? (
          <div style={styles.editingWrapper}>
            {multiline ? (
              <textarea
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                style={styles.editTextarea}
                placeholder={placeholder}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') cancelEditing()
                }}
              />
            ) : (
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                style={styles.editInput}
                placeholder={placeholder}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit(path)
                  if (e.key === 'Escape') cancelEditing()
                }}
              />
            )}
            <div style={styles.editButtonGroup}>
              <button 
                type="button"
                onClick={() => saveEdit(path)} 
                style={styles.saveEditBtn}
                title="Save (Enter)"
              >
                <Check size={16} />
              </button>
              <button 
                type="button"
                onClick={cancelEditing} 
                style={styles.cancelEditBtn}
                title="Cancel (Esc)"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div 
            style={styles.editableValue} 
            onClick={() => startEditing(fieldKey, displayValue)}
            title="Click to edit"
          >
            <span style={styles.editableText}>
              {displayValue || placeholder}
            </span>
            <Edit2 size={14} style={styles.editIcon} />
          </div>
        )}
      </div>
    )
  }

  const isMobile = windowWidth <= 768

  return (
    <div style={styles.container}>
      <main
        className={isMobile ? 'main-mobile' : ''}
        style={{
          ...styles.main,
          marginLeft: '0'
        }}
      >
        <div
          className={isMobile ? 'content-mobile' : ''}
          style={styles.content}
        >

              // Enhanced Form Component with Dropdowns - Replace your form section

{!lessonPlan ? (
  <div style={{
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px 20px"
  }}>
    {/* Form Header */}
    <div style={{
      textAlign: "center",
      marginBottom: "48px"
    }}>
      {/* Funzo Hub Branding */}
      <div style={{
        fontSize: "3rem",
        fontWeight: 900,
        background: "linear-gradient(135deg, #4338CA 0%, #6366F1 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        marginBottom: "16px",
        letterSpacing: "-2px"
      }}>
        Funzo Hub
      </div>
      
      <h2 style={{
        fontSize: "2.5rem",
        fontWeight: 800,
        color: "#111827",
        margin: "0 0 12px 0",
        letterSpacing: "-1px"
      }}>
        Create New Lesson Plan
      </h2>
      <p style={{
        fontSize: "1.05rem",
        color: "#6B7280",
        margin: 0,
        lineHeight: 1.6
      }}>
        Fill in the details below to generate your CBE-aligned lesson plan
      </p>
    </div>

    {/* Main Form Card */}
    <div style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "20px",
      border: "2px solid #4338CA",
      boxShadow: "0 20px 60px rgba(67, 56, 202, 0.15)",
      padding: "48px 40px",
      marginBottom: "24px"
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "24px"
      }}>
        {/* School Name */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{
            display: "block",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "#111827",
            marginBottom: "10px"
          }}>
            School Name <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            name="schoolName"
            placeholder="e.g., Nairobi Primary School"
            value={formData.schoolName ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                schoolName: sanitizeTextInput(e.target.value, 120)
              }))
            }
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "2px solid #E5E7EB",
              fontSize: "1rem",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.3s ease",
              outline: "none",
              backgroundColor: "#FFFFFF",
              ...((!formData.schoolName?.trim()) ? { borderColor: "#fca5a5" } : {})
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#4338CA"
              e.target.style.boxShadow = "0 0 0 4px rgba(67, 56, 202, 0.1)"
            }}
            onBlur={(e) => {
              e.target.style.borderColor = formData.schoolName?.trim() ? "#E5E7EB" : "#fca5a5"
              e.target.style.boxShadow = "none"
            }}
          />
        </div>

        {/* Learning Area - SELECT DROPDOWN */}
        <div>
          <label style={{
            display: "block",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "#111827",
            marginBottom: "10px"
          }}>
            Learning Area <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            name="subject"
            value={formData.subject ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                subject: e.target.value
              }))
            }
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "2px solid #E5E7EB",
              fontSize: "1rem",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.3s ease",
              outline: "none",
              backgroundColor: "#FFFFFF",
              cursor: "pointer",
              ...((!formData.subject?.trim()) ? { borderColor: "#fca5a5" } : {})
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#4338CA"
              e.target.style.boxShadow = "0 0 0 4px rgba(67, 56, 202, 0.1)"
            }}
            onBlur={(e) => {
              e.target.style.borderColor = formData.subject?.trim() ? "#E5E7EB" : "#fca5a5"
              e.target.style.boxShadow = "none"
            }}
          >
            <option value="">-- Select Learning Area --</option>
            
            {/* Compulsory Subjects */}
            <optgroup label="Compulsory Subjects">
              <option value="English">English</option>
              <option value="Kiswahili">Kiswahili/KSL</option>
              <option value="Core Mathematics">Core Mathematics</option>
              <option value="Essential Mathematics">Essential Mathematics</option>
              <option value="Community Service Learning">Community Service Learning (CSL)</option>
            </optgroup>
            
            {/* Arts & Sports */}
            <optgroup label="Arts & Sports">
              <option value="Sports and Recreation">Sports and Recreation</option>
              <option value="Music and Dance">Music and Dance</option>
              <option value="Theatre and Film">Theatre and Film</option>
              <option value="Fine Arts">Fine Arts</option>
            </optgroup>
            
            {/* Social Sciences */}
            <optgroup label="Social Sciences">
              <option value="Literature in English">Literature in English</option>
              <option value="Indigenous Languages">Indigenous Languages</option>
              <option value="Fasihi ya Kiswahili">Fasihi ya Kiswahili</option>
              <option value="Sign Language">Sign Language</option>
              <option value="Arabic">Arabic</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Mandarin Chinese">Mandarin Chinese</option>
              <option value="Christian Religious Education">Christian Religious Education</option>
              <option value="Islamic Religious Education">Islamic Religious Education</option>
              <option value="Hindu Religious Education">Hindu Religious Education</option>
              <option value="Business Studies">Business Studies</option>
              <option value="History and Citizenship">History and Citizenship</option>
              <option value="Geography">Geography</option>
            </optgroup>
            
            {/* STEM */}
            <optgroup label="Science, Technology, Engineering & Mathematics (STEM)">
              <option value="Biology">Biology</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
              <option value="General Science">General Science</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Computer Studies">Computer Studies</option>
              <option value="Home Science">Home Science</option>
              <option value="Aviation">Aviation</option>
              <option value="Building Construction">Building Construction</option>
              <option value="Electricity">Electricity</option>
              <option value="Metalwork">Metalwork</option>
              <option value="Power Mechanics">Power Mechanics</option>
              <option value="Woodwork">Woodwork</option>
              <option value="Media Technology">Media Technology</option>
              <option value="Marine and Fisheries Technology">Marine and Fisheries Technology</option>
            </optgroup>
          </select>
        </div>

        {/* Grade */}
        <div>
          <label style={{
            display: "block",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "#111827",
            marginBottom: "10px"
          }}>
            Grade <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="number"
            name="grade"
            placeholder="e.g., 5"
            ref={gradeInputRef}
            value={formData.grade ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                grade: sanitizeNumberInput(e.target.value, 2)
              }))
            }
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "2px solid #E5E7EB",
              fontSize: "1rem",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.3s ease",
              outline: "none",
              backgroundColor: "#FFFFFF",
              ...((formData.grade === "" || formData.grade === null || formData.grade === undefined) ? { borderColor: "#fca5a5" } : {})
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#4338CA"
              e.target.style.boxShadow = "0 0 0 4px rgba(67, 56, 202, 0.1)"
            }}
            onBlur={(e) => {
              const hasValue = formData.grade !== "" && formData.grade !== null && formData.grade !== undefined
              e.target.style.borderColor = hasValue ? "#E5E7EB" : "#fca5a5"
              e.target.style.boxShadow = "none"
            }}
          />
        </div>

        {/* Date */}
        <div>
          <label style={{
            display: "block",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "#111827",
            marginBottom: "10px"
          }}>
            Date <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                date: sanitizeDateInput(e.target.value)
              }))
            }
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "2px solid #E5E7EB",
              fontSize: "1rem",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.3s ease",
              outline: "none",
              backgroundColor: "#FFFFFF"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#4338CA"
              e.target.style.boxShadow = "0 0 0 4px rgba(67, 56, 202, 0.1)"
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E5E7EB"
              e.target.style.boxShadow = "none"
            }}
          />
        </div>

        {/* Time Range */}
        <div>
          <label style={{
            display: "block",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "#111827",
            marginBottom: "10px"
          }}>
            Time <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            name="timeRange"
            placeholder="e.g., 08:00 - 08:45"
            value={formData.timeRange ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                timeRange: e.target.value
              }))
            }
            onBlur={(e) => {
              const { start, end } = parseTimeRange(e.target.value)
              setFormData((prev) => ({
                ...prev,
                startTime: start,
                endTime: end,
                timeRange: start && end ? `${start} - ${end}` : prev.timeRange,
              }))
            }}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "2px solid #E5E7EB",
              fontSize: "1rem",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.3s ease",
              outline: "none",
              backgroundColor: "#FFFFFF",
              ...(!((parseTimeRange(formData.timeRange).start || formData.startTime) && (parseTimeRange(formData.timeRange).end || formData.endTime)) ? { borderColor: "#fca5a5" } : {})
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#4338CA"
              e.target.style.boxShadow = "0 0 0 4px rgba(67, 56, 202, 0.1)"
            }}
            onBlur={(e) => {
              const { start, end } = parseTimeRange(e.target.value)
              setFormData((prev) => ({
                ...prev,
                startTime: start,
                endTime: end,
                timeRange: start && end ? `${start} - ${end}` : prev.timeRange,
              }))
              const hasTimeRange = start && end
              e.target.style.borderColor = hasTimeRange ? "#E5E7EB" : "#fca5a5"
              e.target.style.boxShadow = "none"
            }}
          />
          <p style={{ 
            fontSize: "0.85rem", 
            color: "#6B7280", 
            margin: "6px 0 0 0",
            fontStyle: "italic"
          }}>
            Format: HH:MM - HH:MM (e.g., 08:00 - 08:45)
          </p>
        </div>

        {/* Boys */}
        <div>
          <label style={{
            display: "block",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "#111827",
            marginBottom: "10px"
          }}>
            Roll - Boys <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="number"
            name="boys"
            placeholder="e.g., 15"
            value={formData.boys ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                boys: sanitizeNumberInput(e.target.value, 3)
              }))
            }
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "2px solid #E5E7EB",
              fontSize: "1rem",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.3s ease",
              outline: "none",
              backgroundColor: "#FFFFFF",
              ...((formData.boys === "" || formData.boys === null || formData.boys === undefined) ? { borderColor: "#fca5a5" } : {})
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#4338CA"
              e.target.style.boxShadow = "0 0 0 4px rgba(67, 56, 202, 0.1)"
            }}
            onBlur={(e) => {
              const hasValue = formData.boys !== "" && formData.boys !== null && formData.boys !== undefined
              e.target.style.borderColor = hasValue ? "#E5E7EB" : "#fca5a5"
              e.target.style.boxShadow = "none"
            }}
          />
        </div>

        {/* Girls */}
        <div>
          <label style={{
            display: "block",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "#111827",
            marginBottom: "10px"
          }}>
            Roll - Girls <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="number"
            name="girls"
            placeholder="e.g., 18"
            value={formData.girls ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                girls: sanitizeNumberInput(e.target.value, 3)
              }))
            }
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "2px solid #E5E7EB",
              fontSize: "1rem",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.3s ease",
              outline: "none",
              backgroundColor: "#FFFFFF",
              ...((formData.girls === "" || formData.girls === null || formData.girls === undefined) ? { borderColor: "#fca5a5" } : {})
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#4338CA"
              e.target.style.boxShadow = "0 0 0 4px rgba(67, 56, 202, 0.1)"
            }}
            onBlur={(e) => {
              const hasValue = formData.girls !== "" && formData.girls !== null && formData.girls !== undefined
              e.target.style.borderColor = hasValue ? "#E5E7EB" : "#fca5a5"
              e.target.style.boxShadow = "none"
            }}
          />
        </div>

        {/* Strand */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{
            display: "block",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "#111827",
            marginBottom: "10px"
          }}>
            Strand <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            name="strand"
            placeholder="e.g., Numbers, Algebra, Geometry"
            value={formData.strand ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                strand: sanitizeTextInput(e.target.value, 120)
              }))
            }
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "2px solid #E5E7EB",
              fontSize: "1rem",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.3s ease",
              outline: "none",
              backgroundColor: "#FFFFFF",
              ...((!formData.strand?.trim()) ? { borderColor: "#fca5a5" } : {})
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#4338CA"
              e.target.style.boxShadow = "0 0 0 4px rgba(67, 56, 202, 0.1)"
            }}
            onBlur={(e) => {
              e.target.style.borderColor = formData.strand?.trim() ? "#E5E7EB" : "#fca5a5"
              e.target.style.boxShadow = "none"
            }}
          />
        </div>

        {/* Sub-strand */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{
            display: "block",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "#111827",
            marginBottom: "10px"
          }}>
            Sub-strand <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            name="subStrand"
            placeholder="e.g., Addition and Subtraction, Linear Equations"
            value={formData.subStrand ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                subStrand: sanitizeTextInput(e.target.value, 120)
              }))
            }
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "2px solid #E5E7EB",
              fontSize: "1rem",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.3s ease",
              outline: "none",
              backgroundColor: "#FFFFFF",
              ...((!formData.subStrand?.trim()) ? { borderColor: "#fca5a5" } : {})
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#4338CA"
              e.target.style.boxShadow = "0 0 0 4px rgba(67, 56, 202, 0.1)"
            }}
            onBlur={(e) => {
              e.target.style.borderColor = formData.subStrand?.trim() ? "#E5E7EB" : "#fca5a5"
              e.target.style.boxShadow = "none"
            }}
          />
        </div>
      </div>

      {/* Generate Button */}
      <button 
        type="button" 
        onClick={handleGenerate} 
        disabled={isGenerating}
        style={{
          width: "100%",
          marginTop: "32px",
          backgroundColor: "#4338CA",
          color: "#FFFFFF",
          border: "none",
          padding: "16px 24px",
          borderRadius: "12px",
          fontWeight: 700,
          fontSize: "1.05rem",
          cursor: isGenerating ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 14px rgba(67, 56, 202, 0.3)",
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "0.3px",
          opacity: isGenerating ? 0.7 : 1
        }}
        onMouseOver={(e) => {
          if (!isGenerating) {
            e.target.style.backgroundColor = "#3730A3"
            e.target.style.transform = "translateY(-2px)"
            e.target.style.boxShadow = "0 8px 20px rgba(67, 56, 202, 0.4)"
          }
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = "#4338CA"
          e.target.style.transform = "translateY(0)"
          e.target.style.boxShadow = "0 4px 14px rgba(67, 56, 202, 0.3)"
        }}
      >
        {isGenerating ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <span style={{
              display: "inline-block",
              width: "16px",
              height: "16px",
              border: "3px solid rgba(255,255,255,0.3)",
              borderTopColor: "#FFFFFF",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite"
            }}></span>
            Generating Lesson Plan...
          </span>
        ) : (
          "Generate Lesson Plan"
        )}
      </button>
    </div>

    {/* Info Tip */}
    <div style={{
      padding: "16px 20px",
      backgroundColor: "#EEF2FF",
      border: "2px solid #C7D2FE",
      borderRadius: "12px",
      display: "flex",
      gap: "12px",
      alignItems: "start"
    }}>
      <span style={{ fontSize: "1.5rem" }}>💡</span>
      <div style={{ flex: 1 }}>
        <strong style={{ color: "#4338CA", fontSize: "0.95rem" }}>Pro Tip:</strong>
        <p style={{ 
          margin: "4px 0 0 0", 
          fontSize: "0.9rem", 
          color: "#4338CA",
          lineHeight: 1.6 
        }}>
          For Kiswahili lessons, select "Kiswahili" or "Fasihi ya Kiswahili" from the Learning Area dropdown to get full Kiswahili output with subject-specific terminology!
        </p>
      </div>
    </div>

    {/* Add spinning animation */}
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
) : (    
              
              
                <div style={styles.documentContainer}>
                  <div 
                    className={isMobile ? 'action-bar-mobile' : ''}
                    style={styles.actionBar}
                  >
                    <button type="button" onClick={handleCreateNew} style={styles.backButton}>
                      <ArrowLeft size={16} />
                      <span>New Plan</span>
                    </button>
                    <div 
                      className={isMobile ? 'action-bar-right-mobile' : ''}
                      style={styles.actionBarRight}
                    >
                      <button 
                        type="button"
                        onClick={() => handleDownload(lessonPlan, 'pdf')} 
                        disabled={isDownloading}
                        style={styles.pdfButton}
                      >
                        <Download size={16} />
                        <span>{isDownloading ? "Downloading..." : "Download PDF"}</span>
                      </button>
                    </div>
                  </div>

                  <div 
                    className={isMobile ? 'document-page-mobile' : ''}
                    style={styles.documentPage}
                  >
                    {(() => {
                      const fields = getBilingualFields(lessonPlan)
                      const { isKiswahili, labels, data } = fields

                      return (
                        <>
                          <div style={styles.docHeader}>
                            <div style={styles.docTitle}>{isKiswahili ? "MPANGO WA SOMO" : "LESSON PLAN"}</div>
                            <div style={styles.docSubtitle}>
                              {renderEditableField(
                                "lessonPlan.weekLesson",
                                (data.weekLesson || (lessonPlan?.lessonPlan || lessonPlan)?.weekLesson) ?? "WEEK 1: LESSON 1",
                                false,
                                "WEEK 1: LESSON 1"
                              )}
                            </div>
                            <div style={styles.docDivider}></div>
                          </div>

                          {/* BASIC INFORMATION */}
                          <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>{isKiswahili ? "TAARIFA ZA MSINGI" : "BASIC INFORMATION"}</h3>
                            <table className={isMobile ? 'doc-table-mobile' : ''} style={styles.docTable}>
                              <tbody>
                                <tr>
                                  <td style={styles.tableLabelCell}>{labels.school}:</td>
                                  <td style={styles.tableValueCell}>
                                    {renderEditableField("lessonPlan.school", data.school)}
                                  </td>
                                  <td style={styles.tableLabelCell}>{labels.learningArea}:</td>
                                  <td style={styles.tableValueCell}>
                                    {renderEditableField("lessonPlan.learningArea", data.learningArea)}
                                  </td>
                                </tr>
                                <tr>
                                  <td style={styles.tableLabelCell}>{labels.grade}:</td>
                                  <td style={styles.tableValueCell}>
                                    {renderEditableField("lessonPlan.grade", data.grade?.toString())}
                                  </td>
                                  <td style={styles.tableLabelCell}>{labels.date}:</td>
                                  <td style={styles.tableValueCell}>
                                    {renderEditableField("lessonPlan.date", data.date)}
                                  </td>
                                </tr>
                                <tr>
                                  <td style={styles.tableLabelCell}>{labels.time}:</td>
                                  <td style={styles.tableValueCell}>
                                    {renderEditableField("lessonPlan.time", data.time)}
                                  </td>
                                  <td style={styles.tableLabelCell}>{labels.roll}:</td>
                                  <td style={styles.tableValueCell}>
                                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                      <span>{labels.boys}: {renderEditableField("lessonPlan.roll.boys", String(data.roll?.boys || 0))}</span>
                                      <span>{labels.girls}: {renderEditableField("lessonPlan.roll.girls", String(data.roll?.girls || 0))}</span>
                                      <span>{labels.total}: {data.roll?.total || 0}</span>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* STRAND */}
                          <div style={styles.section}>
                            <div style={styles.sectionTitle}>{labels.strand}</div>
                            {renderEditableField("lessonPlan.strand", data.strand, false, "Enter strand")}
                          </div>

                          {/* SUB-STRAND */}
                          <div style={styles.section}>
                            <div style={styles.sectionTitle}>{labels.subStrand}</div>
                            {renderEditableField("lessonPlan.subStrand", data.subStrand, false, "Enter sub-strand")}
                          </div>

                          {/* SPECIFIC LEARNING OUTCOMES */}
                          <div style={styles.section}>
                            <div style={styles.sectionHeaderWithButton}>
                              <div style={styles.sectionTitle}>{labels.specificLearningOutcomes}</div>
                              <button type="button" onClick={addLearningOutcome} style={styles.addButton} title="Add outcome">
                                <Plus size={16} />
                                <span>Add</span>
                              </button>
                            </div>
                            <div style={{ fontStyle: 'italic', marginBottom: '12px', fontSize: '12px' }}>
                              {data.specificLearningOutcomes?.statement || labels.outcomeStatement}
                            </div>
                            {(data.specificLearningOutcomes?.outcomes || []).map((outcome, index) => (
                              <div key={index} style={styles.outcomeItem}>
                                <div style={styles.outcomeNumber}>{outcome.id || String.fromCharCode(97 + index)})</div>
                                <div style={styles.outcomeContent}>
                                  {renderEditableField(`lessonPlan.specificLearningOutcomes.outcomes.${index}.outcome`, outcome.outcome || outcome.text, true, "Enter outcome")}
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => deleteLearningOutcome(index)} 
                                  style={styles.deleteButton}
                                  title="Delete outcome"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* KEY INQUIRY QUESTIONS */}
                          <div style={styles.section}>
                            <div style={styles.sectionHeaderWithButton}>
                              <div style={styles.sectionTitle}>{labels.keyInquiryQuestions}</div>
                              <button type="button" onClick={addInquiryQuestion} style={styles.addButton} title="Add question">
                                <Plus size={16} />
                                <span>Add</span>
                              </button>
                            </div>
                            {(data.keyInquiryQuestions || []).map((question, index) => (
                              <div key={index} style={styles.outcomeItem}>
                                <div style={styles.outcomeNumber}>{index + 1})</div>
                                <div style={styles.outcomeContent}>
                                  {renderEditableField(`lessonPlan.keyInquiryQuestions.${index}`, question, false, "Enter question")}
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => deleteInquiryQuestion(index)} 
                                  style={styles.deleteButton}
                                  title="Delete question"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* CORE COMPETENCIES */}
                          <div style={styles.section}>
                            <div style={styles.sectionHeaderWithButton}>
                              <div style={styles.sectionTitle}>{labels.coreCompetencies}</div>
                              <button type="button" onClick={addCoreCompetency} style={styles.addButton} title="Add competency">
                                <Plus size={16} />
                                <span>Add</span>
                              </button>
                            </div>
                            {(data.coreCompetencies || []).map((competency, index) => (
                              <div key={index} style={styles.listItem}>
                                <span>• </span>
                                <div style={{ flex: 1 }}>
                                  {renderEditableField(`lessonPlan.coreCompetenciesToBeDeveloped.${index}`, competency, false, "Enter competency")}
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => deleteCoreCompetency(index)} 
                                  style={styles.deleteButton}
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* LINK TO VALUES */}
                          <div style={styles.section}>
                            <div style={styles.sectionHeaderWithButton}>
                              <div style={styles.sectionTitle}>{labels.linkToValues}</div>
                              <button type="button" onClick={addValue} style={styles.addButton} title="Add value">
                                <Plus size={16} />
                                <span>Add</span>
                              </button>
                            </div>
                            {(data.linkToValues || []).map((value, index) => (
                              <div key={index} style={styles.listItem}>
                                <span>• </span>
                                <div style={{ flex: 1 }}>
                                  {renderEditableField(`lessonPlan.linkToValues.${index}`, value, false, "Enter value")}
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => deleteValue(index)} 
                                  style={styles.deleteButton}
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* LINKS TO PCI */}
                          <div style={styles.section}>
                            <div style={styles.sectionHeaderWithButton}>
                              <div style={styles.sectionTitle}>{labels.linksToPCI}</div>
                              <button type="button" onClick={addPCI} style={styles.addButton} title="Add PCI">
                                <Plus size={16} />
                                <span>Add</span>
                              </button>
                            </div>
                            {(data.linksToPCI || []).map((pci, index) => (
                              <div key={index} style={styles.listItem}>
                                <span>• </span>
                                <div style={{ flex: 1 }}>
                                  {renderEditableField(`lessonPlan.linksToPCI.${index}`, pci, false, "Enter PCI")}
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => deletePCI(index)} 
                                  style={styles.deleteButton}
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* LEARNING RESOURCES */}
                          <div style={styles.section}>
                            <div style={styles.sectionHeaderWithButton}>
                              <div style={styles.sectionTitle}>{labels.learningResources}</div>
                              <button
                                type="button"
                                onClick={() => clearSection("lessonPlan.learningResources", [])}
                                style={styles.clearSectionButton}
                                title="Remove section"
                              >
                                <Trash2 size={14} />
                                <span>Remove</span>
                              </button>
                            </div>
                            {renderEditableField("lessonPlan.learningResources", normalizeToStringArray(data.learningResources).join(", "), true, "Enter resources (comma-separated)")}
                          </div>

                          {/* SUGGESTED LEARNING EXPERIENCES */}
                          <div style={styles.section}>
                            <div style={styles.sectionHeaderWithButton}>
                              <div style={styles.sectionTitle}>{labels.suggestedLearningExperiences}</div>
                              <button
                                type="button"
                                onClick={() => clearSection("lessonPlan.suggestedLearningExperiences", {})}
                                style={styles.clearSectionButton}
                                title="Remove section"
                              >
                                <Trash2 size={14} />
                                <span>Remove</span>
                              </button>
                            </div>

                            {/* i) Introduction */}
                            <div style={styles.subsection}>
                              <div style={styles.sectionHeaderWithButton}>
                                <div style={styles.subsectionTitle}>i) {labels.introduction} (5 mins)</div>
                                <button
                                  onClick={() => clearSection("lessonPlan.suggestedLearningExperiences.introduction", "")}
                                  style={styles.clearSectionButton}
                                  title="Remove section"
                                >
                                  <Trash2 size={14} />
                                  <span>Remove</span>
                                </button>
                              </div>
                              {renderEditableField("lessonPlan.suggestedLearningExperiences.introduction", data.suggestedLearningExperiences?.introduction, true, "Enter introduction")}
                            </div>

                            {/* ii) Exploration/Development */}
                            <div style={styles.subsection}>
                              <div style={styles.sectionHeaderWithButton}>
                                <div style={styles.subsectionTitle}>ii) {labels.exploration} (35 mins)</div>
                                <button onClick={addExplorationStep} style={styles.addButton} title="Add step">
                                  <Plus size={16} />
                                  <span>Add Step</span>
                                </button>
                                <button
                                  onClick={() => clearSection("lessonPlan.suggestedLearningExperiences.exploration", [])}
                                  style={styles.clearSectionButton}
                                  title="Remove section"
                                >
                                  <Trash2 size={14} />
                                  <span>Remove</span>
                                </button>
                              </div>
                              {(data.suggestedLearningExperiences?.exploration || []).map((step, index) => (
                                <div key={index} style={styles.stepBlock}>
                                  <div style={styles.stepHeader}>
                                    <div style={styles.stepTitleText}>{labels.step} {index + 1}</div>
                                    <button 
                                      onClick={() => deleteExplorationStep(index)} 
                                      style={styles.deleteButton}
                                      title="Delete step"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                  <div style={styles.stepField}>
                                    {renderEditableField(
                                      `lessonPlan.suggestedLearningExperiences.exploration.${index}`,
                                      getExplorationStepText(step, index),
                                      true,
                                      "Enter step description"
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* iii) Reflection */}
                            <div style={styles.subsection}>
                              <div style={styles.sectionHeaderWithButton}>
                                <div style={styles.subsectionTitle}>iii) {labels.reflection}</div>
                                <button
                                  onClick={() => clearSection("lessonPlan.reflection", "")}
                                  style={styles.clearSectionButton}
                                  title="Remove section"
                                >
                                  <Trash2 size={14} />
                                  <span>Remove</span>
                                </button>
                              </div>
                              {renderEditableField(
                                "lessonPlan.reflection", 
                                data.suggestedLearningExperiences?.reflection || data.reflection || (lessonPlan?.lessonPlan || lessonPlan)?.reflection || (lessonPlan?.lessonPlan || lessonPlan)?.suggestedLearningExperiences?.reflection, 
                                true, 
                                "Enter reflection"
                              )}
                            </div>

                            {/* iv) Extension */}
                            <div style={styles.subsection}>
                              <div style={styles.sectionHeaderWithButton}>
                                <div style={styles.subsectionTitle}>iv) {labels.extension}</div>
                                <button
                                  onClick={() => clearSection("lessonPlan.extension", "")}
                                  style={styles.clearSectionButton}
                                  title="Remove section"
                                >
                                  <Trash2 size={14} />
                                  <span>Remove</span>
                                </button>
                              </div>
                              {renderEditableField(
                                "lessonPlan.extension", 
                                data.suggestedLearningExperiences?.extension || data.extension || (lessonPlan?.lessonPlan || lessonPlan)?.extension || (lessonPlan?.lessonPlan || lessonPlan)?.suggestedLearningExperiences?.extension, 
                                true, 
                                "Enter extension"
                              )}
                            </div>

                            {/* v) Conclusion */}
                            <div style={styles.subsection}>
                              <div style={styles.sectionHeaderWithButton}>
                                <div style={styles.subsectionTitle}>v) Conclusion (5 mins)</div>
                                <button
                                  onClick={() => clearSection("lessonPlan.conclusion", "")}
                                  style={styles.clearSectionButton}
                                  title="Remove section"
                                >
                                  <Trash2 size={14} />
                                  <span>Remove</span>
                                </button>
                              </div>
                              {renderEditableField(
                                "lessonPlan.conclusion",
                                data.suggestedLearningExperiences?.conclusion || data.conclusion || (lessonPlan?.lessonPlan || lessonPlan)?.conclusion || (lessonPlan?.lessonPlan || lessonPlan)?.suggestedLearningExperiences?.conclusion,
                                true,
                                "Enter conclusion"
                              )}
                            </div>
                          </div>

                          {/* PARENTAL INVOLVEMENT */}
                          <div style={styles.section}>
                            <div style={styles.sectionHeaderWithButton}>
                              <div style={styles.sectionTitle}>{labels.parentalInvolvement}</div>
                              <button
                                onClick={() => clearSection("lessonPlan.suggestedParentalInvolvement", "")}
                                style={styles.clearSectionButton}
                                title="Remove section"
                              >
                                <Trash2 size={14} />
                                <span>Remove</span>
                              </button>
                            </div>
                            {renderEditableField("lessonPlan.suggestedParentalInvolvement", data.parentalInvolvement || (lessonPlan?.lessonPlan || lessonPlan)?.suggestedParentalInvolvement, true, "Enter parental involvement/community service learning")}
                          </div>

                          {/* SELF EVALUATION */}
                          <div style={styles.section}>
                            <div style={styles.sectionHeaderWithButton}>
                              <div style={styles.sectionTitle}>{labels.selfEvaluation}</div>
                              <button
                                onClick={() => clearSection("lessonPlan.selfEvaluationMarks", "")}
                                style={styles.clearSectionButton}
                                title="Remove section"
                              >
                                <Trash2 size={14} />
                                <span>Remove</span>
                              </button>
                            </div>
                            {renderEditableField("lessonPlan.selfEvaluationMarks", data.selfEvaluation || (lessonPlan?.lessonPlan || lessonPlan)?.selfEvaluationMarks, true, "Enter self-evaluation criteria")}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              )}
        </div>
      </main>
    </div>
  )
}
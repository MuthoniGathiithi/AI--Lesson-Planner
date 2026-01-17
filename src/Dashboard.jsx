"use client"

import { useState, useEffect } from "react"
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

  const [formData, setFormData] = useState({
    schoolName: "",
    subject: "",
    grade: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "08:00",
    endTime: "08:40",
    boys: "",
    girls: "",
    strand: "",
    subStrand: "",
  })

  const sanitizeTextInput = (value, maxLen = 120) => {
    const s = String(value ?? "")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
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
    // Validate required fields - FIXED for number inputs
    const errors = []
    
    if (!formData.schoolName?.trim()) errors.push("School")
    if (!formData.subject?.trim()) errors.push("Learning Area")
    if (String(formData.grade ?? "").trim() === "") errors.push("Grade")
    if (!formData.date?.trim()) errors.push("Date")
    if (!formData.startTime?.trim()) errors.push("Time")
    if (!formData.strand?.trim()) errors.push("Strand")
    if (!formData.subStrand?.trim()) errors.push("Sub-strand")
    
    if (errors.length > 0) {
      alert(`Please fill in the following required fields:\n- ${errors.join('\n- ')}`)
      return
    }

    setIsGenerating(true)
    try {
      const normalizedFormData = {
        ...formData,
        subject: toSentenceCase(formData.subject),
        strand: toSentenceCase(formData.strand),
        subStrand: toSentenceCase(formData.subStrand),
      }
      const generatedPlan = await generateLessonPlan(normalizedFormData)
      setLessonPlan(generatedPlan)
      console.log("Generated lesson plan:", generatedPlan)
    } catch (error) {
      console.error("Error generating lesson plan:", error)
      const message = error?.message ? String(error.message) : String(error)
      alert(`Failed to generate lesson plan:\n${message}`)
    } finally {
      setIsGenerating(false)
    }
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
      startTime: "08:00",
      endTime: "08:40",
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

    let current = newPlan
    for (let i = 0; i < keys.length - 1; i++) {
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

  const saveEdit = (path) => {
    if (!lessonPlan) return
    
    const newPlan = JSON.parse(JSON.stringify(lessonPlan))
    const keys = path.split('.')
    
    let current = newPlan
    for (let i = 0; i < keys.length - 1; i++) {
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
                onClick={() => saveEdit(path)} 
                style={styles.saveEditBtn}
                title="Save (Enter)"
              >
                <Check size={16} />
              </button>
              <button 
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
              {!lessonPlan ? (
                <div style={styles.formCard}>
                  <h2 style={styles.formTitle}>Create New Lesson Plan</h2>
                  <div style={styles.formGrid}>
                    {[
                      { label: "School", key: "schoolName", placeholder: "Enter school name", type: "text", required: true },
                      { label: "Learning Area", key: "subject", placeholder: "e.g. Biology, Geography, Mathematics", type: "text", required: true },
                      { label: "Grade", key: "grade", placeholder: "e.g. 10", type: "number", required: true },
                      { label: "Date", key: "date", placeholder: "", type: "date", required: true },
                      { label: "Time", key: "startTime", placeholder: "e.g. 08:00", type: "time", required: true },
                      { label: "Roll - Boys", key: "boys", placeholder: "0", type: "number", required: true },
                      { label: "Roll - Girls", key: "girls", placeholder: "0", type: "number", required: true },
                      { label: "Strand", key: "strand", placeholder: "e.g. Biodiversity", type: "text", required: true },
                      { label: "Sub-strand", key: "subStrand", placeholder: "e.g. Classification", type: "text", required: true },
                    ].map((field) => (
                      <div key={field.key} style={styles.fieldWrapper}>
                        <label style={styles.label}>
                          {field.label}
                          {field.required && (
                            <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                          )}
                        </label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.key] ?? ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              [field.key]: (() => {
                                const raw = e.target.value
                                if (field.type === "number") {
                                  if (field.key === "grade") return sanitizeNumberInput(raw, 2)
                                  if (field.key === "boys" || field.key === "girls") return sanitizeNumberInput(raw, 3)
                                  return sanitizeNumberInput(raw, 6)
                                }
                                if (field.type === "time") return sanitizeTimeInput(raw)
                                if (field.type === "date") return sanitizeDateInput(raw)
                                if (field.key === "schoolName") return sanitizeTextInput(raw, 120)
                                if (field.key === "subject") return sanitizeTextInput(raw, 80)
                                if (field.key === "strand") return sanitizeTextInput(raw, 120)
                                if (field.key === "subStrand") return sanitizeTextInput(raw, 120)
                                return sanitizeTextInput(raw, 200)
                              })(),
                            }))
                          }
                          style={{
                            ...styles.input,
                            ...(field.required && (
                              field.type === 'number' 
                                ? (formData[field.key] === "" || formData[field.key] === null || formData[field.key] === undefined)
                                : !formData[field.key]?.trim()
                            ) ? { borderColor: "#fca5a5" } : {})
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#f0f9ff", borderRadius: "8px", fontSize: "14px", color: "#0369a1" }}>
                    💡 <strong>Tip:</strong> For Kiswahili lessons, enter "Kiswahili" in the Learning Area field to get full Kiswahili output with subject-specific terminology!
                  </div>
                  
                  <button onClick={handleGenerate} disabled={isGenerating} style={styles.generateButton}>
                    {isGenerating ? "Generating Lesson Plan..." : "Generate Lesson Plan"}
                  </button>
                </div>
              ) : (
                <div style={styles.documentContainer}>
                  <div 
                    className={isMobile ? 'action-bar-mobile' : ''}
                    style={styles.actionBar}
                  >
                    <button onClick={handleCreateNew} style={styles.backButton}>
                      <ArrowLeft size={16} />
                      <span>New Plan</span>
                    </button>
                    <div 
                      className={isMobile ? 'action-bar-right-mobile' : ''}
                      style={styles.actionBarRight}
                    >
                      <button 
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

                          {/* LESSON TITLE */}
                          <div style={styles.section}>
                            <div style={styles.sectionTitle}>{labels.lessonTitle}</div>
                            {renderEditableField("lessonPlan.lessonTitle", data.lessonTitle, false, "Enter lesson title")}
                          </div>

                          {/* SPECIFIC LEARNING OUTCOMES */}
                          <div style={styles.section}>
                            <div style={styles.sectionHeaderWithButton}>
                              <div style={styles.sectionTitle}>{labels.specificLearningOutcomes}</div>
                              <button onClick={addLearningOutcome} style={styles.addButton} title="Add outcome">
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
                              <button onClick={addInquiryQuestion} style={styles.addButton} title="Add question">
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
                              <button onClick={addCoreCompetency} style={styles.addButton} title="Add competency">
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
                              <button onClick={addValue} style={styles.addButton} title="Add value">
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
                              <button onClick={addPCI} style={styles.addButton} title="Add PCI">
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
                                    {renderEditableField(`lessonPlan.suggestedLearningExperiences.exploration.${index}`, typeof step === "string" ? step : step?.description || step?.text, true, "Enter step description")}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* iii) Reflection */}
                            <div style={styles.subsection}>
                              <div style={styles.sectionHeaderWithButton}>
                                <div style={styles.subsectionTitle}>iii) {labels.reflection}</div>
                                <button
                                  onClick={() => clearSection("lessonPlan.suggestedLearningExperiences.reflection", "")}
                                  style={styles.clearSectionButton}
                                  title="Remove section"
                                >
                                  <Trash2 size={14} />
                                  <span>Remove</span>
                                </button>
                              </div>
                              {renderEditableField("lessonPlan.suggestedLearningExperiences.reflection", data.suggestedLearningExperiences?.reflection, true, "Enter reflection")}
                            </div>

                            {/* iv) Extension */}
                            <div style={styles.subsection}>
                              <div style={styles.sectionHeaderWithButton}>
                                <div style={styles.subsectionTitle}>iv) {labels.extension}</div>
                                <button
                                  onClick={() => clearSection("lessonPlan.suggestedLearningExperiences.extension", "")}
                                  style={styles.clearSectionButton}
                                  title="Remove section"
                                >
                                  <Trash2 size={14} />
                                  <span>Remove</span>
                                </button>
                              </div>
                              {renderEditableField("lessonPlan.suggestedLearningExperiences.extension", data.suggestedLearningExperiences?.extension, true, "Enter extension")}
                            </div>

                            {/* v) Conclusion */}
                            <div style={styles.subsection}>
                              <div style={styles.sectionHeaderWithButton}>
                                <div style={styles.subsectionTitle}>v) Conclusion (5 mins)</div>
                                <button
                                  onClick={() => clearSection("lessonPlan.suggestedLearningExperiences.conclusion", "")}
                                  style={styles.clearSectionButton}
                                  title="Remove section"
                                >
                                  <Trash2 size={14} />
                                  <span>Remove</span>
                                </button>
                              </div>
                              {renderEditableField(
                                "lessonPlan.suggestedLearningExperiences.conclusion",
                                data.suggestedLearningExperiences?.conclusion,
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
                            {renderEditableField("lessonPlan.suggestedParentalInvolvement", data.parentalInvolvement, true, "Enter parental involvement/community service learning")}
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
                            {renderEditableField("lessonPlan.selfEvaluationMarks", data.selfEvaluation, true, "Enter self-evaluation criteria")}
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
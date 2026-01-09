"use client"

import { useState, useEffect } from "react"
import { generateLessonPlan } from "./services/api"
import { saveLessonPlan, fetchLessonPlans, updateLessonPlan, deleteLessonPlan } from "./services/lessonPlanService"

// SVG Icons as components
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm4 9h-3v3h-2v-3H6v-2h3V6h2v3h3v2z" />
  </svg>
)

const ArchiveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M3 1h14a2 2 0 0 1 2 2v4H1V3a2 2 0 0 1 2-2zm0 7h14v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8zm6 4h2v2h-2v-2z" />
  </svg>
)

const SaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M3 2h11l3 3v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V2zm9 2H5v12h10V4zm-2 2v4h4V6H7z" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
    <path d="M7 10l5-5-1.4-1.4L4.2 10l6.4 6.4L12 15l-5-5z" />
  </svg>
)

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 3C5.6 3 1.7 5.7 0 9.5c1.7 3.8 5.6 6.5 10 6.5s8.3-2.7 10-6.5c-1.7-3.8-5.6-6.5-10-6.5zm0 10c-1.9 0-3.5-1.6-3.5-3.5S8.1 6 10 6s3.5 1.6 3.5 3.5S11.9 13 10 13z" />
  </svg>
)

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
    <path d="M6 2a1 1 0 0 0-1 1v1H2a1 1 0 1 0 0 2h1v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2h-3V3a1 1 0 0 0-1-1H6zm2 4a1 1 0 0 1 2 0v8a1 1 0 1 1-2 0V6zm4 0a1 1 0 0 1 2 0v8a1 1 0 1 1-2 0V6z" />
  </svg>
)

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M7.707 10.293a1 1 0 1 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l5-5a1 1 0 0 0-1.414-1.414L8.707 10.293z" />
  </svg>
)

export default function LessonCreator() {
  const [activeTab, setActiveTab] = useState("create")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingLessons, setIsLoadingLessons] = useState(false)
  const [lessonPlan, setLessonPlan] = useState(null)
  const [currentLessonId, setCurrentLessonId] = useState(null)
  const [savedLessons, setSavedLessons] = useState([])
  const [formData, setFormData] = useState({
    schoolName: "",
    className: "",
    grade: "10",
    term: "1",
    date: new Date().toISOString().split("T")[0],
    startTime: "08:00",
    endTime: "08:40",
    teacherName: "",
    tscNumber: "",
    boys: "0",
    girls: "0",
    strand: "",
    subStrand: "",
  })

  useEffect(() => {
    if (activeTab === "archive") {
      loadLessons()
    }
  }, [activeTab])

  const loadLessons = async () => {
    setIsLoadingLessons(true)
    const result = await fetchLessonPlans()

    if (result.success) {
      const lessons = result.data.map((lesson) => {
        const content = typeof lesson.content === "string" ? JSON.parse(lesson.content) : lesson.content

        return {
          ...content,
          dbId: lesson.id,
          savedDate: new Date(lesson.created_at).toLocaleDateString(),
          status: lesson.status,
        }
      })
      setSavedLessons(lessons)
    } else {
      alert("Failed to load lessons: " + result.error)
    }

    setIsLoadingLessons(false)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      const generatedPlan = await generateLessonPlan(formData)
      setLessonPlan(generatedPlan)

      setCurrentLessonId(null)
      console.log("Generated lesson plan:", generatedPlan)
    } catch (error) {
      console.error("Error generating lesson plan:", error)
      alert("Failed to generate lesson plan. Make sure the backend is running!")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!lessonPlan) return

    setIsSaving(true)

    try {
      let result

      if (currentLessonId) {
        result = await updateLessonPlan(currentLessonId, lessonPlan)
        if (result.success) {
          alert("Lesson plan updated successfully!")
        }
      } else {
        result = await saveLessonPlan(lessonPlan)
        if (result.success) {
          alert("Lesson plan saved successfully!")
          setCurrentLessonId(result.data.id)
        }
      }

      if (!result.success) {
        alert("Failed to save lesson plan: " + result.error)
      }

      if (activeTab === "archive") {
        await loadLessons()
      }
    } catch (error) {
      console.error("Error saving lesson:", error)
      alert("An error occurred while saving the lesson plan")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (lesson) => {
    if (!confirm("Are you sure you want to delete this lesson plan?")) {
      return
    }

    const result = await deleteLessonPlan(lesson.dbId)

    if (result.success) {
      alert("Lesson plan deleted successfully!")
      await loadLessons()
    } else {
      alert("Failed to delete lesson plan: " + result.error)
    }
  }

  const handleViewLesson = (lesson) => {
    console.log("Viewing lesson:", lesson)
    console.log("administrativeDetails:", lesson.administrativeDetails)
    console.log("guidingQuestion:", lesson.guidingQuestion)
    console.log("learningOutcomes:", lesson.learningOutcomes)
    console.log("lessonFlow:", lesson.lessonFlow)

    const fullLesson = {
      administrativeDetails: lesson.administrativeDetails || {},
      curriculumAlignment: lesson.curriculumAlignment || {},
      learningOutcomes: lesson.learningOutcomes || [],
      guidingQuestion: lesson.guidingQuestion || "",
      learningResources: lesson.learningResources || [],
      lessonFlow: lesson.lessonFlow || {},
    }

    console.log("Setting lessonPlan to:", fullLesson)

    setLessonPlan(fullLesson)
    setCurrentLessonId(lesson.dbId)
    setActiveTab("create")
  }

  const handleCreateNew = () => {
    setLessonPlan(null)
    setCurrentLessonId(null)
    setFormData({
      schoolName: "",
      className: "",
      grade: "10",
      term: "1",
      date: new Date().toISOString().split("T")[0],
      startTime: "08:00",
      endTime: "08:40",
      teacherName: "",
      tscNumber: "",
      boys: "0",
      girls: "0",
      strand: "",
      subStrand: "",
    })
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🎓</div>
          <span style={styles.logoText}>EduPlan AI</span>
        </div>

        <nav style={styles.nav}>
          <button
            onClick={() => setActiveTab("create")}
            style={{
              ...styles.navButton,
              ...(activeTab === "create" ? styles.navButtonActive : {}),
            }}
          >
            <span style={styles.navIcon}>
              <PlusIcon />
            </span>
            Create Lesson
          </button>

          <button
            onClick={() => setActiveTab("archive")}
            style={{
              ...styles.navButton,
              ...(activeTab === "archive" ? styles.navButtonActive : {}),
            }}
          >
            <span style={styles.navIcon}>
              <ArchiveIcon />
            </span>
            Lesson Archive
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.content}>
          {activeTab === "create" && (
            <>
              <div style={styles.header}>
                <h1 style={styles.title}>Create Lesson Plan</h1>
                <p style={styles.subtitle}>Fill in the details to generate your curriculum-aligned plan.</p>
              </div>

              {!lessonPlan ? (
                <div style={styles.card}>
                  <div style={styles.formGrid}>
                    {[
                      { label: "School Name", key: "schoolName", placeholder: "Enter school name", type: "text" },
                      { label: "Class", key: "className", placeholder: "e.g. 10A", type: "text" },
                      { label: "Grade", key: "grade", placeholder: "e.g. 10", type: "number" },
                      { label: "Term", key: "term", placeholder: "1, 2, or 3", type: "number" },
                      { label: "Date", key: "date", placeholder: "", type: "date" },
                      { label: "Start Time", key: "startTime", placeholder: "", type: "time" },
                      { label: "End Time", key: "endTime", placeholder: "", type: "time" },
                      { label: "Teacher Name", key: "teacherName", placeholder: "Enter teacher name", type: "text" },
                      { label: "TSC Number", key: "tscNumber", placeholder: "Enter TSC number", type: "text" },
                      { label: "Number of Boys", key: "boys", placeholder: "0", type: "number" },
                      { label: "Number of Girls", key: "girls", placeholder: "0", type: "number" },
                      { label: "Strand", key: "strand", placeholder: "Select strand", type: "text" },
                      { label: "Sub-strand", key: "subStrand", placeholder: "Select sub-strand", type: "text" },
                    ].map((field) => (
                      <div key={field.key} style={styles.fieldWrapper}>
                        <label style={styles.label}>{field.label}</label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.key]}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          style={styles.input}
                          onFocus={(e) => (e.target.style.borderColor = "#0ea5e9")}
                          onBlur={(e) => (e.target.style.borderColor = "#d0d0d0")}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    style={{
                      ...styles.button,
                      opacity: isGenerating ? 0.7 : 1,
                      cursor: isGenerating ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!isGenerating) {
                        e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)"
                        e.target.style.transform = "translateY(-2px)"
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.boxShadow = "none"
                      e.target.style.transform = "translateY(0)"
                    }}
                  >
                    {isGenerating ? "Generating..." : "Generate Lesson Plan"}
                  </button>
                </div>
              ) : (
                <div style={styles.documentContainer}>
                  <div style={styles.actionBar}>
                    <button
                      onClick={handleCreateNew}
                      style={styles.secondaryButton}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#dbeafe"
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#f0fdf4"
                      }}
                    >
                      <ArrowLeftIcon /> Create New
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      style={{
                        ...styles.button,
                        opacity: isSaving ? 0.7 : 1,
                        cursor: isSaving ? "not-allowed" : "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSaving) {
                          e.target.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)"
                          e.target.style.transform = "translateY(-2px)"
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.boxShadow = "none"
                        e.target.style.transform = "translateY(0)"
                      }}
                    >
                      <SaveIcon /> {isSaving ? "Saving..." : currentLessonId ? "Update" : "Save"}
                    </button>
                  </div>

                  <div style={styles.documentPage}>
                    {/* ... existing document code ... */}
                    <div style={styles.docHeader}>
                      <h1 style={styles.docTitle}>LESSON PLAN</h1>
                      <div style={styles.docDivider}></div>
                    </div>

                    <table style={styles.table}>
                      <tbody>
                        <tr>
                          <td style={styles.tableLabelCell}>School:</td>
                          <td style={styles.tableValueCell}>{lessonPlan.administrativeDetails?.school}</td>
                          <td style={styles.tableLabelCell}>Subject:</td>
                          <td style={styles.tableValueCell}>{lessonPlan.administrativeDetails?.subject}</td>
                        </tr>
                        <tr>
                          <td style={styles.tableLabelCell}>Class:</td>
                          <td style={styles.tableValueCell}>{lessonPlan.administrativeDetails?.class}</td>
                          <td style={styles.tableLabelCell}>Grade:</td>
                          <td style={styles.tableValueCell}>{lessonPlan.administrativeDetails?.grade}</td>
                        </tr>
                        <tr>
                          <td style={styles.tableLabelCell}>Teacher:</td>
                          <td style={styles.tableValueCell}>{lessonPlan.administrativeDetails?.teacher}</td>
                          <td style={styles.tableLabelCell}>Students:</td>
                          <td style={styles.tableValueCell}>
                            {lessonPlan.administrativeDetails?.studentEnrollment?.total}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={styles.section}>
                      <h2 style={styles.sectionTitle}>GUIDING QUESTION</h2>
                      <p style={styles.docText}>
                        <em>{lessonPlan.guidingQuestion}</em>
                      </p>
                    </div>

                    <div style={styles.section}>
                      <h2 style={styles.sectionTitle}>LEARNING OUTCOMES</h2>
                      {lessonPlan.learningOutcomes?.map((outcome) => (
                        <p key={outcome.id} style={styles.docText}>
                          {outcome.id}. {outcome.outcome}
                        </p>
                      ))}
                    </div>

                    <div style={styles.section}>
                      <h2 style={styles.sectionTitle}>LEARNING RESOURCES</h2>
                      <p style={styles.docText}>{lessonPlan.learningResources?.join(", ")}</p>
                    </div>

                    <div style={styles.section}>
                      <h2 style={styles.sectionTitle}>LESSON FLOW</h2>

                      <div style={styles.subsection}>
                        <h3 style={styles.subsectionTitle}>Introduction (5 minutes)</h3>
                        <p style={styles.docText}>{lessonPlan.lessonFlow?.introduction?.description}</p>
                      </div>

                      <div style={styles.subsection}>
                        <h3 style={styles.subsectionTitle}>Development Activities</h3>
                        {lessonPlan.lessonFlow?.development?.map((step) => (
                          <div key={step.step} style={styles.stepContainer}>
                            <p style={styles.stepTitle}>
                              <strong>
                                Step {step.step}: {step.title}
                              </strong>
                            </p>
                            <p style={styles.docText}>
                              <strong>Description:</strong> {step.description}
                            </p>
                            <p style={styles.docText}>
                              <strong>Activity:</strong> {step.activity}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div style={styles.subsection}>
                        <h3 style={styles.subsectionTitle}>Conclusion (5 minutes)</h3>
                        <p style={styles.docText}>{lessonPlan.lessonFlow?.conclusion?.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "archive" && (
            <>
              <div style={styles.header}>
                <h1 style={styles.title}>Lesson Archive</h1>
                <p style={styles.subtitle}>View and manage your saved lesson plans.</p>
              </div>

              {isLoadingLessons ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>⏳</div>
                  <h2 style={styles.emptyTitle}>Loading lessons...</h2>
                </div>
              ) : savedLessons.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📁</div>
                  <h2 style={styles.emptyTitle}>No Saved Lessons Yet</h2>
                  <p style={styles.emptyText}>Create and save lesson plans to see them here.</p>
                </div>
              ) : (
                <div style={styles.lessonGrid}>
                  {savedLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      style={styles.lessonCard}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 8px 16px rgba(16, 185, 129, 0.12)"
                        e.currentTarget.style.transform = "translateY(-4px)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)"
                        e.currentTarget.style.transform = "translateY(0)"
                      }}
                    >
                      <div style={styles.lessonHeader}>
                        <h3 style={styles.lessonTopic}>
                          {lesson.administrativeDetails?.subject ||
                            lesson.guidingQuestion?.substring(0, 50) ||
                            "Untitled"}
                        </h3>
                        <span style={styles.lessonDate}>{lesson.savedDate}</span>
                      </div>
                      <div style={styles.lessonMeta}>
                        <div>
                          <strong>Grade:</strong> {lesson.administrativeDetails?.grade || lesson.grade}
                        </div>
                        <div>
                          <strong>Class:</strong> {lesson.administrativeDetails?.class || "N/A"}
                        </div>
                        <div>
                          <strong>Teacher:</strong> {lesson.administrativeDetails?.teacher || "N/A"}
                        </div>
                      </div>
                      <div style={styles.lessonActions}>
                        <button
                          onClick={() => handleViewLesson(lesson)}
                          style={styles.viewButton}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#0ea5e9"
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#10b981"
                          }}
                        >
                          <EyeIcon /> View
                        </button>
                        <button
                          onClick={() => handleDelete(lesson)}
                          style={styles.deleteButton}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#fee2e2"
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#fff"
                          }}
                        >
                          <TrashIcon /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #fdb4d6 0%, #f8a5d3 15%, #f297ce 30%, #e885c7 45%, #dc73be 60%, #c968b5 75%, #a860aa 85%, #8b5a9f 100%)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif",
  },
  sidebar: {
    width: "260px",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e0e7ff",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    height: "100vh",
    boxShadow: "2px 0 8px rgba(0, 0, 0, 0.04)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "40px",
    padding: "8px 0",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    backgroundColor: "#0ea5e9",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    fontSize: "20px",
    fontWeight: "bold",
    boxShadow: "0 2px 8px rgba(14, 165, 233, 0.2)",
  },
  logoText: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: "-0.3px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 14px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#64748b",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    borderLeft: "3px solid transparent",
  },
  navButtonActive: {
    backgroundColor: "#dbeafe",
    color: "#0ea5e9",
    borderLeft: "3px solid #0ea5e9",
    fontWeight: "600",
  },
  navIcon: {
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: "20px",
    color: "inherit",
  },
  main: {
    marginLeft: "260px",
    flex: 1,
    padding: "32px 40px",
    background: "transparent",
  },
  content: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "8px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    fontWeight: "400",
    lineHeight: "1.5",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "32px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "28px",
  },
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  input: {
    height: "40px",
    padding: "0 12px",
    fontSize: "14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  button: {
    padding: "11px 20px",
    backgroundColor: "#10b981",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  secondaryButton: {
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#0ea5e9",
    backgroundColor: "#f0fdf4",
    border: "1px solid #d1fae5",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "15px",
    color: "#64748b",
    lineHeight: "1.6",
  },
  lessonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },
  lessonCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e2e8f0",
    transition: "all 0.3s ease",
  },
  lessonHeader: {
    marginBottom: "14px",
    paddingBottom: "12px",
    borderBottom: "1px solid #e2e8f0",
  },
  lessonTopic: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "4px",
    lineHeight: "1.4",
  },
  lessonDate: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "500",
  },
  lessonMeta: {
    fontSize: "13px",
    color: "#475569",
    marginBottom: "16px",
    lineHeight: "1.8",
  },
  lessonActions: {
    display: "flex",
    gap: "8px",
  },
  viewButton: {
    flex: 1,
    padding: "8px 12px",
    backgroundColor: "#10b981",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  deleteButton: {
    flex: 1,
    padding: "8px 12px",
    backgroundColor: "#fff",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: "600",
    border: "1.5px solid #fecaca",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  documentContainer: {
    background: "transparent",
    padding: "40px 20px",
    minHeight: "100vh",
  },
  actionBar: {
    maxWidth: "850px",
    margin: "0 auto 20px auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  documentPage: {
    maxWidth: "850px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    padding: "60px 80px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    minHeight: "1100px",
    fontFamily: "'Times New Roman', Times, serif",
  },
  docHeader: {
    textAlign: "center",
    marginBottom: "40px",
  },
  docTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#000",
    letterSpacing: "1px",
    marginBottom: "10px",
  },
  docDivider: {
    height: "3px",
    backgroundColor: "#000",
    width: "100%",
    margin: "10px 0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "30px",
    border: "1px solid #000",
  },
  tableLabelCell: {
    border: "1px solid #000",
    padding: "8px 12px",
    fontWeight: "bold",
    fontSize: "12px",
    backgroundColor: "#f3f4f6",
    width: "20%",
  },
  tableValueCell: {
    border: "1px solid #000",
    padding: "8px 12px",
    fontSize: "12px",
    width: "30%",
  },
  section: {
    marginBottom: "25px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#000",
    textTransform: "uppercase",
    marginBottom: "12px",
    borderBottom: "2px solid #000",
    paddingBottom: "4px",
  },
  subsection: {
    marginBottom: "20px",
  },
  subsectionTitle: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#000",
    marginBottom: "8px",
    textDecoration: "underline",
  },
  docText: {
    fontSize: "12px",
    lineHeight: "1.8",
    color: "#000",
    marginBottom: "8px",
    textAlign: "justify",
  },
  stepContainer: {
    marginBottom: "15px",
    paddingLeft: "20px",
  },
  stepTitle: {
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "6px",
  },
}

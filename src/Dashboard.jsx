"use client"

import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Plus,
  Archive,
  Save,
  ArrowLeft,
  Eye,
  Trash2,
  ChevronRight,
  User,
  LogOut,
  Search,
} from "lucide-react"
import { generateLessonPlan } from "./services/api"
import { saveLessonPlan, fetchLessonPlans, updateLessonPlan, deleteLessonPlan } from "./services/lessonPlanService"

export default function LessonCreator() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingLessons, setIsLoadingLessons] = useState(false)
  const [lessonPlan, setLessonPlan] = useState(null)
  const [currentLessonId, setCurrentLessonId] = useState(null)
  const [savedLessons, setSavedLessons] = useState([])
  const [userName, setUserName] = useState("")

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
    loadLessons()
  }, [])

  useEffect(() => {
    if (activeTab === "archive") {
      loadLessons()
    }
  }, [activeTab])

  useEffect(() => {
    if (formData.teacherName) {
      const firstName = formData.teacherName.split(" ")[0]
      setUserName(firstName)
    }
  }, [formData.teacherName])

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
    const fullLesson = {
      administrativeDetails: lesson.administrativeDetails || {},
      curriculumAlignment: lesson.curriculumAlignment || {},
      learningOutcomes: lesson.learningOutcomes || [],
      guidingQuestion: lesson.guidingQuestion || "",
      learningResources: lesson.learningResources || [],
      lessonFlow: lesson.lessonFlow || {},
    }
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
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>📚</div>
          <div style={styles.logoText}>Funza AI</div>
        </div>

        <div style={styles.userProfile}>
          <div style={styles.avatar}>
            <User size={24} />
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{formData.teacherName || "Teacher"}</div>
            <div style={styles.userRole}>Educator</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <button
            onClick={() => setActiveTab("dashboard")}
            style={{
              ...styles.navButton,
              ...(activeTab === "dashboard" ? styles.navButtonActive : {}),
            }}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
            <ChevronRight size={16} style={styles.navChevron} />
          </button>
          <button
            onClick={() => setActiveTab("create")}
            style={{
              ...styles.navButton,
              ...(activeTab === "create" ? styles.navButtonActive : {}),
            }}
          >
            <Plus size={20} />
            <span>Create Lesson</span>
            <ChevronRight size={16} style={styles.navChevron} />
          </button>
          <button
            onClick={() => setActiveTab("archive")}
            style={{
              ...styles.navButton,
              ...(activeTab === "archive" ? styles.navButtonActive : {}),
            }}
          >
            <Archive size={20} />
            <span>Lesson Archive</span>
            <ChevronRight size={16} style={styles.navChevron} />
          </button>
        </nav>

        <div style={styles.navDivider}></div>

        <button style={styles.logoutButton}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <div style={styles.main}>
        <div style={styles.topBar}>
          <div style={styles.welcomeText}>
            <div style={styles.welcomeGreeting}>Good {new Date().getHours() < 12 ? "Morning" : "Afternoon"}</div>
            <div style={styles.welcomeTitle}>Lesson Planner</div>
          </div>
          <div style={styles.searchContainer}>
            <Search size={18} style={styles.searchIcon} />
            <input type="text" placeholder="Search..." style={styles.searchInput} />
          </div>
        </div>

        <div style={styles.content}>
          {activeTab === "dashboard" && (
            <>
              <div style={styles.dashboardGrid}>
                <div style={styles.cardLarge}>
                  <div style={styles.cardHeader}>
                    <div>
                      <div style={styles.cardLabel}>CURRICULUM PLANNING</div>
                      <div style={styles.cardTitle}>Total Lessons</div>
                      <div style={styles.cardValue}>{savedLessons.length}</div>
                    </div>
                    <button onClick={() => setActiveTab("create")} style={styles.cardButton}>
                      <Plus size={24} />
                    </button>
                  </div>
                </div>

                <div style={styles.cardMedium}>
                  <div style={styles.cardTag}>ACTIVE</div>
                  <div style={styles.cardTitle}>Active Lessons</div>
                  <div style={styles.cardValue}>{savedLessons.filter((l) => l.status !== "archived").length}</div>
                  <div style={styles.cardSubtitle}>in progress</div>
                </div>

                <div style={styles.cardMedium}>
                  <div style={styles.cardTag}>STATS</div>
                  <div style={styles.cardTitle}>This Week</div>
                  <div style={styles.cardValue}>
                    {
                      savedLessons.filter((l) => {
                        const lessonDate = new Date(l.savedDate)
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return lessonDate >= weekAgo
                      }).length
                    }
                  </div>
                  <div style={styles.cardSubtitle}>new lessons</div>
                </div>

                <div style={styles.cardAccent}>
                  <div style={styles.accentIcon}>✨</div>
                  <div style={styles.cardTitle}>Ready to teach?</div>
                  <div style={styles.cardSubtitle}>Create your next lesson plan</div>
                  <button onClick={() => setActiveTab("create")} style={styles.accentButton}>
                    Create Now →
                  </button>
                </div>

                <div style={styles.cardFullWidth}>
                  <h3 style={styles.sectionTitle}>Recent Lesson Plans</h3>
                  {isLoadingLessons ? (
                    <div style={styles.loadingState}>Loading lessons...</div>
                  ) : savedLessons.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>📝</div>
                      <div style={styles.emptyText}>No lessons yet. Create your first lesson plan!</div>
                      <button onClick={() => setActiveTab("create")} style={styles.emptyButton}>
                        Create Lesson Plan
                      </button>
                    </div>
                  ) : (
                    <div style={styles.lessonList}>
                      {savedLessons.slice(0, 4).map((lesson, index) => (
                        <div key={index} style={styles.lessonItem} onClick={() => handleViewLesson(lesson)}>
                          <div style={styles.lessonIcon}>{["📘", "📗", "📙", "📕"][index % 4]}</div>
                          <div style={styles.lessonDetails}>
                            <div style={styles.lessonTitle}>
                              {lesson.administrativeDetails?.subject ||
                                lesson.guidingQuestion?.substring(0, 40) ||
                                "Lesson Plan"}
                            </div>
                            <div style={styles.lessonMeta}>
                              Grade {lesson.administrativeDetails?.grade || "N/A"} •{" "}
                              {lesson.administrativeDetails?.class || "Class"}
                            </div>
                          </div>
                          <div style={styles.lessonDate}>{lesson.savedDate}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {savedLessons.length > 4 && (
                    <button onClick={() => setActiveTab("archive")} style={styles.viewAllButton}>
                      View All Lessons →
                    </button>
                  )}
                </div>

                <div style={styles.cardStat}>
                  <div style={styles.statValue}>
                    {savedLessons.length > 0
                      ? Math.round(
                          (savedLessons.filter((l) => l.status === "completed").length / savedLessons.length) * 100,
                        )
                      : 0}
                    %
                  </div>
                  <div style={styles.statLabel}>Completion Rate</div>
                </div>

                <div style={styles.cardSummary}>
                  <div style={styles.summaryLabel}>Total Created</div>
                  <div style={styles.summaryValue}>{savedLessons.length}</div>
                  <div style={styles.summaryText}>Keep up the great work!</div>
                </div>
              </div>
            </>
          )}

          {activeTab === "create" && (
            <>
              <div style={styles.pageHeader}>
                <h2 style={styles.pageTitle}>Create Lesson Plan</h2>
                <p style={styles.pageSubtitle}>Fill in the details to generate your curriculum-aligned plan.</p>
              </div>

              {!lessonPlan ? (
                <div style={styles.formCard}>
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
                        />
                      </div>
                    ))}
                  </div>
                  <button onClick={handleGenerate} disabled={isGenerating} style={styles.generateButton}>
                    {isGenerating ? "Generating..." : "Generate Lesson Plan"}
                  </button>
                </div>
              ) : (
                <div style={styles.documentContainer}>
                  <div style={styles.actionBar}>
                    <button onClick={handleCreateNew} style={styles.backButton}>
                      <ArrowLeft size={16} />
                      Create New
                    </button>
                    <button onClick={handleSave} disabled={isSaving} style={styles.saveButton}>
                      <Save size={16} />
                      {isSaving ? "Saving..." : currentLessonId ? "Update" : "Save"}
                    </button>
                  </div>

                  <div style={styles.documentPage}>
                    <div style={styles.docHeader}>
                      <div style={styles.docTitle}>LESSON PLAN</div>
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
                      <div style={styles.sectionTitle}>GUIDING QUESTION</div>
                      <p style={styles.docText}>{lessonPlan.guidingQuestion}</p>
                    </div>

                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>LEARNING OUTCOMES</div>
                      {lessonPlan.learningOutcomes?.map((outcome) => (
                        <p key={outcome.id} style={styles.docText}>
                          {outcome.id}. {outcome.outcome}
                        </p>
                      ))}
                    </div>

                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>LEARNING RESOURCES</div>
                      <p style={styles.docText}>{lessonPlan.learningResources?.join(", ")}</p>
                    </div>

                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>LESSON FLOW</div>

                      <div style={styles.subsection}>
                        <div style={styles.subsectionTitle}>Introduction (5 minutes)</div>
                        <p style={styles.docText}>{lessonPlan.lessonFlow?.introduction?.description}</p>
                      </div>

                      <div style={styles.subsection}>
                        <div style={styles.subsectionTitle}>Development Activities</div>
                        {lessonPlan.lessonFlow?.development?.map((step) => (
                          <div key={step.step} style={styles.stepContainer}>
                            <div style={styles.stepTitle}>
                              Step {step.step}: {step.title}
                            </div>
                            <p style={styles.docText}>Description: {step.description}</p>
                            <p style={styles.docText}>Activity: {step.activity}</p>
                          </div>
                        ))}
                      </div>

                      <div style={styles.subsection}>
                        <div style={styles.subsectionTitle}>Conclusion (5 minutes)</div>
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
              <div style={styles.pageHeader}>
                <h2 style={styles.pageTitle}>Lesson Archive</h2>
                <p style={styles.pageSubtitle}>View and manage your saved lesson plans.</p>
              </div>

              {isLoadingLessons ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>⏳</div>
                  <div style={styles.emptyText}>Loading lessons...</div>
                </div>
              ) : savedLessons.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📁</div>
                  <div style={styles.emptyText}>No Saved Lessons Yet</div>
                  <p style={styles.emptyDescription}>Create and save lesson plans to see them here.</p>
                </div>
              ) : (
                <div style={styles.lessonGrid}>
                  {savedLessons.map((lesson) => (
                    <div key={lesson.dbId} style={styles.lessonCard}>
                      <div style={styles.lessonCardHeader}>
                        <div style={styles.lessonCardTitle}>
                          {lesson.administrativeDetails?.subject ||
                            lesson.guidingQuestion?.substring(0, 50) ||
                            "Untitled"}
                        </div>
                        <div style={styles.lessonCardDate}>{lesson.savedDate}</div>
                      </div>
                      <div style={styles.lessonCardMeta}>
                        Grade: {lesson.administrativeDetails?.grade || lesson.grade}
                        <br />
                        Class: {lesson.administrativeDetails?.class || "N/A"}
                        <br />
                        Teacher: {lesson.administrativeDetails?.teacher || "N/A"}
                      </div>
                      <div style={styles.lessonCardActions}>
                        <button onClick={() => handleViewLesson(lesson)} style={styles.viewButton}>
                          <Eye size={16} />
                          View
                        </button>
                        <button onClick={() => handleDelete(lesson)} style={styles.deleteButton}>
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e8f4f8 0%, #d4e9f7 50%, #c5dff0 100%)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif",
    position: "relative",
  },
  sidebar: {
    width: "250px",
    background: "rgba(76, 201, 240, 0.4)",
    backdropFilter: "blur(20px)",
    borderRight: "1px solid rgba(255, 255, 255, 0.3)",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    height: "100vh",
    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
    overflowY: "auto",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "32px",
    padding: "0 8px",
  },
  logoIcon: {
    fontSize: "28px",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: "-0.5px",
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    marginBottom: "32px",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    backdropFilter: "blur(10px)",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: "2px",
  },
  userRole: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.8)",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  navButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(10px)",
    color: "#ffffff",
    fontWeight: "600",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  navChevron: {
    marginLeft: "auto",
    opacity: 0.5,
  },
  navDivider: {
    height: "1px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    margin: "16px 0",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  main: {
    marginLeft: "280px",
    flex: 1,
    backgroundColor: "transparent",
    minHeight: "100vh",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 40px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(15px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
  },
  welcomeText: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  welcomeGreeting: {
    fontSize: "14px",
    color: "rgba(107, 114, 128, 0.9)",
  },
  welcomeTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0a3d62",
  },
  searchContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    color: "rgba(107, 114, 128, 0.5)",
    pointerEvents: "none",
  },
  searchInput: {
    height: "44px",
    paddingLeft: "40px",
    paddingRight: "14px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    fontSize: "14px",
    color: "#111827",
    outline: "none",
    transition: "all 0.2s ease",
    width: "250px",
  },
  content: {
    padding: "32px 40px",
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
    gridAutoRows: "auto",
  },
  cardLarge: {
    gridColumn: "span 1",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    transition: "all 0.3s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
  },
  cardButton: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "rgba(76, 201, 240, 0.3)",
    backdropFilter: "blur(10px)",
    color: "#0a3d62",
    border: "1px solid rgba(76, 201, 240, 0.5)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  cardMedium: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    transition: "all 0.3s ease",
  },
  cardLabel: {
    fontSize: "12px",
    color: "rgba(107, 114, 128, 0.9)",
    fontWeight: "600",
    letterSpacing: "0.5px",
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  cardTag: {
    fontSize: "11px",
    color: "#0a7fb5",
    fontWeight: "700",
    letterSpacing: "0.5px",
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0a3d62",
    marginBottom: "4px",
  },
  cardValue: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#0a7fb5",
    marginTop: "8px",
  },
  cardSubtitle: {
    fontSize: "13px",
    color: "rgba(107, 114, 128, 0.8)",
    marginTop: "4px",
  },
  cardAccent: {
    background: "linear-gradient(135deg, rgba(10, 127, 181, 0.25) 0%, rgba(76, 201, 240, 0.15) 100%)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "28px",
    color: "#0a3d62",
    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
    border: "1px solid rgba(76, 201, 240, 0.4)",
    transition: "all 0.3s ease",
  },
  accentIcon: {
    fontSize: "32px",
    marginBottom: "12px",
  },
  accentButton: {
    marginTop: "16px",
    padding: "10px 16px",
    backgroundColor: "rgba(76, 201, 240, 0.3)",
    color: "#0a3d62",
    border: "1px solid rgba(76, 201, 240, 0.5)",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  cardFullWidth: {
    gridColumn: "span 3",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0a3d62",
    marginBottom: "20px",
  },
  lessonList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  lessonItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  lessonIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
  },
  lessonDetails: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0a3d62",
    marginBottom: "2px",
  },
  lessonMeta: {
    fontSize: "12px",
    color: "rgba(107, 114, 128, 0.8)",
  },
  lessonDate: {
    fontSize: "13px",
    color: "rgba(107, 114, 128, 0.6)",
    fontWeight: "500",
  },
  loadingState: {
    textAlign: "center",
    padding: "40px",
    color: "rgba(107, 114, 128, 0.8)",
    fontSize: "14px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  emptyText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0a3d62",
    marginBottom: "8px",
  },
  emptyDescription: {
    fontSize: "14px",
    color: "rgba(107, 114, 128, 0.8)",
    marginBottom: "20px",
  },
  emptyButton: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, rgba(10, 127, 181, 0.3) 0%, rgba(76, 201, 240, 0.2) 100%)",
    color: "#0a7fb5",
    fontSize: "14px",
    fontWeight: "600",
    border: "1px solid rgba(10, 127, 181, 0.3)",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  viewAllButton: {
    width: "100%",
    padding: "12px",
    marginTop: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#0a7fb5",
    fontSize: "14px",
    fontWeight: "600",
    border: "1px solid rgba(76, 201, 240, 0.3)",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  cardStat: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  statValue: {
    fontSize: "40px",
    fontWeight: "700",
    color: "#0a7fb5",
  },
  statLabel: {
    fontSize: "13px",
    color: "rgba(107, 114, 128, 0.8)",
    marginTop: "8px",
    fontWeight: "500",
  },
  cardSummary: {
    background: "linear-gradient(135deg, rgba(10, 127, 181, 0.25) 0%, rgba(76, 201, 240, 0.15) 100%)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "28px",
    color: "#0a3d62",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
    border: "1px solid rgba(76, 201, 240, 0.4)",
  },
  summaryLabel: {
    fontSize: "13px",
    fontWeight: "500",
    marginBottom: "8px",
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: "40px",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#0a7fb5",
  },
  summaryText: {
    fontSize: "13px",
    opacity: 0.9,
  },
  pageHeader: {
    marginBottom: "28px",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0a3d62",
    marginBottom: "6px",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "rgba(107, 114, 128, 0.8)",
  },
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginBottom: "28px",
  },
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0a3d62",
  },
  input: {
    height: "44px",
    padding: "0 14px",
    fontSize: "14px",
    border: "1.5px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    color: "#0a3d62",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  generateButton: {
    padding: "14px 28px",
    background: "linear-gradient(135deg, rgba(10, 127, 181, 0.4) 0%, rgba(76, 201, 240, 0.3) 100%)",
    color: "#0a3d62",
    fontSize: "15px",
    fontWeight: "600",
    border: "1px solid rgba(10, 127, 181, 0.3)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(10, 127, 181, 0.15)",
  },
  documentContainer: {
    backgroundColor: "transparent",
    padding: "20px 0",
  },
  actionBar: {
    maxWidth: "850px",
    margin: "0 auto 20px auto",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },
  backButton: {
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#0a7fb5",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    border: "1.5px solid rgba(76, 201, 240, 0.3)",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  saveButton: {
    padding: "12px 20px",
    background: "linear-gradient(135deg, rgba(10, 127, 181, 0.4) 0%, rgba(76, 201, 240, 0.3) 100%)",
    color: "#0a3d62",
    fontSize: "14px",
    fontWeight: "600",
    border: "1px solid rgba(10, 127, 181, 0.3)",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 2px 8px rgba(10, 127, 181, 0.2)",
  },
  documentPage: {
    maxWidth: "850px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    padding: "60px 80px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
    minHeight: "1100px",
    fontFamily: "'Times New Roman', serif",
    lineHeight: "1.6",
    borderRadius: "8px",
  },
  docHeader: {
    textAlign: "center",
    marginBottom: "32px",
  },
  docTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#000000",
    letterSpacing: "2px",
    marginBottom: "12px",
  },
  docDivider: {
    height: "2px",
    backgroundColor: "#000000",
    margin: "16px auto",
    width: "80px",
  },
  section: {
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#000000",
    letterSpacing: "1px",
    marginBottom: "12px",
    textTransform: "uppercase",
  },
  subsection: {
    marginBottom: "20px",
    marginLeft: "20px",
  },
  subsectionTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#000000",
    marginBottom: "8px",
    textDecoration: "underline",
  },
  stepContainer: {
    marginBottom: "12px",
    marginLeft: "20px",
  },
  stepTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#000000",
    marginBottom: "4px",
  },
  docText: {
    fontSize: "12px",
    color: "#333333",
    lineHeight: "1.6",
    margin: "8px 0",
    textAlign: "justify",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "24px",
    fontSize: "12px",
  },
  tableLabelCell: {
    padding: "8px",
    fontWeight: "700",
    color: "#000000",
    borderBottom: "1px solid #d1d5db",
    textAlign: "left",
  },
  tableValueCell: {
    padding: "8px",
    color: "#333333",
    borderBottom: "1px solid #d1d5db",
    textAlign: "left",
  },
  lessonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  lessonCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(20px)",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    transition: "all 0.2s ease",
  },
  lessonCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    gap: "8px",
  },
  lessonCardTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0a3d62",
    flex: 1,
  },
  lessonCardDate: {
    fontSize: "12px",
    color: "rgba(107, 114, 128, 0.6)",
    fontWeight: "500",
  },
  lessonCardMeta: {
    fontSize: "13px",
    color: "rgba(107, 114, 128, 0.8)",
    marginBottom: "16px",
    lineHeight: "1.5",
  },
  lessonCardActions: {
    display: "flex",
    gap: "8px",
  },
  viewButton: {
    flex: 1,
    padding: "8px 12px",
    backgroundColor: "rgba(10, 127, 181, 0.3)",
    color: "#0a3d62",
    fontSize: "13px",
    fontWeight: "600",
    border: "1px solid rgba(10, 127, 181, 0.3)",
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
    backgroundColor: "rgba(220, 38, 38, 0.2)",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: "600",
    border: "1px solid rgba(220, 38, 38, 0.2)",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
}

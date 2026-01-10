"use client"

import { useState, useEffect } from "react"
import { generateLessonPlan } from "./services/api"
import { saveLessonPlan, fetchLessonPlans, updateLessonPlan, deleteLessonPlan } from "./services/lessonPlanService"

// SVG Icons as components
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
)

const ArchiveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="21 8 21 21 3 21 3 8"></polyline>
    <rect x="1" y="3" width="22" height="5"></rect>
    <line x1="10" y1="12" x2="14" y2="12"></line>
  </svg>
)

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
)

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
)

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
)

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

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
    // Load lessons on mount
    loadLessons()
  }, [])

  useEffect(() => {
    if (activeTab === "archive") {
      loadLessons()
    }
  }, [activeTab])

  useEffect(() => {
    // Extract first name from teacher name when it's filled
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
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>📚</div>
          <div style={styles.logoText}>Funza AI</div>
        </div>

        {/* User Profile */}
        <div style={styles.userProfile}>
          <div style={styles.avatarWrapper}>
            <div style={styles.avatar}>
              <UserIcon />
            </div>
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{formData.teacherName || "Teacher"}</div>
            <div style={styles.userRole}>Educator</div>
          </div>
          <button style={styles.userMenuButton}>⋮</button>
        </div>

        <nav style={styles.nav}>
          <button
            onClick={() => setActiveTab("dashboard")}
            style={{
              ...styles.navButton,
              ...(activeTab === "dashboard" ? styles.navButtonActive : {}),
            }}
          >
            <span style={styles.navIcon}>
              <DashboardIcon />
            </span>
            Dashboard
            <span style={styles.navChevron}>
              <ChevronRightIcon />
            </span>
          </button>
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
            <span style={styles.navChevron}>
              <ChevronRightIcon />
            </span>
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
            <span style={styles.navChevron}>
              <ChevronRightIcon />
            </span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <div style={styles.topBar}>
          <div style={styles.welcomeText}>
            <div style={styles.welcomeGreeting}>Good {new Date().getHours() < 12 ? "Morning" : "Afternoon"}</div>
            <div style={styles.welcomeTitle}>Lesson Planner</div>
          </div>
        </div>

        <div style={styles.content}>
          {activeTab === "dashboard" && (
            <>
              {/* Stats Cards */}
              <div style={styles.dashboardGrid}>
              <div style={styles.cardPrimary}>
                <div style={styles.cardInfo}>
                  <div style={styles.cardLabel}>CURRICULUM PLANNING</div>
                  <div style={styles.cardValue}>Total Lessons</div>
                  <div style={styles.cardSubtitle}>{savedLessons.length} lesson plans</div>
                </div>
                <button onClick={() => setActiveTab("create")} style={styles.floatingAddButton}>
                  +
                </button>
              </div>

              <div style={styles.cardSecondary}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.cardTag}>ACTIVE</div>
                    <div style={styles.cardTitle}>Active Lessons</div>
                    <div style={styles.cardSubtitle}>
                      {savedLessons.filter(l => l.status !== 'archived').length} lessons in progress
                    </div>
                  </div>
                  <div style={styles.folderIcon}>📚</div>
                </div>
                <div style={styles.progressLabel}>Keep teaching</div>
              </div>

              <div style={styles.cardSecondary}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.cardTag}>STATS</div>
                    <div style={styles.cardTitle}>This Week</div>
                    <div style={styles.cardSubtitle}>
                      {savedLessons.filter(l => {
                        const lessonDate = new Date(l.savedDate)
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return lessonDate >= weekAgo
                      }).length} new lessons
                    </div>
                  </div>
                  <div style={styles.folderIcon}>📊</div>
                </div>
              </div>

              <div style={styles.cardTertiary}>
                <div style={styles.playIcon}>▶</div>
                <div style={styles.cardTitle}>Quick Access</div>
                <div style={styles.cardSubtitle}>Recent materials</div>
              </div>

              <div style={styles.cardDark}>
                <div style={styles.lockIcon}>⭐</div>
                <div style={styles.cardTitle}>Ready to teach?</div>
                <div style={styles.cardSubtitle}>Create your next lesson plan</div>
              </div>

              <div style={styles.cardWeather}>
                <div style={styles.weatherInfo}>
                  <div style={styles.weatherQuestion}>Ready to teach?</div>
                  <div style={styles.weatherDesc}>Create your next lesson plan</div>
                  <div style={styles.weatherTemp}>{new Date().toLocaleDateString('en-US', { weekday: 'short' })}</div>
                </div>
                <button onClick={() => setActiveTab("create")} style={styles.weatherAddButton}>
                  +
                </button>
              </div>

              {/* Recent Lesson Plans */}
              <div style={styles.latestUpdates}>
                <h3 style={styles.sectionTitle}>Recent Lesson Plans</h3>
                {isLoadingLessons ? (
                  <div style={styles.loadingState}>
                    Loading lessons...
                  </div>
                ) : savedLessons.length === 0 ? (
                  <div style={styles.emptyDashboard}>
                    <div style={styles.emptyDashboardIcon}>📝</div>
                    <div style={styles.emptyDashboardText}>
                      No lessons yet. Create your first lesson plan!
                    </div>
                    <button onClick={() => setActiveTab("create")} style={styles.createFirstButton}>
                      Create Lesson Plan
                    </button>
                  </div>
                ) : (
                  <div style={styles.updatesList}>
                    {savedLessons.slice(0, 4).map((lesson, index) => (
                      <div key={index} style={styles.updateItem} onClick={() => handleViewLesson(lesson)}>
                        <div style={styles.updateIcon}>
                          {index === 0 ? '📘' : index === 1 ? '📗' : index === 2 ? '📙' : '📕'}
                        </div>
                        <div style={styles.updateDetails}>
                          <div style={styles.updateTitle}>
                            {lesson.administrativeDetails?.subject || lesson.guidingQuestion?.substring(0, 40) || 'Lesson Plan'}
                          </div>
                          <div style={styles.updateCategory}>
                            Grade {lesson.administrativeDetails?.grade || 'N/A'} • {lesson.administrativeDetails?.class || 'Class'}
                          </div>
                        </div>
                        <div style={styles.updateDate}>{lesson.savedDate}</div>
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

              {/* Completion Stats */}
              <div style={styles.chartCard}>
                <div style={styles.chartValue}>
                  {savedLessons.length > 0 ? Math.round((savedLessons.filter(l => l.status === 'completed').length / savedLessons.length) * 100) : 0}%
                </div>
                <svg width="180" height="180" style={styles.donutChart}>
                  <circle cx="90" cy="90" r="80" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                  <circle
                    cx="90"
                    cy="90"
                    r="80"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="20"
                    strokeDasharray={`${2 * Math.PI * 80 * (savedLessons.length > 0 ? (savedLessons.filter(l => l.status === 'completed').length / savedLessons.length) : 0)} ${2 * Math.PI * 80}`}
                    strokeDashoffset={2 * Math.PI * 80 * 0.25}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={styles.chartLabel}>Lessons completion</div>
              </div>

              {/* Summary Card */}
              <div style={styles.savingsCard}>
                <div style={styles.savingsText}>Total Lessons Created</div>
                <div style={styles.savingsAmount}>{savedLessons.length}</div>
                <div style={styles.savingsPoints}>Keep up the great work!</div>
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
                      <ArrowLeftIcon />
                      Create New
                    </button>
                    <button onClick={handleSave} disabled={isSaving} style={styles.saveButton}>
                      <SaveIcon />
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
                          <td style={styles.tableValueCell}>{lessonPlan.administrativeDetails?.studentEnrollment?.total}</td>
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
                  <div style={styles.emptyTitle}>Loading lessons...</div>
                </div>
              ) : savedLessons.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📁</div>
                  <div style={styles.emptyTitle}>No Saved Lessons Yet</div>
                  <p style={styles.emptyText}>Create and save lesson plans to see them here.</p>
                </div>
              ) : (
                <div style={styles.lessonGrid}>
                  {savedLessons.map((lesson) => (
                    <div key={lesson.dbId} style={styles.lessonCard}>
                      <div style={styles.lessonHeader}>
                        <div style={styles.lessonTopic}>
                          {lesson.administrativeDetails?.subject || lesson.guidingQuestion?.substring(0, 50) || "Untitled"}
                        </div>
                        <div style={styles.lessonDate}>{lesson.savedDate}</div>
                      </div>
                      <div style={styles.lessonMeta}>
                        Grade: {lesson.administrativeDetails?.grade || lesson.grade}
                        <br />
                        Class: {lesson.administrativeDetails?.class || "N/A"}
                        <br />
                        Teacher: {lesson.administrativeDetails?.teacher || "N/A"}
                      </div>
                      <div style={styles.lessonActions}>
                        <button onClick={() => handleViewLesson(lesson)} style={styles.viewButton}>
                          <EyeIcon />
                          View
                        </button>
                        <button onClick={() => handleDelete(lesson)} style={styles.deleteButton}>
                          <TrashIcon />
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
    backgroundColor: "#f5f7fa",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif",
  },
  sidebar: {
    width: "280px",
    background: "linear-gradient(180deg, #059669 0%, #047857 100%)",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    height: "100vh",
    boxShadow: "4px 0 12px rgba(0, 0, 0, 0.1)",
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    marginBottom: "32px",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
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
    color: "rgba(255, 255, 255, 0.7)",
  },
  userMenuButton: {
    background: "none",
    border: "none",
    color: "#ffffff",
    fontSize: "20px",
    cursor: "pointer",
    padding: "4px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
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
    position: "relative",
  },
  navButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    color: "#ffffff",
    fontWeight: "600",
  },
  navIcon: {
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
  },
  navChevron: {
    marginLeft: "auto",
    opacity: 0.5,
  },
  main: {
    marginLeft: "280px",
    flex: 1,
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 40px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },
  welcomeText: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  welcomeGreeting: {
    fontSize: "14px",
    color: "#6b7280",
  },
  welcomeTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
  },
  topBarActions: {
    display: "flex",
    gap: "12px",
  },
  iconButton: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: "#6b7280",
  },
  content: {
    padding: "32px 40px",
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    gridAutoRows: "minmax(180px, auto)",
  },
  cardPrimary: {
    gridColumn: "span 1",
    backgroundColor: "#fff8ed",
    borderRadius: "16px",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  cardInfo: {
    position: "relative",
    zIndex: 1,
  },
  cardLabel: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "4px",
    fontWeight: "500",
  },
  cardValue: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
  },
  floatingAddButton: {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    color: "#ffffff",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  cardSecondary: {
    gridColumn: "span 1",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  cardTag: {
    fontSize: "10px",
    color: "#6b7280",
    fontWeight: "600",
    letterSpacing: "0.5px",
    marginBottom: "8px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "4px",
  },
  cardSubtitle: {
    fontSize: "13px",
    color: "#6b7280",
  },
  folderIcon: {
    fontSize: "32px",
  },
  progressLabel: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "500",
  },
  cardTertiary: {
    gridColumn: "span 1",
    backgroundColor: "#f0fdf4",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    position: "relative",
  },
  playIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
    fontSize: "18px",
  },
  cardDark: {
    gridColumn: "span 1",
    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    borderRadius: "16px",
    padding: "24px",
    color: "#ffffff",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  lockIcon: {
    fontSize: "32px",
    marginBottom: "16px",
  },
  cardWeather: {
    gridColumn: "span 1",
    gridRow: "span 2",
    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    borderRadius: "16px",
    padding: "28px",
    color: "#ffffff",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  weatherInfo: {
    position: "relative",
    zIndex: 1,
  },
  weatherQuestion: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  weatherDesc: {
    fontSize: "13px",
    opacity: 0.9,
    marginBottom: "24px",
  },
  weatherTemp: {
    fontSize: "64px",
    fontWeight: "300",
  },
  weatherAddButton: {
    position: "absolute",
    bottom: "28px",
    right: "28px",
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    color: "#059669",
    border: "none",
    fontSize: "28px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  latestUpdates: {
    gridColumn: "span 2",
    gridRow: "span 2",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "20px",
  },
  updateTabs: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
  updateTabActive: {
    padding: "10px 20px",
    backgroundColor: "#059669",
    color: "#ffffff",
    border: "none",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  updateTab: {
    padding: "10px 20px",
    backgroundColor: "transparent",
    color: "#6b7280",
    border: "none",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  updatesList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  updateItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  updateIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    backgroundColor: "#ffffff",
  },
  updateDetails: {
    flex: 1,
  },
  updateTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "2px",
  },
  updateCategory: {
    fontSize: "12px",
    color: "#6b7280",
  },
  updateAmount: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#10b981",
  },
  updateDate: {
    fontSize: "13px",
    color: "#9ca3af",
    fontWeight: "500",
  },
  loadingState: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280",
    fontSize: "14px",
  },
  emptyDashboard: {
    textAlign: "center",
    padding: "40px 20px",
  },
  emptyDashboardIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  emptyDashboardText: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "20px",
  },
  createFirstButton: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  viewAllButton: {
    width: "100%",
    padding: "12px",
    marginTop: "16px",
    backgroundColor: "#f9fafb",
    color: "#059669",
    fontSize: "14px",
    fontWeight: "600",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  chartCard: {
    gridColumn: "span 1",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    position: "relative",
  },
  chartValue: {
    position: "absolute",
    fontSize: "36px",
    fontWeight: "700",
    color: "#111827",
  },
  donutChart: {
    transform: "rotate(-90deg)",
  },
  chartLabel: {
    marginTop: "16px",
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: "500",
  },
  savingsCard: {
    gridColumn: "span 1",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    borderRadius: "16px",
    padding: "28px",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  savingsText: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px",
    opacity: 0.95,
  },
  savingsAmount: {
    fontSize: "48px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  savingsPoints: {
    fontSize: "14px",
    opacity: 0.9,
  },
  pageHeader: {
    marginBottom: "28px",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "6px",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
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
    color: "#374151",
  },
  input: {
    height: "44px",
    padding: "0 14px",
    fontSize: "14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    color: "#111827",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  generateButton: {
    padding: "14px 28px",
    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
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
    color: "#059669",
    backgroundColor: "#ffffff",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  saveButton: {
    padding: "12px 20px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
  },
  documentPage: {
    maxWidth: "850px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    padding: "60px 80px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
    minHeight: "1100px",
    fontFamily: "'Times New Roman', Times, serif",
    borderRadius: "8px",
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
  emptyState: {
    textAlign: "center",
    padding: "80px 40px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "15px",
    color: "#6b7280",
  },
  lessonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "20px",
  },
  lessonCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    transition: "all 0.3s ease",
  },
  lessonHeader: {
    marginBottom: "16px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e5e7eb",
  },
  lessonTopic: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "6px",
  },
  lessonDate: {
    fontSize: "12px",
    color: "#9ca3af",
    fontWeight: "500",
  },
  lessonMeta: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "20px",
    lineHeight: "1.8",
  },
  lessonActions: {
    display: "flex",
    gap: "10px",
  },
  viewButton: {
    flex: 1,
    padding: "10px 16px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  deleteButton: {
    flex: 1,
    padding: "10px 16px",
    backgroundColor: "#ffffff",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: "600",
    border: "1.5px solid #fecaca",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
}
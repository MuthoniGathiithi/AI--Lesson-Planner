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

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" />
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

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <path d="M8 4l6 6-6 6V4z" />
  </svg>
)

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
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
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>📚</div>
          <span style={styles.logoText}>EduPlan</span>
        </div>

        {/* User Profile */}
        <div style={styles.userProfile}>
          <div style={styles.avatarWrapper}>
            <div style={styles.avatar}>
              <UserIcon />
            </div>
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>Dave Johnson</div>
            <div style={styles.userRole}>Founder and Ceo</div>
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
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.topBar}>
          <div style={styles.welcomeText}>
            <div style={styles.welcomeGreeting}>Hello Dave, Welcome back</div>
            <div style={styles.welcomeTitle}>Your Dashboard is updated</div>
          </div>
          <div style={styles.topBarActions}>
            <button style={styles.iconButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
              </svg>
            </button>
            <button style={styles.iconButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM5 7V5h14v2H5zm2 4h10v2H7v-2z" />
              </svg>
            </button>
            <button style={styles.iconButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </div>
        </div>

        <div style={styles.content}>
          {activeTab === "dashboard" && (
            <div style={styles.dashboardGrid}>
              {/* Stats Cards */}
              <div style={styles.cardPrimary}>
                <div style={styles.illustration3D}>
                  <div style={styles.shape3D1}></div>
                  <div style={styles.shape3D2}></div>
                  <div style={styles.shape3D3}></div>
                </div>
                <div style={styles.cardInfo}>
                  <div style={styles.cardLabel}>Latest uploades</div>
                  <div style={styles.cardValue}>{savedLessons.length} total files</div>
                </div>
                <button style={styles.floatingAddButton}>+</button>
              </div>

              <div style={styles.cardSecondary}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.cardTag}>PRIORITY: REGULAR</div>
                    <div style={styles.cardTitle}>Open projects</div>
                    <div style={styles.cardSubtitle}>{savedLessons.filter(l => l.status !== 'archived').length} tasks remaining</div>
                  </div>
                  <div style={styles.folderIcon}>📁</div>
                </div>
                <div style={styles.progressLabel}>Complete tasks</div>
              </div>

              <div style={styles.cardTertiary}>
                <div style={styles.playIcon}>▶</div>
                <div style={styles.cardTitle}>Latest media</div>
                <div style={styles.cardSubtitle}>23 media files</div>
              </div>

              <div style={styles.cardDark}>
                <div style={styles.lockIcon}>🔒</div>
                <div style={styles.cardTitle}>Urgent to do</div>
                <div style={styles.cardSubtitle}>High priority files</div>
              </div>

              <div style={styles.cardWeather}>
                <div style={styles.weatherInfo}>
                  <div style={styles.weatherQuestion}>What's your plan ?</div>
                  <div style={styles.weatherDesc}>Looks like a shady day</div>
                  <div style={styles.weatherTemp}>36°</div>
                </div>
                <button style={styles.weatherAddButton}>+</button>
              </div>

              {/* Latest Updates */}
              <div style={styles.latestUpdates}>
                <h2 style={styles.sectionTitle}>Latest updates</h2>
                <div style={styles.updateTabs}>
                  <button style={styles.updateTabActive}>Brand addition</button>
                  <button style={styles.updateTab}>Upcoming tasks</button>
                </div>

                <div style={styles.updatesList}>
                  {savedLessons.slice(0, 3).map((lesson, index) => (
                    <div key={lesson.dbId} style={styles.updateItem}>
                      <div style={styles.updateIcon}>
                        {index === 0 ? '⭐' : index === 1 ? '📸' : '🎨'}
                      </div>
                      <div style={styles.updateDetails}>
                        <div style={styles.updateTitle}>
                          {lesson.administrativeDetails?.subject || 'Lesson Plan'}
                        </div>
                        <div style={styles.updateCategory}>
                          {lesson.administrativeDetails?.grade || 'Education'}
                        </div>
                      </div>
                      <div style={styles.updateAmount}>
                        {index === 0 ? '+' : '-'}{Math.floor(Math.random() * 1000)}.00
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completion Chart */}
              <div style={styles.chartCard}>
                <div style={styles.chartValue}>89%</div>
                <svg width="200" height="200" viewBox="0 0 200 200" style={styles.donutChart}>
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="30"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#fb923c"
                    strokeWidth="30"
                    strokeDasharray={`${2 * Math.PI * 80 * 0.89} ${2 * Math.PI * 80}`}
                    strokeDashoffset={2 * Math.PI * 80 * 0.25}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={styles.chartLabel}>Task completion rate</div>
              </div>

              {/* Savings Card */}
              <div style={styles.savingsCard}>
                <div style={styles.savingsText}>Great Job, You Saved</div>
                <div style={styles.savingsAmount}>$5,000</div>
                <div style={styles.savingsPoints}>Points Earned : 10,000</div>
              </div>
            </div>
          )}

          {activeTab === "create" && (
            <>
              <div style={styles.pageHeader}>
                <h1 style={styles.pageTitle}>Create Lesson Plan</h1>
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

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    style={{
                      ...styles.generateButton,
                      opacity: isGenerating ? 0.7 : 1,
                      cursor: isGenerating ? "not-allowed" : "pointer",
                    }}
                  >
                    {isGenerating ? "Generating..." : "Generate Lesson Plan"}
                  </button>
                </div>
              ) : (
                <div style={styles.documentContainer}>
                  <div style={styles.actionBar}>
                    <button onClick={handleCreateNew} style={styles.backButton}>
                      <ArrowLeftIcon /> Create New
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      style={{
                        ...styles.saveButton,
                        opacity: isSaving ? 0.7 : 1,
                      }}
                    >
                      <SaveIcon /> {isSaving ? "Saving..." : currentLessonId ? "Update" : "Save"}
                    </button>
                  </div>

                  <div style={styles.documentPage}>
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
              <div style={styles.pageHeader}>
                <h1 style={styles.pageTitle}>Lesson Archive</h1>
                <p style={styles.pageSubtitle}>View and manage your saved lesson plans.</p>
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
                    <div key={lesson.dbId} style={styles.lessonCard}>
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
                        <button onClick={() => handleViewLesson(lesson)} style={styles.viewButton}>
                          <EyeIcon /> View
                        </button>
                        <button onClick={() => handleDelete(lesson)} style={styles.deleteButton}>
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
    backgroundColor: "#f5f7fa",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif",
  },
  sidebar: {
    width: "280px",
    background: "linear-gradient(180deg, #2d3561 0%, #1f2849 100%)",
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
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
  illustration3D: {
    position: "relative",
    height: "120px",
    marginBottom: "16px",
  },
  shape3D1: {
    position: "absolute",
    width: "60px",
    height: "80px",
    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    borderRadius: "8px",
    left: "10px",
    top: "20px",
    transform: "rotate(-10deg)",
  },
  shape3D2: {
    position: "absolute",
    width: "50px",
    height: "50px",
    background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    borderRadius: "50%",
    right: "30px",
    top: "30px",
  },
  shape3D3: {
    position: "absolute",
    width: "70px",
    height: "40px",
    background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
    borderRadius: "20px",
    right: "10px",
    bottom: "10px",
    transform: "rotate(5deg)",
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
    background: "linear-gradient(135deg, #2d3561 0%, #1f2849 100%)",
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
    background: "linear-gradient(135deg, #2d3561 0%, #1f2849 100%)",
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
    background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
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
    color: "#1e3a8a",
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
    backgroundColor: "#2d3561",
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
    background: "linear-gradient(135deg, #f472b6 0%, #a855f7 100%)",
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
    background: "linear-gradient(135deg, #2d3561 0%, #1f2849 100%)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(45, 53, 97, 0.3)",
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
    color: "#2d3561",
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
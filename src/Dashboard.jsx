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
  Search,
  FileText,
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
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredLessons, setFilteredLessons] = useState([])

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
    // Filter lessons based on search query
    if (searchQuery.trim() === "") {
      setFilteredLessons(savedLessons)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = savedLessons.filter((lesson) => {
        const subject = lesson.administrativeDetails?.subject?.toLowerCase() || ""
        const grade = lesson.administrativeDetails?.grade?.toString().toLowerCase() || ""
        const className = lesson.administrativeDetails?.class?.toLowerCase() || ""
        const teacher = lesson.administrativeDetails?.teacher?.toLowerCase() || ""
        const question = lesson.guidingQuestion?.toLowerCase() || ""

        return (
          subject.includes(query) ||
          grade.includes(query) ||
          className.includes(query) ||
          teacher.includes(query) ||
          question.includes(query)
        )
      })
      setFilteredLessons(filtered)
    }
  }, [searchQuery, savedLessons])

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
      setFilteredLessons(lessons)
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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>📚</div>
            <div style={styles.logoText}>Funza</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <div style={styles.navSection}>
            <div style={styles.navLabel}>MENU</div>
            <button
              onClick={() => setActiveTab("dashboard")}
              style={{
                ...styles.navButton,
                ...(activeTab === "dashboard" ? styles.navButtonActive : {}),
              }}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
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
              {savedLessons.length > 0 && (
                <span style={styles.badge}>{savedLessons.length}</span>
              )}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Top Bar */}
        <header style={styles.topBar}>
          <div style={styles.topBarLeft}>
            <div style={styles.greeting}>{getGreeting()}</div>
            <h1 style={styles.pageTitle}>
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "create" && "Lesson Planner"}
              {activeTab === "archive" && "Lesson Archive"}
            </h1>
          </div>

          <div style={styles.topBarRight}>
            <div style={styles.searchBox}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={styles.content}>
          {activeTab === "dashboard" && (
            <div style={styles.dashboardLayout}>
              {/* Stats Cards */}
              <div style={styles.statsRow}>
                <div style={styles.statCard}>
                  <div style={styles.statHeader}>
                    <div style={styles.statLabel}>TOTAL LESSONS</div>
                  </div>
                  <div style={styles.statValue}>{savedLessons.length}</div>
                  <div style={styles.statSubtext}>All lesson plans created</div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statHeader}>
                    <div style={styles.statLabel}>THIS WEEK</div>
                  </div>
                  <div style={styles.statValue}>
                    {savedLessons.filter((l) => {
                      const lessonDate = new Date(l.savedDate)
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return lessonDate >= weekAgo
                    }).length}
                  </div>
                  <div style={styles.statSubtext}>Lessons created this week</div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statHeader}>
                    <div style={styles.statLabel}>COMPLETION RATE</div>
                  </div>
                  <div style={styles.statValue}>
                    {savedLessons.length > 0
                      ? Math.round((savedLessons.filter((l) => l.status === "completed").length / savedLessons.length) * 100)
                      : 0}%
                  </div>
                  <div style={styles.statSubtext}>Lessons completed</div>
                </div>
              </div>

              {/* Recent Lessons */}
              <div style={styles.lessonsSection}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>Recent Lessons</h2>
                  <button onClick={() => setActiveTab("archive")} style={styles.viewAllButton}>
                    View All
                  </button>
                </div>

                <div style={styles.tableContainer}>
                  {filteredLessons.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>📚</div>
                      <div style={styles.emptyText}>No lessons yet</div>
                      <p style={styles.emptyDescription}>Create your first lesson plan to get started</p>
                    </div>
                  ) : (
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeader}>
                          <th style={{ ...styles.th, textAlign: "left" }}>Subject</th>
                          <th style={{ ...styles.th, textAlign: "left" }}>Grade</th>
                          <th style={{ ...styles.th, textAlign: "left" }}>Class</th>
                          <th style={{ ...styles.th, textAlign: "left" }}>Teacher</th>
                          <th style={{ ...styles.th, textAlign: "left" }}>Date</th>
                          <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLessons.slice(0, 5).map((lesson) => (
                          <tr key={lesson.dbId} style={styles.tableRow}>
                            <td style={styles.td}>
                              {lesson.administrativeDetails?.subject || lesson.guidingQuestion?.substring(0, 30) || "Lesson Plan"}
                            </td>
                            <td style={styles.td}>{lesson.administrativeDetails?.grade || "N/A"}</td>
                            <td style={styles.td}>{lesson.administrativeDetails?.class || "N/A"}</td>
                            <td style={styles.td}>{lesson.administrativeDetails?.teacher || "N/A"}</td>
                            <td style={styles.td}>{lesson.savedDate}</td>
                            <td style={styles.td}>
                              <button onClick={() => handleViewLesson(lesson)} style={styles.viewButtonSmall}>
                                <Eye size={16} />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "create" && (
            <>
              {!lessonPlan ? (
                <div style={styles.formCard}>
                  <h2 style={styles.formTitle}>Create New Lesson Plan</h2>
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

                    <table style={styles.docTable}>
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
              {isLoadingLessons ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyText}>Loading lessons...</div>
                </div>
              ) : filteredLessons.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📁</div>
                  <div style={styles.emptyText}>
                    {searchQuery ? "No lessons match your search" : "No Saved Lessons Yet"}
                  </div>
                  <p style={styles.emptyDescription}>
                    {searchQuery
                      ? "Try a different search term"
                      : "Create and save lesson plans to see them here."}
                  </p>
                </div>
              ) : (
                <div style={styles.lessonGrid}>
                  {filteredLessons.map((lesson) => (
                    <div key={lesson.dbId} style={styles.lessonCard}>
                      <div style={styles.lessonCardHeader}>
                        <FileText size={24} style={styles.lessonCardIcon} />
                      </div>
                      <div style={styles.lessonCardTitle}>
                        {lesson.administrativeDetails?.subject ||
                          lesson.guidingQuestion?.substring(0, 50) ||
                          "Untitled"}
                      </div>
                      <div style={styles.lessonCardMeta}>
                        <div style={styles.metaRow}>
                          <span style={styles.metaLabel}>Grade:</span>
                          <span style={styles.metaValue}>{lesson.administrativeDetails?.grade || "N/A"}</span>
                        </div>
                        <div style={styles.metaRow}>
                          <span style={styles.metaLabel}>Class:</span>
                          <span style={styles.metaValue}>{lesson.administrativeDetails?.class || "N/A"}</span>
                        </div>
                        <div style={styles.metaRow}>
                          <span style={styles.metaLabel}>Teacher:</span>
                          <span style={styles.metaValue}>{lesson.administrativeDetails?.teacher || "N/A"}</span>
                        </div>
                        <div style={styles.metaRow}>
                          <span style={styles.metaLabel}>Date:</span>
                          <span style={styles.metaValue}>{lesson.savedDate}</span>
                        </div>
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
      </main>
    </div>
  )
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  sidebar: {
    width: "260px",
    backgroundColor: "#000000",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    height: "100vh",
    overflowY: "auto",
  },
  sidebarHeader: {
    marginBottom: "32px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
  },
  logoIcon: {
    fontSize: "28px",
  },
  logoText: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: "-0.5px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  navSection: {
    marginBottom: "16px",
  },
  navLabel: {
    fontSize: "11px",
    color: "#888888",
    fontWeight: "600",
    letterSpacing: "1px",
    padding: "8px 16px",
    marginBottom: "8px",
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#ffffff",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    position: "relative",
  },
  navButtonActive: {
    backgroundColor: "#1976d2",
    fontWeight: "600",
  },
  badge: {
    marginLeft: "auto",
    backgroundColor: "#1976d2",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 8px",
    borderRadius: "12px",
    minWidth: "22px",
    textAlign: "center",
  },
  main: {
    marginLeft: "260px",
    flex: 1,
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 32px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e0e0e0",
  },
  topBarLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  greeting: {
    fontSize: "14px",
    color: "#666666",
    fontWeight: "500",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#000000",
    margin: 0,
  },
  topBarRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  searchBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    color: "#999999",
    pointerEvents: "none",
  },
  searchInput: {
    height: "44px",
    paddingLeft: "44px",
    paddingRight: "16px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#ffffff",
    fontSize: "14px",
    color: "#000000",
    outline: "none",
    transition: "all 0.2s ease",
    width: "300px",
    fontFamily: "inherit",
  },
  content: {
    padding: "32px",
  },
  dashboardLayout: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "28px",
    border: "1px solid #e0e0e0",
  },
  statHeader: {
    marginBottom: "12px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#666666",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },
  statValue: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#000000",
    marginBottom: "8px",
  },
  statSubtext: {
    fontSize: "14px",
    color: "#666666",
  },
  lessonsSection: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "28px",
    border: "1px solid #e0e0e0",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#000000",
  },
  viewAllButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#1976d2",
    backgroundColor: "transparent",
    border: "1px solid #1976d2",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    borderBottom: "2px solid #e0e0e0",
  },
  th: {
    padding: "14px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#666666",
    textAlign: "center",
  },
  tableRow: {
    borderBottom: "1px solid #f0f0f0",
    transition: "background-color 0.2s ease",
  },
  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#000000",
    textAlign: "left",
  },
  viewButtonSmall: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#1976d2",
    backgroundColor: "transparent",
    border: "1px solid #1976d2",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "32px",
    border: "1px solid #e0e0e0",
  },
  formTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#000000",
    marginBottom: "28px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
    marginBottom: "28px",
  },
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#000000",
  },
  input: {
    height: "44px",
    padding: "0 16px",
    fontSize: "14px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#000000",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  generateButton: {
    padding: "14px 32px",
    backgroundColor: "#1976d2",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
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
    color: "#000000",
    backgroundColor: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  saveButton: {
    padding: "12px 20px",
    backgroundColor: "#1976d2",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  documentPage: {
    maxWidth: "850px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    padding: "60px 80px",
    minHeight: "1100px",
    fontFamily: "'Times New Roman', serif",
    lineHeight: "1.6",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
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
  docTable: {
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
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  emptyText: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#000000",
    marginBottom: "8px",
  },
  emptyDescription: {
    fontSize: "14px",
    color: "#666666",
    marginBottom: "20px",
  },
  lessonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
  },
  lessonCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #e0e0e0",
    transition: "all 0.2s ease",
  },
  lessonCardHeader: {
    marginBottom: "16px",
  },
  lessonCardIcon: {
    color: "#1976d2",
  },
  lessonCardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#000000",
    marginBottom: "16px",
    lineHeight: "1.4",
  },
  lessonCardMeta: {
    marginBottom: "20px",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  metaLabel: {
    fontSize: "13px",
    color: "#666666",
    fontWeight: "500",
  },
  metaValue: {
    fontSize: "13px",
    color: "#000000",
    fontWeight: "600",
  },
  lessonCardActions: {
    display: "flex",
    gap: "12px",
  },
  viewButton: {
    flex: 1,
    padding: "12px 16px",
    backgroundColor: "#1976d2",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  deleteButton: {
    flex: 1,
    padding: "12px 16px",
    backgroundColor: "#ffffff",
    color: "#000000",
    fontSize: "14px",
    fontWeight: "600",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
}
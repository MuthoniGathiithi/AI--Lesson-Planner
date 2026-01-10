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
  Bell,
  Settings,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
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
    if (formData.teacherName) {
      const firstName = formData.teacherName.split(" ")[0]
      setUserName(firstName)
    }
  }, [formData.teacherName])

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

  const thisWeekLessons = savedLessons.filter((l) => {
    const lessonDate = new Date(l.savedDate)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return lessonDate >= weekAgo
  })

  const completionRate =
    savedLessons.length > 0
      ? Math.round((savedLessons.filter((l) => l.status === "completed").length / savedLessons.length) * 100)
      : 0

  const weekGrowth = thisWeekLessons.length > 0 ? "+14.88%" : "0%"
  const isGrowthPositive = thisWeekLessons.length > 0

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
            <div style={styles.navLabel}>MAIN</div>
            <button
              onClick={() => setActiveTab("dashboard")}
              style={{
                ...styles.navButton,
                ...(activeTab === "dashboard" ? styles.navButtonActive : {}),
              }}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
              {activeTab === "dashboard" && <div style={styles.activeIndicator}></div>}
            </button>
          </div>

          <button
            onClick={() => setActiveTab("create")}
            style={{
              ...styles.navButton,
              ...(activeTab === "create" ? styles.navButtonActive : {}),
            }}
          >
            <Plus size={18} />
            <span>Create Lesson</span>
            {activeTab === "create" && <div style={styles.activeIndicator}></div>}
          </button>

          <button
            onClick={() => setActiveTab("archive")}
            style={{
              ...styles.navButton,
              ...(activeTab === "archive" ? styles.navButtonActive : {}),
            }}
          >
            <Archive size={18} />
            <span>Lesson Archive</span>
            {activeTab === "archive" && savedLessons.length > 0 && (
              <span style={styles.badge}>{savedLessons.length}</span>
            )}
            {activeTab === "archive" && <div style={styles.activeIndicator}></div>}
          </button>

          

          
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
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <button style={styles.iconButton}>
              <Bell size={20} />
            </button>
            <button style={styles.iconButton}>
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div style={styles.content}>
          {activeTab === "dashboard" && (
            <div style={styles.dashboardLayout}>
              {/* Stats Cards */}
              

              {/* Main Content Grid */}
              <div style={styles.dashboardGrid}>
                {/* Lessons List */}
                <div style={styles.lessonsList}>
                  <div style={styles.listHeader}>
                    <h3 style={styles.listTitle}>LIST OF LESSONS</h3>
                    
                  </div>

                  <div style={styles.tableContainer}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeader}>
                          <th style={styles.th}>
                           
                          </th>
                          <th style={{ ...styles.th, textAlign: "left" }}>Name</th>
                          <th style={{ ...styles.th, textAlign: "left" }}>Dates</th>
                          <th style={{ ...styles.th, textAlign: "left" }}>Lesson PLans </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLessons.slice(0, 3).map((lesson, index) => (
                          <tr key={lesson.dbId} style={styles.tableRow} onClick={() => handleViewLesson(lesson)}>
                            <td style={styles.td}>
                              <input
                                
                                checked={index === 0}
                                onChange={() => {}}
                                style={styles.checkbox}
                              />
                            </td>
                            <td style={{ ...styles.td, fontWeight: "500" }}>
                              {lesson.administrativeDetails?.subject || lesson.guidingQuestion?.substring(0, 30) || "Lesson Plan"}
                            </td>
                            <td style={styles.td}>
                              {lesson.savedDate} - {new Date(new Date(lesson.savedDate).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </td>
                            <td style={styles.td}>
                              <span style={{ ...styles.priorityBadge, ...(index === 0 ? styles.priorityLow : styles.priorityMedium) }}>
                                {index === 0 ? "Low" : "Medium"}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <div style={styles.attachmentLink}>
                                <FileText size={14} />
                                Lesson Plan.pdf
                              </div>
                            </td>
                            <td style={styles.td}>
                              <div style={styles.assigneeGroup}>
                                <div style={styles.assigneeAvatar}>
                                  {lesson.administrativeDetails?.teacher?.charAt(0) || "T"}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Communication Section */}
                  
                </div>

               
              </div>
            </div>
          )}

          {activeTab === "create" && (
            <>
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
      </main>
    </div>
  )
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 50%, #f3e5f5 100%)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  sidebar: {
    width: "250px",
    background:"#FAFAFA" ,
    backdropFilter: "blur(20px)",
    borderRight: "1px solid rgba(255, 255, 255, 0.5)",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    height: "100vh",
    boxShadow: "4px 0 24px rgba(0, 0, 0, 0.04)",
    overflowY: "auto",
  },
  sidebarHeader: {
    marginBottom: "24px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 12px",
  },
  logoIcon: {
    fontSize: "24px",
  },
  logoText: {
    fontSize: "24px",
    fontWeight: "700",
    background: "#000",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.5px",
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  userAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: "18px",
  },
  userDetails: {
    flex: 1,
  },
  userGreeting: {
    fontSize: "10px",
    color: "#6b7280",
    fontWeight: "600",
    letterSpacing: "0.5px",
    marginBottom: "2px",
  },
  userTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "2px",
  },
  userSubtitle: {
    fontSize: "12px",
    color: "#6b7280",
  },
  userChevron: {
    color: "#9ca3af",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  navSection: {
    marginBottom: "8px",
  },
  navLabel: {
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: "600",
    letterSpacing: "0.5px",
    padding: "8px 12px",
    marginTop: "12px",
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#6b7280",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    position: "relative",
  },
  navButtonActive: {
    backgroundColor: "#ffffff",
    color: "#1976d2",
    fontWeight: "600",
    boxShadow: "0 2px 8px rgba(25, 118, 210, 0.12)",
  },
  activeIndicator: {
    position: "absolute",
    right: "12px",
    width: "4px",
    height: "20px",
    backgroundColor: "#1976d2",
    borderRadius: "2px",
  },
  badge: {
    marginLeft: "auto",
    backgroundColor: "#ef4444",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "12px",
    minWidth: "20px",
    textAlign: "center",
  },
  sidebarFooter: {
    marginTop: "auto",
    paddingTop: "16px",
  },
  messagesList: {
    display: "flex",
    gap: "8px",
    padding: "8px 12px",
  },
  messageAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s ease",
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
    padding: "24px 32px",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
  },
  topBarLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  greeting: {
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: "500",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
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
    color: "#9ca3af",
    pointerEvents: "none",
  },
  searchInput: {
    height: "44px",
    paddingLeft: "44px",
    paddingRight: "16px",
    borderRadius: "12px",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    backgroundColor: "#ffffff",
    fontSize: "14px",
    color: "#111827",
    outline: "none",
    transition: "all 0.2s ease",
    width: "280px",
    fontFamily: "inherit",
  },
  iconButton: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    color: "#6b7280",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  content: {
    padding: "32px",
  },
  dashboardLayout: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "20px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
  },
  statCardPrimary: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
  },
  statCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  statIcon: {
    fontSize: "32px",
  },
  statBadge: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "600",
  },
  statContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statLabel: {
    fontSize: "16px",
    fontWeight: "600",
    opacity: 0.95,
  },
  statText: {
    fontSize: "13px",
    opacity: 0.85,
  },
  statHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  statTitle: {
    fontSize: "11px",
    color: "#6b7280",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },
  chartMini: {
    width: "60px",
    height: "40px",
  },
  statValue: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "8px",
  },
  statSubtext: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
  },
  statTrend: {
    color: "#10b981",
    fontWeight: "600",
  },
  statPeriod: {
    color: "#9ca3af",
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px",
  },
  lessonsList: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  listTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280",
    letterSpacing: "0.5px",
  },
  linkButton: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "13px",
    color: "#1976d2",
    fontWeight: "500",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tableContainer: {
    overflowX: "auto",
    marginBottom: "32px",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0",
  },
  tableHeader: {
    borderBottom: "1px solid #e5e7eb",
  },
  th: {
    padding: "12px 16px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
  },
  tableRow: {
    borderBottom: "1px solid #f3f4f6",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  td: {
    padding: "16px",
    fontSize: "13px",
    color: "#374151",
    textAlign: "center",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
    accentColor: "#1976d2",
  },
  priorityBadge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "500",
  },
  priorityLow: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  priorityMedium: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  attachmentLink: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#1976d2",
    fontSize: "13px",
  },
  assigneeGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "4px",
  },
  assigneeAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "600",
  },
  communicationSection: {
    paddingTop: "24px",
    borderTop: "1px solid #f3f4f6",
  },
  messageList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  messageItem: {
    display: "flex",
    gap: "12px",
    padding: "12px",
    borderRadius: "12px",
    backgroundColor: "#f9fafb",
    transition: "all 0.2s ease",
  },
  messageContent: {
    flex: 1,
  },
  messageName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "4px",
  },
  messageText: {
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: "1.5",
    marginBottom: "4px",
  },
  messageTime: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  rightSidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  widget: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
  },
  widgetHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  widgetTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    letterSpacing: "0.5px",
  },
  chartArea: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  barChart: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: "120px",
    gap: "8px",
  },
  barItem: {
    flex: 1,
    backgroundColor: "#3b82f6",
    borderRadius: "8px 8px 0 0",
    minHeight: "20px",
  },
  chartLegend: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#374151",
  },
  legendDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
  legendValue: {
    marginLeft: "auto",
    fontWeight: "600",
  },
  countryList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  countryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    borderRadius: "12px",
    backgroundColor: "#f9fafb",
  },
  countryInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  countryName: {
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: "500",
  },
  countryLabel: {
    fontSize: "14px",
    color: "#111827",
    fontWeight: "600",
  },
  countryStats: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  countryValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
  },
  countryGrowth: {
    fontSize: "13px",
    color: "#10b981",
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "32px",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
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
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    height: "44px",
    padding: "0 16px",
    fontSize: "14px",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    color: "#111827",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  generateButton: {
    padding: "14px 32px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
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
    color: "#6b7280",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  saveButton: {
    padding: "12px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
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
    borderRadius: "12px",
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
    padding: "60px 20px",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  emptyText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "8px",
  },
  emptyDescription: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "20px",
  },
  lessonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  lessonCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
    transition: "all 0.2s ease",
  },
  lessonCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    gap: "12px",
  },
  lessonCardTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    lineHeight: "1.4",
  },
  lessonCardDate: {
    fontSize: "12px",
    color: "#9ca3af",
    fontWeight: "500",
  },
  lessonCardMeta: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "16px",
    lineHeight: "1.6",
  },
  lessonCardActions: {
    display: "flex",
    gap: "8px",
  },
  viewButton: {
    flex: 1,
    padding: "10px 16px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
    color: "#ef4444",
    fontSize: "13px",
    fontWeight: "600",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
}
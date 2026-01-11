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
  LogOut,
  Download,
  Edit2,
  Check,
  X,
} from "lucide-react"
import { generateLessonPlan } from "./services/api"
import { saveLessonPlan, fetchLessonPlans, updateLessonPlan, deleteLessonPlan } from "./services/lessonPlanService"

export default function LessonCreator() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingLessons, setIsLoadingLessons] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [lessonPlan, setLessonPlan] = useState(null)
  const [currentLessonId, setCurrentLessonId] = useState(null)
  const [savedLessons, setSavedLessons] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredLessons, setFilteredLessons] = useState([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const [editingValue, setEditingValue] = useState("")
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024)

  const [formData, setFormData] = useState({
    schoolName: "",
    subject: "",
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

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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
    if (!formData.subject.trim()) {
      alert("Please enter a subject (e.g., Biology, Geography, Mathematics)")
      return
    }
    if (!formData.strand.trim()) {
      alert("Please enter a strand")
      return
    }
    if (!formData.subStrand.trim()) {
      alert("Please enter a sub-strand")
      return
    }

    setIsGenerating(true)
    try {
      const generatedPlan = await generateLessonPlan(formData)
      setLessonPlan(generatedPlan)
      setCurrentLessonId(null)
      console.log("Generated lesson plan:", generatedPlan)
    } catch (error) {
      console.error("Error generating lesson plan:", error)
      alert(
        "Failed to generate lesson plan. Please check: \n- Backend is running\n- Subject name is correct (typos are handled)\n- Strand and sub-strand are provided",
      )
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

  const downloadAsDocx = async (lesson) => {
    try {
      let content = `LESSON PLAN\n\n`

      content += `School: ${lesson.administrativeDetails?.school || "N/A"}\n`
      content += `Subject: ${lesson.administrativeDetails?.subject || "N/A"}\n`
      content += `Class: ${lesson.administrativeDetails?.class || "N/A"}\n`
      content += `Grade: ${lesson.administrativeDetails?.grade || "N/A"}\n`
      content += `Teacher: ${lesson.administrativeDetails?.teacher || "N/A"}\n`
      content += `Students: ${lesson.administrativeDetails?.studentEnrollment?.total || "N/A"}\n`
      content += `Date: ${lesson.administrativeDetails?.date || "N/A"}\n`
      content += `Time: ${lesson.administrativeDetails?.time?.start || ""} - ${lesson.administrativeDetails?.time?.end || ""}\n\n`

      content += `GUIDING QUESTION\n`
      content += `${lesson.guidingQuestion || "N/A"}\n\n`

      content += `LEARNING OUTCOMES\n`
      if (lesson.learningOutcomes && lesson.learningOutcomes.length > 0) {
        lesson.learningOutcomes.forEach((outcome) => {
          content += `${outcome.id}. ${outcome.outcome}\n`
        })
      }
      content += `\n`

      content += `LEARNING RESOURCES\n`
      content += `${lesson.learningResources?.join(", ") || "N/A"}\n\n`

      content += `LESSON FLOW\n\n`

      content += `Introduction (5 minutes)\n`
      content += `${lesson.lessonFlow?.introduction?.description || "N/A"}\n\n`

      content += `Development Activities\n`
      if (lesson.lessonFlow?.development && lesson.lessonFlow.development.length > 0) {
        lesson.lessonFlow.development.forEach((step) => {
          content += `\nStep ${step.step}: ${step.title}\n`
          content += `Description: ${step.description}\n`
          content += `Activity: ${step.activity}\n`
        })
      }
      content += `\n`

      content += `Conclusion (5 minutes)\n`
      content += `${lesson.lessonFlow?.conclusion?.description || "N/A"}\n`

      const blob = new Blob([content], { type: "text/plain" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${lesson.administrativeDetails?.subject || "lesson_plan"}_${lesson.administrativeDetails?.class || ""}_${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return { success: true }
    } catch (error) {
      console.error("Download error:", error)
      return { success: false, error: error.message }
    }
  }

  const downloadAsPdf = async (lesson) => {
    try {
      const printWindow = window.open("", "", "width=800,height=600")

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lesson Plan - ${lesson.administrativeDetails?.subject || "Untitled"}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            h2 {
              margin-top: 30px;
              font-size: 16px;
              text-transform: uppercase;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            h3 {
              margin-top: 20px;
              font-size: 14px;
              text-decoration: underline;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            td {
              padding: 8px;
              border: 1px solid #ddd;
            }
            td:nth-child(odd) {
              font-weight: bold;
              width: 25%;
              background: #f5f5f5;
            }
            .section {
              margin: 20px 0;
            }
            .step {
              margin: 15px 0 15px 20px;
              padding: 10px;
              background: #f9f9f9;
              border-left: 3px solid #1976d2;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>LESSON PLAN</h1>
          
          <table>
            <tr>
              <td>School:</td>
              <td>${lesson.administrativeDetails?.school || "N/A"}</td>
              <td>Subject:</td>
              <td>${lesson.administrativeDetails?.subject || "N/A"}</td>
            </tr>
            <tr>
              <td>Class:</td>
              <td>${lesson.administrativeDetails?.class || "N/A"}</td>
              <td>Grade:</td>
              <td>${lesson.administrativeDetails?.grade || "N/A"}</td>
            </tr>
            <tr>
              <td>Teacher:</td>
              <td>${lesson.administrativeDetails?.teacher || "N/A"}</td>
              <td>Students:</td>
              <td>${lesson.administrativeDetails?.studentEnrollment?.total || "N/A"}</td>
            </tr>
            <tr>
              <td>Date:</td>
              <td>${lesson.administrativeDetails?.date || "N/A"}</td>
              <td>Time:</td>
              <td>${lesson.administrativeDetails?.time?.start || ""} - ${lesson.administrativeDetails?.time?.end || ""}</td>
            </tr>
          </table>
          
          <div class="section">
            <h2>Guiding Question</h2>
            <p>${lesson.guidingQuestion || "N/A"}</p>
          </div>
          
          <div class="section">
            <h2>Learning Outcomes</h2>
            ${
              lesson.learningOutcomes?.map((outcome) => `<p>${outcome.id}. ${outcome.outcome}</p>`).join("") ||
              "<p>N/A</p>"
            }
          </div>
          
          <div class="section">
            <h2>Learning Resources</h2>
            <p>${lesson.learningResources?.join(", ") || "N/A"}</p>
          </div>
          
          <div class="section">
            <h2>Lesson Flow</h2>
            
            <h3>Introduction (5 minutes)</h3>
            <p>${lesson.lessonFlow?.introduction?.description || "N/A"}</p>
            
            <h3>Development Activities</h3>
            ${
              lesson.lessonFlow?.development
                ?.map(
                  (step) => `
              <div class="step">
                <strong>Step ${step.step}: ${step.title}</strong><br>
                <strong>Description:</strong> ${step.description}<br>
                <strong>Activity:</strong> ${step.activity}
              </div>
            `,
                )
                .join("") || "<p>N/A</p>"
            }
            
            <h3>Conclusion (5 minutes)</h3>
            <p>${lesson.lessonFlow?.conclusion?.description || "N/A"}</p>
          </div>
        </body>
        </html>
      `)

      printWindow.document.close()
      printWindow.focus()

      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)

      return { success: true }
    } catch (error) {
      console.error("PDF generation error:", error)
      return { success: false, error: error.message }
    }
  }

  const handleDownload = async (lesson, format = "docx") => {
    setIsDownloading(true)
    try {
      let result
      if (format === "pdf") {
        result = await downloadAsPdf(lesson)
      } else {
        result = await downloadAsDocx(lesson)
      }

      if (result.success) {
        alert(`Lesson plan downloaded successfully as ${format.toUpperCase()}!`)
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
    setIsMobileMenuOpen(false)
  }

  const handleCreateNew = () => {
    setLessonPlan(null)
    setCurrentLessonId(null)
    setEditingField(null)
    setFormData({
      schoolName: "",
      subject: "",
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
    setActiveTab("create")
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      setLessonPlan(null)
      setCurrentLessonId(null)
      setSavedLessons([])
      setFilteredLessons([])
      setActiveTab("dashboard")
      alert("Logged out successfully!")
      window.location.href = "/login"
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const handleNavClick = (tab) => {
    setActiveTab(tab)
    setIsMobileMenuOpen(false)
  }

  const startEditing = (field, value) => {
    setEditingField(field)
    setEditingValue(value || "")
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditingValue("")
  }

  const saveEdit = (path) => {
    if (!lessonPlan) return

    const newPlan = JSON.parse(JSON.stringify(lessonPlan))
    const keys = path.split(".")

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

  const addLearningOutcome = () => {
    if (!lessonPlan) return
    const newOutcomes = [...(lessonPlan.learningOutcomes || [])]
    newOutcomes.push({
      id: (newOutcomes.length + 1).toString(),
      outcome: "New learning outcome - click to edit",
    })
    setLessonPlan({ ...lessonPlan, learningOutcomes: newOutcomes })
  }

  const deleteLearningOutcome = (index) => {
    if (!lessonPlan) return
    const newOutcomes = lessonPlan.learningOutcomes.filter((_, i) => i !== index)
    const renumbered = newOutcomes.map((outcome, i) => ({
      ...outcome,
      id: (i + 1).toString(),
    }))
    setLessonPlan({ ...lessonPlan, learningOutcomes: renumbered })
  }

  const addDevelopmentStep = () => {
    if (!lessonPlan) return
    const lessonFlow = lessonPlan.lessonFlow || {}
    const development = [...(lessonFlow.development || [])]
    development.push({
      step: development.length + 1,
      title: "New Step - click to edit",
      description: "Step description - click to edit",
      activity: "Activity description - click to edit",
    })
    setLessonPlan({
      ...lessonPlan,
      lessonFlow: { ...lessonFlow, development },
    })
  }

  const deleteDevelopmentStep = (index) => {
    if (!lessonPlan) return
    const lessonFlow = lessonPlan.lessonFlow || {}
    const development = lessonFlow.development.filter((_, i) => i !== index)
    const renumbered = development.map((step, i) => ({
      ...step,
      step: i + 1,
    }))
    setLessonPlan({
      ...lessonPlan,
      lessonFlow: { ...lessonFlow, development: renumbered },
    })
  }

  const renderEditableField = (path, value, multiline = false, placeholder = "Click to edit") => {
    const fieldKey = path
    const isEditing = editingField === fieldKey

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
                  if (e.key === "Escape") cancelEditing()
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
                  if (e.key === "Enter") saveEdit(path)
                  if (e.key === "Escape") cancelEditing()
                }}
              />
            )}
            <div style={styles.editButtonGroup}>
              <button onClick={() => saveEdit(path)} style={styles.saveEditBtn} title="Save (Enter)">
                <Check size={16} />
              </button>
              <button onClick={cancelEditing} style={styles.cancelEditBtn} title="Cancel (Esc)">
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.editableValue} onClick={() => startEditing(fieldKey, value)} title="Click to edit">
            <span style={styles.editableText}>{value || placeholder}</span>
            <Edit2 size={14} style={styles.editIcon} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside
        style={{
          ...styles.sidebar,
          width: windowWidth <= 768 ? (isMobileMenuOpen ? "260px" : "0") : "260px",
          transform: windowWidth <= 768 && !isMobileMenuOpen ? "translateX(-100%)" : "translateX(0)",
          borderRight: windowWidth > 768 || isMobileMenuOpen ? "1px solid #e5e7eb" : "none",
        }}
      >
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Lesson Creator</h2>
          {windowWidth <= 768 && isMobileMenuOpen && (
            <button onClick={() => setIsMobileMenuOpen(false)} style={styles.closeMenuButton} aria-label="Close menu">
              <X size={24} />
            </button>
          )}
        </div>

        <nav style={styles.nav}>
          <button
            onClick={() => handleNavClick("dashboard")}
            style={{
              ...styles.navLink,
              ...(activeTab === "dashboard" ? { backgroundColor: "#e0e7ff", color: "#2563eb", fontWeight: "600" } : {}),
            }}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleNavClick("create")}
            style={{
              ...styles.navLink,
              ...(activeTab === "create" ? { backgroundColor: "#e0e7ff", color: "#2563eb", fontWeight: "600" } : {}),
            }}
          >
            <Plus size={20} />
            <span>Create Lesson</span>
          </button>

          <button
            onClick={() => handleNavClick("archive")}
            style={{
              ...styles.navLink,
              ...(activeTab === "archive" ? { backgroundColor: "#e0e7ff", color: "#2563eb", fontWeight: "600" } : {}),
            }}
          >
            <Archive size={20} />
            <span>Lesson Archive</span>
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && windowWidth <= 768 && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            zIndex: 999,
          }}
        />
      )}

      {/* Main Content */}
      <main
        style={{
          ...styles.main,
          marginLeft: windowWidth <= 768 ? "0" : "260px",
        }}
      >
        {/* Top Bar */}
        <header style={styles.topBar}>
          <div style={styles.topBarLeft}>
            <div style={styles.greeting}>{getGreeting()}</div>
            <h1
              style={{
                ...styles.pageTitle,
                fontSize: windowWidth <= 640 ? "20px" : "28px",
              }}
            >
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "create" && "Lesson Planner"}
              {activeTab === "archive" && "Lesson Archive"}
            </h1>
          </div>

          <div
            style={{
              ...styles.topBarRight,
              width: windowWidth <= 640 ? "100%" : "auto",
            }}
          >
            <div
              style={{
                ...styles.searchBox,
                width: windowWidth <= 640 ? "100%" : "auto",
              }}
            >
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            {windowWidth <= 768 && (
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={styles.menuToggle}>
                {isMobileMenuOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div style={styles.content}>
          {activeTab === "dashboard" && (
            <div style={styles.dashboardLayout}>
              <div
                style={{
                  ...styles.dashboardHeader,
                  flexDirection: windowWidth <= 640 ? "column" : "row",
                  gap: windowWidth <= 640 ? "12px" : "16px",
                }}
              >
                <button
                  onClick={handleCreateNew}
                  style={{
                    ...styles.createNewButton,
                    width: windowWidth <= 640 ? "100%" : "auto",
                    padding: windowWidth <= 640 ? "10px 16px" : "12px 20px",
                    fontSize: windowWidth <= 640 ? "13px" : "14px",
                  }}
                >
                  <Plus size={windowWidth <= 640 ? 18 : 20} />
                  <span>Create New Lesson Plan</span>
                </button>
              </div>

              {/* Stats Cards */}
              <div
                style={{
                  ...styles.statsRow,
                  flexDirection: windowWidth <= 640 ? "column" : "row",
                  gap: windowWidth <= 640 ? "12px" : "16px",
                }}
              >
                <div
                  style={{
                    ...styles.statCard,
                    ...styles.statCardBlue,
                    flex: windowWidth <= 640 ? "1 1 100%" : "1",
                  }}
                >
                  <div style={styles.statHeader}>
                    <div style={styles.statIcon}>
                      <FileText size={windowWidth <= 640 ? 20 : 24} />
                    </div>
                    <div
                      style={{
                        ...styles.statPercentage,
                        fontSize: windowWidth <= 640 ? "14px" : "16px",
                      }}
                    >
                      {savedLessons.length > 0 ? "100%" : "0%"}
                    </div>
                  </div>
                  <div
                    style={{
                      ...styles.statValue,
                      fontSize: windowWidth <= 640 ? "24px" : "28px",
                    }}
                  >
                    {savedLessons.length.toLocaleString()}
                  </div>
                  <div
                    style={{
                      ...styles.statSubtext,
                      fontSize: windowWidth <= 640 ? "12px" : "14px",
                    }}
                  >
                    Total Lessons
                  </div>
                </div>

                <div
                  style={{
                    ...styles.statCard,
                    ...styles.statCardPurple,
                    flex: windowWidth <= 640 ? "1 1 100%" : "1",
                  }}
                >
                  <div style={styles.statHeader}>
                    <div style={styles.statIcon}>
                      <Archive size={windowWidth <= 640 ? 20 : 24} />
                    </div>
                    <div
                      style={{
                        ...styles.statPercentage,
                        fontSize: windowWidth <= 640 ? "14px" : "16px",
                      }}
                    >
                      {savedLessons.filter((l) => {
                        const lessonDate = new Date(l.savedDate)
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return lessonDate >= weekAgo
                      }).length > 0
                        ? "+12%"
                        : "0%"}
                    </div>
                  </div>
                  <div
                    style={{
                      ...styles.statValue,
                      fontSize: windowWidth <= 640 ? "24px" : "28px",
                    }}
                  >
                    {savedLessons
                      .filter((l) => {
                        const lessonDate = new Date(l.savedDate)
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return lessonDate >= weekAgo
                      })
                      .length.toLocaleString()}
                  </div>
                  <div
                    style={{
                      ...styles.statSubtext,
                      fontSize: windowWidth <= 640 ? "12px" : "14px",
                    }}
                  >
                    This Week
                  </div>
                </div>
              </div>

              {/* Recent Lessons */}
              <div style={styles.lessonsSection}>
                <div
                  style={{
                    ...styles.sectionHeader,
                    flexDirection: windowWidth <= 640 ? "column" : "row",
                    gap: windowWidth <= 640 ? "12px" : "0",
                  }}
                >
                  <h2
                    style={{
                      ...styles.sectionTitle,
                      fontSize: windowWidth <= 640 ? "16px" : "18px",
                    }}
                  >
                    Recent Lessons
                  </h2>
                  <button
                    onClick={() => setActiveTab("archive")}
                    style={{
                      ...styles.viewAllButton,
                      width: windowWidth <= 640 ? "100%" : "auto",
                      padding: windowWidth <= 640 ? "8px 12px" : "8px 16px",
                      fontSize: windowWidth <= 640 ? "12px" : "14px",
                    }}
                  >
                    View All
                  </button>
                </div>

                <div
                  style={{
                    ...styles.tableContainer,
                    overflowX: windowWidth <= 768 ? "auto" : "visible",
                  }}
                >
                  {filteredLessons.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div
                        style={{
                          ...styles.emptyText,
                          fontSize: windowWidth <= 640 ? "14px" : "16px",
                        }}
                      >
                        {searchQuery ? "No lessons match your search" : "No lessons yet"}
                      </div>
                      <p
                        style={{
                          ...styles.emptyDescription,
                          fontSize: windowWidth <= 640 ? "12px" : "14px",
                        }}
                      >
                        {searchQuery ? "Try a different search term" : "Create your first lesson plan to get started"}
                      </p>
                    </div>
                  ) : (
                    <div style={styles.tableWrapper}>
                      <table
                        style={{
                          ...styles.table,
                          fontSize: windowWidth <= 640 ? "12px" : "14px",
                        }}
                      >
                        <thead>
                          <tr style={styles.tableHeader}>
                            <th style={{ ...styles.th, textAlign: "left" }}>Subject</th>
                            <th
                              style={{
                                ...styles.th,
                                textAlign: "left",
                                display: windowWidth < 1024 ? "none" : "table-cell",
                              }}
                            >
                              Grade
                            </th>
                            <th
                              style={{
                                ...styles.th,
                                textAlign: "left",
                                display: windowWidth < 1024 ? "none" : "table-cell",
                              }}
                            >
                              Class
                            </th>
                            <th
                              style={{
                                ...styles.th,
                                textAlign: "left",
                                display: windowWidth < 1024 ? "none" : "table-cell",
                              }}
                            >
                              Teacher
                            </th>
                            <th
                              style={{
                                ...styles.th,
                                textAlign: "left",
                                display: windowWidth < 768 ? "none" : "table-cell",
                              }}
                            >
                              Date
                            </th>
                            <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLessons.slice(0, 5).map((lesson) => (
                            <tr key={lesson.dbId} style={styles.tableRow}>
                              <td
                                style={{
                                  ...styles.td,
                                  fontSize: windowWidth <= 640 ? "11px" : "inherit",
                                }}
                              >
                                {lesson.administrativeDetails?.subject ||
                                  lesson.guidingQuestion?.substring(0, 30) ||
                                  "Lesson Plan"}
                              </td>
                              <td
                                style={{
                                  ...styles.td,
                                  display: windowWidth < 1024 ? "none" : "table-cell",
                                }}
                              >
                                {lesson.administrativeDetails?.grade || "N/A"}
                              </td>
                              <td
                                style={{
                                  ...styles.td,
                                  display: windowWidth < 1024 ? "none" : "table-cell",
                                }}
                              >
                                {lesson.administrativeDetails?.class || "N/A"}
                              </td>
                              <td
                                style={{
                                  ...styles.td,
                                  display: windowWidth < 1024 ? "none" : "table-cell",
                                }}
                              >
                                {lesson.administrativeDetails?.teacher || "N/A"}
                              </td>
                              <td
                                style={{
                                  ...styles.td,
                                  display: windowWidth < 768 ? "none" : "table-cell",
                                }}
                              >
                                {lesson.savedDate}
                              </td>
                              <td style={styles.td}>
                                <div
                                  style={{
                                    ...styles.actionButtonGroup,
                                    flexDirection: windowWidth <= 640 ? "column" : "row",
                                    gap: windowWidth <= 640 ? "6px" : "8px",
                                  }}
                                >
                                  <button
                                    onClick={() => handleViewLesson(lesson)}
                                    style={{
                                      ...styles.viewButtonSmall,
                                      width: windowWidth <= 640 ? "100%" : "auto",
                                      padding: windowWidth <= 640 ? "6px 8px" : "6px 12px",
                                      fontSize: windowWidth <= 640 ? "11px" : "12px",
                                    }}
                                  >
                                    <Eye size={windowWidth <= 640 ? 14 : 16} />
                                    {windowWidth > 640 && <span>View</span>}
                                  </button>
                                  <button
                                    onClick={() => handleDownload(lesson, "docx")}
                                    style={{
                                      ...styles.downloadButtonSmall,
                                      width: windowWidth <= 640 ? "100%" : "auto",
                                      padding: windowWidth <= 640 ? "6px 8px" : "6px 12px",
                                    }}
                                    disabled={isDownloading}
                                    title="Download"
                                  >
                                    <Download size={windowWidth <= 640 ? 14 : 16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "create" && (
            <>
              {!lessonPlan ? (
                <div
                  style={{
                    ...styles.formCard,
                    padding: windowWidth <= 640 ? "16px" : "24px",
                  }}
                >
                  <h2
                    style={{
                      ...styles.formTitle,
                      fontSize: windowWidth <= 640 ? "18px" : "22px",
                      marginBottom: windowWidth <= 640 ? "16px" : "24px",
                    }}
                  >
                    Create New Lesson Plan
                  </h2>
                  <div
                    style={{
                      ...styles.formGrid,
                      gridTemplateColumns:
                        windowWidth <= 640 ? "1fr" : windowWidth <= 1024 ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
                      gap: windowWidth <= 640 ? "12px" : "16px",
                    }}
                  >
                    {[
                      { label: "School Name", key: "schoolName", placeholder: "Enter school name", type: "text" },
                      {
                        label: "Subject",
                        key: "subject",
                        placeholder: "e.g. Biology, Geography, Mathematics",
                        type: "text",
                      },
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
                      { label: "Strand", key: "strand", placeholder: "e.g. Biodiversity", type: "text" },
                      { label: "Sub-strand", key: "subStrand", placeholder: "e.g. Classification", type: "text" },
                    ].map((field) => (
                      <div
                        key={field.key}
                        style={{
                          ...styles.fieldWrapper,
                          marginBottom: windowWidth <= 640 ? "12px" : "0",
                        }}
                      >
                        <label
                          style={{
                            ...styles.label,
                            fontSize: windowWidth <= 640 ? "12px" : "14px",
                            marginBottom: windowWidth <= 640 ? "6px" : "8px",
                          }}
                        >
                          {field.label}
                          {(field.key === "subject" || field.key === "strand" || field.key === "subStrand") && (
                            <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                          )}
                        </label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.key]}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          style={{
                            ...styles.input,
                            fontSize: windowWidth <= 640 ? "12px" : "14px",
                            padding: windowWidth <= 640 ? "8px 10px" : "10px 12px",
                            ...(field.key === "subject" && !formData.subject ? { borderColor: "#fca5a5" } : {}),
                            ...(field.key === "strand" && !formData.strand ? { borderColor: "#fca5a5" } : {}),
                            ...(field.key === "subStrand" && !formData.subStrand ? { borderColor: "#fca5a5" } : {}),
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px",
                      backgroundColor: "#f0f9ff",
                      borderRadius: "8px",
                      fontSize: windowWidth <= 640 ? "12px" : "14px",
                      color: "#0369a1",
                    }}
                  >
                    💡 <strong>Tip:</strong> The system can handle typos! If you type "Geogrphy" instead of "Geography",
                    it will automatically match to the correct subject.
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    style={{
                      ...styles.generateButton,
                      width: windowWidth <= 640 ? "100%" : "auto",
                      padding: windowWidth <= 640 ? "10px 16px" : "12px 24px",
                      fontSize: windowWidth <= 640 ? "13px" : "14px",
                      marginTop: windowWidth <= 640 ? "16px" : "20px",
                    }}
                  >
                    {isGenerating ? "Generating..." : "Generate Lesson Plan"}
                  </button>
                </div>
              ) : (
                <div style={styles.documentContainer}>
                  <div
                    style={{
                      ...styles.actionBar,
                      flexDirection: windowWidth <= 768 ? "column" : "row",
                      gap: windowWidth <= 768 ? "12px" : "16px",
                    }}
                  >
                    <button
                      onClick={handleCreateNew}
                      style={{
                        ...styles.backButton,
                        width: windowWidth <= 768 ? "100%" : "auto",
                        padding: windowWidth <= 768 ? "10px 16px" : "10px 16px",
                        fontSize: windowWidth <= 768 ? "13px" : "14px",
                      }}
                    >
                      <ArrowLeft size={16} />
                      <span>{windowWidth <= 768 ? "New" : "New Plan"}</span>
                    </button>
                    <div
                      style={{
                        ...styles.actionBarRight,
                        flexDirection: windowWidth <= 768 ? "column" : "row",
                        gap: windowWidth <= 768 ? "12px" : "8px",
                        width: windowWidth <= 768 ? "100%" : "auto",
                      }}
                    >
                      <button
                        onClick={() => handleDownload(lessonPlan, "docx")}
                        disabled={isDownloading}
                        style={{
                          ...styles.downloadButton,
                          width: windowWidth <= 768 ? "100%" : "auto",
                          padding: windowWidth <= 768 ? "10px 16px" : "10px 16px",
                          fontSize: windowWidth <= 768 ? "13px" : "14px",
                        }}
                      >
                        <Download size={16} />
                        <span>{isDownloading ? "Downloading..." : windowWidth <= 768 ? "Download" : "Download"}</span>
                      </button>
                      <button
                        onClick={() => handleDownload(lessonPlan, "pdf")}
                        disabled={isDownloading}
                        style={{
                          ...styles.pdfButton,
                          width: windowWidth <= 768 ? "100%" : "auto",
                          padding: windowWidth <= 768 ? "10px 16px" : "10px 16px",
                          fontSize: windowWidth <= 768 ? "13px" : "14px",
                        }}
                      >
                        <Download size={16} />
                        <span>{isDownloading ? "Printing..." : windowWidth <= 768 ? "PDF" : "Print PDF"}</span>
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                          ...styles.saveButton,
                          width: windowWidth <= 768 ? "100%" : "auto",
                          padding: windowWidth <= 768 ? "10px 16px" : "10px 16px",
                          fontSize: windowWidth <= 768 ? "13px" : "14px",
                        }}
                      >
                        <Save size={16} />
                        <span>{isSaving ? "Saving..." : currentLessonId ? "Update" : "Save"}</span>
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      ...styles.documentPage,
                      padding: windowWidth <= 640 ? "16px" : "24px",
                    }}
                  >
                    <div style={styles.docHeader}>
                      <div
                        style={{
                          ...styles.docTitle,
                          fontSize: windowWidth <= 640 ? "18px" : "24px",
                        }}
                      >
                        LESSON PLAN
                      </div>
                      <div style={styles.docDivider}></div>
                    </div>

                    {/* Editable Administrative Details */}
                    <table
                      style={{
                        ...styles.docTable,
                        fontSize: windowWidth <= 640 ? "11px" : "12px",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td style={styles.tableLabelCell}>School:</td>
                          <td style={styles.tableValueCell}>
                            {renderEditableField(
                              "administrativeDetails.school",
                              lessonPlan.administrativeDetails?.school,
                            )}
                          </td>
                          <td
                            style={{
                              ...styles.tableLabelCell,
                              display: windowWidth <= 768 ? "none" : "table-cell",
                            }}
                          >
                            Subject:
                          </td>
                          <td
                            style={{
                              ...styles.tableValueCell,
                              display: windowWidth <= 768 ? "none" : "table-cell",
                            }}
                          >
                            {renderEditableField(
                              "administrativeDetails.subject",
                              lessonPlan.administrativeDetails?.subject,
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td style={styles.tableLabelCell}>Class:</td>
                          <td style={styles.tableValueCell}>
                            {renderEditableField(
                              "administrativeDetails.class",
                              lessonPlan.administrativeDetails?.class,
                            )}
                          </td>
                          <td
                            style={{
                              ...styles.tableLabelCell,
                              display: windowWidth <= 768 ? "none" : "table-cell",
                            }}
                          >
                            Grade:
                          </td>
                          <td
                            style={{
                              ...styles.tableValueCell,
                              display: windowWidth <= 768 ? "none" : "table-cell",
                            }}
                          >
                            {renderEditableField(
                              "administrativeDetails.grade",
                              lessonPlan.administrativeDetails?.grade?.toString(),
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td style={styles.tableLabelCell}>Teacher:</td>
                          <td style={styles.tableValueCell}>
                            {renderEditableField(
                              "administrativeDetails.teacher",
                              lessonPlan.administrativeDetails?.teacher,
                            )}
                          </td>
                          <td
                            style={{
                              ...styles.tableLabelCell,
                              display: windowWidth <= 768 ? "none" : "table-cell",
                            }}
                          >
                            Students:
                          </td>
                          <td
                            style={{
                              ...styles.tableValueCell,
                              display: windowWidth <= 768 ? "none" : "table-cell",
                            }}
                          >
                            {lessonPlan.administrativeDetails?.studentEnrollment?.total || "N/A"}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Editable Guiding Question */}
                    <div style={styles.section}>
                      <div
                        style={{
                          ...styles.sectionTitle,
                          fontSize: windowWidth <= 640 ? "14px" : "16px",
                        }}
                      >
                        GUIDING QUESTION
                      </div>
                      {renderEditableField(
                        "guidingQuestion",
                        lessonPlan.guidingQuestion,
                        true,
                        "Enter guiding question",
                      )}
                    </div>

                    {/* Editable Learning Outcomes */}
                    <div style={styles.section}>
                      <div
                        style={{
                          ...styles.sectionHeaderWithButton,
                          flexDirection: windowWidth <= 640 ? "column" : "row",
                          gap: windowWidth <= 640 ? "8px" : "12px",
                        }}
                      >
                        <div
                          style={{
                            ...styles.sectionTitle,
                            fontSize: windowWidth <= 640 ? "14px" : "16px",
                          }}
                        >
                          LEARNING OUTCOMES
                        </div>
                        <button
                          onClick={addLearningOutcome}
                          style={{
                            ...styles.addButton,
                            width: windowWidth <= 640 ? "100%" : "auto",
                            padding: windowWidth <= 640 ? "8px 12px" : "8px 16px",
                            fontSize: windowWidth <= 640 ? "12px" : "14px",
                          }}
                          title="Add outcome"
                        >
                          <Plus size={windowWidth <= 640 ? 16 : 16} />
                          <span>Add</span>
                        </button>
                      </div>
                      {lessonPlan.learningOutcomes?.map((outcome, index) => (
                        <div
                          key={index}
                          style={{
                            ...styles.outcomeItem,
                            flexDirection: windowWidth <= 640 ? "column" : "row",
                            gap: windowWidth <= 640 ? "8px" : "12px",
                          }}
                        >
                          <div
                            style={{
                              ...styles.outcomeNumber,
                              minWidth: windowWidth <= 640 ? "24px" : "auto",
                            }}
                          >
                            {outcome.id}.
                          </div>
                          <div
                            style={{
                              ...styles.outcomeContent,
                              flex: 1,
                            }}
                          >
                            {renderEditableField(
                              `learningOutcomes.${index}.outcome`,
                              outcome.outcome,
                              true,
                              "Enter outcome",
                            )}
                          </div>
                          <button
                            onClick={() => deleteLearningOutcome(index)}
                            style={{
                              ...styles.deleteButton,
                              width: windowWidth <= 640 ? "100%" : "auto",
                              padding: windowWidth <= 640 ? "8px 12px" : "6px 12px",
                            }}
                            title="Delete outcome"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Editable Learning Resources */}
                    <div style={styles.section}>
                      <div
                        style={{
                          ...styles.sectionTitle,
                          fontSize: windowWidth <= 640 ? "14px" : "16px",
                        }}
                      >
                        LEARNING RESOURCES
                      </div>
                      {renderEditableField(
                        "learningResources",
                        lessonPlan.learningResources?.join(", "),
                        true,
                        "Enter resources (comma-separated)",
                      )}
                    </div>

                    {/* Editable Lesson Flow */}
                    <div style={styles.section}>
                      <div
                        style={{
                          ...styles.sectionTitle,
                          fontSize: windowWidth <= 640 ? "14px" : "16px",
                        }}
                      >
                        LESSON FLOW
                      </div>

                      {/* Introduction */}
                      <div style={styles.subsection}>
                        <div
                          style={{
                            ...styles.subsectionTitle,
                            fontSize: windowWidth <= 640 ? "13px" : "14px",
                          }}
                        >
                          Introduction (5 minutes)
                        </div>
                        {renderEditableField(
                          "lessonFlow.introduction.description",
                          lessonPlan.lessonFlow?.introduction?.description,
                          true,
                          "Enter introduction",
                        )}
                      </div>

                      {/* Development Activities */}
                      <div style={styles.subsection}>
                        <div
                          style={{
                            ...styles.sectionHeaderWithButton,
                            flexDirection: windowWidth <= 640 ? "column" : "row",
                            gap: windowWidth <= 640 ? "8px" : "12px",
                          }}
                        >
                          <div
                            style={{
                              ...styles.subsectionTitle,
                              fontSize: windowWidth <= 640 ? "13px" : "14px",
                            }}
                          >
                            Development Activities
                          </div>
                          <button
                            onClick={addDevelopmentStep}
                            style={{
                              ...styles.addButton,
                              width: windowWidth <= 640 ? "100%" : "auto",
                              padding: windowWidth <= 640 ? "8px 12px" : "8px 16px",
                              fontSize: windowWidth <= 640 ? "12px" : "14px",
                            }}
                            title="Add step"
                          >
                            <Plus size={16} />
                            <span>Add Step</span>
                          </button>
                        </div>
                        {lessonPlan.lessonFlow?.development?.map((step, index) => (
                          <div
                            key={index}
                            style={{
                              ...styles.stepBlock,
                              marginBottom: windowWidth <= 640 ? "12px" : "16px",
                            }}
                          >
                            <div
                              style={{
                                ...styles.stepHeader,
                                flexDirection: windowWidth <= 640 ? "column" : "row",
                                gap: windowWidth <= 640 ? "8px" : "12px",
                              }}
                            >
                              <div
                                style={{
                                  ...styles.stepTitleText,
                                  fontSize: windowWidth <= 640 ? "13px" : "14px",
                                }}
                              >
                                Step {step.step}
                              </div>
                              <button
                                onClick={() => deleteDevelopmentStep(index)}
                                style={{
                                  ...styles.deleteButton,
                                  width: windowWidth <= 640 ? "100%" : "auto",
                                  padding: windowWidth <= 640 ? "8px 12px" : "6px 12px",
                                }}
                                title="Delete step"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div
                              style={{
                                ...styles.stepField,
                                fontSize: windowWidth <= 640 ? "12px" : "14px",
                                marginTop: windowWidth <= 640 ? "8px" : "12px",
                              }}
                            >
                              <strong>Title:</strong>
                              {renderEditableField(
                                `lessonFlow.development.${index}.title`,
                                step.title,
                                false,
                                "Enter title",
                              )}
                            </div>
                            <div
                              style={{
                                ...styles.stepField,
                                fontSize: windowWidth <= 640 ? "12px" : "14px",
                                marginTop: windowWidth <= 640 ? "8px" : "12px",
                              }}
                            >
                              <strong>Description:</strong>
                              {renderEditableField(
                                `lessonFlow.development.${index}.description`,
                                step.description,
                                true,
                                "Enter description",
                              )}
                            </div>
                            <div
                              style={{
                                ...styles.stepField,
                                fontSize: windowWidth <= 640 ? "12px" : "14px",
                                marginTop: windowWidth <= 640 ? "8px" : "12px",
                              }}
                            >
                              <strong>Activity:</strong>
                              {renderEditableField(
                                `lessonFlow.development.${index}.activity`,
                                step.activity,
                                true,
                                "Enter activity",
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Conclusion */}
                      <div style={styles.subsection}>
                        <div
                          style={{
                            ...styles.subsectionTitle,
                            fontSize: windowWidth <= 640 ? "13px" : "14px",
                          }}
                        >
                          Conclusion (5 minutes)
                        </div>
                        {renderEditableField(
                          "lessonFlow.conclusion.description",
                          lessonPlan.lessonFlow?.conclusion?.description,
                          true,
                          "Enter conclusion",
                        )}
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
                  <div
                    style={{
                      ...styles.emptyText,
                      fontSize: windowWidth <= 640 ? "14px" : "16px",
                    }}
                  >
                    Loading lessons...
                  </div>
                </div>
              ) : filteredLessons.length === 0 ? (
                <div style={styles.emptyState}>
                  <div
                    style={{
                      ...styles.emptyIcon,
                      fontSize: windowWidth <= 640 ? "32px" : "48px",
                    }}
                  >
                    📁
                  </div>
                  <div
                    style={{
                      ...styles.emptyText,
                      fontSize: windowWidth <= 640 ? "14px" : "16px",
                    }}
                  >
                    {searchQuery ? "No lessons match your search" : "No Saved Lessons Yet"}
                  </div>
                  <p
                    style={{
                      ...styles.emptyDescription,
                      fontSize: windowWidth <= 640 ? "12px" : "14px",
                    }}
                  >
                    {searchQuery ? "Try a different search term" : "Create and save lesson plans to see them here."}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    ...styles.lessonGrid,
                    gridTemplateColumns:
                      windowWidth <= 640 ? "1fr" : windowWidth <= 1024 ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
                    gap: windowWidth <= 640 ? "12px" : "16px",
                  }}
                >
                  {filteredLessons.map((lesson) => (
                    <div
                      key={lesson.dbId}
                      style={{
                        ...styles.lessonCard,
                        padding: windowWidth <= 640 ? "12px" : "16px",
                      }}
                    >
                      <div style={styles.lessonCardHeader}>
                        <FileText size={windowWidth <= 640 ? 20 : 24} style={styles.lessonCardIcon} />
                      </div>
                      <div
                        style={{
                          ...styles.lessonCardTitle,
                          fontSize: windowWidth <= 640 ? "13px" : "14px",
                        }}
                      >
                        {lesson.administrativeDetails?.subject ||
                          lesson.guidingQuestion?.substring(0, 50) ||
                          "Untitled"}
                      </div>
                      <div style={styles.lessonCardMeta}>
                        <div
                          style={{
                            ...styles.metaRow,
                            fontSize: windowWidth <= 640 ? "11px" : "12px",
                          }}
                        >
                          <span style={styles.metaLabel}>Grade:</span>
                          <span style={styles.metaValue}>{lesson.administrativeDetails?.grade || "N/A"}</span>
                        </div>
                        <div
                          style={{
                            ...styles.metaRow,
                            fontSize: windowWidth <= 640 ? "11px" : "12px",
                          }}
                        >
                          <span style={styles.metaLabel}>Class:</span>
                          <span style={styles.metaValue}>{lesson.administrativeDetails?.class || "N/A"}</span>
                        </div>
                        <div
                          style={{
                            ...styles.metaRow,
                            fontSize: windowWidth <= 640 ? "11px" : "12px",
                          }}
                        >
                          <span style={styles.metaLabel}>Teacher:</span>
                          <span style={styles.metaValue}>{lesson.administrativeDetails?.teacher || "N/A"}</span>
                        </div>
                        <div
                          style={{
                            ...styles.metaRow,
                            fontSize: windowWidth <= 640 ? "11px" : "12px",
                          }}
                        >
                          <span style={styles.metaLabel}>Date:</span>
                          <span style={styles.metaValue}>{lesson.savedDate}</span>
                        </div>
                      </div>
                      <div
                        style={{
                          ...styles.lessonCardActions,
                          flexDirection: windowWidth <= 640 ? "column" : "row",
                          gap: windowWidth <= 640 ? "8px" : "12px",
                        }}
                      >
                        <button
                          onClick={() => handleViewLesson(lesson)}
                          style={{
                            ...styles.viewButton,
                            width: windowWidth <= 640 ? "100%" : "auto",
                            padding: windowWidth <= 640 ? "8px 12px" : "8px 16px",
                            fontSize: windowWidth <= 640 ? "12px" : "13px",
                          }}
                        >
                          <Eye size={windowWidth <= 640 ? 14 : 16} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDownload(lesson, "docx")}
                          style={{
                            ...styles.downloadButtonCard,
                            width: windowWidth <= 640 ? "100%" : "auto",
                            padding: windowWidth <= 640 ? "8px 12px" : "8px 16px",
                            fontSize: windowWidth <= 640 ? "12px" : "13px",
                          }}
                          disabled={isDownloading}
                        >
                          <Download size={windowWidth <= 640 ? 14 : 16} />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={() => handleDelete(lesson)}
                          style={{
                            ...styles.deleteButtonCard,
                            width: windowWidth <= 640 ? "100%" : "auto",
                            padding: windowWidth <= 640 ? "8px 12px" : "8px 16px",
                            fontSize: windowWidth <= 640 ? "12px" : "13px",
                          }}
                        >
                          <Trash2 size={windowWidth <= 640 ? 14 : 16} />
                          <span>Delete</span>
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
    height: "100vh",
    backgroundColor: "#f5f7fa",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu"',
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    transition: "width 0.3s ease, transform 0.3s ease, margin-left 0.3s ease",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    zIndex: 1000,
  },
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
  },
  sidebarTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1f2937",
    lineHeight: "1.3",
  },
  closeMenuButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
  },
  nav: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "16px 24px",
    gap: "8px",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    backgroundColor: "transparent",
    color: "#6b7280",
    transition: "background-color 0.2s ease, color 0.2s ease",
  },
  sidebarFooter: {
    padding: "20px 24px",
    borderTop: "1px solid #e5e7eb",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 16px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    width: "100%",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    transition: "margin-left 0.3s ease",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  topBarLeft: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  topBarRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  menuToggle: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
  },
  greeting: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "4px",
    fontWeight: "500",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#1f2937",
    margin: 0,
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    padding: "8px 12px",
    gap: "8px",
  },
  searchIcon: {
    color: "#9ca3af",
  },
  searchInput: {
    border: "none",
    backgroundColor: "transparent",
    outline: "none",
    fontSize: "14px",
    color: "#1f2937",
    width: "200px",
  },
  content: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
  },
  dashboardLayout: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  dashboardHeader: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: "16px",
  },
  createNewButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  statsRow: {
    display: "flex",
    gap: "16px",
    justifyContent: "flex-start",
  },
  statCard: {
    flex: 1,
    minWidth: "200px",
    padding: "20px",
    borderRadius: "12px",
    color: "#ffffff",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  statCardBlue: {
    backgroundColor: "#2563eb",
  },
  statCardPurple: {
    backgroundColor: "#7c3aed",
  },
  statHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  statIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
  },
  statPercentage: {
    fontSize: "16px",
    fontWeight: "bold",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  statSubtext: {
    fontSize: "14px",
    opacity: 0.9,
  },
  lessonsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1f2937",
    margin: 0,
  },
  viewAllButton: {
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    color: "#1f2937",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  tableContainer: {
    overflowX: "auto",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  tableWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    borderBottom: "2px solid #e5e7eb",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "600",
    color: "#6b7280",
    fontSize: "13px",
    textTransform: "uppercase",
  },
  tableRow: {
    borderBottom: "1px solid #f3f4f6",
    transition: "background-color 0.2s ease",
  },
  td: {
    padding: "12px 16px",
    color: "#1f2937",
  },
  actionButtonGroup: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
  },
  viewButtonSmall: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  downloadButtonSmall: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "#d1fae5",
    color: "#065f46",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  emptyState: {
    padding: "60px 24px",
    textAlign: "center",
    color: "#6b7280",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  emptyText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "8px",
  },
  emptyDescription: {
    fontSize: "14px",
    color: "#9ca3af",
    margin: 0,
  },
  lessonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
  },
  lessonCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    transition: "box-shadow 0.2s ease",
  },
  lessonCardHeader: {
    marginBottom: "16px",
  },
  lessonCardIcon: {
    color: "#2563eb",
  },
  lessonCardTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "12px",
    lineHeight: "1.4",
  },
  lessonCardMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "16px",
    flex: 1,
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
  },
  metaLabel: {
    color: "#6b7280",
    fontWeight: "500",
  },
  metaValue: {
    color: "#1f2937",
    fontWeight: "600",
  },
  lessonCardActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-start",
  },
  viewButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  downloadButtonCard: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#d1fae5",
    color: "#065f46",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  deleteButtonCard: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  formTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "24px",
    margin: 0,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: "8px",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#1f2937",
    transition: "border-color 0.2s ease",
  },
  generateButton: {
    padding: "12px 24px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    marginTop: "20px",
  },
  documentContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  actionBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    gap: "16px",
  },
  actionBarRight: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#f3f4f6",
    color: "#1f2937",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  downloadButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#d1fae5",
    color: "#065f46",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  pdfButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#fef08a",
    color: "#713f12",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  saveButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  documentPage: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "900px",
    margin: "0 auto",
    width: "100%",
  },
  docHeader: {
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "3px solid #2563eb",
  },
  docTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: "8px",
  },
  docDivider: {
    height: "2px",
    backgroundColor: "#e5e7eb",
  },
  docTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "24px",
    fontSize: "12px",
  },
  tableLabelCell: {
    padding: "12px",
    fontWeight: "bold",
    color: "#1f2937",
    backgroundColor: "#f9fafb",
    borderRadius: "4px 0 0 4px",
    width: "20%",
  },
  tableValueCell: {
    padding: "12px",
    color: "#1f2937",
    width: "30%",
  },
  section: {
    marginBottom: "24px",
  },
  sectionHeaderWithButton: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    gap: "12px",
  },
  subsection: {
    marginBottom: "16px",
  },
  subsectionTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "8px",
    textDecoration: "underline",
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  outcomeItem: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    marginBottom: "8px",
  },
  outcomeNumber: {
    fontWeight: "bold",
    color: "#1f2937",
    paddingTop: "4px",
  },
  outcomeContent: {
    flex: 1,
  },
  deleteButton: {
    padding: "6px 12px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  stepBlock: {
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderLeft: "4px solid #2563eb",
    borderRadius: "4px",
    marginBottom: "16px",
  },
  stepHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    gap: "12px",
  },
  stepTitleText: {
    fontWeight: "bold",
    color: "#1f2937",
    fontSize: "14px",
  },
  stepField: {
    marginBottom: "12px",
    fontSize: "14px",
  },
  editableContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  editingWrapper: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
  },
  editTextarea: {
    flex: 1,
    padding: "8px 12px",
    border: "2px solid #2563eb",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    minHeight: "80px",
    resize: "vertical",
  },
  editInput: {
    flex: 1,
    padding: "8px 12px",
    border: "2px solid #2563eb",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  editButtonGroup: {
    display: "flex",
    gap: "6px",
  },
  saveEditBtn: {
    padding: "8px 12px",
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    display: "flex",
    alignItems: "center",
  },
  cancelEditBtn: {
    padding: "8px 12px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    display: "flex",
    alignItems: "center",
  },
  editableValue: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    border: "1px solid transparent",
  },
  editableText: {
    flex: 1,
    color: "#1f2937",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  editIcon: {
    color: "#9ca3af",
    marginLeft: "8px",
  },
}


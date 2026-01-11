•Formatting may be inconsistent from source
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

  const [formData, setFormData] = useState({
    schoolName: "",
    subject: "", // ADDED SUBJECT FIELD
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
    // Validate required fields
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
      alert("Failed to generate lesson plan. Please check: \n- Backend is running\n- Subject name is correct (typos are handled)\n- Strand and sub-strand are provided")
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

  // Integrated download functions
  const downloadAsDocx = async (lesson) => {
    try {
      // Generate plain text content from lesson plan
      let content = `LESSON PLAN\n\n`
      
      // Administrative Details
      content += `School: ${lesson.administrativeDetails?.school || 'N/A'}\n`
      content += `Subject: ${lesson.administrativeDetails?.subject || 'N/A'}\n`
      content += `Class: ${lesson.administrativeDetails?.class || 'N/A'}\n`
      content += `Grade: ${lesson.administrativeDetails?.grade || 'N/A'}\n`
      content += `Teacher: ${lesson.administrativeDetails?.teacher || 'N/A'}\n`
      content += `Students: ${lesson.administrativeDetails?.studentEnrollment?.total || 'N/A'}\n`
      content += `Date: ${lesson.administrativeDetails?.date || 'N/A'}\n`
      content += `Time: ${lesson.administrativeDetails?.time?.start || ''} - ${lesson.administrativeDetails?.time?.end || ''}\n\n`
      
      // Guiding Question
      content += `GUIDING QUESTION\n`
      content += `${lesson.guidingQuestion || 'N/A'}\n\n`
      
      // Learning Outcomes
      content += `LEARNING OUTCOMES\n`
      if (lesson.learningOutcomes && lesson.learningOutcomes.length > 0) {
        lesson.learningOutcomes.forEach(outcome => {
          content += `${outcome.id}. ${outcome.outcome}\n`
        })
      }
      content += `\n`
      
      // Learning Resources
      content += `LEARNING RESOURCES\n`
      content += `${lesson.learningResources?.join(", ") || 'N/A'}\n\n`
      
      // Lesson Flow
      content += `LESSON FLOW\n\n`
      
      // Introduction
      content += `Introduction (5 minutes)\n`
      content += `${lesson.lessonFlow?.introduction?.description || 'N/A'}\n\n`
      
      // Development Activities
      content += `Development Activities\n`
      if (lesson.lessonFlow?.development && lesson.lessonFlow.development.length > 0) {
        lesson.lessonFlow.development.forEach(step => {
          content += `\nStep ${step.step}: ${step.title}\n`
          content += `Description: ${step.description}\n`
          content += `Activity: ${step.activity}\n`
        })
      }
      content += `\n`
      
      // Conclusion
      content += `Conclusion (5 minutes)\n`
      content += `${lesson.lessonFlow?.conclusion?.description || 'N/A'}\n`
      
      // Create blob and download
      const blob = new Blob([content], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${lesson.administrativeDetails?.subject || 'lesson_plan'}_${lesson.administrativeDetails?.class || ''}_${new Date().toISOString().split('T')[0]}.txt`
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
      // For PDF, we'll use the print functionality
      // Create a printable version
      const printWindow = window.open('', '', 'width=800,height=600')
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lesson Plan - ${lesson.administrativeDetails?.subject || 'Untitled'}</title>
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
              <td>${lesson.administrativeDetails?.school || 'N/A'}</td>
              <td>Subject:</td>
              <td>${lesson.administrativeDetails?.subject || 'N/A'}</td>
            </tr>
            <tr>
              <td>Class:</td>
              <td>${lesson.administrativeDetails?.class || 'N/A'}</td>
              <td>Grade:</td>
              <td>${lesson.administrativeDetails?.grade || 'N/A'}</td>
            </tr>
            <tr>
              <td>Teacher:</td>
              <td>${lesson.administrativeDetails?.teacher || 'N/A'}</td>
              <td>Students:</td>
              <td>${lesson.administrativeDetails?.studentEnrollment?.total || 'N/A'}</td>
            </tr>
            <tr>
              <td>Date:</td>
              <td>${lesson.administrativeDetails?.date || 'N/A'}</td>
              <td>Time:</td>
              <td>${lesson.administrativeDetails?.time?.start || ''} - ${lesson.administrativeDetails?.time?.end || ''}</td>
            </tr>
          </table>
          
          <div class="section">
            <h2>Guiding Question</h2>
            <p>${lesson.guidingQuestion || 'N/A'}</p>
          </div>
          
          <div class="section">
            <h2>Learning Outcomes</h2>
            ${lesson.learningOutcomes?.map(outcome => 
              `<p>${outcome.id}. ${outcome.outcome}</p>`
            ).join('') || '<p>N/A</p>'}
          </div>
          
          <div class="section">
            <h2>Learning Resources</h2>
            <p>${lesson.learningResources?.join(", ") || 'N/A'}</p>
          </div>
          
          <div class="section">
            <h2>Lesson Flow</h2>
            
            <h3>Introduction (5 minutes)</h3>
            <p>${lesson.lessonFlow?.introduction?.description || 'N/A'}</p>
            
            <h3>Development Activities</h3>
            ${lesson.lessonFlow?.development?.map(step => `
              <div class="step">
                <strong>Step ${step.step}: ${step.title}</strong><br>
                <strong>Description:</strong> ${step.description}<br>
                <strong>Activity:</strong> ${step.activity}
              </div>
            `).join('') || '<p>N/A</p>'}
            
            <h3>Conclusion (5 minutes)</h3>
            <p>${lesson.lessonFlow?.conclusion?.description || 'N/A'}</p>
          </div>
        </body>
        </html>
      `)
      
      printWindow.document.close()
      printWindow.focus()
      
      // Wait for content to load, then print
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

  const handleDownload = async (lesson, format = 'docx') => {
    setIsDownloading(true)
    try {
      let result
      if (format === 'pdf') {
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
      subject: "", // Reset subject
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

  // Inline editing functions
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
    const keys = path.split('.')
    
    let current = newPlan
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      const nextKey = keys[i + 1]
      
      // Handle array indices
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
      outcome: "New learning outcome - click to edit"
    })
    setLessonPlan({ ...lessonPlan, learningOutcomes: newOutcomes })
  }

  const deleteLearningOutcome = (index) => {
    if (!lessonPlan) return
    const newOutcomes = lessonPlan.learningOutcomes.filter((_, i) => i !== index)
    // Renumber outcomes
    const renumbered = newOutcomes.map((outcome, i) => ({
      ...outcome,
      id: (i + 1).toString()
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
      activity: "Activity description - click to edit"
    })
    setLessonPlan({
      ...lessonPlan,
      lessonFlow: { ...lessonFlow, development }
    })
  }

  const deleteDevelopmentStep = (index) => {
    if (!lessonPlan) return
    const lessonFlow = lessonPlan.lessonFlow || {}
    const development = lessonFlow.development.filter((_, i) => i !== index)
    // Renumber steps
    const renumbered = development.map((step, i) => ({
      ...step,
      step: i + 1
    }))
    setLessonPlan({
      ...lessonPlan,
      lessonFlow: { ...lessonFlow, development: renumbered }
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
            onClick={() => startEditing(fieldKey, value)}
            title="Click to edit"
          >
            <span style={styles.editableText}>
              {value || placeholder}
            </span>
            <Edit2 size={14} style={styles.editIcon} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          ...styles.mobileMenuButton,
          display: window.innerWidth <= 768 ? 'block' : 'none'
        }}
        aria-label="Toggle menu"
      >
        <div style={styles.hamburger}>
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
        </div>
      </button>

      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        ...(window.innerWidth <= 768 && !isMobileMenuOpen ? { transform: 'translateX(-100%)' } : {}),
        ...(window.innerWidth <= 768 && isMobileMenuOpen ? { transform: 'translateX(0)' } : {})
      }}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <div style={styles.logoText}>Funza</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <div style={styles.navSection}>
            <button
              onClick={() => handleNavClick("dashboard")}
              style={{
                ...styles.navButton,
                ...(activeTab === "dashboard" ? styles.navButtonActive : {}),
              }}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleNavClick("create")}
              style={{
                ...styles.navButton,
                ...(activeTab === "create" ? styles.navButtonActive : {}),
              }}
            >
              <Plus size={20} />
              <span>Create Lesson</span>
            </button>

            <button
              onClick={() => handleNavClick("archive")}
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

          <div style={styles.navSectionBottom}>
            <div style={styles.dividerLine}></div>
            <button onClick={handleLogout} style={styles.logoutButton}>
              <LogOut size={20} />
              <span>Log out</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && window.innerWidth <= 768 && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={styles.mobileOverlay}
        />
      )}

      {/* Main Content */}
      <main style={{
        ...styles.main,
        marginLeft: window.innerWidth <= 768 ? '0' : '260px'
      }}>
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
                <div style={{...styles.statCard, ...styles.statCardBlue}}>
                  <div style={styles.statHeader}>
                    <div style={styles.statIcon}>
                      <FileText size={24} />
                    </div>
                    <div style={styles.statPercentage}>
                      {savedLessons.length > 0 ? "100%" : "0%"}
                    </div>
                  </div>
                  <div style={styles.statValue}>{savedLessons.length.toLocaleString()}</div>
                  <div style={styles.statSubtext}>Total Lessons</div>
                </div>

                <div style={{...styles.statCard, ...styles.statCardPurple}}>
                  <div style={styles.statHeader}>
                    <div style={styles.statIcon}>
                      <Archive size={24} />
                    </div>
                    <div style={styles.statPercentage}>
                      {savedLessons.filter((l) => {
                        const lessonDate = new Date(l.savedDate)
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return lessonDate >= weekAgo
                      }).length > 0 ? "+12%" : "0%"}
                    </div>
                  </div>
                  <div style={styles.statValue}>
                    {savedLessons.filter((l) => {
                      const lessonDate = new Date(l.savedDate)
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return lessonDate >= weekAgo
                    }).length.toLocaleString()}
                  </div>
                  <div style={styles.statSubtext}>This Week</div>
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
                      <div style={styles.emptyText}>
                        {searchQuery ? "No lessons match your search" : "No lessons yet"}
                      </div>
                      <p style={styles.emptyDescription}>
                        {searchQuery
                          ? "Try a different search term"
                          : "Create your first lesson plan to get started"}
                      </p>
                    </div>
                  ) : (
                    <div style={styles.tableWrapper}>
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
                                <div style={styles.actionButtonGroup}>
                                  <button onClick={() => handleViewLesson(lesson)} style={styles.viewButtonSmall}>
                                    <Eye size={16} />
                                    <span>View</span>
                                  </button>
                                  <button 
                                    onClick={() => handleDownload(lesson, 'docx')} 
                                    style={styles.downloadButtonSmall}
                                    disabled={isDownloading}
                                    title="Download"
                                  >
                                    <Download size={16} />
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
                <div style={styles.formCard}>
                  <h2 style={styles.formTitle}>Create New Lesson Plan</h2>
                  <div style={styles.formGrid}>
                    {[
                      { label: "School Name", key: "schoolName", placeholder: "Enter school name", type: "text" },
                      { label: "Subject", key: "subject", placeholder: "e.g. Biology, Geography, Mathematics", type: "text" }, // ADDED SUBJECT FIELD
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
                      <div key={field.key} style={styles.fieldWrapper}>
                        <label style={styles.label}>
                          {field.label}
                          {/* Mark required fields */}
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
                            // Highlight required fields if empty
                            ...(field.key === "subject" && !formData.subject ? { borderColor: "#fca5a5" } : {}),
                            ...(field.key === "strand" && !formData.strand ? { borderColor: "#fca5a5" } : {}),
                            ...(field.key === "subStrand" && !formData.subStrand ? { borderColor: "#fca5a5" } : {})
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Helper text */}
                  <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#f0f9ff", borderRadius: "8px", fontSize: "14px", color: "#0369a1" }}>
                    💡 <strong>Tip:</strong> The system can handle typos! If you type "Geogrphy" instead of "Geography", it will automatically match to the correct subject.
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
                      <span>New Plan</span>
                    </button>
                    <div style={styles.actionBarRight}>
                      <button 
                        onClick={() => handleDownload(lessonPlan, 'docx')} 
                        disabled={isDownloading}
                        style={styles.downloadButton}
                      >
                        <Download size={16} />
                        <span>{isDownloading ? "Downloading..." : "Download"}</span>
                      </button>
                      <button 
                        onClick={() => handleDownload(lessonPlan, 'pdf')} 
                        disabled={isDownloading}
                        style={styles.pdfButton}
                      >
                        <Download size={16} />
                        <span>{isDownloading ? "Printing..." : "Print PDF"}</span>
                      </button>
                      <button onClick={handleSave} disabled={isSaving} style={styles.saveButton}>
                        <Save size={16} />
                        <span>{isSaving ? "Saving..." : currentLessonId ? "Update" : "Save"}</span>
                      </button>
                    </div>
                  </div>

                  <div style={styles.documentPage}>
                    <div style={styles.docHeader}>
                      <div style={styles.docTitle}>LESSON PLAN</div>
                      <div style={styles.docDivider}></div>
                    </div>

                    {/* Editable Administrative Details */}
                    <table style={styles.docTable}>
                      <tbody>
                        <tr>
                          <td style={styles.tableLabelCell}>School:</td>
                          <td style={styles.tableValueCell}>
                            {renderEditableField("administrativeDetails.school", lessonPlan.administrativeDetails?.school)}
                          </td>
                          <td style={styles.tableLabelCell}>Subject:</td>
                          <td style={styles.tableValueCell}>
                            {renderEditableField("administrativeDetails.subject", lessonPlan.administrativeDetails?.subject)}
                          </td>
                        </tr>
                        <tr>
                          <td style={styles.tableLabelCell}>Class:</td>
                          <td style={styles.tableValueCell}>
                            {renderEditableField("administrativeDetails.class", lessonPlan.administrativeDetails?.class)}
                          </td>
                          <td style={styles.tableLabelCell}>Grade:</td>
                          <td style={styles.tableValueCell}>
                            {renderEditableField("administrativeDetails.grade", lessonPlan.administrativeDetails?.grade?.toString())}
                          </td>
                        </tr>
                        <tr>
                          <td style={styles.tableLabelCell}>Teacher:</td>
                          <td style={styles.tableValueCell}>
                            {renderEditableField("administrativeDetails.teacher", lessonPlan.administrativeDetails?.teacher)}
                          </td>
                          <td style={styles.tableLabelCell}>Students:</td>
                          <td style={styles.tableValueCell}>
                            {lessonPlan.administrativeDetails?.studentEnrollment?.total || "N/A"}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Editable Guiding Question */}
                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>GUIDING QUESTION</div>
                      {renderEditableField("guidingQuestion", lessonPlan.guidingQuestion, true, "Enter guiding question")}
                    </div>

                    {/* Editable Learning Outcomes */}
                    <div style={styles.section}>
                      <div style={styles.sectionHeaderWithButton}>
                        <div style={styles.sectionTitle}>LEARNING OUTCOMES</div>
                        <button onClick={addLearningOutcome} style={styles.addButton} title="Add outcome">
                          <Plus size={16} />
                          <span>Add</span>
                        </button>
                      </div>
                      {lessonPlan.learningOutcomes?.map((outcome, index) => (
                        <div key={index} style={styles.outcomeItem}>
                          <div style={styles.outcomeNumber}>{outcome.id}.</div>
                          <div style={styles.outcomeContent}>
                            {renderEditableField(`learningOutcomes.${index}.outcome`, outcome.outcome, true, "Enter outcome")}
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

                    {/* Editable Learning Resources */}
                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>LEARNING RESOURCES</div>
                      {renderEditableField("learningResources", lessonPlan.learningResources?.join(", "), true, "Enter resources (comma-separated)")}
                    </div>

                    {/* Editable Lesson Flow */}
                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>LESSON FLOW</div>

                      {/* Introduction */}
                      <div style={styles.subsection}>
                        <div style={styles.subsectionTitle}>Introduction (5 minutes)</div>
                        {renderEditableField("lessonFlow.introduction.description", lessonPlan.lessonFlow?.introduction?.description, true, "Enter introduction")}
                      </div>

                      {/* Development Activities */}
                      <div style={styles.subsection}>
                        <div style={styles.sectionHeaderWithButton}>
                          <div style={styles.subsectionTitle}>Development Activities</div>
                          <button onClick={addDevelopmentStep} style={styles.addButton} title="Add step">
                            <Plus size={16} />
                            <span>Add Step</span>
                          </button>
                        </div>
                        {lessonPlan.lessonFlow?.development?.map((step, index) => (
                          <div key={index} style={styles.stepBlock}>
                            <div style={styles.stepHeader}>
                              <div style={styles.stepTitleText}>Step {step.step}</div>
                              <button 
                                onClick={() => deleteDevelopmentStep(index)} 
                                style={styles.deleteButton}
                                title="Delete step"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div style={styles.stepField}>
                              <strong>Title:</strong>
                              {renderEditableField(`lessonFlow.development.${index}.title`, step.title, false, "Enter title")}
                            </div>
                            <div style={styles.stepField}>
                              <strong>Description:</strong>
                              {renderEditableField(`lessonFlow.development.${index}.description`, step.description, true, "Enter description")}
                            </div>
                            <div style={styles.stepField}>
                              <strong>Activity:</strong>
                              {renderEditableField(`lessonFlow.development.${index}.activity`, step.activity, true, "Enter activity")}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Conclusion */}
                      <div style={styles.subsection}>
                        <div style={styles.subsectionTitle}>Conclusion (5 minutes)</div>
                        {renderEditableField("lessonFlow.conclusion.description", lessonPlan.lessonFlow?.conclusion?.description, true, "Enter conclusion")}
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
                          <span>View</span>
                        </button>
                        <button 
                          onClick={() => handleDownload(lesson, 'docx')} 
                          style={styles.downloadButtonCard}
                          disabled={isDownloading}
                        >
                          <Download size={16} />
                          <span>Download</span>
                        </button>
                        <button onClick={() => handleDelete(lesson)} style={styles.deleteButtonCard}>
                          <Trash2 size={16} />
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
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  mobileMenuButton: {
    position: "fixed",
    top: "16px",
    left: "16px",
    zIndex: 1001,
    backgroundColor: "#000000",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    cursor: "pointer",
  },
  hamburger: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  hamburgerLine: {
    width: "24px",
    height: "2px",
    backgroundColor: "#ffffff",
    borderRadius: "2px",
  },
  mobileOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
  },
  sidebar: {
    width: "260px",
    backgroundColor: "#000000",
    padding: "24px 0",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    height: "100vh",
    overflowY: "auto",
    zIndex: 1000,
    transition: "transform 0.3s ease",
  },
  sidebarHeader: {
    marginBottom: "40px",
    padding: "0 16px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
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
    flex: 1,
    justifyContent: "space-between",
  },
  navSection: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  navSectionBottom: {
    display: "flex",
    flexDirection: "column",
    marginTop: "auto",
  },
  dividerLine: {
    height: "1px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    margin: "16px 16px",
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    fontSize: "15px",
    fontWeight: "500",
    color: "#ffffff",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "0",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    position: "relative",
    width: "100%",
  },
  navButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    fontWeight: "600",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    fontSize: "15px",
    fontWeight: "500",
    color: "#ffffff",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "0",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    position: "relative",
    width: "100%",
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
    flexWrap: "wrap",
    gap: "16px",
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
    flex: 1,
    maxWidth: "400px",
  },
  searchBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
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
    width: "100%",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
  },
  statCard: {
    borderRadius: "16px",
    padding: "28px",
    border: "none",
    position: "relative",
    overflow: "hidden",
  },
  statCardBlue: {
    backgroundColor: "#d4f1ff",
  },
  statCardPurple: {
    backgroundColor: "#e5deff",
  },
  statHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  statIcon: {
    color: "#000000",
    opacity: 0.6,
  },
  statPercentage: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#22c55e",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  statValue: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#000000",
    marginBottom: "8px",
  },
  statSubtext: {
    fontSize: "14px",
    color: "#000000",
    opacity: 0.7,
    fontWeight: "500",
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
    flexWrap: "wrap",
    gap: "12px",
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
  tableWrapper: {
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "600px",
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
    whiteSpace: "nowrap",
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
  actionButtonGroup: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
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
    whiteSpace: "nowrap",
  },
  downloadButtonSmall: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#4caf50",
    backgroundColor: "transparent",
    border: "1px solid #4caf50",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
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
    width: "100%",
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
    flexWrap: "wrap",
  },
  actionBarRight: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
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
    whiteSpace: "nowrap",
  },
  downloadButton: {
    padding: "12px 20px",
    backgroundColor: "#4caf50",
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
    whiteSpace: "nowrap",
  },
  pdfButton: {
    padding: "12px 20px",
    backgroundColor: "#ff9800",
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
    whiteSpace: "nowrap",
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
    whiteSpace: "nowrap",
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
  sectionHeaderWithButton: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    flexWrap: "wrap",
    gap: "8px",
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
    width: "25%",
  },
  tableValueCell: {
    padding: "8px",
    color: "#333333",
    borderBottom: "1px solid #d1d5db",
    textAlign: "left",
    width: "25%",
  },
  editableContainer: {
    margin: "8px 0",
  },
  editableValue: {
    padding: "8px 12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "4px",
    border: "1px solid #e0e0e0",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: "36px",
  },
  editableText: {
    flex: 1,
    fontSize: "12px",
    color: "#333333",
  },
  editIcon: {
    color: "#1976d2",
    flexShrink: 0,
    marginLeft: "8px",
  },
  editingWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  editInput: {
    padding: "8px 12px",
    fontSize: "12px",
    border: "2px solid #1976d2",
    borderRadius: "4px",
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
  },
  editTextarea: {
    padding: "8px 12px",
    fontSize: "12px",
    border: "2px solid #1976d2",
    borderRadius: "4px",
    outline: "none",
    fontFamily: "inherit",
    minHeight: "80px",
    resize: "vertical",
    width: "100%",
  },
  editButtonGroup: {
    display: "flex",
    gap: "8px",
  },
  saveEditBtn: {
    padding: "6px 12px",
    backgroundColor: "#4caf50",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    fontWeight: "600",
  },
  cancelEditBtn: {
    padding: "6px 12px",
    backgroundColor: "#f44336",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    fontWeight: "600",
  },
  addButton: {
    padding: "6px 12px",
    backgroundColor: "#1976d2",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    fontWeight: "600",
  },
  deleteButton: {
    padding: "4px 8px",
    backgroundColor: "#f44336",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "11px",
  },
  outcomeItem: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
    marginBottom: "12px",
    padding: "8px",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
  },
  outcomeNumber: {
    fontWeight: "700",
    fontSize: "12px",
    paddingTop: "8px",
    minWidth: "24px",
  },
  outcomeContent: {
    flex: 1,
  },
  stepBlock: {
    marginBottom: "16px",
    marginLeft: "20px",
    padding: "12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
  },
  stepHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  stepTitleText: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#000000",
  },
  stepField: {
    marginBottom: "8px",
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
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
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
    wordBreak: "break-word",
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
    gap: "8px",
    flexWrap: "wrap",
  },
  viewButton: {
    flex: 1,
    minWidth: "80px",
    padding: "10px 14px",
    backgroundColor: "#1976d2",
    color: "#ffffff",
    fontSize: "13px",
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
  downloadButtonCard: {
    flex: 1,
    minWidth: "100px",
    padding: "10px 14px",
    backgroundColor: "#4caf50",
    color: "#ffffff",
    fontSize: "13px",
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
  deleteButtonCard: {
    flex: 1,
    minWidth: "80px",
    padding: "10px 14px",
    backgroundColor: "#ffffff",
    color: "#000000",
    fontSize: "13px",
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

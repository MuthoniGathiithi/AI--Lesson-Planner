
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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

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
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
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
        const plan = lesson.lessonPlan || lesson
        const subject = plan.administrativeDetails?.subject?.toLowerCase() || ""
        const grade = plan.administrativeDetails?.grade?.toString().toLowerCase() || ""
        const className = plan.administrativeDetails?.class?.toLowerCase() || ""
        const teacher = plan.teacherDetails?.name?.toLowerCase() || plan.administrativeDetails?.teacher?.toLowerCase() || ""
        const question = plan.keyInquiryQuestion?.toLowerCase() || plan.guidingQuestion?.toLowerCase() || ""

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
  const errors = []
  
  if (!formData.schoolName.trim()) errors.push("School Name")
  if (!formData.subject.trim()) errors.push("Subject")
  if (!formData.className.trim()) errors.push("Class")
  if (!formData.teacherName.trim()) errors.push("Teacher Name")
  if (!formData.strand.trim()) errors.push("Strand")
  if (!formData.subStrand.trim()) errors.push("Sub-strand")
  
  if (errors.length > 0) {
    alert(`Please fill in the following required fields:\n- ${errors.join('\n- ')}`)
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
    alert("Failed to generate lesson plan. Please check:\n- Backend is running\n- All required fields are filled\n- Strand and sub-strand are provided")
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

  const downloadAsPdf = async (lesson) => {
    try {
      const plan = lesson.lessonPlan || lesson
      const admin = plan.administrativeDetails || {}
      const teacher = plan.teacherDetails || {}
      const roll = admin.roll || admin.studentEnrollment || {}
      const outcomesData = plan.lessonLearningOutcomes || {}
      const outcomes = outcomesData.outcomes || plan.learningOutcomes || []
      
      const timeString = typeof admin.time === 'string' ? admin.time : (admin.time?.start ? `${admin.time.start} - ${admin.time.end}` : 'N/A')
      
      const printWindow = window.open('', '', 'width=800,height=600')
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lesson Plan - ${admin.subject || 'Untitled'}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              padding: 40px;
              max-width: 850px;
              margin: 0 auto;
              line-height: 1.6;
            }
            h1 {
              text-align: center;
              font-size: 24px;
              font-weight: 700;
              letter-spacing: 2px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 30px;
            }
            h2 {
              font-size: 14px;
              font-weight: 700;
              text-transform: uppercase;
              margin-top: 25px;
              margin-bottom: 12px;
            }
            h3 {
              font-size: 13px;
              font-weight: 700;
              margin-top: 18px;
              margin-bottom: 8px;
              text-decoration: underline;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 12px;
            }
            td {
              padding: 8px;
              border-bottom: 1px solid #d1d5db;
            }
            td:nth-child(odd) {
              font-weight: 700;
              width: 25%;
            }
            .section {
              margin: 20px 0;
              font-size: 12px;
            }
            .outcomes-statement {
              font-style: italic;
              margin-bottom: 8px;
            }
            .outcome-item {
              margin-left: 20px;
              margin-bottom: 6px;
            }
            .step {
              margin: 12px 0 12px 20px;
              padding: 10px;
              background: #f9f9f9;
              border-left: 2px solid #000;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>LESSON PLAN</h1>
          
          <h2>Administrative Details</h2>
          <table>
            <tr>
              <td>School:</td>
              <td>${admin.school || 'N/A'}</td>
              <td>Subject:</td>
              <td>${admin.subject || 'N/A'}</td>
            </tr>
            <tr>
              <td>Year:</td>
              <td>${admin.year || new Date().getFullYear()}</td>
              <td>Term:</td>
              <td>${admin.term || 'N/A'}</td>
            </tr>
            <tr>
              <td>Date:</td>
              <td>${admin.date || 'N/A'}</td>
              <td>Time:</td>
              <td>${timeString}</td>
            </tr>
            <tr>
              <td>Grade:</td>
              <td>${admin.grade || 'N/A'}</td>
              <td>Roll:</td>
              <td>Boys: ${roll.boys || 0}, Girls: ${roll.girls || 0}, Total: ${roll.total || 0}</td>
            </tr>
          </table>
          
          <h2>Teacher Details</h2>
          <table>
            <tr>
              <td>Name:</td>
              <td>${teacher.name || admin.teacher || 'N/A'}</td>
              <td>TSC Number:</td>
              <td>${teacher.tscNumber || admin.teacherTSCNumber || 'N/A'}</td>
            </tr>
          </table>
          
          <div class="section">
            <h2>Strand</h2>
            <p>${plan.strand || plan.curriculumAlignment?.strand || 'N/A'}</p>
          </div>
          
          <div class="section">
            <h2>Sub-strand</h2>
            <p>${plan.subStrand || plan.curriculumAlignment?.substrand || 'N/A'}</p>
          </div>
          
          <div class="section">
            <h2>Lesson Learning Outcomes</h2>
            ${outcomes.length > 0 ? `
              <div class="outcomes-statement">${outcomesData.statement || "By the end of the lesson, the learner should be able to:"}</div>
              ${outcomes.map(outcome => 
                `<div class="outcome-item">${outcome.id}) ${outcome.outcome}</div>`
              ).join('')}
            ` : '<p>N/A</p>'}
          </div>
          
          <div class="section">
            <h2>Key Inquiry Question</h2>
            <p>${plan.keyInquiryQuestion || plan.guidingQuestion || 'N/A'}</p>
          </div>
          
          <div class="section">
            <h2>Learning Resources</h2>
            <p>${(plan.learningResources || []).join(", ") || 'N/A'}</p>
          </div>
          
          <div class="section">
            <h2>Lesson Flow</h2>
            
            <h3>Introduction</h3>
            <p>${plan.lessonFlow?.introduction?.description || 'N/A'}</p>
            
            <h3>Development</h3>
            ${(plan.lessonFlow?.development || []).map(step => `
              <div class="step">
                <strong>Step ${step.step}:</strong><br>
                ${step.description || step.title || 'N/A'}
                ${step.activity ? `<br><strong>Activity:</strong> ${step.activity}` : ''}
              </div>
            `).join('') || '<p>N/A</p>'}
            
            <h3>Conclusion</h3>
            <p>${plan.lessonFlow?.conclusion?.description || 'N/A'}</p>
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
    if (lesson.lessonPlan) {
      setLessonPlan(lesson)
    } else {
      const timeObj = lesson.administrativeDetails?.time
      const timeString = typeof timeObj === 'string' ? timeObj : (timeObj?.start ? `${timeObj.start} - ${timeObj.end}` : '')
      
      setLessonPlan({
        lessonPlan: {
          administrativeDetails: {
            ...lesson.administrativeDetails,
            time: timeString
          },
          teacherDetails: {
            name: lesson.administrativeDetails?.teacher || '',
            tscNumber: lesson.administrativeDetails?.teacherTSCNumber || ''
          },
          strand: lesson.curriculumAlignment?.strand || '',
          subStrand: lesson.curriculumAlignment?.substrand || '',
          lessonLearningOutcomes: {
            statement: "By the end of the lesson, the learner should be able to:",
            outcomes: lesson.learningOutcomes || []
          },
          keyInquiryQuestion: lesson.guidingQuestion || '',
          learningResources: lesson.learningResources || [],
          lessonFlow: lesson.lessonFlow || {
            introduction: { description: '' },
            development: [],
            conclusion: { description: '' }
          }
        }
      })
    }
    
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

  const addLearningOutcome = () => {
    if (!lessonPlan) return
    
    const plan = lessonPlan.lessonPlan || lessonPlan
    const outcomesData = plan.lessonLearningOutcomes || { statement: "By the end of the lesson, the learner should be able to:", outcomes: [] }
    const outcomes = outcomesData.outcomes || plan.learningOutcomes || []
    
    const newOutcomes = [...outcomes]
    const nextLetter = String.fromCharCode(97 + newOutcomes.length)
    newOutcomes.push({
      id: nextLetter,
      outcome: "New learning outcome - click to edit"
    })
    
    if (lessonPlan.lessonPlan) {
      setLessonPlan({
        ...lessonPlan,
        lessonPlan: {
          ...lessonPlan.lessonPlan,
          lessonLearningOutcomes: {
            ...outcomesData,
            outcomes: newOutcomes
          }
        }
      })
    } else {
      setLessonPlan({ ...lessonPlan, learningOutcomes: newOutcomes })
    }
  }

  const deleteLearningOutcome = (index) => {
    if (!lessonPlan) return
    
    const plan = lessonPlan.lessonPlan || lessonPlan
    const outcomesData = plan.lessonLearningOutcomes || {}
    const outcomes = outcomesData.outcomes || plan.learningOutcomes || []
    
    const newOutcomes = outcomes.filter((_, i) => i !== index)
    const renumbered = newOutcomes.map((outcome, i) => ({
      ...outcome,
      id: String.fromCharCode(97 + i)
    }))
    
    if (lessonPlan.lessonPlan) {
      setLessonPlan({
        ...lessonPlan,
        lessonPlan: {
          ...lessonPlan.lessonPlan,
          lessonLearningOutcomes: {
            ...outcomesData,
            outcomes: renumbered
          }
        }
      })
    } else {
      setLessonPlan({ ...lessonPlan, learningOutcomes: renumbered })
    }
  }

  const addDevelopmentStep = () => {
    if (!lessonPlan) return
    const plan = lessonPlan.lessonPlan || lessonPlan
    const lessonFlow = plan.lessonFlow || {}
    const development = [...(lessonFlow.development || [])]
    
    development.push({
      step: development.length + 1,
      description: "Step description - click to edit"
    })
    
    if (lessonPlan.lessonPlan) {
      setLessonPlan({
        ...lessonPlan,
        lessonPlan: {
          ...lessonPlan.lessonPlan,
          lessonFlow: { ...lessonFlow, development }
        }
      })
    } else {
      setLessonPlan({
        ...lessonPlan,
        lessonFlow: { ...lessonFlow, development }
      })
    }
  }

  const deleteDevelopmentStep = (index) => {
    if (!lessonPlan) return
    const plan = lessonPlan.lessonPlan || lessonPlan
    const lessonFlow = plan.lessonFlow || {}
    const development = lessonFlow.development.filter((_, i) => i !== index)
    const renumbered = development.map((step, i) => ({
      ...step,
      step: i + 1
    }))
    
    if (lessonPlan.lessonPlan) {
      setLessonPlan({
        ...lessonPlan,
        lessonPlan: {
          ...lessonPlan.lessonPlan,
          lessonFlow: { ...lessonFlow, development: renumbered }
        }
      })
    } else {
      setLessonPlan({
        ...lessonPlan,
        lessonFlow: { ...lessonFlow, development: renumbered }
      })
    }
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

  const isMobile = windowWidth <= 768

  return (
    <div style={styles.container}>
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-button { display: block !important; }
          .sidebar-mobile-hidden { transform: translateX(-100%) !important; }
          .sidebar-mobile-visible { transform: translateX(0) !important; }
          .main-mobile { margin-left: 0 !important; }
          .top-bar-mobile { padding: 60px 16px 16px 16px !important; }
          .page-title-mobile { font-size: 20px !important; }
          .search-box-mobile { max-width: 100% !important; }
          .content-mobile { padding: 16px !important; }
          .form-grid-mobile { grid-template-columns: 1fr !important; }
          .stats-row-mobile { grid-template-columns: 1fr !important; }
          .lesson-grid-mobile { grid-template-columns: 1fr !important; }
          .document-page-mobile { padding: 20px 16px !important; }
          .action-bar-mobile { flex-direction: column !important; gap: 8px !important; }
          .action-bar-right-mobile { width: 100% !important; flex-direction: column !important; gap: 8px !important; }
          .doc-table-mobile { font-size: 10px !important; }
          .table-label-cell-mobile { padding: 4px !important; }
          .table-value-cell-mobile { padding: 4px !important; }
        }
      `}</style>

      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="mobile-menu-button"
        style={{
          ...styles.mobileMenuButton,
          display: isMobile ? 'block' : 'none'
        }}
        aria-label="Toggle menu"
      >
        <div style={styles.hamburger}>
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
        </div>
      </button>

      <aside 
        className={isMobile ? (isMobileMenuOpen ? 'sidebar-mobile-visible' : 'sidebar-mobile-hidden') : ''}
        style={styles.sidebar}
      >
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <div style={styles.logoText}>FunzoIQ</div>
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
            <button onClick={handleLogout} style={styles.logoutButton}>
              <LogOut size={20} />
              <span>Log out</span>
            </button>
          </div>
        </nav>
      </aside>

      {isMobileMenuOpen && isMobile && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={styles.mobileOverlay}
        />
      )}

      <main 
        className={isMobile ? 'main-mobile' : ''}
        style={{
          ...styles.main,
          marginLeft: isMobile ? '0' : '260px'
        }}
      >
        <header 
          className={isMobile ? 'top-bar-mobile' : ''}
          style={styles.topBar}
        >
          <div style={styles.topBarLeft}>
            <div style={styles.greeting}>{getGreeting()}</div>
            <h1 
              className={isMobile ? 'page-title-mobile' : ''}
              style={styles.pageTitle}
            >
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "create" && "Lesson Planner"}
              {activeTab === "archive" && "Lesson Archive"}
            </h1>
          </div>

          <div 
            className={isMobile ? 'search-box-mobile' : ''}
            style={styles.topBarRight}
          >
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

        <div 
          className={isMobile ? 'content-mobile' : ''}
          style={styles.content}
        >
          {activeTab === "dashboard" && (
            <div style={styles.dashboardLayout}>
              <div 
                className={isMobile ? 'stats-row-mobile' : ''}
                style={styles.statsRow}
              >
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
                          {filteredLessons.slice(0, 5).map((lesson) => {
                            const plan = lesson.lessonPlan || lesson
                            return (
                              <tr key={lesson.dbId} style={styles.tableRow}>
                                <td style={styles.td}>
                                  {plan.administrativeDetails?.subject || plan.keyInquiryQuestion?.substring(0, 30) || plan.guidingQuestion?.substring(0, 30) || "Lesson Plan"}
                                </td>
                                <td style={styles.td}>{plan.administrativeDetails?.grade || "N/A"}</td>
                                <td style={styles.td}>{plan.administrativeDetails?.class || "N/A"}</td>
                                <td style={styles.td}>{plan.teacherDetails?.name || plan.administrativeDetails?.teacher || "N/A"}</td>
                                <td style={styles.td}>{lesson.savedDate}</td>
                                <td style={styles.td}>
                                  <div style={styles.actionButtonGroup}>
                                    <button onClick={() => handleViewLesson(lesson)} style={styles.viewButtonSmall}>
                                      <Eye size={16} />
                                      <span>View</span>
                                    </button>
                                    <button 
                                      onClick={() => handleDownload(lesson, 'pdf')} 
                                      style={styles.downloadButtonSmall}
                                      disabled={isDownloading}
                                      title="Download"
                                    >
                                      <Download size={16} />
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(lesson)} 
                                      style={styles.deleteButtonSmall}
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
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
                  <div 
                    className={isMobile ? 'form-grid-mobile' : ''}
                    style={styles.formGrid}
                  >
                   {[
  { label: "School Name", key: "schoolName", placeholder: "Enter school name", type: "text", required: true },
  { label: "Subject", key: "subject", placeholder: "e.g. Biology, Geography, Mathematics", type: "text", required: true },
  { label: "Class", key: "className", placeholder: "e.g. 10A", type: "text", required: true },
  { label: "Grade", key: "grade", placeholder: "e.g. 10", type: "number", required: false },
  { label: "Term", key: "term", placeholder: "1, 2, or 3", type: "number", required: false },
  { label: "Date", key: "date", placeholder: "", type: "date", required: false },
  { label: "Start Time", key: "startTime", placeholder: "", type: "time", required: false },
  { label: "End Time", key: "endTime", placeholder: "", type: "time", required: false },
  { label: "Teacher Name", key: "teacherName", placeholder: "Enter teacher name", type: "text", required: true },
  { label: "TSC Number", key: "tscNumber", placeholder: "Enter TSC number", type: "text", required: false },
  { label: "Number of Boys", key: "boys", placeholder: "0", type: "number", required: false },
  { label: "Number of Girls", key: "girls", placeholder: "0", type: "number", required: false },
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
      value={formData[field.key]}
      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
      style={{
        ...styles.input,
        ...(field.required && !formData[field.key].trim() ? { borderColor: "#fca5a5" } : {})
      }}
    />
  </div>
))}
                  </div>
                  
                  <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#f0f9ff", borderRadius: "8px", fontSize: "14px", color: "#0369a1" }}>
                    💡 <strong>Tip:</strong> The system can handle typos! If you type "Geogrphy" instead of "Geography", it will automatically match to the correct subject.
                  </div>
                  
                  <button onClick={handleGenerate} disabled={isGenerating} style={styles.generateButton}>
                    {isGenerating ? "Generating..." : "Generate Lesson Plan"}
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
                        <span>{isDownloading ? "Printing..." : "Print PDF"}</span>
                      </button>
                      <button onClick={handleSave} disabled={isSaving} style={styles.saveButton}>
                        <Save size={16} />
                        <span>{isSaving ? "Saving..." : currentLessonId ? "Update" : "Save"}</span>
                      </button>
                    </div>
                  </div>

                  <div 
                    className={isMobile ? 'document-page-mobile' : ''}
                    style={styles.documentPage}
                  >
                    <div style={styles.docHeader}>
                      <div style={styles.docTitle}>LESSON PLAN</div>
                      <div style={styles.docDivider}></div>
                    </div>

                    <h3 style={styles.sectionTitle}>ADMINISTRATIVE DETAILS</h3>
                    <table 
                      className={isMobile ? 'doc-table-mobile' : ''}
                      style={styles.docTable}
                    >
                      <tbody>
                        <tr>
                          <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>School:</td>
                          <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                            {renderEditableField("lessonPlan.administrativeDetails.school", lessonPlan?.lessonPlan?.administrativeDetails?.school || lessonPlan?.administrativeDetails?.school)}
                          </td>
                          <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>Subject:</td>
                          <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                            {renderEditableField("lessonPlan.administrativeDetails.subject", lessonPlan?.lessonPlan?.administrativeDetails?.subject || lessonPlan?.administrativeDetails?.subject)}
                          </td>
                        </tr>
                        <tr>
                          <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>Year:</td>
                          <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                            {renderEditableField("lessonPlan.administrativeDetails.year", lessonPlan?.lessonPlan?.administrativeDetails?.year || lessonPlan?.administrativeDetails?.year)}
                          </td>
                          <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>Term:</td>
                          <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                            {renderEditableField("lessonPlan.administrativeDetails.term", lessonPlan?.lessonPlan?.administrativeDetails?.term?.toString() || lessonPlan?.administrativeDetails?.term?.toString())}
                          </td>
                        </tr>
                        <tr>
                          <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>Date:</td>
                          <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                            {renderEditableField("lessonPlan.administrativeDetails.date", lessonPlan?.lessonPlan?.administrativeDetails?.date || lessonPlan?.administrativeDetails?.date)}
                          </td>
                          <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>Time:</td>
                          <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                            {(() => {
                              const plan = lessonPlan?.lessonPlan || lessonPlan
                              const timeValue = plan?.administrativeDetails?.time
                              const timeString = typeof timeValue === 'string' ? timeValue : (timeValue?.start ? `${timeValue.start} - ${timeValue.end}` : "N/A")
                              return renderEditableField("lessonPlan.administrativeDetails.time", timeString)
                            })()}
                          </td>
                        </tr>
                        <tr>
                          <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>Grade:</td>
                          <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                            {renderEditableField("lessonPlan.administrativeDetails.grade", lessonPlan?.lessonPlan?.administrativeDetails?.grade?.toString() || lessonPlan?.administrativeDetails?.grade?.toString())}
                          </td>
                          <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>Roll:</td>
                          <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                            {(() => {
                              const plan = lessonPlan?.lessonPlan || lessonPlan
                              const roll = plan?.administrativeDetails?.roll || plan?.administrativeDetails?.studentEnrollment || {}
                              return `Boys: ${roll.boys || 0}, Girls: ${roll.girls || 0}, Total: ${roll.total || 0}`
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <h3 style={styles.sectionTitle}>TEACHER DETAILS</h3>
                    <table 
                      className={isMobile ? 'doc-table-mobile' : ''}
                      style={styles.docTable}
                    >
                      <tbody>
                        <tr>
                          <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>Name:</td>
                          <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                            {renderEditableField("lessonPlan.teacherDetails.name", lessonPlan?.lessonPlan?.teacherDetails?.name || lessonPlan?.teacherDetails?.name || lessonPlan?.administrativeDetails?.teacher)}
                          </td>
                          <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>TSC Number:</td>
                          <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                            {renderEditableField("lessonPlan.teacherDetails.tscNumber", lessonPlan?.lessonPlan?.teacherDetails?.tscNumber || lessonPlan?.teacherDetails?.tscNumber || lessonPlan?.administrativeDetails?.teacherTSCNumber)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>STRAND</div>
                      {renderEditableField("lessonPlan.strand", lessonPlan?.lessonPlan?.strand || lessonPlan?.strand || lessonPlan?.curriculumAlignment?.strand, false, "Enter strand")}
                    </div>

                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>SUB-STRAND</div>
                      {renderEditableField("lessonPlan.subStrand", lessonPlan?.lessonPlan?.subStrand || lessonPlan?.subStrand || lessonPlan?.curriculumAlignment?.substrand, false, "Enter sub-strand")}
                    </div>

                    <div style={styles.section}>
                      <div style={styles.sectionHeaderWithButton}>
                        <div style={styles.sectionTitle}>LESSON LEARNING OUTCOMES</div>
                        <button onClick={addLearningOutcome} style={styles.addButton} title="Add outcome">
                          <Plus size={16} />
                          <span>Add</span>
                        </button>
                      </div>
                      <div style={{ fontStyle: 'italic', marginBottom: '12px', fontSize: '12px' }}>
                        {lessonPlan?.lessonPlan?.lessonLearningOutcomes?.statement || lessonPlan?.lessonLearningOutcomes?.statement || "By the end of the lesson, the learner should be able to:"}
                      </div>
                      {(() => {
                        const plan = lessonPlan?.lessonPlan || lessonPlan
                        const outcomes = plan?.lessonLearningOutcomes?.outcomes || plan?.learningOutcomes || []
                        return outcomes.map((outcome, index) => (
                          <div key={index} style={styles.outcomeItem}>
                            <div style={styles.outcomeNumber}>{outcome.id})</div>
                            <div style={styles.outcomeContent}>
                              {renderEditableField(`lessonPlan.lessonLearningOutcomes.outcomes.${index}.outcome`, outcome.outcome, true, "Enter outcome")}
                            </div>
                            <button 
                              onClick={() => deleteLearningOutcome(index)} 
                              style={styles.deleteButton}
                              title="Delete outcome"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      })()}
                    </div>

                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>KEY INQUIRY QUESTION</div>
                      {renderEditableField("lessonPlan.keyInquiryQuestion", lessonPlan?.lessonPlan?.keyInquiryQuestion || lessonPlan?.keyInquiryQuestion || lessonPlan?.guidingQuestion, true, "Enter key inquiry question")}
                    </div>

                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>LEARNING RESOURCES</div>
                      {(() => {
                        const plan = lessonPlan?.lessonPlan || lessonPlan
                        const resources = plan?.learningResources || []
                        return renderEditableField("lessonPlan.learningResources", resources.join(", "), true, "Enter resources (comma-separated)")
                      })()}
                    </div>

                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>LESSON FLOW</div>

                      <div style={styles.subsection}>
                        <div style={styles.subsectionTitle}>Introduction</div>
                        {renderEditableField("lessonPlan.lessonFlow.introduction.description", lessonPlan?.lessonPlan?.lessonFlow?.introduction?.description || lessonPlan?.lessonFlow?.introduction?.description, true, "Enter introduction")}
                      </div>

                      <div style={styles.subsection}>
                        <div style={styles.sectionHeaderWithButton}>
                          <div style={styles.subsectionTitle}>Development</div>
                          <button onClick={addDevelopmentStep} style={styles.addButton} title="Add step">
                            <Plus size={16} />
                            <span>Add Step</span>
                          </button>
                        </div>
                        {(() => {
                          const plan = lessonPlan?.lessonPlan || lessonPlan
                          const development = plan?.lessonFlow?.development || []
                          return development.map((step, index) => (
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
                                {renderEditableField(`lessonPlan.lessonFlow.development.${index}.description`, step.description || step.title, true, "Enter step description")}
                              </div>
                              {step.activity && (
                                <div style={styles.stepField}>
                                  <strong>Activity:</strong>
                                  {renderEditableField(`lessonPlan.lessonFlow.development.${index}.activity`, step.activity, true, "Enter activity")}
                                </div>
                              )}
                            </div>
                          ))
                        })()}
                      </div>

                      <div style={styles.subsection}>
                        <div style={styles.subsectionTitle}>Conclusion</div>
                        {renderEditableField("lessonPlan.lessonFlow.conclusion.description", lessonPlan?.lessonPlan?.lessonFlow?.conclusion?.description || lessonPlan?.lessonFlow?.conclusion?.description, true, "Enter conclusion")}
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
                <div 
                  className={isMobile ? 'lesson-grid-mobile' : ''}
                  style={styles.lessonGrid}
                >
                  {filteredLessons.map((lesson) => {
                    const plan = lesson.lessonPlan || lesson
                    return (
                      <div key={lesson.dbId} style={styles.lessonCard}>
                        <div style={styles.lessonCardHeader}>
                          <FileText size={24} style={styles.lessonCardIcon} />
                        </div>
                        <div style={styles.lessonCardTitle}>
                          {plan.administrativeDetails?.subject ||
                            plan.keyInquiryQuestion?.substring(0, 50) ||
                            plan.guidingQuestion?.substring(0, 50) ||
                            "Untitled"}
                        </div>
                        <div style={styles.lessonCardMeta}>
                          <div style={styles.metaRow}>
                            <span style={styles.metaLabel}>Grade:</span>
                            <span style={styles.metaValue}>{plan.administrativeDetails?.grade || "N/A"}</span>
                          </div>
                          <div style={styles.metaRow}>
                            <span style={styles.metaLabel}>Class:</span>
                            <span style={styles.metaValue}>{plan.administrativeDetails?.class || "N/A"}</span>
                          </div>
                          <div style={styles.metaRow}>
                            <span style={styles.metaLabel}>Teacher:</span>
                            <span style={styles.metaValue}>{plan.teacherDetails?.name || plan.administrativeDetails?.teacher || "N/A"}</span>
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
                            onClick={() => handleDownload(lesson, 'pdf')} 
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
                    )
                  })}
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
  // Add your styles object here

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
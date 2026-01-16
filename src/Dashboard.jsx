"use client"

import { useState, useEffect } from "react"
import "./Dashboard.css"
import { getBilingualFields } from "./utils/bilingual"
import { downloadAsPdf } from "./utils/pdf"
import { styles } from "./styles/dashboardStyles"
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
      const filteredLessons = savedLessons.filter((lesson) => {
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase()
        const fields = getBilingualFields(lesson)

        const subject = fields.data.subject?.toLowerCase() || ""
        const grade = fields.data.grade?.toString().toLowerCase() || ""
        const teacher = fields.data.teacherName?.toLowerCase() || ""
        const question = fields.data.keyQuestion?.toLowerCase() || ""

        return (
          subject.includes(query) ||
          grade.includes(query) ||
          teacher.includes(query) ||
          question.includes(query)
        )
      })
      setFilteredLessons(filteredLessons)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = savedLessons.filter((lesson) => {
        const fields = getBilingualFields(lesson)
        const subject = fields.data.subject?.toLowerCase() || ""
        const grade = fields.data.grade?.toString().toLowerCase() || ""
        const teacher = fields.data.teacherName?.toLowerCase() || ""
        const question = fields.data.keyQuestion?.toLowerCase() || ""

        return (
          subject.includes(query) ||
          grade.includes(query) ||
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
        const normalizedContent = content?.lessonPlan
          ? content
          : {
              lessonPlan: content,
            }

        return {
          ...normalizedContent,
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
  if (!formData.teacherName.trim()) errors.push("Teacher Name")
  if (!formData.strand.trim()) errors.push("Strand")
  if (!formData.subStrand.trim()) errors.push("Sub-strand")
  
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
    setCurrentLessonId(null)
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
      plan.learningResources = normalizeToStringArray(plan.learningResources)

      if (plan.administrativeDetails) {
        if (plan.administrativeDetails.subject != null) {
          plan.administrativeDetails.subject = toSentenceCase(plan.administrativeDetails.subject)
        }
      }

      if (plan.strand != null) plan.strand = toSentenceCase(plan.strand)
      if (plan.subStrand != null) plan.subStrand = toSentenceCase(plan.subStrand)

      if (plan.curriculumAlignment) {
        if (plan.curriculumAlignment.strand != null) plan.curriculumAlignment.strand = toSentenceCase(plan.curriculumAlignment.strand)
        if (plan.curriculumAlignment.substrand != null) plan.curriculumAlignment.substrand = toSentenceCase(plan.curriculumAlignment.substrand)
        if (plan.curriculumAlignment.subStrand != null) plan.curriculumAlignment.subStrand = toSentenceCase(plan.curriculumAlignment.subStrand)
      }

      const rawLlo = plan.lessonLearningOutcomes || plan.lessonLearningOutcomes || {}
      const rawOutcomes = rawLlo.outcomes || plan.learningOutcomes || []
      const outcomesArray = Array.isArray(rawOutcomes) ? rawOutcomes : []
      const normalizedOutcomes = outcomesArray
        .map((item, index) => {
          if (item && typeof item === "object") {
            return {
              id: item.id ?? String.fromCharCode(97 + (index % 26)),
              outcome: item.outcome ?? item.text ?? item.description ?? "",
            }
          }
          return {
            id: String.fromCharCode(97 + (index % 26)),
            outcome: String(item ?? ""),
          }
        })
        .filter((o) => String(o.outcome ?? "").trim() !== "")

      plan.lessonLearningOutcomes = {
        statement:
          rawLlo.statement ||
          "By the end of the lesson, the learner should be able to:",
        outcomes: normalizedOutcomes,
      }

      plan.lessonLearningOutcomes = plan.lessonLearningOutcomes

      delete plan.learningOutcomes
    }
    return clone
  }


  const handleSave = async () => {
    if (!lessonPlan) return

    setIsSaving(true)
    try {
      let result
      const normalized = normalizeLessonPlanForSave(lessonPlan)
      if (currentLessonId) {
        result = await updateLessonPlan(currentLessonId, normalized)
        if (result.success) {
          alert("Lesson plan updated successfully!")
        }
      } else {
        result = await saveLessonPlan(normalized)
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
      const fields = getBilingualFields(lesson)
      const timeString = fields.data.time

      setLessonPlan({
        lessonPlan: lesson,
        dbId: lesson.dbId,
        savedDate: lesson.savedDate,
        status: lesson.status,
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

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) return

    setLessonPlan(null)
    setCurrentLessonId(null)
    setSavedLessons([])
    setFilteredLessons([])
    setActiveTab("dashboard")

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      window.location.href = "/"
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
    
    const fields = getBilingualFields(lessonPlan)
    const outcomesData = fields.data.learningOutcomes || { statement: fields.labels.outcomeStatement, outcomes: [] }
    const outcomes = outcomesData.outcomes || []
    
    const newOutcomes = [...outcomes]
    const nextLetter = String.fromCharCode(97 + newOutcomes.length)
    newOutcomes.push({
      id: nextLetter,
      outcome: "New learning outcome - click to edit"
    })
    
    // Update in original structure
    const plan = lessonPlan.lessonPlan || lessonPlan
    if (fields.isKiswahili) {
      if (!plan["MATOKEO YA KUJIFUNZIA"]) plan["MATOKEO YA KUJIFUNZIA"] = {}
      plan["MATOKEO YA KUJIFUNZIA"].outcomes = newOutcomes
    } else {
      if (!plan.lessonLearningOutcomes) plan.lessonLearningOutcomes = {}
      plan.lessonLearningOutcomes.outcomes = newOutcomes
    }
    
    setLessonPlan({...lessonPlan})
  }

  const deleteLearningOutcome = (index) => {
    if (!lessonPlan) return
    
    const fields = getBilingualFields(lessonPlan)
    const outcomesData = fields.data.learningOutcomes || {}
    const outcomes = outcomesData.outcomes || []
    
    const newOutcomes = outcomes.filter((_, i) => i !== index)
    const renumbered = newOutcomes.map((outcome, i) => ({
      ...outcome,
      id: String.fromCharCode(97 + i)
    }))
    
    // Update in original structure
    const plan = lessonPlan.lessonPlan || lessonPlan
    if (fields.isKiswahili) {
      if (plan["MATOKEO YA KUJIFUNZIA"]) {
        plan["MATOKEO YA KUJIFUNZIA"].outcomes = renumbered
      }
    } else {
      if (plan.lessonLearningOutcomes) {
        plan.lessonLearningOutcomes.outcomes = renumbered
      }
    }
    
    setLessonPlan({...lessonPlan})
  }

  const addDevelopmentStep = () => {
    if (!lessonPlan) return
    const fields = getBilingualFields(lessonPlan)
    const lessonFlow = fields.data.lessonFlow || {}
    const development = [...(lessonFlow.development || lessonFlow[fields.labels.development?.toLowerCase()] || [])]
    
    development.push({
      step: development.length + 1,
      description: "Step description - click to edit"
    })
    
    // Update in original structure
    const plan = lessonPlan.lessonPlan || lessonPlan
    if (fields.isKiswahili) {
      if (!plan["MTIRIRIKO WA SOMO"]) plan["MTIRIRIKO WA SOMO"] = {}
      plan["MTIRIRIKO WA SOMO"][fields.labels.development] = development
    } else {
      if (!plan.lessonFlow) plan.lessonFlow = {}
      plan.lessonFlow.development = development
    }
    
    setLessonPlan({...lessonPlan})
  }

  const deleteDevelopmentStep = (index) => {
    if (!lessonPlan) return
    const fields = getBilingualFields(lessonPlan)
    const lessonFlow = fields.data.lessonFlow || {}
    const development = (lessonFlow.development || lessonFlow[fields.labels.development?.toLowerCase()] || []).filter((_, i) => i !== index)
    const renumbered = development.map((step, i) => ({
      ...step,
      step: i + 1
    }))
    
    // Update in original structure
    const plan = lessonPlan.lessonPlan || lessonPlan
    if (fields.isKiswahili) {
      if (plan["MTIRIRIKO WA SOMO"]) {
        plan["MTIRIRIKO WA SOMO"][fields.labels.development] = renumbered
      }
    } else {
      if (plan.lessonFlow) {
        plan.lessonFlow.development = renumbered
      }
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
            <div style={styles.logoText}>Funzo Hub</div>
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
              <span>Overview</span>
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
            <div style={styles.dividerLine} />
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
              {activeTab === "dashboard" && "Overview"}
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
                  </div>
                  <div style={styles.statValue}>{savedLessons.length.toLocaleString()}</div>
                  <div style={styles.statSubtext}>Total Lessons</div>
                </div>

                <div style={{...styles.statCard, ...styles.statCardPurple}}>
                  <div style={styles.statHeader}>
                    <div style={styles.statIcon}>
                      <Archive size={24} />
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
                  <div style={{ ...styles.sectionHeaderActions, ...(isMobile ? styles.sectionHeaderActionsMobile : {}) }}>
                    <button
                      onClick={() => {
                        handleCreateNew()
                        setActiveTab("create")
                      }}
                      style={styles.createPlanButton}
                    >
                      <Plus size={16} />
                      <span>Create New Plan</span>
                    </button>
                    <button onClick={() => setActiveTab("archive")} style={styles.viewAllButton}>
                      View All
                    </button>
                  </div>
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
                            <th style={{ ...styles.th, textAlign: "left" }}>Teacher</th>
                            <th style={{ ...styles.th, textAlign: "left" }}>Date</th>
                            <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLessons.slice(0, 5).map((lesson) => {
                            const fields = getBilingualFields(lesson)
                            return (
                              <tr key={lesson.dbId} style={styles.tableRow}>
                                <td style={styles.td}>
                                  {fields.data.subject || fields.data.keyQuestion?.substring(0, 30) || "Lesson Plan"}
                                </td>
                                <td style={styles.td}>{fields.data.grade || "N/A"}</td>
                                <td style={styles.td}>{fields.data.teacherName || "N/A"}</td>
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
                                      title="Download as PDF"
                                    >
                                      <Download size={16} />
                                      <span>Download as PDF</span>
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
                    style={styles.formGrid}
                  >
                   {[
  { label: "School Name", key: "schoolName", placeholder: "Enter school name", type: "text", required: true },
  { label: "Subject", key: "subject", placeholder: "e.g. Biology, Geography, Mathematics", type: "text", required: true },
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
                    💡 <strong>Tip:</strong> For Kiswahili lessons, type "Kiswahili" as the subject to get full Kiswahili output!
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
                        <span>{isDownloading ? "Downloading..." : "Download as PDF"}</span>
                      </button>
                      <button onClick={handleSave} disabled={isSaving} style={styles.saveButton}>
                        <Save size={16} />
                        <span>{isSaving ? "Saving..." : "Save"}</span>
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
                            <div style={styles.docDivider}></div>
                          </div>

                          <h3 style={styles.sectionTitle}>{labels.adminDetails}</h3>
                          <table 
                            className={isMobile ? 'doc-table-mobile' : ''}
                            style={styles.docTable}
                          >
                            <tbody>
                              <tr>
                                <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>{labels.school}:</td>
                                <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                                  {renderEditableField("lessonPlan.administrativeDetails.school", data.school)}
                                </td>
                                <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>{labels.subject}:</td>
                                <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                                  {renderEditableField("lessonPlan.administrativeDetails.subject", data.subject)}
                                </td>
                              </tr>
                              <tr>
                                <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>{labels.year}:</td>
                                <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                                  {renderEditableField("lessonPlan.administrativeDetails.year", data.year || new Date().getFullYear().toString())}
                                </td>
                                <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>{labels.term}:</td>
                                <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                                  {renderEditableField("lessonPlan.administrativeDetails.term", data.term?.toString())}
                                </td>
                              </tr>
                              <tr>
                                <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>{labels.date}:</td>
                                <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                                  {renderEditableField("lessonPlan.administrativeDetails.date", data.date)}
                                </td>
                                <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>{labels.time}:</td>
                                <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                                  {renderEditableField("lessonPlan.administrativeDetails.time", data.time)}
                                </td>
                              </tr>
                              <tr>
                                <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>{labels.grade}:</td>
                                <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                                  {renderEditableField("lessonPlan.administrativeDetails.grade", data.grade?.toString())}
                                </td>
                                <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>{labels.roll}:</td>
                                <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                        <span>{labels.boys}:</span>
                                        {renderEditableField("lessonPlan.administrativeDetails.roll.boys", String(data.boys))}
                                      </div>
                                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                        <span>{labels.girls}:</span>
                                        {renderEditableField("lessonPlan.administrativeDetails.roll.girls", String(data.girls))}
                                      </div>
                                    </div>
                                    <div>{labels.total}: {data.total}</div>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          <h3 style={styles.sectionTitle}>{labels.teacherDetails}</h3>
                          <table 
                            className={isMobile ? 'doc-table-mobile' : ''}
                            style={styles.docTable}
                          >
                            <tbody>
                              <tr>
                                <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>{labels.name}:</td>
                                <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                                  {renderEditableField("lessonPlan.teacherDetails.name", data.teacherName)}
                                </td>
                                <td className={isMobile ? 'table-label-cell-mobile' : ''} style={styles.tableLabelCell}>{labels.tscNumber}:</td>
                                <td className={isMobile ? 'table-value-cell-mobile' : ''} style={styles.tableValueCell}>
                                  {renderEditableField("lessonPlan.teacherDetails.tscNumber", data.tscNumber)}
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          <div style={styles.section}>
                            <div style={styles.sectionTitle}>{labels.strand}</div>
                            {renderEditableField("lessonPlan.strand", data.strand, false, "Enter strand")}
                          </div>

                          <div style={styles.section}>
                            <div style={styles.sectionTitle}>{labels.subStrand}</div>
                            {renderEditableField("lessonPlan.subStrand", data.subStrand, false, "Enter sub-strand")}
                          </div>

                          <div style={styles.section}>
                            <div style={styles.sectionHeaderWithButton}>
                              <div style={styles.sectionTitle}>{labels.learningOutcomes}</div>
                              <button onClick={addLearningOutcome} style={styles.addButton} title="Add outcome">
                                <Plus size={16} />
                                <span>Add</span>
                              </button>
                            </div>
                            <div style={{ fontStyle: 'italic', marginBottom: '12px', fontSize: '12px' }}>
                              {data.learningOutcomes?.statement || labels.outcomeStatement}
                            </div>
                            {(data.learningOutcomes?.outcomes || []).map((outcome, index) => (
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
                            ))}
                          </div>

                          <div style={styles.section}>
                            <div style={styles.sectionTitle}>{labels.keyQuestion}</div>
                            {renderEditableField("lessonPlan.keyInquiryQuestion", data.keyQuestion, true, "Enter key inquiry question")}
                          </div>

                          <div style={styles.section}>
                            <div style={styles.sectionTitle}>{labels.resources}</div>
                            {renderEditableField("lessonPlan.learningResources", normalizeToStringArray(data.resources).join(", "), true, "Enter resources (comma-separated)")}
                          </div>

                          <div style={styles.section}>
                            <div style={styles.sectionTitle}>{labels.lessonFlow}</div>

                            <div style={styles.subsection}>
                              <div style={styles.subsectionTitle}>{labels.introduction}</div>
                              {renderEditableField("lessonPlan.lessonFlow.introduction.description", data.lessonFlow?.introduction?.description || data.lessonFlow?.[labels.introduction?.toLowerCase()]?.description, true, "Enter introduction")}
                            </div>

                            <div style={styles.subsection}>
                              <div style={styles.sectionHeaderWithButton}>
                                <div style={styles.subsectionTitle}>{labels.development}</div>
                                <button onClick={addDevelopmentStep} style={styles.addButton} title="Add step">
                                  <Plus size={16} />
                                  <span>Add Step</span>
                                </button>
                              </div>
                              {(data.lessonFlow?.development || data.lessonFlow?.[labels.development?.toLowerCase()] || []).map((step, index) => (
                                <div key={index} style={styles.stepBlock}>
                                  <div style={styles.stepHeader}>
                                    <div style={styles.stepTitleText}>{labels.step} {step.step || step[labels.step?.toLowerCase()]}</div>
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
                                      <strong>{isKiswahili ? "Shughuli" : "Activity"}:</strong>
                                      {renderEditableField(`lessonPlan.lessonFlow.development.${index}.activity`, step.activity, true, "Enter activity")}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div style={styles.subsection}>
                              <div style={styles.subsectionTitle}>{labels.conclusion}</div>
                              {renderEditableField("lessonPlan.lessonFlow.conclusion.description", data.lessonFlow?.conclusion?.description || data.lessonFlow?.[labels.conclusion?.toLowerCase()]?.description, true, "Enter conclusion")}
                            </div>
                          </div>
                        </>
                      )
                    })()}
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
                    const fields = getBilingualFields(lesson)
                    return (
                      <div key={lesson.dbId} style={styles.lessonCard}>
                        <div style={styles.lessonCardHeader}>
                          <FileText size={24} style={styles.lessonCardIcon} />
                        </div>
                        <div style={styles.lessonCardTitle}>
                          {fields.data.subject || fields.data.keyQuestion?.substring(0, 50) || "Untitled"}
                        </div>
                        <div style={styles.lessonCardMeta}>
                          <div style={styles.metaRow}>
                            <span style={styles.metaLabel}>{fields.labels.grade}:</span>
                            <span style={styles.metaValue}>{fields.data.grade || "N/A"}</span>
                          </div>
                          <div style={styles.metaRow}>
                            <span style={styles.metaLabel}>{fields.labels.name}:</span>
                            <span style={styles.metaValue}>{fields.data.teacherName || "N/A"}</span>
                          </div>
                          <div style={styles.metaRow}>
                            <span style={styles.metaLabel}>{fields.labels.date}:</span>
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
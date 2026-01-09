import { useState, useEffect } from "react"
import { generateLessonPlan } from "./services/api"
import { 
  saveLessonPlan, 
  fetchLessonPlans, 
  updateLessonPlan, 
  deleteLessonPlan 
} from "./services/lessonPlanService"

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
    date: new Date().toISOString().split('T')[0],
    startTime: "08:00",
    endTime: "08:40",
    teacherName: "",
    tscNumber: "",
    boys: "0",
    girls: "0",
    strand: "",
    subStrand: "",
  })

  // Load saved lessons when Archive tab is opened
  useEffect(() => {
    if (activeTab === "archive") {
      loadLessons()
    }
  }, [activeTab])

  


const loadLessons = async () => {
  setIsLoadingLessons(true)
  const result = await fetchLessonPlans()
  
  if (result.success) {
    const lessons = result.data.map(lesson => {
      // Parse the content if it's a string
      const content = typeof lesson.content === 'string' 
        ? JSON.parse(lesson.content) 
        : lesson.content
      
      return {
        ...content,
        dbId: lesson.id,
        savedDate: new Date(lesson.created_at).toLocaleDateString(),
        status: lesson.status
      }
    })
    setSavedLessons(lessons)
  } else {
    alert('Failed to load lessons: ' + result.error)
  }
  
  setIsLoadingLessons(false)
}











  const handleGenerate = async () => {
    setIsGenerating(true)
    
    try {
      const generatedPlan = await generateLessonPlan(formData)
        setLessonPlan(generatedPlan)
      
      setCurrentLessonId(null)
      console.log('Generated lesson plan:', generatedPlan)
    } catch (error) {
      console.error('Error generating lesson plan:', error)
      alert('Failed to generate lesson plan. Make sure the backend is running!')
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
        alert('Failed to save lesson plan: ' + result.error)
      }
      
      if (activeTab === "archive") {
        await loadLessons()
      }
    } catch (error) {
      console.error('Error saving lesson:', error)
      alert('An error occurred while saving the lesson plan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (lesson) => {
    if (!confirm('Are you sure you want to delete this lesson plan?')) {
      return
    }
    
    const result = await deleteLessonPlan(lesson.dbId)
    
    if (result.success) {
      alert('Lesson plan deleted successfully!')
      await loadLessons()
    } else {
      alert('Failed to delete lesson plan: ' + result.error)
    }
  }


const handleViewLesson = (lesson) => {
  console.log('Viewing lesson:', lesson)
  console.log('administrativeDetails:', lesson.administrativeDetails)
  console.log('guidingQuestion:', lesson.guidingQuestion)
  console.log('learningOutcomes:', lesson.learningOutcomes)
  console.log('lessonFlow:', lesson.lessonFlow)
  
  const fullLesson = {
    administrativeDetails: lesson.administrativeDetails || {},
    curriculumAlignment: lesson.curriculumAlignment || {},
    learningOutcomes: lesson.learningOutcomes || [],
    guidingQuestion: lesson.guidingQuestion || "",
    learningResources: lesson.learningResources || [],
    lessonFlow: lesson.lessonFlow || {}
  }
  
  console.log('Setting lessonPlan to:', fullLesson)
  
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
      date: new Date().toISOString().split('T')[0],
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
          <div style={styles.logoIcon}>✨</div>
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
            <span style={styles.navIcon}>➕</span>
            Create Lesson
          </button>
          <button
            onClick={() => setActiveTab("archive")}
            style={{
              ...styles.navButton,
              ...(activeTab === "archive" ? styles.navButtonActive : {}),
            }}
          >
            <span style={styles.navIcon}>📁</span>
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
                <p style={styles.subtitle}>
                  Fill in the details to generate your curriculum-aligned plan.
                </p>
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
                  >
                    {isGenerating ? "Generating..." : "✨ Generate Lesson Plan"}
                  </button>
                </div>
              ) : (
                <div style={styles.documentContainer}>
                  <div style={styles.actionBar}>
                    <button onClick={handleCreateNew} style={styles.secondaryButton}>
                      ← Create New
                    </button>
                    <button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      style={{
                        ...styles.button,
                        opacity: isSaving ? 0.7 : 1,
                        cursor: isSaving ? "not-allowed" : "pointer",
                      }}
                    >
                      {isSaving ? "Saving..." : (currentLessonId ? "💾 Update" : "💾 Save")}
                    </button>
                  </div>

                  <div style={styles.documentPage}>
                    {/* Document Header */}
                    <div style={styles.docHeader}>
                      <h1 style={styles.docTitle}>LESSON PLAN</h1>
                      <div style={styles.docDivider}></div>
                    </div>

                    {/* Administrative Details Table */}
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

                    {/* Guiding Question */}
                    <div style={styles.section}>
                      <h2 style={styles.sectionTitle}>GUIDING QUESTION</h2>
                      <p style={styles.docText}><em>{lessonPlan.guidingQuestion}</em></p>
                    </div>

                    {/* Learning Outcomes */}
                    <div style={styles.section}>
                      <h2 style={styles.sectionTitle}>LEARNING OUTCOMES</h2>
                      {lessonPlan.learningOutcomes?.map((outcome) => (
                        <p key={outcome.id} style={styles.docText}>
                          {outcome.id}. {outcome.outcome}
                        </p>
                      ))}
                    </div>

                    {/* Learning Resources */}
                    <div style={styles.section}>
                      <h2 style={styles.sectionTitle}>LEARNING RESOURCES</h2>
                      <p style={styles.docText}>
                        {lessonPlan.learningResources?.join(', ')}
                      </p>
                    </div>

                    {/* Lesson Flow */}
                    <div style={styles.section}>
                      <h2 style={styles.sectionTitle}>LESSON FLOW</h2>
                      
                      {/* Introduction */}
                      <div style={styles.subsection}>
                        <h3 style={styles.subsectionTitle}>Introduction (5 minutes)</h3>
                        <p style={styles.docText}>{lessonPlan.lessonFlow?.introduction?.description}</p>
                      </div>

                      {/* Development Steps */}
                      <div style={styles.subsection}>
                        <h3 style={styles.subsectionTitle}>Development Activities</h3>
                        {lessonPlan.lessonFlow?.development?.map((step) => (
                          <div key={step.step} style={styles.stepContainer}>
                            <p style={styles.stepTitle}>
                              <strong>Step {step.step}: {step.title}</strong>
                            </p>
                            <p style={styles.docText}><strong>Description:</strong> {step.description}</p>
                            <p style={styles.docText}><strong>Activity:</strong> {step.activity}</p>
                          </div>
                        ))}
                      </div>

                      {/* Conclusion */}
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
                <p style={styles.subtitle}>
                  View and manage your saved lesson plans.
                </p>
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
                  <p style={styles.emptyText}>
                    Create and save lesson plans to see them here.
                  </p>
                </div>
              ) : (
                <div style={styles.lessonGrid}>
                  {savedLessons.map((lesson) => (
                    <div key={lesson.id} style={styles.lessonCard}>
                      <div style={styles.lessonHeader}>
                        <h3 style={styles.lessonTopic}>
                          {lesson.administrativeDetails?.subject || lesson.guidingQuestion?.substring(0, 50) || 'Untitled'}
                        </h3>
                       <span style={styles.lessonDate}>{lesson.savedDate}</span>
                      </div>
                      <div style={styles.lessonMeta}>
                        <div><strong>Grade:</strong> {lesson.administrativeDetails?.grade || lesson.grade}</div>
                        <div><strong>Class:</strong> {lesson.administrativeDetails?.class || 'N/A'}</div>
                        <div><strong>Teacher:</strong> {lesson.administrativeDetails?.teacher || 'N/A'}</div>
                      </div>
                      <div style={styles.lessonActions}>
                        <button
                          onClick={() => handleViewLesson(lesson)}
                          style={styles.viewButton}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(lesson)}
                          style={styles.deleteButton}
                        >
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
    backgroundColor: "#f9fafb",
  },
  sidebar: {
    width: "260px",
    backgroundColor: "#fff",
    borderRight: "1px solid #e5e7eb",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    height: "100vh",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "40px",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    backgroundColor: "#4F46E5",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    fontSize: "20px",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1a1a1a",
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
    fontSize: "15px",
    fontWeight: "500",
    color: "#666",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s",
  },
  navButtonActive: {
    backgroundColor: "#4F46E5",
    color: "#fff",
  },
  navIcon: {
    fontSize: "18px",
  },
  main: {
    marginLeft: "260px",
    flex: 1,
    padding: "40px",
  },
  content: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  },
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  input: {
    height: "40px",
    padding: "0 16px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#fff",
    color: "#1a1a1a",
    outline: "none",
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#4F46E5",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  secondaryButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#4F46E5",
    backgroundColor: "#fff",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 20px",
  },
  emptyIcon: {
    fontSize: "80px",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "16px",
    color: "#666",
  },
  lessonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  },
  lessonCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
  },
  lessonHeader: {
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid #e5e7eb",
  },
  lessonTopic: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: "4px",
  },
  lessonDate: {
    fontSize: "12px",
    color: "#999",
  },
  lessonMeta: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "16px",
    lineHeight: "1.6",
  },
  lessonActions: {
    display: "flex",
    gap: "8px",
  },
  viewButton: {
    flex: 1,
    padding: "8px 16px",
    backgroundColor: "#4F46E5",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  deleteButton: {
    flex: 1,
    padding: "8px 16px",
    backgroundColor: "#fff",
    color: "#dc2626",
    fontSize: "14px",
    fontWeight: "500",
    border: "1px solid #dc2626",
    borderRadius: "6px",
    cursor: "pointer",
  },
  documentContainer: {
    backgroundColor: "#e5e7eb",
    padding: "40px 20px",
    minHeight: "100vh",
  },
  actionBar: {
    maxWidth: "850px",
    margin: "0 auto 20px auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  documentPage: {
    maxWidth: "850px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    padding: "60px 80px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
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
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

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      backgroundColor: "#dff5f8",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    sidebar: {
      width: "260px",
      backgroundColor: "#2c3e50",
      color: "#ffffff",
      padding: "24px 20px",
      overflow: "auto",
      boxShadow: "2px 0 12px rgba(0, 0, 0, 0.15)",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "40px",
      fontSize: "18px",
      fontWeight: "700",
      letterSpacing: "-0.5px",
    },
    logoIcon: {
      display: "none",
    },
    logoText: {
      color: "#ffffff",
    },
    userProfile: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "16px",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: "12px",
      marginBottom: "28px",
      cursor: "pointer",
    },
    avatarWrapper: {
      flex: 0,
    },
    avatar: {
      width: "40px",
      height: "40px",
      borderRadius: "8px",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ffffff",
    },
    userInfo: {
      flex: 1,
      minWidth: 0,
    },
    userName: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#ffffff",
    },
    userRole: {
      fontSize: "12px",
      color: "rgba(255, 255, 255, 0.6)",
    },
    userMenuButton: {
      background: "none",
      border: "none",
      color: "rgba(255, 255, 255, 0.6)",
      fontSize: "18px",
      cursor: "pointer",
      padding: "4px",
    },
    nav: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    navButton: {
      padding: "12px 16px",
      backgroundColor: "transparent",
      color: "rgba(255, 255, 255, 0.7)",
      border: "none",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      transition: "all 0.2s ease",
    },
    navButtonActive: {
      backgroundColor: "rgba(123, 220, 183, 0.25)",
      color: "#ffffff",
    },
    navIcon: {
      display: "none",
    },
    navChevron: {
      marginLeft: "auto",
      display: "flex",
      opacity: 0.4,
    },
    main: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "auto",
      backgroundColor: "#dff5f8",
    },
    topBar: {
      padding: "28px 40px",
      backgroundColor: "#ffffff",
      borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
    },
    welcomeText: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    welcomeGreeting: {
      fontSize: "14px",
      color: "#6b7a8f",
      fontWeight: "500",
      marginBottom: "6px",
    },
    welcomeTitle: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#1a232d",
    },
    content: {
      flex: 1,
      padding: "32px 40px",
      overflow: "auto",
    },
    dashboardGrid: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "20px",
      marginBottom: "28px",
      maxWidth: "1000px",
      margin: "0 auto",
    },
    heroCard: {
      backgroundColor: "#2c3e50",
      borderRadius: "20px",
      padding: "60px 40px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      position: "relative",
      overflow: "hidden",
      color: "#ffffff",
      textAlign: "center",
      minHeight: "300px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    heroTitle: {
      fontSize: "36px",
      fontWeight: "700",
      marginBottom: "16px",
      color: "#ffffff",
    },
    heroSubtitle: {
      fontSize: "16px",
      color: "rgba(255, 255, 255, 0.85)",
      marginBottom: "32px",
      maxWidth: "600px",
    },
    heroCTA: {
      padding: "14px 32px",
      backgroundColor: "#7bdcb7",
      color: "#2c3e50",
      fontSize: "15px",
      fontWeight: "600",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 16px rgba(123, 220, 183, 0.3)",
    },
    cardPrimary: {
      gridColumn: "span 1",
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
      position: "relative",
      border: "1px solid rgba(0, 0, 0, 0.04)",
    },
    cardInfo: {
      display: "flex",
      flexDirection: "column",
    },
    cardLabel: {
      fontSize: "11px",
      fontWeight: "700",
      color: "#6b7a8f",
      letterSpacing: "0.5px",
      marginBottom: "8px",
      textTransform: "uppercase",
    },
    cardValue: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#1a232d",
      marginBottom: "4px",
    },
    cardSubtitle: {
      fontSize: "13px",
      color: "#6b7a8f",
    },
    floatingAddButton: {
      position: "absolute",
      bottom: "20px",
      right: "20px",
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      backgroundColor: "#7bdcb7",
      color: "#ffffff",
      border: "none",
      fontSize: "20px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 16px rgba(123, 220, 183, 0.3)",
      transition: "all 0.2s ease",
    },
    cardSecondary: {
      gridColumn: "span 1",
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
      border: "1px solid rgba(0, 0, 0, 0.04)",
    },
    cardHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "16px",
    },
    cardTag: {
      fontSize: "11px",
      fontWeight: "700",
      color: "#6b7a8f",
      letterSpacing: "0.5px",
      marginBottom: "8px",
      textTransform: "uppercase",
    },
    cardTitle: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#1a232d",
      marginBottom: "4px",
    },
    folderIcon: {
      fontSize: "32px",
    },
    progressLabel: {
      fontSize: "13px",
      color: "#6b7a8f",
      marginTop: "12px",
    },
    cardTertiary: {
      gridColumn: "span 1",
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
      position: "relative",
      border: "1px solid rgba(0, 0, 0, 0.04)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
    playIcon: {
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      background: "#7bdcb7",
      color: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "16px",
      fontSize: "18px",
    },
    cardDark: {
      gridColumn: "span 2",
      background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
      borderRadius: "16px",
      padding: "32px",
      color: "#ffffff",
      boxShadow: "0 8px 24px rgba(44, 62, 80, 0.2)",
      position: "relative",
      overflow: "hidden",
    },
    lockIcon: {
      fontSize: "32px",
      marginBottom: "12px",
    },
    cardWeather: {
      gridColumn: "span 1",
      gridRow: "span 2",
      background: "linear-gradient(135deg, #7bdcb7 0%, #5ecaa8 100%)",
      borderRadius: "16px",
      padding: "28px",
      color: "#ffffff",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 8px 24px rgba(123, 220, 183, 0.25)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    weatherInfo: {
      position: "relative",
      zIndex: 1,
    },
    weatherQuestion: {
      fontSize: "16px",
      fontWeight: "700",
      marginBottom: "8px",
    },
    weatherDesc: {
      fontSize: "13px",
      opacity: 0.9,
      marginBottom: "24px",
    },
    weatherTemp: {
      fontSize: "48px",
      fontWeight: "700",
    },
    weatherAddButton: {
      alignSelf: "flex-end",
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      backgroundColor: "#ffffff",
      color: "#7bdcb7",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
    },
    latestUpdates: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "28px",
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
      border: "1px solid rgba(0, 0, 0, 0.04)",
      gridColumn: "span 2",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#1a232d",
      marginBottom: "20px",
    },
    updatesList: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    updateItem: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "16px",
      backgroundColor: "#f5f8fa",
      borderRadius: "12px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      border: "1px solid rgba(0, 0, 0, 0.03)",
    },
    updateIcon: {
      width: "44px",
      height: "44px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      backgroundColor: "#ffffff",
      flexShrink: 0,
    },
    updateDetails: {
      flex: 1,
    },
    updateTitle: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#1a232d",
      marginBottom: "4px",
    },
    updateCategory: {
      fontSize: "12px",
      color: "#6b7a8f",
    },
    updateAmount: {
      fontSize: "14px",
      fontWeight: "700",
      color: "#7bdcb7",
    },
    updateDate: {
      fontSize: "12px",
      color: "#a8b5c4",
      fontWeight: "500",
    },
    loadingState: {
      textAlign: "center",
      padding: "40px",
      color: "#6b7a8f",
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
      color: "#6b7a8f",
      marginBottom: "20px",
    },
    createFirstButton: {
      padding: "12px 24px",
      background: "linear-gradient(135deg, #7bdcb7 0%, #5ecaa8 100%)",
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "600",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 4px 12px rgba(123, 220, 183, 0.25)",
    },
    viewAllButton: {
      width: "100%",
      padding: "12px",
      marginTop: "16px",
      backgroundColor: "#f5f8fa",
      color: "#7bdcb7",
      fontSize: "14px",
      fontWeight: "600",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    chartCard: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "28px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
      border: "1px solid rgba(0, 0, 0, 0.04)",
    },
    chartValue: {
      position: "absolute",
      fontSize: "32px",
      fontWeight: "700",
      color: "#1a232d",
    },
    donutChart: {
      transform: "rotate(-90deg)",
    },
    chartLabel: {
      marginTop: "16px",
      fontSize: "13px",
      color: "#6b7a8f",
      fontWeight: "500",
    },
    savingsCard: {
      background: "linear-gradient(135deg, #f5b041 0%, #f39c12 100%)",
      borderRadius: "16px",
      padding: "28px",
      color: "#ffffff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      boxShadow: "0 8px 24px rgba(243, 156, 18, 0.25)",
    },
    savingsText: {
      fontSize: "16px",
      fontWeight: "600",
      marginBottom: "12px",
      opacity: 0.95,
    },
    savingsAmount: {
      fontSize: "44px",
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
      color: "#1a232d",
      marginBottom: "6px",
    },
    pageSubtitle: {
      fontSize: "14px",
      color: "#6b7a8f",
    },
    formCard: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "32px",
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
      border: "1px solid rgba(0, 0, 0, 0.04)",
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
      color: "#1a232d",
    },
    input: {
      height: "44px",
      padding: "0 14px",
      fontSize: "14px",
      border: "1.5px solid #e5e7eb",
      borderRadius: "10px",
      backgroundColor: "#ffffff",
      color: "#1a232d",
      outline: "none",
      transition: "all 0.2s ease",
      fontFamily: "inherit",
    },
    generateButton: {
      padding: "14px 28px",
      background: "linear-gradient(135deg, #7bdcb7 0%, #5ecaa8 100%)",
      color: "#ffffff",
      fontSize: "15px",
      fontWeight: "600",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 4px 16px rgba(123, 220, 183, 0.3)",
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
      color: "#7bdcb7",
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
      background: "linear-gradient(135deg, #7bdcb7 0%, #5ecaa8 100%)",
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
      boxShadow: "0 4px 12px rgba(123, 220, 183, 0.25)",
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
      color: "#1a232d",
      marginBottom: "8px",
    },
    emptyText: {
      fontSize: "15px",
      color: "#6b7a8f",
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
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
      transition: "all 0.3s ease",
      border: "1px solid rgba(0, 0, 0, 0.04)",
    },
    lessonHeader: {
      marginBottom: "16px",
      paddingBottom: "16px",
      borderBottom: "1px solid #e5e7eb",
    },
    lessonTopic: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#1a232d",
      marginBottom: "6px",
    },
    lessonDate: {
      fontSize: "12px",
      color: "#a8b5c4",
      fontWeight: "500",
    },
    lessonMeta: {
      fontSize: "13px",
      color: "#6b7a8f",
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
      background: "linear-gradient(135deg, #7bdcb7 0%, #5ecaa8 100%)",
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
      color: "#ff6b6b",
      fontSize: "13px",
      fontWeight: "600",
      border: "1.5px solid #ffd4d4",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoText}>Funza AI</div>
        </div>

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
              <div style={styles.dashboardGrid}>
                <div style={styles.heroCard}>
                  <div style={styles.heroTitle}>Welcome Back, {formData.teacherName || "Educator"}!</div>
                  <div style={styles.heroSubtitle}>
                    Start creating curriculum-aligned lesson plans with AI. Get started by generating your first lesson
                    plan today.
                  </div>
                  <button onClick={() => setActiveTab("create")} style={styles.heroCTA}>
                    Create Your First Lesson Plan
                  </button>
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

                    {lessonPlan?.administrativeDetails && (
                      <div style={styles.section}>
                        <div style={styles.subsectionTitle}>ADMINISTRATIVE DETAILS</div>
                        <table style={styles.table}>
                          <tbody>
                            <tr>
                              <td style={styles.tableLabelCell}>School Name</td>
                              <td style={styles.tableValueCell}>
                                {lessonPlan.administrativeDetails.schoolName || "N/A"}
                              </td>
                              <td style={styles.tableLabelCell}>Date</td>
                              <td style={styles.tableValueCell}>{lessonPlan.administrativeDetails.date || "N/A"}</td>
                            </tr>
                            <tr>
                              <td style={styles.tableLabelCell}>Class</td>
                              <td style={styles.tableValueCell}>{lessonPlan.administrativeDetails.class || "N/A"}</td>
                              <td style={styles.tableLabelCell}>Time</td>
                              <td style={styles.tableValueCell}>
                                {lessonPlan.administrativeDetails.startTime || "N/A"} -{" "}
                                {lessonPlan.administrativeDetails.endTime || "N/A"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    {lessonPlan?.curriculumAlignment && Object.keys(lessonPlan.curriculumAlignment).length > 0 && (
                      <div style={styles.section}>
                        <div style={styles.subsectionTitle}>CURRICULUM ALIGNMENT</div>
                        <div style={styles.docText}>
                          {Object.entries(lessonPlan.curriculumAlignment).map(([key, value]) => (
                            <div key={key} style={{ marginBottom: "8px" }}>
                              <strong>{key}:</strong> {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {lessonPlan?.learningOutcomes && lessonPlan.learningOutcomes.length > 0 && (
                      <div style={styles.section}>
                        <div style={styles.subsectionTitle}>LEARNING OUTCOMES</div>
                        {lessonPlan.learningOutcomes.map((outcome, index) => (
                          <div key={index} style={styles.stepContainer}>
                            <div style={styles.stepTitle}>
                              {index + 1}. {outcome}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {lessonPlan?.guidingQuestion && (
                      <div style={styles.section}>
                        <div style={styles.subsectionTitle}>GUIDING QUESTION</div>
                        <div style={styles.docText}>{lessonPlan.guidingQuestion}</div>
                      </div>
                    )}

                    {lessonPlan?.learningResources && lessonPlan.learningResources.length > 0 && (
                      <div style={styles.section}>
                        <div style={styles.subsectionTitle}>LEARNING RESOURCES</div>
                        {lessonPlan.learningResources.map((resource, index) => (
                          <div key={index} style={styles.stepContainer}>
                            <div style={styles.stepTitle}>
                              {index + 1}. {resource}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {lessonPlan?.lessonFlow && Object.keys(lessonPlan.lessonFlow).length > 0 && (
                      <div style={styles.section}>
                        <div style={styles.subsectionTitle}>LESSON FLOW</div>
                        <div style={styles.docText}>
                          {Object.entries(lessonPlan.lessonFlow).map(([key, value]) => (
                            <div key={key} style={{ marginBottom: "12px" }}>
                              <strong>{key}:</strong> {Array.isArray(value) ? value.join(", ") : value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "archive" && (
            <>
              <div style={styles.pageHeader}>
                <h2 style={styles.pageTitle}>Lesson Archive</h2>
                <p style={styles.pageSubtitle}>View and manage all your saved lesson plans.</p>
              </div>

              {isLoadingLessons ? (
                <div style={styles.loadingState}>Loading lessons...</div>
              ) : savedLessons.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📚</div>
                  <div style={styles.emptyTitle}>No Lesson Plans Yet</div>
                  <div style={styles.emptyText}>Create your first lesson plan to get started.</div>
                </div>
              ) : (
                <div style={styles.lessonGrid}>
                  {savedLessons.map((lesson, index) => (
                    <div key={index} style={styles.lessonCard}>
                      <div style={styles.lessonHeader}>
                        <div style={styles.lessonTopic}>
                          {lesson.administrativeDetails?.subject ||
                            lesson.guidingQuestion?.substring(0, 40) ||
                            "Lesson Plan"}
                        </div>
                        <div style={styles.lessonDate}>{lesson.savedDate}</div>
                      </div>
                      <div style={styles.lessonMeta}>
                        <div>
                          <strong>Grade:</strong> {lesson.administrativeDetails?.grade || "N/A"}
                        </div>
                        <div>
                          <strong>Class:</strong> {lesson.administrativeDetails?.class || "N/A"}
                        </div>
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

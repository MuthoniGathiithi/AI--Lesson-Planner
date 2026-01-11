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
  const [isMobile, setIsMobile] = useState(false)

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
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          ...styles.mobileMenuButton,
          display: isMobile ? "block" : "none",
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
      <aside
        style={{
          ...styles.sidebar,
          ...(isMobile && !isMobileMenuOpen ? { transform: "translateX(-100%)" } : {}),
          ...(isMobile && isMobileMenuOpen ? { transform: "translateX(0)" } : {}),
        }}
      >
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
              {savedLessons.length > 0 && <span style={styles.badge}>{savedLessons.length}</span>}
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
      {isMobileMenuOpen && isMobile && <div onClick={() => setIsMobileMenuOpen(false)} style={styles.mobileOverlay} />}

      {/* Main Content */}
      <main
        style={{
          ...styles.main,
          marginLeft: isMobile ? "0" : "260px",
        }}
      >
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
                <div style={{ ...styles.statCard, ...styles.statCardBlue }}>
                  <div style={styles.statHeader}>
                    <div style={styles.statIcon}>
                      <FileText size={24} />
                    </div>
                    <div style={styles.statPercentage}>{savedLessons.length > 0 ? "100%" : "0%"}</div>
                  </div>
                  <div style={styles.statValue}>{savedLessons.length.toLocaleString()}</div>
                  <div style={styles.statSubtext}>Total Lessons</div>
                </div>

                <div style={{ ...styles.statCard, ...styles.statCardPurple }}>
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
                      }).length > 0
                        ? "+12%"
                        : "0%"}
                    </div>
                  </div>
                  <div style={styles.statValue}>
                    {savedLessons
                      .filter((l) => {
                        const lessonDate = new Date(l.savedDate)
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return lessonDate >= weekAgo
                      })
                      .length.toLocaleString()}
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
                        {searchQuery ? "Try a different search term" : "Create your first lesson plan to get started"}
                      </p>
                    </div>
                  ) : (
                    <div style={styles.tableWrapper}>
                      <table style={styles.table}>
                        <thead>
                          <tr style={styles.tableHeader}>
                            <th style={{ ...styles.th, textAlign: "left" }}>Subject</th>
                            <th style={{ ...styles.th, textAlign: "left", display: isMobile ? "none" : "table-cell" }}>
                              Grade
                            </th>
                            <th style={{ ...styles.th, textAlign: "left", display: isMobile ? "none" : "table-cell" }}>
                              Class
                            </th>
                            <th style={{ ...styles.th, textAlign: "left", display: isMobile ? "none" : "table-cell" }}>
                              Teacher
                            </th>
                            <th style={{ ...styles.th, textAlign: "left", display: isMobile ? "none" : "table-cell" }}>
                              Date
                            </th>
                            <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLessons.slice(0, 5).map((lesson) => (
                            <tr key={lesson.dbId} style={styles.tableRow}>
                              <td style={styles.td}>
                                {lesson.administrativeDetails?.subject ||
                                  lesson.guidingQuestion?.substring(0, 30) ||
                                  "Lesson Plan"}
                              </td>
                              <td style={{ ...styles.td, display: isMobile ? "none" : "table-cell" }}>
                                {lesson.administrativeDetails?.grade || "N/A"}
                              </td>
                              <td style={{ ...styles.td, display: isMobile ? "none" : "table-cell" }}>
                                {lesson.administrativeDetails?.class || "N/A"}
                              </td>
                              <td style={{ ...styles.td, display: isMobile ? "none" : "table-cell" }}>
                                {lesson.administrativeDetails?.teacher || "N/A"}
                              </td>
                              <td style={{ ...styles.td, display: isMobile ? "none" : "table-cell" }}>
                                {lesson.savedDate}
                              </td>
                              <td style={styles.td}>
                                <div style={styles.actionButtonGroup}>
                                  <button onClick={() => handleViewLesson(lesson)} style={styles.viewButtonSmall}>
                                    <Eye size={16} />
                                    <span>View</span>
                                  </button>
                                  <button
                                    onClick={() => handleDownload(lesson, "docx")}
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
                      <div key={field.key} style={styles.fieldWrapper}>
                        <label style={styles.label}>
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
                      fontSize: "14px",
                      color: "#0369a1",
                    }}
                  >
                    💡 <strong>Tip:</strong> The system can handle typos! If you type "Geogrphy" instead of "Geography",
                    it will automatically match to the correct subject.
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
                        onClick={() => handleDownload(lessonPlan, "docx")}
                        disabled={isDownloading}
                        style={styles.downloadButton}
                      >
                        <Download size={16} />
                        <span style={{ display: isMobile ? "none" : "inline" }}>Download</span>
                      </button>
                      <button
                        onClick={() => handleDownload(lessonPlan, "pdf")}
                        disabled={isDownloading}
                        style={styles.pdfButton}
                      >
                        <Download size={16} />
                        <span style={{ display: isMobile ? "none" : "inline" }}>Print PDF</span>
                      </button>
                      <button onClick={handleSave} disabled={isSaving} style={styles.saveButton}>
                        <Save size={16} />
                        <span style={{ display: isMobile ? "none" : "inline" }}>
                          {isSaving ? "Saving..." : currentLessonId ? "Update" : "Save"}
                        </span>
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
                            {renderEditableField(
                              "administrativeDetails.school",
                              lessonPlan.administrativeDetails?.school,
                            )}
                          </td>
                          <td style={{ ...styles.tableLabelCell, display: isMobile ? "none" : "table-cell" }}>
                            Subject:
                          </td>
                          <td style={{ ...styles.tableValueCell, display: isMobile ? "none" : "table-cell" }}>
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
                          <td style={{ ...styles.tableLabelCell, display: isMobile ? "none" : "table-cell" }}>
                            Grade:
                          </td>
                          <td style={{ ...styles.tableValueCell, display: isMobile ? "none" : "table-cell" }}>
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
                          <td style={{ ...styles.tableLabelCell, display: isMobile ? "none" : "table-cell" }}>
                            Students:
                          </td>
                          <td style={{ ...styles.tableValueCell, display: isMobile ? "none" : "table-cell" }}>
                            {lessonPlan.administrativeDetails?.studentEnrollment?.total || "N/A"}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Editable Guiding Question */}
                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>GUIDING QUESTION</div>
                      {renderEditableField(
                        "guidingQuestion",
                        lessonPlan.guidingQuestion,
                        true,
                        "Enter guiding question",
                      )}
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
                            {renderEditableField(
                              `learningOutcomes.${index}.outcome`,
                              outcome.outcome,
                              true,
                              "Enter outcome",
                            )}
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
                      {renderEditableField(
                        "learningResources",
                        lessonPlan.learningResources?.join(", "),
                        true,
                        "Enter resources (comma-separated)",
                      )}
                    </div>

                    {/* Editable Lesson Flow */}
                    <div style={styles.section}>
                      <div style={styles.sectionTitle}>LESSON FLOW</div>

                      {/* Introduction */}
                      <div style={styles.subsection}>
                        <div style={styles.subsectionTitle}>Introduction (5 minutes)</div>
                        {renderEditableField(
                          "lessonFlow.introduction.description",
                          lessonPlan.lessonFlow?.introduction?.description,
                          true,
                          "Enter introduction description",
                        )}
                      </div>

                      {/* Development Activities */}
                      <div style={styles.subsection}>
                        <div style={styles.sectionHeaderWithButton}>
                          <div style={styles.subsectionTitle}>Development Activities</div>
                          <button onClick={addDevelopmentStep} style={styles.addButton} title="Add step">
                            <Plus size={16} />
                            <span>Add</span>
                          </button>
                        </div>
                        {lessonPlan.lessonFlow?.development?.map((step, index) => (
                          <div key={index} style={styles.stepContainer}>
                            <div style={styles.stepHeader}>
                              <div style={styles.stepNumber}>Step {step.step}</div>
                              <button
                                onClick={() => deleteDevelopmentStep(index)}
                                style={styles.deleteButton}
                                title="Delete step"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div style={styles.stepField}>
                              <label style={styles.stepLabel}>Title:</label>
                              {renderEditableField(
                                `lessonFlow.development.${index}.title`,
                                step.title,
                                false,
                                "Enter step title",
                              )}
                            </div>
                            <div style={styles.stepField}>
                              <label style={styles.stepLabel}>Description:</label>
                              {renderEditableField(
                                `lessonFlow.development.${index}.description`,
                                step.description,
                                true,
                                "Enter step description",
                              )}
                            </div>
                            <div style={styles.stepField}>
                              <label style={styles.stepLabel}>Activity:</label>
                              {renderEditableField(
                                `lessonFlow.development.${index}.activity`,
                                step.activity,
                                true,
                                "Enter activity description",
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Conclusion */}
                      <div style={styles.subsection}>
                        <div style={styles.subsectionTitle}>Conclusion (5 minutes)</div>
                        {renderEditableField(
                          "lessonFlow.conclusion.description",
                          lessonPlan.lessonFlow?.conclusion?.description,
                          true,
                          "Enter conclusion description",
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "archive" && (
            <div style={styles.lessonsSection}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Lesson Archive</h2>
              </div>

              <div style={styles.tableContainer}>
                {filteredLessons.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyText}>
                      {searchQuery ? "No lessons match your search" : "No archived lessons"}
                    </div>
                    <p style={styles.emptyDescription}>
                      {searchQuery ? "Try a different search term" : "Your created lessons will appear here"}
                    </p>
                  </div>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeader}>
                          <th style={{ ...styles.th, textAlign: "left" }}>Subject</th>
                          <th style={{ ...styles.th, textAlign: "left", display: isMobile ? "none" : "table-cell" }}>
                            Grade
                          </th>
                          <th style={{ ...styles.th, textAlign: "left", display: isMobile ? "none" : "table-cell" }}>
                            Class
                          </th>
                          <th style={{ ...styles.th, textAlign: "left", display: isMobile ? "none" : "table-cell" }}>
                            Teacher
                          </th>
                          <th style={{ ...styles.th, textAlign: "left", display: isMobile ? "none" : "table-cell" }}>
                            Date
                          </th>
                          <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLessons.map((lesson) => (
                          <tr key={lesson.dbId} style={styles.tableRow}>
                            <td style={styles.td}>
                              {lesson.administrativeDetails?.subject ||
                                lesson.guidingQuestion?.substring(0, 30) ||
                                "Lesson Plan"}
                            </td>
                            <td style={{ ...styles.td, display: isMobile ? "none" : "table-cell" }}>
                              {lesson.administrativeDetails?.grade || "N/A"}
                            </td>
                            <td style={{ ...styles.td, display: isMobile ? "none" : "table-cell" }}>
                              {lesson.administrativeDetails?.class || "N/A"}
                            </td>
                            <td style={{ ...styles.td, display: isMobile ? "none" : "table-cell" }}>
                              {lesson.administrativeDetails?.teacher || "N/A"}
                            </td>
                            <td style={{ ...styles.td, display: isMobile ? "none" : "table-cell" }}>
                              {lesson.savedDate}
                            </td>
                            <td style={styles.td}>
                              <div style={styles.actionButtonGroup}>
                                <button onClick={() => handleViewLesson(lesson)} style={styles.viewButtonSmall}>
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleDownload(lesson, "docx")}
                                  style={styles.downloadButtonSmall}
                                  disabled={isDownloading}
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )

  // ... other functions continue below ...

  function loadLessons() {
    // Implementation from original
  }

  function handleGenerate() {
    // Implementation from original
  }

  function handleSave() {
    // Implementation from original
  }

  function downloadAsDocx(lesson) {
    // Implementation from original
  }

  function downloadAsPdf(lesson) {
    // Implementation from original
  }

  function handleDownload(lesson, format) {
    // Implementation from original
  }

  function handleDelete(lesson) {
    // Implementation from original
  }

  function handleViewLesson(lesson) {
    // Implementation from original
  }

  function handleCreateNew() {
    // Implementation from original
  }

  function handleLogout() {
    // Implementation from original
  }

  function getGreeting() {
    // Implementation from original
  }

  function handleNavClick(tab) {
    // Implementation from original
  }

  function startEditing(field, value) {
    // Implementation from original
  }

  function cancelEditing() {
    // Implementation from original
  }

  function saveEdit(path) {
    // Implementation from original
  }

  function addLearningOutcome() {
    // Implementation from original
  }

  function deleteLearningOutcome(index) {
    // Implementation from original
  }

  function addDevelopmentStep() {
    // Implementation from original
  }

  function deleteDevelopmentStep(index) {
    // Implementation from original
  }
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
    "@media (maxWidth: 768px)": {
      width: "70%",
      maxWidth: "260px",
    },
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
    "@media (maxWidth: 768px)": {
      padding: "16px 16px 16px 56px",
      flexDirection: "column",
      alignItems: "flex-start",
    },
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
    "@media (maxWidth: 768px)": {
      fontSize: "20px",
    },
  },
  topBarRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    maxWidth: "400px",
    "@media (maxWidth: 768px)": {
      flex: 1,
      maxWidth: "100%",
    },
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
    "@media (maxWidth: 768px)": {
      padding: "20px 16px",
    },
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
    "@media (maxWidth: 768px)": {
      gridTemplateColumns: "1fr",
      gap: "16px",
    },
  },
  statCard: {
    borderRadius: "16px",
    padding: "28px",
    border: "none",
    position: "relative",
    overflow: "hidden",
    "@media (maxWidth: 768px)": {
      padding: "20px",
    },
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
    "@media (maxWidth: 768px)": {
      fontSize: "28px",
    },
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
    "@media (maxWidth: 768px)": {
      padding: "16px",
    },
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
    "@media (maxWidth: 768px)": {
      fontSize: "16px",
    },
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
    "@media (maxWidth: 768px)": {
      padding: "6px 12px",
      fontSize: "12px",
    },
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
    "@media (maxWidth: 768px)": {
      padding: "10px 8px",
      fontSize: "12px",
    },
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
    "@media (maxWidth: 768px)": {
      padding: "12px 8px",
      fontSize: "12px",
    },
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
    "@media (maxWidth: 768px)": {
      padding: "4px 8px",
      fontSize: "11px",
    },
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
    "@media (maxWidth: 768px)": {
      padding: "4px 8px",
      fontSize: "11px",
    },
  },
  deleteButtonSmall: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#ef4444",
    backgroundColor: "transparent",
    border: "1px solid #ef4444",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "@media (maxWidth: 768px)": {
      padding: "4px 8px",
      fontSize: "11px",
    },
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "32px",
    border: "1px solid #e0e0e0",
    "@media (maxWidth: 768px)": {
      padding: "20px 16px",
      borderRadius: "8px",
    },
  },
  formTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#000000",
    marginBottom: "28px",
    "@media (maxWidth: 768px)": {
      fontSize: "18px",
      marginBottom: "20px",
    },
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "28px",
    "@media (maxWidth: 768px)": {
      gridTemplateColumns: "1fr",
      gap: "16px",
    },
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
    "@media (maxWidth: 768px)": {
      fontSize: "12px",
    },
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
    "@media (maxWidth: 768px)": {
      height: "40px",
      fontSize: "12px",
      padding: "0 12px",
    },
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
    "@media (maxWidth: 768px)": {
      padding: "12px 24px",
      fontSize: "14px",
    },
  },
  documentContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "28px",
    border: "1px solid #e0e0e0",
    "@media (maxWidth: 768px)": {
      padding: "16px",
      borderRadius: "8px",
    },
  },
  actionBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "12px",
    flexWrap: "wrap",
    "@media (maxWidth: 768px)": {
      flexDirection: "column",
      gap: "8px",
    },
  },
  actionBarRight: {
    display: "flex",
    gap: "12px",
    "@media (maxWidth: 768px)": {
      width: "100%",
      flexDirection: "column",
      gap: "8px",
    },
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1976d2",
    backgroundColor: "#e3f2fd",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "@media (maxWidth: 768px)": {
      padding: "8px 12px",
      fontSize: "12px",
      width: "100%",
      justifyContent: "center",
    },
  },
  downloadButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#4caf50",
    backgroundColor: "#f1f8f4",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "@media (maxWidth: 768px)": {
      flex: 1,
      padding: "8px 12px",
      fontSize: "12px",
    },
  },
  pdfButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ff9800",
    backgroundColor: "#fff3e0",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "@media (maxWidth: 768px)": {
      flex: 1,
      padding: "8px 12px",
      fontSize: "12px",
    },
  },
  saveButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#1976d2",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "@media (maxWidth: 768px)": {
      flex: 1,
      padding: "8px 12px",
      fontSize: "12px",
    },
  },
  documentPage: {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    "@media (maxWidth: 768px)": {
      padding: "16px 12px",
    },
  },
  docHeader: {
    marginBottom: "24px",
    borderBottom: "2px solid #000000",
    paddingBottom: "16px",
  },
  docTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    "@media (maxWidth: 768px)": {
      fontSize: "18px",
    },
  },
  docDivider: {
    height: "2px",
    backgroundColor: "#e0e0e0",
    marginTop: "12px",
  },
  docTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "24px",
  },
  tableLabelCell: {
    padding: "12px",
    fontWeight: "600",
    backgroundColor: "#f5f5f5",
    borderBottom: "1px solid #e0e0e0",
    fontSize: "13px",
    "@media (maxWidth: 768px)": {
      padding: "8px",
      fontSize: "11px",
    },
  },
  tableValueCell: {
    padding: "12px",
    borderBottom: "1px solid #e0e0e0",
    fontSize: "13px",
    "@media (maxWidth: 768px)": {
      padding: "8px",
      fontSize: "11px",
    },
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
    flexWrap: "wrap",
  },
  subsection: {
    marginBottom: "20px",
    paddingLeft: "16px",
    borderLeft: "3px solid #1976d2",
  },
  subsectionTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#000000",
    marginBottom: "12px",
    "@media (maxWidth: 768px)": {
      fontSize: "13px",
    },
  },
  outcomeItem: {
    display: "flex",
    gap: "12px",
    marginBottom: "12px",
    padding: "12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
    "@media (maxWidth: 768px)": {
      flexDirection: "column",
      padding: "10px",
    },
  },
  outcomeNumber: {
    fontWeight: "700",
    minWidth: "30px",
    paddingTop: "2px",
  },
  outcomeContent: {
    flex: 1,
  },
  stepContainer: {
    padding: "16px",
    marginBottom: "12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    "@media (maxWidth: 768px)": {
      padding: "12px",
    },
  },
  stepHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  stepNumber: {
    fontWeight: "700",
    fontSize: "14px",
  },
  stepField: {
    marginBottom: "12px",
  },
  stepLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#000000",
    display: "block",
    marginBottom: "6px",
    "@media (maxWidth: 768px)": {
      fontSize: "11px",
    },
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#1976d2",
    backgroundColor: "#e3f2fd",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  deleteButton: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#ef4444",
    backgroundColor: "#ffebee",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  editableContainer: {
    position: "relative",
  },
  editableValue: {
    padding: "8px 12px",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
    minHeight: "32px",
    "@media (maxWidth: 768px)": {
      padding: "6px 10px",
      fontSize: "12px",
    },
  },
  editableText: {
    flex: 1,
    wordBreak: "break-word",
  },
  editIcon: {
    opacity: 0.5,
    transition: "opacity 0.2s ease",
  },
  editingWrapper: {
    display: "flex",
    gap: "6px",
    alignItems: "flex-start",
  },
  editInput: {
    flex: 1,
    padding: "6px 10px",
    borderRadius: "4px",
    border: "1px solid #1976d2",
    fontSize: "13px",
    fontFamily: "inherit",
  },
  editTextarea: {
    flex: 1,
    padding: "6px 10px",
    borderRadius: "4px",
    border: "1px solid #1976d2",
    fontSize: "13px",
    fontFamily: "inherit",
    minHeight: "80px",
    resize: "vertical",
    "@media (maxWidth: 768px)": {
      minHeight: "60px",
      fontSize: "12px",
    },
  },
  editButtonGroup: {
    display: "flex",
    gap: "4px",
  },
  saveEditBtn: {
    padding: "6px 8px",
    backgroundColor: "#4caf50",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
  },
  cancelEditBtn: {
    padding: "6px 8px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 20px",
  },
  emptyText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#000000",
    marginBottom: "8px",
    "@media (maxWidth: 768px)": {
      fontSize: "16px",
    },
  },
  emptyDescription: {
    fontSize: "14px",
    color: "#666666",
    margin: 0,
    "@media (maxWidth: 768px)": {
      fontSize: "12px",
    },
  },
}

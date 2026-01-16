import { jsPDF } from "jspdf"
import { saveAs } from "file-saver"
import { getBilingualFields } from "./bilingual"

export const normalizeToStringArray = (value) => {
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

export const toSentenceCase = (value) => {
  const s = String(value ?? "").trim()
  if (!s) return ""
  const lower = s.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

export const downloadAsPdf = async (lesson) => {
  try {
    const fields = getBilingualFields(lesson)
    const { isKiswahili, labels, data } = fields

    const subject = toSentenceCase(data.learningArea || "Untitled Lesson")
    const dateString = data.date || new Date().toISOString().split("T")[0]
    const safeSubject = String(subject).replace(/[^a-z0-9\- _]/gi, "").trim() || "Lesson Plan"
    const filename = `${safeSubject} - ${dateString}.pdf`

    const doc = new jsPDF({ unit: "pt", format: "a4" })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 48
    const maxWidth = pageWidth - margin * 2
    let y = margin

    const FONT_TITLE = 20
    const FONT_SECTION = 13
    const FONT_LABEL = 11
    const FONT_VALUE = 11
    const LINE_HEIGHT = 14
    const SECTION_GAP = 10

    const ensureSpace = (needed = 18) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
    }

    const addTitle = (text) => {
      const needed = 34
      ensureSpace(needed)
      doc.setFont("times", "bold")
      doc.setFontSize(FONT_TITLE)
      doc.text(String(text), pageWidth / 2, y, { align: "center" })
      y += 28
    }

    const addSection = (text) => {
      const needed = 32
      ensureSpace(needed)
      doc.setFont("times", "bold")
      doc.setFontSize(FONT_SECTION)
      doc.text(String(text).toUpperCase(), margin, y)
      y += 16
      doc.setDrawColor(0)
      y += SECTION_GAP
    }

    const addKeyValue = (label, value) => {
      const labelText = `${label}: `

      doc.setFont("times", "bold")
      doc.setFontSize(FONT_LABEL)
      const labelWidth = doc.getTextWidth(labelText)

      doc.setFont("times", "normal")
      doc.setFontSize(FONT_VALUE)
      const valueLines = doc.splitTextToSize(String(value ?? "N/A"), Math.max(10, maxWidth - labelWidth))
      const needed = valueLines.length * LINE_HEIGHT + 8

      ensureSpace(needed)

      doc.setFont("times", "bold")
      doc.setFontSize(FONT_LABEL)
      doc.text(labelText, margin, y)

      doc.setFont("times", "normal")
      doc.setFontSize(FONT_VALUE)
      doc.text(valueLines, margin + labelWidth, y)
      y += valueLines.length * LINE_HEIGHT + 8
    }

    const addParagraph = (text) => {
      doc.setFont("times", "normal")
      doc.setFontSize(FONT_VALUE)
      const lines = doc.splitTextToSize(String(text ?? "N/A"), maxWidth)
      const needed = lines.length * LINE_HEIGHT + 8
      ensureSpace(needed)
      doc.text(lines, margin, y)
      y += lines.length * LINE_HEIGHT + 8
    }

    const addList = (items, numbered = false) => {
      if (!Array.isArray(items) || items.length === 0) {
        addParagraph("N/A")
        return
      }
      
      items.forEach((item, index) => {
        const prefix = numbered ? `${index + 1}) ` : "• "
        const text = typeof item === "string" ? item : item?.text || item?.outcome || String(item)
        doc.setFont("times", "normal")
        doc.setFontSize(FONT_VALUE)
        const lines = doc.splitTextToSize(`${prefix}${text}`, maxWidth - 20)
        const needed = lines.length * LINE_HEIGHT + 4
        ensureSpace(needed)
        doc.text(lines, margin + (numbered ? 0 : 10), y)
        y += lines.length * LINE_HEIGHT + 4
      })
    }

    // Title
    addTitle(isKiswahili ? "MPANGO WA SOMO" : "LESSON PLAN")

    // Basic Information
    addSection(isKiswahili ? "TAARIFA ZA MSINGI" : "BASIC INFORMATION")
    addKeyValue(labels.school, data.school)
    addKeyValue(labels.learningArea, data.learningArea)
    addKeyValue(labels.grade, data.grade)
    addKeyValue(labels.date, data.date)
    addKeyValue(labels.time, data.time)
    
    const rollData = data.roll || {}
    addKeyValue(
      labels.roll,
      `${labels.boys}: ${rollData.boys || 0}, ${labels.girls}: ${rollData.girls || 0}, ${labels.total}: ${rollData.total || 0}`
    )

    // Strand and Sub-strand
    addSection(labels.strand)
    addParagraph(data.strand)

    addSection(labels.subStrand)
    addParagraph(data.subStrand)

    // Lesson Title
    addSection(labels.lessonTitle)
    addParagraph(data.lessonTitle)

    // Specific Learning Outcomes
    addSection(labels.specificLearningOutcomes)
    const outcomesData = data.specificLearningOutcomes || {}
    addParagraph(outcomesData.statement || labels.outcomeStatement)
    
    const outcomes = outcomesData.outcomes || []
    if (outcomes.length > 0) {
      outcomes.forEach((outcome, index) => {
        const id = outcome.id || String.fromCharCode(97 + index)
        const text = outcome.outcome || outcome.text || String(outcome)
        addParagraph(`${id}) ${text}`)
      })
    } else {
      addParagraph("N/A")
    }

    // Key Inquiry Questions
    addSection(labels.keyInquiryQuestions)
    addList(data.keyInquiryQuestions, true)

    // Core Competencies
    addSection(labels.coreCompetencies)
    addList(data.coreCompetencies, false)

    // Link to Values
    addSection(labels.linkToValues)
    addList(data.linkToValues, false)

    // Links to PCI
    addSection(labels.linksToPCI)
    addList(data.linksToPCI, false)

    // Learning Resources
    addSection(labels.learningResources)
    addList(data.learningResources, false)

    // Suggested Learning Experiences
    addSection(labels.suggestedLearningExperiences)
    
    const experiences = data.suggestedLearningExperiences || {}

    // i) Introduction
    addKeyValue(`i) ${labels.introduction}`, experiences.introduction || "N/A")

    // ii) Exploration/Development
    addSection(`ii) ${labels.exploration}`)
    const explorationSteps = experiences.exploration || []
    if (Array.isArray(explorationSteps) && explorationSteps.length > 0) {
      explorationSteps.forEach((step, index) => {
        const stepText = typeof step === "string" ? step : step?.description || step?.text || String(step)
        addParagraph(`${labels.step} ${index + 1}: ${stepText}`)
      })
    } else {
      addParagraph("N/A")
    }

    // iii) Reflection
    addKeyValue(`iii) ${labels.reflection}`, experiences.reflection || "N/A")

    // iv) Extension
    addKeyValue(`iv) ${labels.extension}`, experiences.extension || "N/A")

    // Parental Involvement
    addSection(labels.parentalInvolvement)
    addParagraph(data.parentalInvolvement)

    // Self Evaluation
    addSection(labels.selfEvaluation)
    addParagraph(data.selfEvaluation)

    // Generate and save PDF
    const blob = doc.output("blob")
    const file = new File([blob], filename, { type: "application/pdf" })

    try {
      saveAs(blob, filename)
    } catch (e) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    }

    return { success: true }
  } catch (error) {
    console.error("PDF generation error:", error)
    return { success: false, error: error.message }
  }
}
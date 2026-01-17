/*import { jsPDF } from "jspdf"
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
} */

  import { jsPDF } from "jspdf"
import { getBilingualFields } from "./bilingual"

/**
 * Download lesson plan as PDF with traditional formatting
 */
export async function downloadAsPdf(lessonPlan) {
  try {
    const fields = getBilingualFields(lessonPlan)
    const { isKiswahili, labels, data } = fields
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    let y = 20
    const margin = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const contentWidth = pageWidth - (2 * margin)
    
    // Set default font to Times (closest to traditional document style)
    doc.setFont("times", "normal")
    
    // Helper to check if we need a new page
    const checkNewPage = (spaceNeeded = 10) => {
      if (y + spaceNeeded > pageHeight - 20) {
        doc.addPage()
        y = 20
        return true
      }
      return false
    }
    
    // Helper to add text with auto-wrap
    const addText = (text, fontSize = 11, isBold = false, indent = 0) => {
      if (!text) return
      
      checkNewPage()
      doc.setFontSize(fontSize)
      doc.setFont("times", isBold ? 'bold' : 'normal')
      
      const effectiveWidth = contentWidth - indent
      const lines = doc.splitTextToSize(text, effectiveWidth)
      
      lines.forEach((line) => {
        checkNewPage()
        doc.text(line, margin + indent, y)
        y += 5 // Fixed line spacing
      })
      y += 1 // Small gap after text block
    }
    
    // Helper for section headers (bold, larger)
    const addSectionHeader = (title, fontSize = 11) => {
      checkNewPage(8)
      y += 2 // Space before section
      doc.setFontSize(fontSize)
      doc.setFont("times", "bold")
      doc.text(title, margin, y)
      y += 6 // Space after header
    }
    
    // Helper for inline bold labels
    const addLabelValue = (label, value, fontSize = 11) => {
      checkNewPage()
      doc.setFontSize(fontSize)
      
      // Bold label
      doc.setFont("times", "bold")
      const labelWidth = doc.getTextWidth(label)
      doc.text(label, margin, y)
      
      // Normal value
      doc.setFont("times", "normal")
      doc.text(value, margin + labelWidth, y)
      y += 5
    }
    
    // ============ MAIN TITLE ============
    doc.setFontSize(14)
    doc.setFont("times", "bold")
    const mainTitle = `${data.grade?.toUpperCase() || 'GRADE 10'} ${data.learningArea?.toUpperCase() || 'HOME SCIENCE'} LESSON PLANS TERM 1`
    doc.text(mainTitle, margin, y)
    y += 8
    
    doc.setFontSize(12)
    doc.text('WEEK 1: LESSON 1', margin, y)
    y += 10
    
    // ============ INFORMATION TABLE ============
    const tableHeaders = ['SCHOOL', 'LEVEL', 'LEARNING AREA', 'DATE', 'TIME', 'ROLL']
    const tableValues = [
      data.school || '',
      data.grade || 'GRADE 10',
      data.learningArea || 'HOME SCIENCE',
      data.date || '',
      data.time || '',
      `B: ${data.roll?.boys || 0} G: ${data.roll?.girls || 0} T: ${data.roll?.total || 0}`
    ]
    
    // Calculate column widths
    const tableWidth = contentWidth
    const colWidth = tableWidth / 6
    
    // Draw table
    doc.setLineWidth(0.3)
    doc.setFont("times", "bold")
    doc.setFontSize(9)
    
    // Header row
    const tableY = y
    doc.rect(margin, tableY, tableWidth, 7) // Outer border
    
    // Draw column dividers and headers
    for (let i = 0; i < tableHeaders.length; i++) {
      const x = margin + (i * colWidth)
      if (i > 0) {
        doc.line(x, tableY, x, tableY + 14) // Column divider
      }
      doc.text(tableHeaders[i], x + 2, tableY + 5)
    }
    
    // Divider between header and data
    doc.line(margin, tableY + 7, margin + tableWidth, tableY + 7)
    
    // Data row
    doc.setFont("times", "normal")
    for (let i = 0; i < tableValues.length; i++) {
      const x = margin + (i * colWidth)
      doc.text(tableValues[i], x + 2, tableY + 12)
    }
    
    // Bottom border
    doc.rect(margin, tableY, tableWidth, 14)
    
    y = tableY + 20
    
    // ============ STRAND ============
    addSectionHeader(`${labels.strand}: ${data.strand || 'Foods and Nutrition'}`)
    y += 1
    
    // ============ SUB-STRAND ============
    addSectionHeader(`${labels.subStrand}: ${data.subStrand || 'Overview of Foods and Nutrition'}`)
    y += 2
    
    // ============ SPECIFIC LEARNING OUTCOMES ============
    addSectionHeader(labels.specificLearningOutcomes + ':')
    addText(data.specificLearningOutcomes?.statement || 'By the end of the lesson, learners should be able to:', 11, false)
    
    const outcomes = data.specificLearningOutcomes?.outcomes || []
    outcomes.forEach((outcome, i) => {
      const outcomeText = outcome.outcome || outcome.text || 'N/A'
      addText(`- ${outcomeText}`, 11, false)
    })
    y += 2
    
    // ============ KEY INQUIRY QUESTIONS ============
    addSectionHeader(labels.keyInquiryQuestions + ':')
    const questions = data.keyInquiryQuestions || []
    if (questions.length === 0) {
      addText('- N/A', 11, false)
    } else {
      questions.forEach((q) => {
        addText(`- ${q}`, 11, false)
      })
    }
    y += 2
    
    // ============ LEARNING RESOURCES ============
    addSectionHeader(labels.learningResources + ':')
    const resources = Array.isArray(data.learningResources) 
      ? data.learningResources 
      : (typeof data.learningResources === 'string' ? data.learningResources.split(',') : [])
    
    if (resources.length === 0 || !resources.some(r => r?.trim())) {
      addText('- N/A', 11, false)
    } else {
      resources.forEach(r => {
        if (r?.trim()) addText(`- ${r.trim()}`, 11, false)
      })
    }
    y += 2
    
    // ============ CORE COMPETENCIES ============
    addSectionHeader(labels.coreCompetencies + ':')
    const competencies = data.coreCompetencies || []
    if (competencies.length === 0) {
      addText('- N/A', 11, false)
    } else {
      competencies.forEach(c => {
        addText(`- ${c}`, 11, false)
      })
    }
    y += 2
    
    // ============ LINK TO VALUES ============
    addSectionHeader(labels.linkToValues + ':')
    const values = data.linkToValues || []
    if (values.length === 0) {
      addText('- N/A', 11, false)
    } else {
      values.forEach(v => {
        addText(`- ${v}`, 11, false)
      })
    }
    y += 2
    
    // ============ LINKS TO PCI ============
    addSectionHeader(labels.linksToPCI + ':')
    const pcis = data.linksToPCI || []
    if (pcis.length === 0) {
      addText('- N/A', 11, false)
    } else {
      pcis.forEach(p => {
        addText(`- ${p}`, 11, false)
      })
    }
    y += 2
    
    // ============ ORGANISATION OF LEARNING ============
    addSectionHeader('Organisation of Learning:')
    
    // Introduction
    addSectionHeader('Introduction (5 minutes)', 11)
    addText(data.suggestedLearningExperiences?.introduction || 'Greet the students warmly and introduce the lesson.', 11, false)
    y += 2
    
    // Lesson Development
    addSectionHeader('Lesson Development (30 minutes)', 11)
    y += 1
    
    // Exploration steps
    const exploration = data.suggestedLearningExperiences?.exploration || []
    const getExplorationText = (step) => {
      if (step == null) return ""
      if (typeof step === 'string') return step
      if (typeof step !== 'object') return String(step)
      return (
        step.description ||
        step.text ||
        step.activity ||
        step.content ||
        step.task ||
        step.teacherActivity ||
        step.learnerActivity ||
        ""
      )
    }

    const normalizedExploration = Array.isArray(exploration) ? exploration : [exploration]
    const usableSteps = normalizedExploration
      .map((step, i) => ({
        step,
        index: i,
        text: String(getExplorationText(step) ?? "").trim(),
      }))
      .filter((s) => s.text.length > 0)

    if (usableSteps.length === 0) {
      addText('- N/A', 11, false)
    } else {
      usableSteps.forEach(({ step, index, text }, i) => {
        const title = typeof step === 'object' && step ? step.title : null
        const duration = typeof step === 'object' && step ? step.duration : null
        addSectionHeader(`Step ${i + 1}: ${title || `Activity ${i + 1}`} (${duration || '10 minutes'})`, 11)
        addText(text, 11, false)
        y += 1
      })
    }
    
    // Reflection
    addSectionHeader('Reflection (5 minutes)', 11)
    addText(
      String(data.suggestedLearningExperiences?.reflection ?? '').trim() || '- N/A',
      11,
      false
    )
    y += 2
    
    // Extension
    addSectionHeader('Extension Activities', 11)
    addText(
      String(data.suggestedLearningExperiences?.extension ?? '').trim() || '- N/A',
      11,
      false
    )
    y += 2

    // Conclusion
    addSectionHeader('Conclusion (5 minutes)', 11)
    addText(
      String(data.suggestedLearningExperiences?.conclusion ?? '').trim() || '- N/A',
      11,
      false
    )
    y += 2
    
    // ============ PARENTAL INVOLVEMENT ============
    if (data.parentalInvolvement) {
      addSectionHeader(labels.parentalInvolvement + ':')
      addText(data.parentalInvolvement, 11, false)
      y += 2
    }
    
    // ============ ASSESSMENT ============
    if (data.assessment) {
      addSectionHeader('Assessment:')
      addText(data.assessment, 11, false)
      y += 2
    }
    
    // ============ SELF EVALUATION ============
    if (data.selfEvaluation) {
      addSectionHeader(labels.selfEvaluation + ':')
      addText(data.selfEvaluation, 11, false)
    }
    
    // Generate filename
    const fileName = `${data.learningArea || 'Lesson'}_Grade${data.grade || 'X'}_${data.date || 'plan'}.pdf`
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_.-]/g, '')
    
    // Save the PDF
    doc.save(fileName)
    
    return { success: true }
  } catch (error) {
    console.error('PDF generation error:', error)
    return { success: false, error: error.message }
  }
}
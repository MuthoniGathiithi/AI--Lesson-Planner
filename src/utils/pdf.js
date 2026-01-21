import * as jsPDFModule from "jspdf"
import { getBilingualFields } from "./bilingual"

/**
 * Download lesson plan as PDF with exact formatting matching structure requirements
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

    // Helper to check if we need a new page
    const checkNewPage = (spaceNeeded = 10) => {
      if (y + spaceNeeded > pageHeight - 20) {
        doc.addPage()
        y = 20
        return true
      }
      return false
    }

    // Helper to add normal text (NOT bolded)
    const addText = (text, fontSize = 11, indent = 0) => {
      if (!text) return
      checkNewPage()
      doc.setFontSize(fontSize)
      doc.setFont("times", "normal")
      const effectiveWidth = contentWidth - indent
      const lines = doc.splitTextToSize(text, effectiveWidth)
      lines.forEach((line) => {
        checkNewPage()
        doc.text(line, margin + indent, y)
        y += 5
      })
      y += 1
    }

    // Helper for BOLDED section headers ONLY
    const addBoldHeader = (title, fontSize = 11) => {
      checkNewPage(8)
      y += 2
      doc.setFontSize(fontSize)
      doc.setFont("times", "bold")
      doc.text(title, margin, y)
      y += 6
    }

    // Helper for NON-BOLDED labels (like STRAND, SUB-STRAND)
    const addNormalLabel = (title, fontSize = 11) => {
      checkNewPage(8)
      y += 2
      doc.setFontSize(fontSize)
      doc.setFont("times", "normal")
      doc.text(title, margin, y)
      y += 6
    }

    // ============ MAIN TITLE (CENTERED) ============
    doc.setFontSize(12)
    doc.setFont("times", "bold")
    const mainTitle = `${data.grade || '10'} ${(data.learningArea || 'GEOGRAPHY').toUpperCase()} LESSON PLAN`
    const titleWidth = doc.getTextWidth(mainTitle)
    const titleX = (pageWidth - titleWidth) / 2
    doc.text(mainTitle, titleX, y)
    y += 8

    // Week/Lesson (CENTERED)
    const weekLesson = data.weekLesson || 'WEEK 1: LESSON 1'
    const weekWidth = doc.getTextWidth(weekLesson)
    const weekX = (pageWidth - weekWidth) / 2
    doc.text(weekLesson, weekX, y)
    y += 10

    // ============ INFORMATION TABLE ============
    const tableHeaders = ['SCHOOL', 'LEARNING AREA', 'GRADE', 'DATE', 'TIME', 'ROLL']
    const tableValues = [
      data.school || '',
      data.learningArea || 'Geography',
      data.grade || '10',
      data.date || '',
      data.time || '',
      `Boys: ${data.roll?.boys || 0} Girls: ${data.roll?.girls || 0} Total: ${data.roll?.total || 0}`
    ]

    const tableWidth = contentWidth
    const colWidths = [30, 34, 16, 20, 25, 35]
    const rowHeight = 8

    doc.setLineWidth(0.3)
    doc.setFont("times", "bold")
    doc.setFontSize(10)

    const tableY = y
    doc.rect(margin, tableY, tableWidth, rowHeight * 2)

    let currentX = margin
    for (let i = 0; i < tableHeaders.length; i++) {
      if (i > 0) {
        doc.line(currentX, tableY, currentX, tableY + rowHeight * 2)
      }
      doc.text(tableHeaders[i], currentX + 2, tableY + 5.5)
      currentX += colWidths[i]
    }

    doc.line(margin, tableY + rowHeight, margin + tableWidth, tableY + rowHeight)

    doc.setFont("times", "normal")
    currentX = margin
    for (let i = 0; i < tableValues.length; i++) {
      doc.text(tableValues[i], currentX + 2, tableY + rowHeight + 5.5)
      currentX += colWidths[i]
    }

    y = tableY + (rowHeight * 2) + 8

    addNormalLabel(`STRAND: ${data.strand || 'Soil'}`)
    addNormalLabel(`SUB-STRAND: ${data.subStrand || 'Types of soil'}`)
    y += 2

    addBoldHeader('SPECIFIC LEARNING OUTCOMES:')
    addText(data.specificLearningOutcomes?.statement || 'By the end of this lesson, the learner should be able to:', 11, 0)

    const outcomes = data.specificLearningOutcomes?.outcomes || []
    outcomes.forEach((outcome, i) => {
      const outcomeText = outcome.outcome || outcome.text || 'N/A'
      const letter = outcome.id || String.fromCharCode(97 + i)
      checkNewPage()
      doc.setFontSize(11)
      doc.setFont("times", "bold")
      const letterText = `${letter})`
      const letterWidth = doc.getTextWidth(letterText)
      doc.text(letterText, margin, y)
      doc.setFont("times", "normal")
      doc.text(` ${outcomeText}`, margin + letterWidth, y)
      y += 5
    })

    y += 3

    addBoldHeader('KEY INQUIRY QUESTIONS:')
    const questions = data.keyInquiryQuestions || []
    if (questions.length === 0) {
      addText('N/A', 11, 0)
    } else {
      questions.forEach((q, i) => {
        checkNewPage()
        doc.setFontSize(11)
        doc.setFont("times", "bold")
        const numberText = `${i + 1})`
        const numberWidth = doc.getTextWidth(numberText)
        doc.text(numberText, margin, y)
        doc.setFont("times", "normal")
        doc.text(` ${q}`, margin + numberWidth, y)
        y += 5
      })
    }

    y += 2

    addBoldHeader('CORE COMPETENCIES TO BE DEVELOPED:')
    const competencies = data.coreCompetencies || []
    if (competencies.length === 0) {
      addText('N/A', 11, 0)
    } else {
      competencies.forEach(c => addText(`• ${c}`, 11, 0))
    }

    y += 2

    addBoldHeader('LINK TO VALUES:')
    const values = data.linkToValues || []
    if (values.length === 0) {
      addText('N/A', 11, 0)
    } else {
      values.forEach(v => addText(`• ${v}`, 11, 0))
    }

    y += 2

    addBoldHeader('LINKS TO PERTINENT AND CONTEMPORARY ISSUES (PCI):')
    const pcis = data.linksToPCI || []
    if (pcis.length === 0) {
      addText('N/A', 11, 0)
    } else {
      pcis.forEach(p => addText(`• ${p}`, 11, 0))
    }

    y += 2

    addBoldHeader('LEARNING RESOURCES:')
    const resources = Array.isArray(data.learningResources)
      ? data.learningResources
      : (typeof data.learningResources === 'string' ? data.learningResources.split(',') : [])

    if (resources.length === 0 || !resources.some(r => r?.trim())) {
      addText('N/A', 11, 0)
    } else {
      const resourceText = resources.filter(r => r?.trim()).map(r => r.trim()).join(', ')
      addText(resourceText, 11, 0)
    }

    y += 2

    addBoldHeader('SUGGESTED LEARNING EXPERIENCES:')
    const indent = 5

    if (data.suggestedLearningExperiences?.introduction) {
      checkNewPage()
      doc.setFontSize(11)
      doc.setFont("times", "normal")
      doc.text('i) Introduction/Getting Started (5 mins)', margin + indent, y)
      y += 6
      addText(data.suggestedLearningExperiences.introduction, 11, indent)
      y += 2
    }

    const exploration = data.suggestedLearningExperiences?.exploration || []
    if (exploration.length > 0) {
      checkNewPage()
      doc.setFontSize(11)
      doc.setFont("times", "normal")
      doc.text('ii) Exploration/Lesson Development (35 mins)', margin + indent, y)
      y += 6

      exploration.forEach((stepObj, i) => {
        let stepText = ''
        if (typeof stepObj === 'string') {
          stepText = stepObj
        } else if (typeof stepObj === 'object' && stepObj !== null) {
          const stepKey = `Step ${i + 1}`
          stepText = stepObj[stepKey] || stepObj.step || stepObj.description || stepObj.text || stepObj.activity || stepObj.content || ''
        }

        if (stepText.trim()) {
          checkNewPage()
          doc.setFontSize(11)
          doc.setFont("times", "normal")
          doc.text(i === 0 ? `Step: ${i + 1}` : `${i + 1}`, margin + indent, y)
          y += 6
          addText(stepText, 11, indent)
          y += 1
        }
      })
      y += 1
    }

    if (data.suggestedLearningExperiences?.reflection) {
      checkNewPage()
      doc.setFontSize(11)
      doc.setFont("times", "normal")
      doc.text('iii) Reflection', margin + indent, y)
      y += 6
      addText(data.suggestedLearningExperiences.reflection, 11, indent)
      y += 2
    }

    if (data.suggestedLearningExperiences?.extension) {
      checkNewPage()
      doc.setFontSize(11)
      doc.setFont("times", "normal")
      doc.text('iv) Extension', margin + indent, y)
      y += 6
      addText(data.suggestedLearningExperiences.extension, 11, indent)
      y += 2
    }

    const conclusionText =
      data.suggestedLearningExperiences?.conclusion ||
      data.suggestedLearningExperiences?.closure ||
      data.suggestedLearningExperiences?.plenary ||
      data.suggestedLearningExperiences?.summary || ''

    if (conclusionText) {
      checkNewPage()
      doc.setFontSize(11)
      doc.setFont("times", "normal")
      doc.text('v) Conclusion (5 mins)', margin + indent, y)
      y += 6
      addText(conclusionText, 11, indent)
      y += 2
    }

    if (data.parentalInvolvement) {
      addBoldHeader('SUGGESTED PARENTAL INVOLVEMENT/COMMUNITY SERVICE LEARNING:')
      addText(data.parentalInvolvement, 11, 0)
      y += 2
    }

    if (data.assessment) {
      addBoldHeader('ASSESSMENT:')
      addText(data.assessment, 11, 0)
      y += 2
    }

    if (data.selfEvaluation) {
      addBoldHeader('SELF-EVALUATION MARKS:')
      addText(data.selfEvaluation, 11, 0)
    }

    const fileName = `${data.learningArea || 'Lesson'}_Grade${data.grade || 'X'}_${data.date || 'plan'}.pdf`
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_.-]/g, '')

    doc.save(fileName)
    return { success: true }

  } catch (error) {
    console.error('PDF generation error:', error)
    return { success: false, error: error.message }
  }
}

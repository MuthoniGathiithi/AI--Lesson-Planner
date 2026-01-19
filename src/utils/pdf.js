/*import { jsPDF } from "jspdf"
import { getBilingualFields } from "./bilingual"


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
    




// ========== NEW EXPLORATION CODE (FIXED FOR ALL FORMATS) ==========
const exploration = data.suggestedLearningExperiences?.exploration || []

if (!Array.isArray(exploration) || exploration.length === 0) {
  addText('- N/A', 11, false)
} else {
  exploration.forEach((stepObj, i) => {
    let stepText = ''
    
    // Handle different formats
    if (typeof stepObj === 'string') {
      stepText = stepObj
    } else if (typeof stepObj === 'object' && stepObj !== null) {
      // Check for "Step 1", "Step 2", etc. keys
      const stepKey = `Step ${i + 1}`
      if (stepObj[stepKey]) {
        stepText = stepObj[stepKey]
      } else {
        // Fallback to other possible fields
        stepText = stepObj.step || stepObj.description || stepObj.text || 
                   stepObj.activity || stepObj.content || ''
      }
    }
    
    if (stepText.trim()) {
      const title = (typeof stepObj === 'object' && stepObj?.title) ? stepObj.title : `Activity ${i + 1}`
      const duration = (typeof stepObj === 'object' && stepObj?.duration) ? stepObj.duration : '10 minutes'
      
     addSectionHeader(`Step ${i + 1}: ${title} (${duration})`, 11)
      addText(stepText, 11, false)
      y += 1
    }
  })
}

    
    // Reflection
    if (data.suggestedLearningExperiences?.reflection) {
      addSectionHeader('Reflection (5 minutes)', 11)
      addText(data.suggestedLearningExperiences.reflection, 11, false)
      y += 2
    }
    
    // Extension
    if (data.suggestedLearningExperiences?.extension) {
      addSectionHeader('Extension Activities', 11)
      addText(data.suggestedLearningExperiences.extension, 11, false)
      y += 2
    }

  

    // ========== NEW CONCLUSION CODE (FIXED) ==========
    addSectionHeader('Conclusion (5 minutes)', 11)
    const conclusionText = data.suggestedLearningExperiences?.conclusion || 
                           data.suggestedLearningExperiences?.closure || 
                           data.suggestedLearningExperiences?.plenary || 
                           data.suggestedLearningExperiences?.summary || 
                           'N/A'
    addText(conclusionText, 11, false)
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
}*/



/*
import { jsPDF } from "jspdf"
import { getBilingualFields } from "./bilingual"

/**
 * Download lesson plan as PDF with traditional formatting
 */
import { jsPDF } from "jspdf"
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
    const mainTitle = `${data.grade || '10'} ${(data.learningArea || 'GEOGRAPHY').toUpperCase()} LESSON PLANS TERM 1`
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
    
    // ============ INFORMATION TABLE (6 COLUMNS: SCHOOL, LEARNING AREA, GRADE, DATE, TIME, ROLL) ============
    const tableHeaders = ['SCHOOL', 'LEARNING AREA', 'GRADE', 'DATE', 'TIME', 'ROLL']
    const tableValues = [
      data.school || '',
      data.learningArea || 'Geography',
      data.grade || '10',
      data.date || '',
      data.time || '',
      `B: ${data.roll?.boys || 0} G: ${data.roll?.girls || 0} T: ${data.roll?.total || 0}`
    ]
    
    // Calculate column widths - adjust for better fit
    const tableWidth = contentWidth
    const colWidths = [30, 35, 15, 20, 25, 35] // Total = 160mm
    const rowHeight = 8
    
    // Draw table
    doc.setLineWidth(0.3)
    doc.setFont("times", "bold") // BOLD for headers
    doc.setFontSize(10)
    
    const tableY = y
    
    // Draw outer border
    doc.rect(margin, tableY, tableWidth, rowHeight * 2)
    
    // Draw headers and vertical lines
    let currentX = margin
    for (let i = 0; i < tableHeaders.length; i++) {
      // Draw vertical line (except for first column)
      if (i > 0) {
        doc.line(currentX, tableY, currentX, tableY + rowHeight * 2)
      }
      
      // Draw header text
      doc.text(tableHeaders[i], currentX + 2, tableY + 5.5)
      currentX += colWidths[i]
    }
    
    // Draw horizontal line between header and data
    doc.line(margin, tableY + rowHeight, margin + tableWidth, tableY + rowHeight)
    
    // Draw data row (normal font)
    doc.setFont("times", "normal")
    currentX = margin
    for (let i = 0; i < tableValues.length; i++) {
      doc.text(tableValues[i], currentX + 2, tableY + rowHeight + 5.5)
      currentX += colWidths[i]
    }
    
    y = tableY + (rowHeight * 2) + 8
    
    // ============ STRAND (NOT BOLDED) ============
    addNormalLabel(`STRAND: ${data.strand || 'Soil'}`)
    
    // ============ SUB-STRAND (NOT BOLDED) ============
    addNormalLabel(`SUB-STRAND: ${data.subStrand || 'Types of soil'}`)
    y += 2
    
    // ============ SPECIFIC LEARNING OUTCOMES (BOLDED TITLE) ============
    addBoldHeader('SPECIFIC LEARNING OUTCOMES:')
    addText(data.specificLearningOutcomes?.statement || 'By the end of this lesson, the learner should be able to:', 11, 0)
    
    const outcomes = data.specificLearningOutcomes?.outcomes || []
    outcomes.forEach((outcome, i) => {
      const outcomeText = outcome.outcome || outcome.text || 'N/A'
      const letter = outcome.id || String.fromCharCode(97 + i)
      
      checkNewPage()
      doc.setFontSize(11)
      
      // Bold the letter
      doc.setFont("times", "bold")
      const letterText = `${letter})`
      const letterWidth = doc.getTextWidth(letterText)
      doc.text(letterText, margin, y)
      
      // Normal text for outcome
      doc.setFont("times", "normal")
      doc.text(` ${outcomeText}`, margin + letterWidth, y)
      y += 5
    })
    y += 3
    
    // ============ KEY INQUIRY QUESTIONS (BOLDED TITLE) ============
    addBoldHeader('KEY INQUIRY QUESTIONS:')
    const questions = data.keyInquiryQuestions || []
    if (questions.length === 0) {
      addText('N/A', 11, 0)
    } else {
      questions.forEach((q, i) => {
        checkNewPage()
        doc.setFontSize(11)
        
        // Bold the number
        doc.setFont("times", "bold")
        const numberText = `${i + 1})`
        const numberWidth = doc.getTextWidth(numberText)
        doc.text(numberText, margin, y)
        
        // Normal text for question
        doc.setFont("times", "normal")
        doc.text(` ${q}`, margin + numberWidth, y)
        y += 5
      })
    }
    y += 2
    
    // ============ CORE COMPETENCIES (BOLDED TITLE) ============
    addBoldHeader('CORE COMPETENCIES TO BE DEVELOPED:')
    const competencies = data.coreCompetencies || []
    if (competencies.length === 0) {
      addText('N/A', 11, 0)
    } else {
      competencies.forEach(c => {
        addText(`• ${c}`, 11, 0)
      })
    }
    y += 2
    
    // ============ LINK TO VALUES (BOLDED TITLE) ============
    addBoldHeader('LINK TO VALUES:')
    const values = data.linkToValues || []
    if (values.length === 0) {
      addText('N/A', 11, 0)
    } else {
      values.forEach(v => {
        addText(`• ${v}`, 11, 0)
      })
    }
    y += 2
    
    // ============ LINKS TO PCI (BOLDED TITLE) ============
    addBoldHeader('LINKS TO PERTINENT AND CONTEMPORARY ISSUES (PCI):')
    const pcis = data.linksToPCI || []
    if (pcis.length === 0) {
      addText('N/A', 11, 0)
    } else {
      pcis.forEach(p => {
        addText(`• ${p}`, 11, 0)
      })
    }
    y += 2
    
    // ============ LEARNING RESOURCES (BOLDED TITLE) ============
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
    
    // ============ SUGGESTED LEARNING EXPERIENCES (BOLDED TITLE) ============
    addBoldHeader('SUGGESTED LEARNING EXPERIENCES:')
    
    const indent = 5 // Indent for roman numerals
    
    // i) Introduction (NOT bolded sub-section label)
    if (data.suggestedLearningExperiences?.introduction) {
      checkNewPage()
      doc.setFontSize(11)
      doc.setFont("times", "normal")
      doc.text('i) Introduction/Getting Started (5 mins)', margin + indent, y)
      y += 6
      addText(data.suggestedLearningExperiences.introduction, 11, indent)
      y += 2
    }
    
    // ii) Exploration (NOT bolded sub-section label)
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
          if (stepObj[stepKey]) {
            stepText = stepObj[stepKey]
          } else {
            stepText = stepObj.step || stepObj.description || stepObj.text || 
                       stepObj.activity || stepObj.content || ''
          }
        }
        
        if (stepText.trim()) {
          // First step uses "Step: 1", subsequent ones just show the number
          if (i === 0) {
            checkNewPage()
            doc.setFontSize(11)
            doc.setFont("times", "normal")
            doc.text(`Step: ${i + 1}`, margin + indent, y)
            y += 6
          } else {
            checkNewPage()
            doc.setFontSize(11)
            doc.setFont("times", "normal")
            doc.text(`${i + 1}`, margin + indent, y)
            y += 6
          }
          addText(stepText, 11, indent)
          y += 1
        }
      })
      y += 1
    }
    
    // iii) Reflection (NOT bolded sub-section label)
    if (data.suggestedLearningExperiences?.reflection) {
      checkNewPage()
      doc.setFontSize(11)
      doc.setFont("times", "normal")
      doc.text('iii) Reflection', margin + indent, y)
      y += 6
      addText(data.suggestedLearningExperiences.reflection, 11, indent)
      y += 2
    }
    
    // iv) Extension (NOT bolded sub-section label)
    if (data.suggestedLearningExperiences?.extension) {
      checkNewPage()
      doc.setFontSize(11)
      doc.setFont("times", "normal")
      doc.text('iv) Extension', margin + indent, y)
      y += 6
      addText(data.suggestedLearningExperiences.extension, 11, indent)
      y += 2
    }
    
    // v) Conclusion (NOT bolded sub-section label)
    const conclusionText = data.suggestedLearningExperiences?.conclusion || 
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
    
    // ============ PARENTAL INVOLVEMENT (BOLDED TITLE) ============
    if (data.parentalInvolvement) {
      addBoldHeader('SUGGESTED PARENTAL INVOLVEMENT/COMMUNITY SERVICE LEARNING:')
      addText(data.parentalInvolvement, 11, 0)
      y += 2
    }
    
    // ============ ASSESSMENT (BOLDED TITLE if present) ============
    if (data.assessment) {
      addBoldHeader('ASSESSMENT:')
      addText(data.assessment, 11, 0)
      y += 2
    }
    
    // ============ SELF EVALUATION (BOLDED TITLE) ============
    if (data.selfEvaluation) {
      addBoldHeader('SELF-EVALUATION MARKS:')
      addText(data.selfEvaluation, 11, 0)
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
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
    const addText = (text, fontSize = 12, isBold = false, indent = 0, fontFamily = "times") => {
      if (!text) return
      
      checkNewPage()
      doc.setFontSize(fontSize)
      doc.setFont(fontFamily, isBold ? 'bold' : 'normal')
      
      const effectiveWidth = contentWidth - indent
      const lines = doc.splitTextToSize(text, effectiveWidth)
      
      lines.forEach((line) => {
        checkNewPage()
        doc.text(line, margin + indent, y)
        y += 6 // Increased line spacing
      })
      y += 2 // Increased gap after text block
    }
    
    // Helper for section headers (bold, larger)
    const addSectionHeader = (title, fontSize = 13, fontFamily = "times") => {
      checkNewPage(10)
      y += 3 // Increased space before section
      doc.setFontSize(fontSize)
      doc.setFont(fontFamily, "bold")
      doc.text(title, margin, y)
      y += 7 // Increased space after header
    }
    
    // Helper for inline bold labels
    const addLabelValue = (label, value, fontSize = 12) => {
      checkNewPage()
      doc.setFontSize(fontSize)
      
      // Bold label
      doc.setFont("times", "bold")
      const labelWidth = doc.getTextWidth(label)
      doc.text(label, margin, y)
      
      // Normal value
      doc.setFont("times", "normal")
      doc.text(value, margin + labelWidth, y)
      y += 6
    }
    
    // ============ MAIN TITLE ============
    doc.setFontSize(16) // Increased from 14
    doc.setFont("helvetica", "bold") // Changed to Helvetica for title
    const mainTitle = `${data.grade?.toUpperCase() || 'GRADE 10'} ${data.learningArea?.toUpperCase() || 'HOME SCIENCE'} LESSON PLANS TERM 1`
    doc.text(mainTitle, margin, y)
    y += 10
    
    doc.setFontSize(14) // Increased from 12
    doc.setFont("helvetica", "bold")
    doc.text('WEEK 1: LESSON 1', margin, y)
    y += 12
    
    // ============ INFORMATION TABLE (LARGER CELLS) ============
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
    
    // Increased cell heights
    const headerHeight = 10 // Increased from 7
    const dataHeight = 10   // Increased from 7
    const totalTableHeight = headerHeight + dataHeight
    
    // Draw table
    doc.setLineWidth(0.4) // Slightly thicker lines
    doc.setFont("helvetica", "bold") // Changed to Helvetica for table headers
    doc.setFontSize(10) // Increased from 9
    
    // Header row
    const tableY = y
    doc.rect(margin, tableY, tableWidth, totalTableHeight) // Outer border
    
    // Draw column dividers and headers
    for (let i = 0; i < tableHeaders.length; i++) {
      const x = margin + (i * colWidth)
      if (i > 0) {
        doc.line(x, tableY, x, tableY + totalTableHeight) // Column divider
      }
      // Center text vertically in cell
      doc.text(tableHeaders[i], x + 2, tableY + 6.5)
    }
    
    // Divider between header and data
    doc.line(margin, tableY + headerHeight, margin + tableWidth, tableY + headerHeight)
    
    // Data row
    doc.setFont("helvetica", "normal") // Changed to Helvetica for table data
    doc.setFontSize(10)
    for (let i = 0; i < tableValues.length; i++) {
      const x = margin + (i * colWidth)
      // Center text vertically in cell
      doc.text(tableValues[i], x + 2, tableY + headerHeight + 6.5)
    }
    
    y = tableY + totalTableHeight + 8
    
    // ============ STRAND ============
    addSectionHeader(`${labels.strand}: ${data.strand || 'Foods and Nutrition'}`, 13, "helvetica")
    y += 1
    
    // ============ SUB-STRAND ============
    addSectionHeader(`${labels.subStrand}: ${data.subStrand || 'Overview of Foods and Nutrition'}`, 13, "helvetica")
    y += 2
    
    // ============ SPECIFIC LEARNING OUTCOMES ============
    addSectionHeader(labels.specificLearningOutcomes + ':', 13, "helvetica")
    addText(data.specificLearningOutcomes?.statement || 'By the end of the lesson, learners should be able to:', 12, false, 0, "times")
    
    const outcomes = data.specificLearningOutcomes?.outcomes || []
    outcomes.forEach((outcome, i) => {
      const outcomeText = outcome.outcome || outcome.text || 'N/A'
      addText(`- ${outcomeText}`, 12, false, 0, "times")
    })
    y += 2
    
    // ============ KEY INQUIRY QUESTIONS ============
    addSectionHeader(labels.keyInquiryQuestions + ':', 13, "helvetica")
    const questions = data.keyInquiryQuestions || []
    if (questions.length === 0) {
      addText('- N/A', 12, false, 0, "times")
    } else {
      questions.forEach((q) => {
        addText(`- ${q}`, 12, false, 0, "times")
      })
    }
    y += 2
    
    // ============ LEARNING RESOURCES ============
    addSectionHeader(labels.learningResources + ':', 13, "helvetica")
    const resources = Array.isArray(data.learningResources) 
      ? data.learningResources 
      : (typeof data.learningResources === 'string' ? data.learningResources.split(',') : [])
    
    if (resources.length === 0 || !resources.some(r => r?.trim())) {
      addText('- N/A', 12, false, 0, "times")
    } else {
      resources.forEach(r => {
        if (r?.trim()) addText(`- ${r.trim()}`, 12, false, 0, "times")
      })
    }
    y += 2
    
    // ============ CORE COMPETENCIES ============
    addSectionHeader(labels.coreCompetencies + ':', 13, "helvetica")
    const competencies = data.coreCompetencies || []
    if (competencies.length === 0) {
      addText('- N/A', 12, false, 0, "times")
    } else {
      competencies.forEach(c => {
        addText(`- ${c}`, 12, false, 0, "times")
      })
    }
    y += 2
    
    // ============ LINK TO VALUES ============
    addSectionHeader(labels.linkToValues + ':', 13, "helvetica")
    const values = data.linkToValues || []
    if (values.length === 0) {
      addText('- N/A', 12, false, 0, "times")
    } else {
      values.forEach(v => {
        addText(`- ${v}`, 12, false, 0, "times")
      })
    }
    y += 2
    
    // ============ LINKS TO PCI ============
    addSectionHeader(labels.linksToPCI + ':', 13, "helvetica")
    const pcis = data.linksToPCI || []
    if (pcis.length === 0) {
      addText('- N/A', 12, false, 0, "times")
    } else {
      pcis.forEach(p => {
        addText(`- ${p}`, 12, false, 0, "times")
      })
    }
    y += 2
    
    // ============ ORGANISATION OF LEARNING ============
    addSectionHeader('Organisation of Learning:', 14, "helvetica") // Larger, different font
    
    // Introduction
    addSectionHeader('Introduction (5 minutes)', 12, "helvetica")
    addText(data.suggestedLearningExperiences?.introduction || 'Greet the students warmly and introduce the lesson.', 12, false, 0, "times")
    y += 2
    
    // Lesson Development
    addSectionHeader('Lesson Development (30 minutes)', 12, "helvetica")
    y += 1
    
    // ========== EXPLORATION CODE ==========
    const exploration = data.suggestedLearningExperiences?.exploration || []

    if (!Array.isArray(exploration) || exploration.length === 0) {
      addText('- N/A', 12, false, 0, "times")
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
          
          addSectionHeader(`Step ${i + 1}: ${title} (${duration})`, 12, "helvetica")
          addText(stepText, 12, false, 0, "times")
          y += 2
        }
      })
    }
    
    // Reflection
    if (data.suggestedLearningExperiences?.reflection) {
      addSectionHeader('Reflection (5 minutes)', 12, "helvetica")
      addText(data.suggestedLearningExperiences.reflection, 12, false, 0, "times")
      y += 2
    }
    
    // Extension
    if (data.suggestedLearningExperiences?.extension) {
      addSectionHeader('Extension Activities', 12, "helvetica")
      addText(data.suggestedLearningExperiences.extension, 12, false, 0, "times")
      y += 2
    }

    // ========== CONCLUSION ==========
    addSectionHeader('Conclusion (5 minutes)', 12, "helvetica")
    const conclusionText = data.suggestedLearningExperiences?.conclusion || 
                           data.suggestedLearningExperiences?.closure || 
                           data.suggestedLearningExperiences?.plenary || 
                           data.suggestedLearningExperiences?.summary || 
                           'N/A'
    addText(conclusionText, 12, false, 0, "times")
    y += 2
    
    // ============ PARENTAL INVOLVEMENT ============
    if (data.parentalInvolvement) {
      addSectionHeader(labels.parentalInvolvement + ':', 13, "helvetica")
      addText(data.parentalInvolvement, 12, false, 0, "times")
      y += 2
    }
    
    // ============ ASSESSMENT ============
    if (data.assessment) {
      addSectionHeader('Assessment:', 13, "helvetica")
      addText(data.assessment, 12, false, 0, "times")
      y += 2
    }
    
    // ============ SELF EVALUATION ============
    if (data.selfEvaluation) {
      addSectionHeader(labels.selfEvaluation + ':', 13, "helvetica")
      addText(data.selfEvaluation, 12, false, 0, "times")
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
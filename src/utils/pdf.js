import { getBilingualFields } from "./bilingual"

export async function downloadAsPdf(lessonPlan) {
  try {
    // ✅ ALTERNATIVE SOLUTION: Load jsPDF from CDN at runtime
    // This completely bypasses Vite/Webpack bundling issues
    
    let jsPDF;
    
    // Check if jsPDF is already loaded globally
    if (window.jspdf && window.jspdf.jsPDF) {
      jsPDF = window.jspdf.jsPDF;
    } else if (window.jsPDF) {
      jsPDF = window.jsPDF;
    } else {
      // Load from CDN dynamically
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js';
        script.onload = () => {
          jsPDF = window.jspdf.jsPDF;
          resolve();
        };
        script.onerror = () => reject(new Error('Failed to load jsPDF from CDN'));
        document.head.appendChild(script);
      });
    }
    
    if (typeof jsPDF !== 'function') {
      throw new Error('jsPDF constructor not available');
    }

    const fields = getBilingualFields(lessonPlan)
    const { isKiswahili, labels, data } = fields
    
    // ✅ Create PDF instance
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
    
    const checkNewPage = (spaceNeeded = 10) => {
      if (y + spaceNeeded > pageHeight - 20) {
        doc.addPage()
        y = 20
        return true
      }
      return false
    }

    const addText = (text, fontSize = 11, indent = 0, addSpacing = false) => {
      if (!text) return
      checkNewPage()
      doc.setFontSize(fontSize)
      doc.setFont("helvetica", "normal")

      let lines = []
      if (addSpacing) {
        text.split('. ').forEach((sentence) => {
          sentence = sentence.trim()
          if (sentence) lines.push(sentence + '.')
        })
      } else {
        lines = doc.splitTextToSize(text, contentWidth - indent)
      }

      lines.forEach((line) => {
        checkNewPage()
        doc.text(line, margin + indent, y)
        y += addSpacing ? 7 : 5
      })
      y += 1
    }

    const addBoldHeader = (title, fontSize = 11) => {
      checkNewPage(8)
      y += 2
      doc.setFontSize(fontSize)
      doc.setFont("helvetica", "bold")
      doc.text(title, margin, y)
      y += 6
    }

    const addNormalLabel = (title, fontSize = 11) => {
      checkNewPage(8)
      y += 2
      doc.setFontSize(fontSize)
      doc.setFont("helvetica", "normal")
      doc.text(title, margin, y)
      y += 6
    }

    // ============ MAIN TITLE ============
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    const mainTitle = `GRADE ${data.grade || '10'} ${(data.learningArea || 'GEOGRAPHY').toUpperCase()} LESSON PLAN`
    const titleWidth = doc.getTextWidth(mainTitle)
    doc.text(mainTitle, (pageWidth - titleWidth) / 2, y)
    y += 8

    const weekLesson = data.weekLesson || 'WEEK 1: LESSON 1'
    const weekWidth = doc.getTextWidth(weekLesson)
    doc.text(weekLesson, (pageWidth - weekWidth) / 2, y)
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
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    const tableY = y
    doc.rect(margin, tableY, tableWidth, rowHeight * 2)

    let currentX = margin
    for (let i = 0; i < tableHeaders.length; i++) {
      if (i > 0) doc.line(currentX, tableY, currentX, tableY + rowHeight * 2)
      doc.text(tableHeaders[i], currentX + 2, tableY + 5.5)
      currentX += colWidths[i]
    }
    doc.line(margin, tableY + rowHeight, margin + tableWidth, tableY + rowHeight)

    doc.setFont("helvetica", "normal")
    currentX = margin
    for (let i = 0; i < tableValues.length; i++) {
      doc.text(tableValues[i], currentX + 2, tableY + rowHeight + 5.5)
      currentX += colWidths[i]
    }
    y = tableY + (rowHeight * 2) + 8

    addNormalLabel(`STRAND: ${data.strand || 'Soil'}`)
    addNormalLabel(`SUB-STRAND: ${data.subStrand || 'Types of soil'}`)
    y += 2

    // ============ SPECIFIC LEARNING OUTCOMES ============
    addBoldHeader('SPECIFIC LEARNING OUTCOMES:')
    addText(data.specificLearningOutcomes?.statement || '', 11, 0, true)

    const outcomes = data.specificLearningOutcomes?.outcomes || []
    outcomes.forEach((outcome, i) => {
      const outcomeText = typeof outcome === 'string' ? outcome : outcome.outcome || outcome.text || outcome || 'N/A'
      addText(`${String.fromCharCode(97 + i)}) ${outcomeText}`, 11, 0, true)
    })
    y += 3

    // ============ KEY INQUIRY QUESTIONS ============
    addBoldHeader('KEY INQUIRY QUESTIONS:')
    const questions = data.keyInquiryQuestions || []
    if (questions.length === 0) addText('N/A', 11, 0)
    else questions.forEach((q, i) => addText(`${i + 1}) ${q}`, 11, 0, true))

    y += 2
    addBoldHeader('CORE COMPETENCIES TO BE DEVELOPED:')
    const competencies = data.coreCompetenciesToBeDeveloped || data.coreCompetencies || []
    competencies.forEach(c => addText(`• ${c}`, 11, 0))

    y += 2
    addBoldHeader('LINK TO VALUES:')
    (data.linkToValues || []).forEach(v => addText(`• ${v}`, 11, 0))

    y += 2
    addBoldHeader('LINKS TO PERTINENT AND CONTEMPORARY ISSUES (PCI):')
    (data.linksToPCI || []).forEach(p => addText(`• ${p}`, 11, 0))

    y += 2
    addBoldHeader('LEARNING RESOURCES:')
    const resources = Array.isArray(data.learningResources) 
      ? data.learningResources 
      : (typeof data.learningResources === 'string' ? data.learningResources.split(',') : [])
    if (resources.length === 0) addText('N/A', 11, 0)
    else resources.forEach((r, i) => addText(`${i + 1}. ${r.trim()}`, 11, 0))

    y += 2
    addBoldHeader('SUGGESTED LEARNING EXPERIENCES:')
    const sle = data.suggestedLearningExperiences || {}
    const indent = 5

    if (sle.introduction) {
      checkNewPage()
      doc.setFont("helvetica", "normal")
      doc.text('Introduction/Getting Started (5 mins)', margin + indent, y)
      y += 6
      addText(sle.introduction, 11, indent)
    }

    if (sle.exploration?.length) {
      checkNewPage()
      doc.setFont("helvetica", "normal")
      doc.text('Exploration/Lesson Development (35 mins)', margin + indent, y)
      y += 6
      sle.exploration.forEach(step => {
        let text = typeof step === 'string' ? step : step.description || step.step || step.text || ''
        if (text.trim()) addText(text, 11, indent)
      })
    }

    if (sle.reflection) {
      checkNewPage()
      doc.setFont("helvetica", "normal")
      doc.text('Reflection', margin + indent, y)
      y += 6
      addText(sle.reflection, 11, indent)
    }

    if (sle.extension) {
      checkNewPage()
      doc.setFont("helvetica", "normal")
      doc.text('Extension', margin + indent, y)
      y += 6
      addText(sle.extension, 11, indent)
    }

    const conclusionText = sle.conclusion || sle.closure || sle.plenary || sle.summary || ''
    if (conclusionText) {
      checkNewPage()
      doc.setFont("helvetica", "normal")
      doc.text('Conclusion (5 mins)', margin + indent, y)
      y += 6
      addText(conclusionText, 11, indent)
    }

    // PARENTAL INVOLVEMENT
    const parentalInvolvement = data.suggestedParentalInvolvement || data.parentalInvolvement || ''
    if (parentalInvolvement) {
      y += 2
      addBoldHeader('SUGGESTED PARENTAL INVOLVEMENT/COMMUNITY SERVICE LEARNING:')
      addText(parentalInvolvement, 11, 0)
    }

    // ASSESSMENT
    if (data.assessment) {
      y += 2
      addBoldHeader('ASSESSMENT:')
      addText(data.assessment, 11, 0)
    }

    // ✅ SELF-EVALUATION MARKS
    const selfEvaluation = data.selfEvaluationMarks || data.selfEvaluation || ''
    if (selfEvaluation && selfEvaluation.trim()) {
      y += 2
      addBoldHeader('SELF-EVALUATION MARKS:')
      addText(selfEvaluation, 11, 0)
    }

    const fileName = `${data.learningArea || 'Lesson'}_Grade${data.grade || 'X'}_${data.date || 'plan'}.pdf`
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_.-]/g, '')

    doc.save(fileName)
    return { success: true }
  } catch (error) {
    console.error('PDF generation error:', error)
    console.error('Error stack:', error.stack)
    return { success: false, error: error.message }
  }
}
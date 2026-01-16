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

    const findKeyInsensitive = (obj, wantedKey) => {
      if (!obj || typeof obj !== "object") return undefined
      const wanted = String(wantedKey ?? "").toLowerCase()
      if (!wanted) return undefined
      const match = Object.keys(obj).find((k) => String(k).toLowerCase() === wanted)
      return match ? obj[match] : undefined
    }

    const getFlowPart = (flow, labelKey, englishKey) => {
      if (!flow || typeof flow !== "object") return undefined
      return (
        flow?.[englishKey] ??
        flow?.[labelKey] ??
        flow?.[String(labelKey ?? "").toLowerCase()] ??
        findKeyInsensitive(flow, labelKey) ??
        findKeyInsensitive(flow, englishKey)
      )
    }

    const normalizeDescription = (value) => {
      if (typeof value === "string") return value
      if (!value || typeof value !== "object") return ""
      const direct = value.description ?? value.maelezo ?? value.text ?? value.content
      if (typeof direct === "string") return direct
      const firstString = Object.values(value).find((v) => typeof v === "string")
      return typeof firstString === "string" ? firstString : ""
    }

    const subject = toSentenceCase(data.subject || "Untitled Lesson")
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
      doc.setLineWidth(0.5)
      doc.line(margin, y, pageWidth - margin, y)
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

    addTitle(isKiswahili ? "MPANGO WA SOMO" : "LESSON PLAN")

    addSection(labels.adminDetails)
    addKeyValue(labels.school, data.school)
    addKeyValue(labels.subject, subject)
    addKeyValue(labels.grade, data.grade)
    addKeyValue(labels.year, data.year || new Date().getFullYear())
    addKeyValue(labels.term, data.term)
    addKeyValue(labels.date, data.date)
    addKeyValue(labels.time, data.time)
    addKeyValue(
      labels.roll,
      `${labels.boys}: ${data.boys || 0}, ${labels.girls}: ${data.girls || 0}, ${labels.total}: ${data.total || 0}`
    )

    addSection(labels.teacherDetails)
    addKeyValue(labels.name, data.teacherName)
    addKeyValue(labels.tscNumber, data.tscNumber)

    addSection(labels.strand)
    addParagraph(toSentenceCase(data.strand))

    addSection(labels.subStrand)
    addParagraph(toSentenceCase(data.subStrand))

    addSection(labels.learningOutcomes)
    const outcomesData = data.learningOutcomes || {}
    const outcomesRaw =
      outcomesData.outcomes ||
      outcomesData.majibu ||
      outcomesData.matokeo ||
      outcomesData.learningOutcomes ||
      []
    const outcomes = Array.isArray(outcomesRaw)
      ? outcomesRaw
      : typeof outcomesRaw === "object" && outcomesRaw
        ? Object.values(outcomesRaw)
        : []

    addParagraph(outcomesData.statement || outcomesData.taarifa || labels.outcomeStatement)
    if (outcomes.length > 0) {
      outcomes.forEach((o, index) => {
        if (o && typeof o === "object") {
          const id = o.id ?? String.fromCharCode(97 + (index % 26))
          const outcome = o.outcome ?? o.text ?? o.description ?? ""
          addParagraph(`${id}) ${outcome || ""}`)
          return
        }
        const id = String.fromCharCode(97 + (index % 26))
        addParagraph(`${id}) ${String(o ?? "")}`)
      })
    } else {
      addParagraph("N/A")
    }

    addSection(labels.keyQuestion)
    addParagraph(data.keyQuestion)

    addSection(labels.resources)
    addParagraph(normalizeToStringArray(data.resources).join(", ") || "N/A")

    addSection(labels.lessonFlow)
    const lessonFlow = data.lessonFlow || {}

    const introRaw = getFlowPart(lessonFlow, labels.introduction, "introduction")
    addKeyValue(labels.introduction, normalizeDescription(introRaw) || "N/A")

    addSection(labels.development)
    const devRaw = getFlowPart(lessonFlow, labels.development, "development")
    const devSteps = Array.isArray(devRaw)
      ? devRaw
      : typeof devRaw === "object" && devRaw
        ? Object.values(devRaw)
        : []

    if (devSteps.length > 0) {
      devSteps.forEach((step, index) => {
        if (step && typeof step === "object") {
          const stepNo = step.step ?? step.no ?? step.number ?? step[labels.step] ?? index + 1
          const desc = step.description ?? step.title ?? step.maelezo ?? step.text ?? ""
          addParagraph(`${labels.step} ${stepNo}: ${desc || "N/A"}`)
          if (step.activity) addParagraph(`${isKiswahili ? "Shughuli" : "Activity"}: ${step.activity}`)
          return
        }
        addParagraph(`${labels.step} ${index + 1}: ${String(step ?? "N/A")}`)
      })
    } else {
      addParagraph("N/A")
    }

    addSection(labels.conclusion)
    const conclusionRaw = getFlowPart(lessonFlow, labels.conclusion, "conclusion")
    addParagraph(normalizeDescription(conclusionRaw) || "N/A")

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

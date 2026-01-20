/*const API_URL = process.env.REACT_APP_API_URL || 'https://ai-lesson-planner-backend-7rq9.onrender.com';*/

const API_URL = process.env.REACT_APP_API_URL || 'https://ai-lesson-planner-backend-7rq9.onrender.com';

const GENERATE_TIMEOUT_MS = 300_000

const formatBackendError = (errorData) => {
  if (!errorData) return 'Failed to generate lesson plan'
  
  const detail = errorData.detail
  
  if (typeof detail === 'string') return detail
  
  if (Array.isArray(detail)) {
    const parts = detail
      .map((d) => {
        if (typeof d === 'string') return d
        if (d && typeof d === 'object') {
          const loc = Array.isArray(d.loc) ? d.loc.join('.') : ''
          const msg = d.msg || d.message || ''
          const type = d.type || ''
          const combined = [loc, msg, type].filter(Boolean).join(' - ')
          return combined || JSON.stringify(d)
        }
        return String(d)
      })
      .filter(Boolean)
    if (parts.length) return parts.join('\n')
  }
  
  if (detail && typeof detail === 'object') return JSON.stringify(detail)
  if (typeof errorData.message === 'string') return errorData.message
  
  return JSON.stringify(errorData)
}

const sanitizeTextInput = (value, maxLen = 200) => {
  const s = String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
  return s.length > maxLen ? s.slice(0, maxLen) : s
}

export const generateLessonPlan = async (formData, options = {}) => {
  let timeoutId
  try {
    console.log('Sending form data to backend:', formData);
    
    const controller = new AbortController()
    timeoutId = setTimeout(() => controller.abort(), GENERATE_TIMEOUT_MS)

    const externalSignal = options?.signal
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort()
      } else {
        externalSignal.addEventListener('abort', () => controller.abort(), { once: true })
      }
    }
    
    // Map frontend form fields to backend expected fields
    const requestBody = {
      school: sanitizeTextInput(formData.schoolName, 120),
      subject: sanitizeTextInput(formData.subject, 80),
      class_name: sanitizeTextInput(`Grade ${formData.grade}`, 20),
      grade: parseInt(String(formData.grade ?? "").replace(/[^0-9]/g, ""), 10) || 0,
      date: sanitizeTextInput(formData.date, 20),
      start_time: sanitizeTextInput(formData.startTime, 10),
      end_time: sanitizeTextInput(formData.endTime, 10),
      boys: parseInt(String(formData.boys ?? "").replace(/[^0-9]/g, ""), 10) || 0,
      girls: parseInt(String(formData.girls ?? "").replace(/[^0-9]/g, ""), 10) || 0,
      strand: sanitizeTextInput(formData.strand, 120),
      sub_strand: sanitizeTextInput(formData.subStrand, 120)
    };
    
    console.log('Request body:', requestBody);

    const response = await fetch(`${API_URL}/generate-lesson-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const raw = await response.text()
      let errorData = null
      try {
        errorData = raw ? JSON.parse(raw) : null
      } catch {
        errorData = { detail: raw || `HTTP ${response.status} ${response.statusText}` }
      }
      console.error('Backend error:', errorData)
      throw new Error(formatBackendError(errorData))
    }

    const data = await response.json()
    console.log('Backend response:', data)

    if (!data.success) {
      throw new Error(data.message || 'Failed to generate lesson plan')
    }

    // Dashboard expects the lesson plan payload (prefer inner lessonPlan if present)
    return data?.lesson_plan?.lessonPlan ?? data?.lesson_plan
  } catch (error) {
    if (error?.name === 'AbortError') {
      if (options?.signal?.aborted) {
        throw new Error('Request cancelled.')
      }
      throw new Error('Request timed out. The server is taking too long to respond. Please try again.')
    }
    console.error('API Error:', error)
    throw error
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}
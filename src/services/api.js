const API_URL = process.env.REACT_APP_API_URL || 'https://ai-lesson-planner-backend-7rq9.onrender.com';

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

// Generate lesson plan
export const generateLessonPlan = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/generate-lesson-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        school: formData.schoolName,
        subject: formData.subject,  // ✅ FIXED: Use actual subject from form
        class_name: formData.className,
        grade: parseInt(formData.grade),
        term: parseInt(formData.term),
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        teacher_name: formData.teacherName,
        teacher_tsc_number: formData.tscNumber,
        boys: parseInt(formData.boys),
        girls: parseInt(formData.girls),
        strand: formData.strand,
        sub_strand: formData.subStrand
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error:', errorData);
      throw new Error(formatBackendError(errorData));
    }

    const data = await response.json();
    if (data.success) {
      return data.lesson_plan.lessonPlan;
    } else {
      throw new Error('Failed to generate lesson plan');
    }
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    throw error;
  }
};

// Get strands
export const getStrands = async (subject) => {  // ✅ FIXED: Accept subject parameter
  const response = await fetch(`${API_URL}/strands/${subject}`);
  const data = await response.json();
  return data.strands;
};

// Get sub-strands
export const getSubStrands = async (subject, strandName) => {  // ✅ FIXED: Accept subject parameter
  const response = await fetch(
    `${API_URL}/sub-strands/${subject}/${encodeURIComponent(strandName)}`
  );
  const data = await response.json();
  return data.sub_strands;
};
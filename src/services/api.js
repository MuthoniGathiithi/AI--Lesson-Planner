const API_URL = process.env.REACT_APP_API_URL || 'https://ai-lesson-planner-backend-7rq9.onrender.com';

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
      throw new Error(errorData.detail || 'Failed to generate lesson plan');
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
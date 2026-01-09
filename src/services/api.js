const API_URL = process.env.REACT_APP_API_URL || 'https://ai-lesson-planner-backend-7rq9.onrender.com';

// Generate lesson plan
export const generateLessonPlan = async (formData) => {
  const response = await fetch(`${API_URL}/generate-lesson-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      
  school: formData.schoolName,        // ← Changed from school to schoolName
  subject: 'biology',
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

  const data = await response.json();
  
  if (data.success) {
    return data.lesson_plan.lessonPlan;
  } else {
    console.error('Backend error details:', errorData);
    throw new Error('Failed to generate lesson plan');
  }
};

// Get strands
export const getStrands = async () => {
  const response = await fetch(`${API_URL}/strands/biology`);
  const data = await response.json();
  return data.strands;
};

// Get sub-strands
export const getSubStrands = async (strandName) => {
  const response = await fetch(
    `${API_URL}/sub-strands/biology/${encodeURIComponent(strandName)}`
  );
  const data = await response.json();
  return data.sub_strands;
};
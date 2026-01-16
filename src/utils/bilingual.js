export const getBilingualFields = (lessonPlan) => {
  const plan = lessonPlan?.lessonPlan || lessonPlan

  const findKeyInsensitive = (obj, wantedKey) => {
    if (!obj || typeof obj !== "object") return undefined
    const wanted = String(wantedKey ?? "")
      .toLowerCase()
      .replace(/\s+/g, "")
    if (!wanted) return undefined

    const key = Object.keys(obj).find(
      (k) => String(k ?? "").toLowerCase().replace(/\s+/g, "") === wanted
    )
    return key ? obj[key] : undefined
  }

  const getKey = (obj, key) => {
    if (!obj || typeof obj !== "object") return undefined
    return obj?.[key] ?? findKeyInsensitive(obj, key)
  }

  const subjectCandidate =
    plan?.administrativeDetails?.subject ||
    plan?.["MAELEZO YA KIUTAWALA"]?.Somo ||
    plan?.subject

  const isKiswahili =
    String(subjectCandidate ?? "").toLowerCase().includes("kiswahili") ||
    String(plan?.title ?? "").toLowerCase().includes("mpango") ||
    getKey(plan, "mstari") != null ||
    getKey(plan, "mstari mdogo") != null ||
    getKey(plan, "MSTARI") != null ||
    getKey(plan, "MSTARI MDOGO") != null

  if (isKiswahili) {
    const admin = plan?.["MAELEZO YA KIUTAWALA"] || plan?.administrativeDetails || {}
    const teacher = plan?.["MAELEZO YA MWALIMU"] || plan?.teacherDetails || {}
    const roll = admin?.["Orodha ya Wanafunzi"] || admin?.roll || admin?.studentEnrollment || {}

    const learningOutcomes =
      getKey(plan, "MATOKEO YA KUJIFUNZA") ||
      getKey(plan, "MATOKEO YA KUJIFUNZIA") ||
      plan?.lessonLearningOutcomes ||
      {}

    const resources =
      getKey(plan, "VIFAA VYA KUJIFUNZIA") ||
      getKey(plan, "VIFAA VYA KUJIFUNZA") ||
      plan?.learningResources ||
      []

    const lessonFlowRaw =
      getKey(plan, "MTIRIRIKO WA SOMO") ||
      plan?.lessonFlow ||
      {}

    const normalizeFlowPart = (value) => {
      if (value == null) return undefined
      if (typeof value === "string") return { description: value }
      if (Array.isArray(value)) return value
      if (typeof value === "object") return value
      return { description: String(value) }
    }

    const rawIntro =
      getKey(lessonFlowRaw, "Utangulizi") ??
      getKey(lessonFlowRaw, "Introduction")
    const rawDev =
      getKey(lessonFlowRaw, "Maendeleo") ??
      getKey(lessonFlowRaw, "Development")
    const rawConclusion =
      getKey(lessonFlowRaw, "Hitimisho") ??
      getKey(lessonFlowRaw, "Conclusion")

    const normalizedDevelopment = Array.isArray(rawDev)
      ? rawDev.map((step, index) => {
          if (step && typeof step === "object") return step
          return { step: index + 1, description: String(step ?? "") }
        })
      : typeof rawDev === "object" && rawDev
        ? Object.values(rawDev).map((step, index) => {
            if (step && typeof step === "object") return step
            return { step: index + 1, description: String(step ?? "") }
          })
        : []

    const lessonFlow = {
      introduction: normalizeFlowPart(rawIntro),
      development: normalizedDevelopment,
      conclusion: normalizeFlowPart(rawConclusion),
    }

    return {
      isKiswahili: true,
      labels: {
        adminDetails: "MAELEZO YA KIUTAWALA",
        school: "Shule",
        subject: "Somo",
        year: "Mwaka",
        term: "Muhula",
        date: "Tarehe",
        time: "Muda",
        grade: "Darasa",
        roll: "Orodha ya Wanafunzi",
        boys: "Wavulana",
        girls: "Wasichana",
        total: "Jumla",
        teacherDetails: "MAELEZO YA MWALIMU",
        name: "Jina",
        tscNumber: "Namba ya TSC",
        strand: "MSTARI",
        subStrand: "MSTARI MDOGO",
        learningOutcomes: "MATOKEO YA KUJIFUNZA",
        outcomeStatement: "Mwishoni mwa somo, mwanafunzi aweze:",
        keyQuestion: "SWALI KUU LA UCHUNGUZI",
        resources: "VIFAA VYA KUJIFUNZIA",
        lessonFlow: "MTIRIRIKO WA SOMO",
        introduction: "Utangulizi",
        development: "Maendeleo",
        conclusion: "Hitimisho",
        step: "Hatua",
      },
      data: {
        school: getKey(admin, "Shule") || admin?.school || "",
        subject: getKey(admin, "Somo") || admin?.subject || "Kiswahili",
        year: getKey(admin, "Mwaka") || admin?.year || "",
        term: getKey(admin, "Muhula") || admin?.term || "",
        date: getKey(admin, "Tarehe") || admin?.date || "",
        time: getKey(admin, "Muda") || admin?.time || "",
        grade: getKey(admin, "Darasa") || admin?.grade || "",
        boys: getKey(roll, "Wavulana") || roll?.boys || 0,
        girls: getKey(roll, "Wasichana") || roll?.girls || 0,
        total: getKey(roll, "Jumla") || roll?.total || 0,
        teacherName: getKey(teacher, "Jina") || teacher?.name || "",
        tscNumber: getKey(teacher, "Namba ya TSC") || teacher?.tscNumber || "",
        strand:
          getKey(plan, "MSTARI") ||
          getKey(plan, "mstari") ||
          getKey(plan, "strand") ||
          plan?.curriculumAlignment?.strand ||
          "",
        subStrand:
          getKey(plan, "MSTARI MDOGO") ||
          getKey(plan, "mstari mdogo") ||
          getKey(plan, "mstari_mdogo") ||
          getKey(plan, "sub_strand") ||
          getKey(plan, "subStrand") ||
          plan?.curriculumAlignment?.substrand ||
          plan?.curriculumAlignment?.subStrand ||
          "",
        learningOutcomes,
        keyQuestion: getKey(plan, "SWALI KUU LA UCHUNGUZI") || plan?.keyInquiryQuestion || "",
        resources,
        lessonFlow,
      },
    }
  }

  const admin = plan?.administrativeDetails || {}
  const teacher = plan?.teacherDetails || {}
  const roll = admin?.roll || admin?.studentEnrollment || {}

  return {
    isKiswahili: false,
    labels: {
      adminDetails: "ADMINISTRATIVE DETAILS",
      school: "School",
      subject: "Subject",
      year: "Year",
      term: "Term",
      date: "Date",
      time: "Time",
      grade: "Grade",
      roll: "Roll",
      boys: "Boys",
      girls: "Girls",
      total: "Total",
      teacherDetails: "TEACHER DETAILS",
      name: "Name",
      tscNumber: "TSC Number",
      strand: "STRAND",
      subStrand: "SUB-STRAND",
      learningOutcomes: "LESSON LEARNING OUTCOMES",
      outcomeStatement: "By the end of the lesson, the learner should be able to:",
      keyQuestion: "KEY INQUIRY QUESTION",
      resources: "LEARNING RESOURCES",
      lessonFlow: "LESSON FLOW",
      introduction: "Introduction",
      development: "Development",
      conclusion: "Conclusion",
      step: "Step",
    },
    data: {
      school: admin?.school || "",
      subject: admin?.subject || "",
      year: admin?.year || "",
      term: admin?.term || "",
      date: admin?.date || "",
      time:
        typeof admin?.time === "string"
          ? admin.time
          : admin?.time?.start
            ? `${admin.time.start} - ${admin.time.end}`
            : "",
      grade: admin?.grade || "",
      boys: roll?.boys || 0,
      girls: roll?.girls || 0,
      total: roll?.total || 0,
      teacherName: teacher?.name || admin?.teacher || "",
      tscNumber: teacher?.tscNumber || admin?.teacherTSCNumber || "",
      strand:
        plan?.strand ||
        plan?.curriculumAlignment?.strand ||
        getKey(plan, "STRAND") ||
        getKey(plan, "mstari") ||
        "",
      subStrand:
        plan?.subStrand ||
        plan?.curriculumAlignment?.substrand ||
        plan?.curriculumAlignment?.subStrand ||
        getKey(plan, "SUB-STRAND") ||
        getKey(plan, "SUB_STRAND") ||
        getKey(plan, "mstari mdogo") ||
        "",
      learningOutcomes: plan?.lessonLearningOutcomes || plan?.lessonLearningOutcomes || {},
      keyQuestion: plan?.keyInquiryQuestion || plan?.guidingQuestion || "",
      resources: plan?.learningResources || [],
      lessonFlow: plan?.lessonFlow || {},
    },
  }
}

"use client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"




export default function HomePage() {
  const navigate = useNavigate()

  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" })
  const contactEmail = "gathiithijoyce74@gmail.com"
  const whatsappNumber = "+254742278735"

  const handleContactSubmit = (e) => {
    e.preventDefault()
    const subject = `Funzo Hub Contact - ${contactForm.name || "Visitor"}`
    const body = `Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\nMessage:\n${contactForm.message}`
    const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
  }

  const handleGetStartedClick = () => {
    navigate("/dashboard")
  }

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Global responsive styles */}
      <style>{`
        @keyframes blobPulse {
          0% { transform: translate(-50%,-40%) scale(1); opacity:0.9 }
          50% { transform: translate(-50%,-40%) scale(1.05); opacity:0.95 }
          100% { transform: translate(-50%,-40%) scale(1); opacity:0.9 }
        }

        @media (max-width: 1024px) {
          .hero-section { padding: 100px 20px 60px; }
          .hero-title { font-size: 3rem; }
          .hero-subtitle { font-size: 1.15rem; }
          .hero-buttons { flex-direction: column; gap: 12px; }
          .mockup-grid { grid-template-columns: 1fr; padding: 20px; }
          .about-grid { grid-template-columns: 1fr; padding: 40px 20px; gap: 40px; }
          .how-it-works-grid { grid-template-columns: 1fr; gap: 40px; }
          .contact-grid { grid-template-columns: 1fr; gap: 28px; }
        }

        @media (max-width: 768px) {
          .hero-section { padding: 80px 16px 50px; }
          .hero-title { font-size: 2.5rem; line-height: 1.2; }
          .hero-subtitle { font-size: 1rem; margin-bottom: 32px !important; }
          .hero-buttons button { padding: 14px 32px; font-size: 0.95rem; width: 100%; }
          .mockup-grid { padding: 16px; gap: 16px; }
          .mockup-grid > div { padding: 16px; }
          .about-section { padding: 60px 16px !important; }
          .about-grid { 
            display: block !important;
            grid-template-columns: 1fr !important;
            padding: 44px 24px !important;
            gap: 32px !important;
            border-radius: 0 !important;
          }
          .about-grid h2 { font-size: 2rem; }
          .about-grid button { width: 100%; }
          .how-it-works-section { padding: 60px 16px !important; }
          .how-it-works-title { font-size: 2rem; }
          .steps-num { font-size: 2rem; min-width: 60px; }
          .step-item { gap: 16px; }
          .step-title { font-size: 1.15rem; }
          .step-desc { font-size: 0.95rem; }
          .mockup-visual { padding: 32px; }
          .contact-section { padding: 60px 16px !important; }
          .contact-grid { grid-template-columns: 1fr; padding: 32px 16px; gap: 24px; }
          .contact-title { font-size: 2rem !important; }
          .contact-form-row { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 640px) {
          .hero-section { padding: 60px 12px 40px; }
          .hero-title { font-size: 1.875rem; line-height: 1.2; letter-spacing: -1px; }
          .hero-subtitle { font-size: 0.95rem; margin-bottom: 24px !important; }
          .hero-buttons { flex-direction: column; gap: 10px; }
          .hero-buttons button { padding: 12px 24px; font-size: 0.9rem; width: 100%; }
          .badge { font-size: 0.8rem; padding: 6px 16px; }
          .mockup-grid { padding: 12px; gap: 12px; }
          .mockup-grid > div { padding: 12px; }
          .about-section { padding: 40px 12px !important; }
          .about-grid { padding: 20px 12px; gap: 24px; }
          .about-grid h2 { font-size: 1.5rem; margin-bottom: 16px !important; }
          .about-description { font-size: 0.95rem; margin-bottom: 20px !important; }
          .about-grid button { width: 100%; padding: 12px 24px; font-size: 0.9rem; }
          .how-it-works-section { padding: 40px 12px !important; }
          .how-it-works-title { font-size: 1.5rem; }
          .how-it-works-subtitle { font-size: 1rem; }
          .steps-num { font-size: 1.5rem; min-width: 50px; }
          .step-item { gap: 12px; margin-bottom: 32px; }
          .step-title { font-size: 1rem; }
          .step-desc { font-size: 0.9rem; line-height: 1.6; }
          .mockup-visual { padding: 24px; border-radius: 8px; min-height: 300px; }
          .about-visual { height: auto; min-height: 200px; padding: 24px; }
          .contact-section { padding: 48px 12px !important; }
          .contact-grid { padding: 20px 12px; gap: 18px; }
          .contact-card { padding: 18px !important; }
          .contact-title { font-size: 1.6rem !important; }
        }

        @media (max-width: 480px) {
          .hero-title { font-size: 1.5rem; }
          .hero-subtitle { font-size: 0.9rem; }
          .badge { font-size: 0.75rem; padding: 5px 12px; }
          .mockup-grid > div { padding: 10px; }
          .about-grid h2 { font-size: 1.35rem; }
          .step-title { font-size: 0.95rem; }
          .step-num { font-size: 1.25rem; }
        }
      `}</style>

      {/* Hero Section */}
      <section
        className="hero-section"
        style={{
          padding: "140px 40px 100px",
          textAlign: "center",
          backgroundColor: "#FAFAFA",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.3,
            zIndex: 0,
          }}
        ></div>

        <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div
            className="badge"
            style={{
              display: "inline-block",
              padding: "8px 20px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "24px",
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "#6B7280",
              marginBottom: "32px",
            }}
          >
            CBE aligned Lesson Plans
          </div>

          <div style={{ display: "inline-block", position: "relative" }}>
            {/* Blob animations */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -40%)",
                width: "920px",
                height: "360px",
                background:
                  "radial-gradient(ellipse at center, rgba(99,102,241,0.72) 0%, rgba(99,102,241,0.36) 30%, rgba(99,102,241,0.14) 55%, transparent 68%)",
                filter: "blur(18px)",
                borderRadius: "50%",
                zIndex: 0,
                pointerEvents: "none",
                mixBlendMode: "screen",
                animation: "blobPulse 5s ease-in-out infinite",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "54%",
                transform: "translate(-50%, -40%)",
                width: "820px",
                height: "420px",
                background:
                  "radial-gradient(ellipse at center, rgba(255,249,240,0.55) 0%, rgba(180, 165, 142, 0.3) 25%, rgba(255,249,240,0.06) 55%, transparent 70%)",
                filter: "blur(34px)",
                borderRadius: "50%",
                zIndex: 0,
                pointerEvents: "none",
                mixBlendMode: "screen",
                opacity: 0.9,
                animation: "blobPulse 7s ease-in-out infinite",
              }}
            />

            <h1
              className="hero-title"
              style={{
                position: "relative",
                zIndex: 1,
                fontSize: "4rem",
                fontWeight: 800,
                color: "#4F46E5",
                margin: "0 0 28px 0",
                lineHeight: "1.1",
                letterSpacing: "-2px",
              }}
            >
              AI-Powered Lesson Planner
            </h1>
          </div>

          <p
            className="hero-subtitle"
            style={{
              fontSize: "1.35rem",
              color: "#000",
              margin: "0 0 48px 0",
              fontWeight: 400,
              lineHeight: "1.6",
              maxWidth: "700px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Let AI handle the planning while you focus on inspiring students.
          </p>

          <div
            className="hero-buttons"
            style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "80px" }}
          >
            <button
              onClick={handleGetStartedClick}
              style={{
                background: "#111827",
                color: "#FFFFFF",
                border: "none",
                padding: "16px 40px",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#1F2937"
                e.target.style.transform = "translateY(-2px)"
              }}
              onMouseOut={(e) => {
                e.target.style.background = "#111827"
                e.target.style.transform = "translateY(0)"
              }}
            >
              Create lesson plan now
            </button>
          </div>

          {/* Hero Mockup */}
          <div
            className="mockup-grid"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
          </div>
        </div>
      </section>

  {/* About Us Section */}
      <section
        className="about-section"
        id="about"
        style={{ padding: "100px 40px", backgroundColor: "#4F46E5" }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            className="about-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "60px",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "60px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Left Content */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 24px",
                  backgroundColor: "#4F46E5",
                  color: "#FFFFFF",
                  borderRadius: "30px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  marginBottom: "28px",
                  letterSpacing: "0.5px",
                }}
              >
                ABOUT US
              </div>
              <h2
                style={{
                  fontSize: "2.75rem",
                  fontWeight: 800,
                  color: "#111827",
                  margin: "0 0 24px 0",
                  letterSpacing: "-1.5px",
                  lineHeight: "1.15",
                }}
              >
                Helping Teachers Plan Faster and Teach Better
              </h2>
              <p
                className="about-description"
                style={{ 
                  fontSize: "1.1rem", 
                  color: "#6B7280", 
                  lineHeight: "1.8", 
                  margin: "0 0 36px 0" 
                }}
              >
                Funzo Hub helps CBE teachers reduce planning time, create structured, curriculum-aligned lesson plans in minutes, and lets teachers focus on what matters most — teaching.
              </p>
              
              {/* Features List */}
              <div style={{ marginBottom: "36px" }}>
                {[
                  "✓ CBE curriculum aligned",
                  "✓ Kiswahili & English support",
                  "✓ Instant PDF download"
                ].map((feature, i) => (
                  <div 
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px",
                      fontSize: "1rem",
                      color: "#374151",
                      fontWeight: 500
                    }}
                  >
                    <span style={{ color: "#4F46E5", fontSize: "1.2rem" }}>{feature.charAt(0)}</span>
                    <span>{feature.slice(2)}</span>
                  </div>
                ))}
              </div>

              <button
                style={{
                  padding: "16px 40px",
                  backgroundColor: "#4F46E5",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#4338CA"
                  e.target.style.transform = "translateY(-2px)"
                  e.target.style.boxShadow = "0 8px 20px rgba(79, 70, 229, 0.4)"
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#4F46E5"
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "0 4px 14px rgba(79, 70, 229, 0.3)"
                }}
              >
                Watch Demo →
              </button>
            </div>

            {/* Right Visual */}
            <div
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: "16px",
                padding: "40px",
                minHeight: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative elements */}
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#4F46E5",
                  opacity: 0.1,
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "40px",
                  left: "40px",
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#4F46E5",
                  opacity: 0.1,
                  borderRadius: "50%",
                }}
              />
              
              <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "4rem", marginBottom: "16px" }}>📚</div>
                <p style={{ fontSize: "1.1rem", color: "#6B7280", fontWeight: 500 }}>
                  AI-Powered Lesson Planning
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        className="how-it-works-section"
        id="how-it-works"
        style={{ padding: "100px 40px", backgroundColor: "#FFFFFF" }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Section Header */}
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <h2
              className="how-it-works-title"
              style={{
                fontSize: "2.75rem",
                fontWeight: 800,
                color: "#111827",
                margin: "0 0 16px 0",
                letterSpacing: "-1.5px",
              }}
            >
              How It Works
            </h2>
            <p 
              className="how-it-works-subtitle" 
              style={{ 
                fontSize: "1.15rem", 
                color: "#6B7280", 
                margin: 0,
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto"
              }}
            >
              Create a CBE-aligned lesson plan in just 3 simple steps.
            </p>
          </div>

          {/* Steps Grid */}
          <div
            className="how-it-works-grid"
            style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr", 
              gap: "40px",
              maxWidth: "900px",
              margin: "0 auto"
            }}
          >
            {[
              {
                num: "01",
                title: "Enter Your Administrative and Class Details",
                desc: "Select grade, subject, strand, sub-strand, and other class information to get started.",
                icon: "📝"
              },
              {
                num: "02",
                title: "Generate Your Lesson Plan",
                desc: "AI instantly creates a structured, CBE-aligned lesson plan, including learning outcomes, activities, and assessments.",
                icon: "⚡"
              },
              {
                num: "03",
                title: "Edit & Download",
                desc: "Customize the lesson to suit your teaching style, then download as a professional PDF.",
                icon: "💾"
              },
            ].map((step, i) => (
              <div 
                key={i} 
                className="step-item" 
                style={{ 
                  display: "flex", 
                  gap: "32px",
                  padding: "32px",
                  backgroundColor: i % 2 === 0 ? "#F9FAFB" : "#FFFFFF",
                  borderRadius: "16px",
                  border: "2px solid #E5E7EB",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)"
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.08)"
                  e.currentTarget.style.borderColor = "#4F46E5"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "none"
                  e.currentTarget.style.borderColor = "#E5E7EB"
                }}
              >
                {/* Step Number Circle */}
                <div
                  style={{
                    flexShrink: 0,
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor: "#4F46E5",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.75rem",
                    fontWeight: 800,
                  }}
                >
                  {step.num}
                </div>

                {/* Step Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "1.75rem" }}>{step.icon}</span>
                    <h3
                      className="step-title"
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#111827",
                        margin: 0,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {step.title}
                    </h3>
                  </div>
                  <p
                    className="step-desc"
                    style={{ 
                      fontSize: "1.05rem", 
                      color: "#6B7280", 
                      margin: 0, 
                      lineHeight: "1.7" 
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: "center", marginTop: "60px" }}>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                padding: "18px 48px",
                backgroundColor: "#4F46E5",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "12px",
                fontSize: "1.1rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#4338CA"
                e.target.style.transform = "translateY(-2px)"
                e.target.style.boxShadow = "0 8px 20px rgba(79, 70, 229, 0.4)"
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#4F46E5"
                e.target.style.transform = "translateY(0)"
                e.target.style.boxShadow = "0 4px 14px rgba(79, 70, 229, 0.3)"
              }}
            >
              Get Started Now →
            </button>
          </div>
        </div>
      </section>

      {/* Responsive Styles */}
      <style>{`
        /* Tablet */
        @media (max-width: 1024px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            padding: 40px !important;
            gap: 40px !important;
          }
          .how-it-works-title {
            font-size: 2.25rem !important;
          }
          .step-item {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .about-section {
            padding: 60px 20px !important;
          }
          .about-grid {
            padding: 32px 24px !important;
            gap: 32px !important;
            border-radius: 16px !important;
          }
          .about-grid h2 {
            font-size: 2rem !important;
            line-height: 1.2 !important;
          }
          .about-description {
            font-size: 1rem !important;
          }
          .about-grid button {
            width: 100%;
            padding: 14px 32px !important;
          }
          
          .how-it-works-section {
            padding: 60px 20px !important;
          }
          .how-it-works-title {
            font-size: 2rem !important;
          }
          .how-it-works-subtitle {
            font-size: 1rem !important;
          }
          .how-it-works-grid {
            gap: 24px !important;
          }
          .step-item {
            padding: 24px !important;
            gap: 20px !important;
          }
          .step-item > div:first-child {
            width: 60px !important;
            height: 60px !important;
            font-size: 1.5rem !important;
          }
          .step-title {
            font-size: 1.25rem !important;
          }
          .step-desc {
            font-size: 0.95rem !important;
          }
        }

        /* Small Mobile */
        @media (max-width: 480px) {
          .about-section {
            padding: 40px 16px !important;
          }
          .about-grid {
            padding: 24px 20px !important;
            border-radius: 12px !important;
          }
          .about-grid h2 {
            font-size: 1.75rem !important;
          }
          .about-description {
            font-size: 0.95rem !important;
          }
          
          .how-it-works-section {
            padding: 40px 16px !important;
          }
          .how-it-works-title {
            font-size: 1.75rem !important;
          }
          .step-item {
            padding: 20px !important;
            gap: 16px !important;
          }
          .step-title {
            font-size: 1.1rem !important;
          }
        }
      `}</style>
    </div>
  )
}
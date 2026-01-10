import React from 'react';
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate('/signup');
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: '#FFFFFF',
      minHeight: '100vh',
      margin: 0,
      padding: 0
    }}>
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
          .about-grid { grid-template-columns: 1fr; padding: 40px 20px; }
          .how-it-works-grid { grid-template-columns: 1fr; gap: 40px; }
        }

        @media (max-width: 640px) {
          .hero-title { font-size: 2.25rem; line-height: 1.2; }
          .hero-subtitle { font-size: 1rem; }
          .steps-num { font-size: 2rem; min-width: 60px; }
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero-section" style={{
        padding: '140px 40px 100px',
        textAlign: 'center',
        backgroundColor: '#FAFAFA',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.3,
          zIndex: 0
        }}></div>

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            padding: '8px 20px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '24px',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: '#6B7280',
            marginBottom: '32px'
          }}>
            CBE aligned Lesson Plans
          </div>

          <div style={{ display: 'inline-block', position: 'relative' }}>
            {/* Blob animations */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -40%)',
              width: '920px',
              height: '360px',
              background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.72) 0%, rgba(99,102,241,0.36) 30%, rgba(99,102,241,0.14) 55%, transparent 68%)',
              filter: 'blur(18px)',
              borderRadius: '50%',
              zIndex: 0,
              pointerEvents: 'none',
              mixBlendMode: 'screen',
              animation: 'blobPulse 5s ease-in-out infinite'
            }} />

            <div style={{
              position: 'absolute',
              left: '50%',
              top: '54%',
              transform: 'translate(-50%, -40%)',
              width: '820px',
              height: '420px',
              background: 'radial-gradient(ellipse at center, rgba(255,249,240,0.55) 0%, rgba(180, 165, 142, 0.3) 25%, rgba(255,249,240,0.06) 55%, transparent 70%)',
              filter: 'blur(34px)',
              borderRadius: '50%',
              zIndex: 0,
              pointerEvents: 'none',
              mixBlendMode: 'screen',
              opacity: 0.9,
              animation: 'blobPulse 7s ease-in-out infinite'
            }} />

            <h1 className="hero-title" style={{
              position: 'relative',
              zIndex: 1,
              fontSize: '4rem',
              fontWeight: 800,
              color: '#4F46E5',
              margin: '0 0 28px 0',
              lineHeight: '1.1',
              letterSpacing: '-2px'
            }}>
              AI-Powered Lesson Planner
            </h1>
          </div>

          <p className="hero-subtitle" style={{
            fontSize: '1.35rem',
            color: '#000',
            margin: '0 0 48px 0',
            fontWeight: 400,
            lineHeight: '1.6',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Let AI handle the planning while you focus on inspiring students.
          </p>

          <div className="hero-buttons" style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '80px' }}>
            <button onClick={handleGetStartedClick} style={{
              background: '#111827',
              color: '#FFFFFF',
              border: 'none',
              padding: '16px 40px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.target.style.background = '#1F2937'; e.target.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.target.style.background = '#111827'; e.target.style.transform = 'translateY(0)'; }}>
              Get Started
            </button>

            <button style={{
              background: '#FFFFFF',
              color: '#000',
              border: '1px solid #E5E7EB',
              padding: '16px 40px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.background = '#F9FAFB'; }}
            onMouseOut={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#FFFFFF'; }}>
              Watch Demo
            </button>
          </div>

          {/* Hero Mockup */}
          <div className="mockup-grid" style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px'
          }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                backgroundColor: '#FAFAFA',
                border: '1px solid #F3F4F6',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'left'
              }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#E5E7EB', borderRadius: '6px', marginBottom: '12px' }}></div>
                <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', marginBottom: '8px', width: '80%' }}></div>
                <div style={{ height: '8px', backgroundColor: '#F3F4F6', borderRadius: '4px', marginBottom: '8px' }}></div>
                <div style={{ height: '8px', backgroundColor: '#F3F4F6', borderRadius: '4px', width: '60%' }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" style={{ padding: '100px 40px', backgroundColor: '#F3F4F6', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="about-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '60px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)'
          }}>
            <div>
              <div style={{
                display: 'inline-block',
                padding: '8px 20px',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '24px'
              }}>
                About Us
              </div>
              <h2 style={{ fontSize: '2.75rem', fontWeight: 700, color: '#000', margin: '0 0 24px 0', letterSpacing: '-1px', lineHeight: '1.2' }}>
                Helping Teachers Plan Faster and Teach Better
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#6B7280', lineHeight: '1.8', margin: '0 0 32px 0' }}>
                FunzoIQ helps CBE teachers create structured, curriculum-aligned lesson plans in minutes, reducing planning time and letting teachers focus on teaching.
              </p>
              <button style={{
                padding: '14px 32px',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.target.style.backgroundColor = '#4338CA'; e.target.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = '#4F46E5'; e.target.style.transform = 'translateY(0)'; }}>
                Book Demo
              </button>
            </div>

            {/* Right visual can remain same, just smaller cards will shrink automatically */}
            <div style={{ position: 'relative', height: '500px', backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '40px', overflow: 'hidden' }}>
              {/* Cards inside same as your current code */}
              {/* ... */}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ padding: '100px 40px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#000', margin: '0 0 16px 0', letterSpacing: '-1px' }}>
              How It Works
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#6B7280', margin: 0 }}>Create a CBE-aligned lesson plan in minutes.</p>
          </div>

          <div className="how-it-works-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
              {[
                { num: '01', title: 'Enter Your Class Details', desc: 'Select grade, subject, strand, sub-strand, and lesson duration..' },
                { num: '02', title: 'Generate Your Lesson Plan', desc: 'Our AI instantly creates a structured, CBE-aligned lesson plan, including learning outcomes, activities, and assessment.' },
                { num: '03', title: 'Review, Edit & Download', desc: 'Customize the lesson to suit your teaching style.' }
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '24px' }}>
                  <div className="steps-num" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#E5E7EB', minWidth: '80px' }}>{step.num}</div>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#111827', margin: '0 0 12px 0', letterSpacing: '-0.3px' }}>{step.title}</h3>
                    <p style={{ fontSize: '1rem', color: '#6B7280', margin: 0, lineHeight: '1.7' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual mockup */}
            <div style={{
              backgroundColor: '#FAFAFA',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '48px',
              position: 'relative'
            }}>
              {/* Grid overlay and mockup elements */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

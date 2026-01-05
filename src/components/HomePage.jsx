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
      {/* Hero Section */}
      <section style={{
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
            AI-Powered Education Technology
          </div>
          
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <style>{`@keyframes blobPulse { 0% { transform: translate(-50%,-40%) scale(1); opacity:0.9 } 50% { transform: translate(-50%,-40%) scale(1.05); opacity:0.95 } 100% { transform: translate(-50%,-40%) scale(1); opacity:0.9 } }`}</style>
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

            <h1 style={{
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
          
          <p style={{
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
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '80px' }}>
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
            onMouseOver={(e) => {
              e.target.style.background = '#1F2937';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#111827';
              e.target.style.transform = 'translateY(0)';
            }}>
              Get Started Free
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
            onMouseOver={(e) => {
              e.target.style.borderColor = '#D1D5DB';
              e.target.style.background = '#F9FAFB';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = '#E5E7EB';
              e.target.style.background = '#FFFFFF';
            }}>
              Watch Demo
            </button>
          </div>

          {/* Hero Mockup/Visual */}
          <div style={{
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
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '6px',
                  marginBottom: '12px'
                }}></div>
                <div style={{
                  height: '8px',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  width: '80%'
                }}></div>
                <div style={{
                  height: '8px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '4px',
                  marginBottom: '8px'
                }}></div>
                <div style={{
                  height: '8px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '4px',
                  width: '60%'
                }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" style={{
        padding: '100px 40px',
        backgroundColor: '#F3F4F6',
        borderTop: '1px solid #E5E7EB'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '60px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)'
          }}>
            {/* Left Content */}
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
              
              <h2 style={{
                fontSize: '2.75rem',
                fontWeight: 700,
                color: '#000',
                margin: '0 0 24px 0',
                letterSpacing: '-1px',
                lineHeight: '1.2'
              }}>
                Helping Teachers Plan Faster and Teach Better
              </h2>
              
              <p style={{
                fontSize: '1.05rem',
                color: '#6B7280',
                lineHeight: '1.8',
                margin: '0 0 20px 0'
              }}>
                FunzoIQ helps CBE teachers create structured, curriculum-aligned lesson plans in minutes, reducing planning time and letting teachers focus on teaching.  </p>
              
              <p style={{
                fontSize: '1.05rem',
                color: '#6B7280',
                lineHeight: '1.8',
                margin: '0 0 32px 0'
              }}>
               { /*Our platform reduces repetitive tasks, allowing educators to focus on what matters most—teaching and empowering students.*/}
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
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#4338CA';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#4F46E5';
                e.target.style.transform = 'translateY(0)';
              }}>
                Book Demo
              </button>
            </div>

            {/* Right Visual Mockup */}
            <div style={{
              position: 'relative',
              height: '500px',
              backgroundColor: '#F9FAFB',
              borderRadius: '12px',
              padding: '40px',
              overflow: 'hidden'
            }}>
              {/* Main card - top right */}
              <div style={{
                position: 'absolute',
                top: '60px',
                right: '40px',
                width: '280px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                zIndex: 3
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#E0E7FF',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    📚
                  </div>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#C7D2FE',
                    borderRadius: '8px'
                  }}></div>
                </div>
                <div style={{
                  height: '8px',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  width: '80%'
                }}></div>
                <div style={{
                  height: '8px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '4px',
                  marginBottom: '8px'
                }}></div>
                <div style={{
                  height: '8px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '4px',
                  width: '60%'
                }}></div>
              </div>

              {/* Secondary card - middle left */}
              <div style={{
                position: 'absolute',
                top: '200px',
                left: '40px',
                width: '240px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                zIndex: 2
              }}>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#E0E7FF',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      height: '6px',
                      backgroundColor: '#E5E7EB',
                      borderRadius: '4px',
                      marginBottom: '6px',
                      width: '70%'
                    }}></div>
                    <div style={{
                      height: '6px',
                      backgroundColor: '#F3F4F6',
                      borderRadius: '4px',
                      width: '50%'
                    }}></div>
                  </div>
                </div>
                <div style={{
                  height: '6px',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '4px',
                  marginBottom: '6px'
                }}></div>
                <div style={{
                  height: '6px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '4px',
                  width: '80%'
                }}></div>
              </div>

              {/* Bottom card - checklist style */}
              <div style={{
                position: 'absolute',
                bottom: '60px',
                right: '60px',
                width: '260px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                zIndex: 1
              }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: i === 3 ? '0' : '14px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#C7D2FE',
                      borderRadius: '50%'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        height: '6px',
                        backgroundColor: '#E5E7EB',
                        borderRadius: '4px',
                        width: i === 3 ? '60%' : '90%'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating accent card - top left */}
              <div style={{
                position: 'absolute',
                top: '40px',
                left: '40px',
                width: '180px',
                backgroundColor: '#818CF8',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)',
                zIndex: 4
              }}>
                <div style={{
                  height: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  width: '60%'
                }}></div>
                <div style={{
                  height: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px',
                  marginBottom: '6px'
                }}></div>
                <div style={{
                  height: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px',
                  width: '80%'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section id="how-it-works" style={{
        padding: '100px 40px',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#000',
              margin: '0 0 16px 0',
              letterSpacing: '-1px'
            }}>
              How It Works
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6B7280',
              margin: 0
            }}>
           Create a CBE-aligned lesson plan in minutes.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center'
          }}>
            {/* Steps */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '56px'
            }}>
              {[
                { num: '01', title: 'Enter Your Class Details', desc: 'Select grade, subject, strand, sub-strand, and lesson duration..' },
                { num: '02', title: 'Generate Your Lesson Plan', desc: 'Our AI instantly creates a structured, CBE-aligned lesson plan, including learning outcomes, activities, and assessment.' },
                { num: '03', title: 'Review, Edit & Download', desc: 'Customize the lesson to suit your teaching style.' }
              ].map((step, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '24px'
                }}>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: '#E5E7EB',
                    minWidth: '80px'
                  }}>
                    {step.num}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.35rem',
                      fontWeight: 600,
                      color: '#111827',
                      margin: '0 0 12px 0',
                      letterSpacing: '-0.3px'
                    }}>
                      {step.title}
                    </h3>
                    <p style={{
                      fontSize: '1rem',
                      color: '#6B7280',
                      margin: 0,
                      lineHeight: '1.7'
                    }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Mockup */}
            <div style={{
              backgroundColor: '#FAFAFA',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '48px',
              position: 'relative'
            }}>
              {/* Grid overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)',
                backgroundSize: '30px 30px',
                opacity: 0.2,
                borderRadius: '12px'
              }}></div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Input mockup */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '24px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    height: '10px',
                    backgroundColor: '#E5E7EB',
                    borderRadius: '4px',
                    width: '40%',
                    marginBottom: '12px'
                  }}></div>
                  <div style={{
                    height: '8px',
                    backgroundColor: '#F3F4F6',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}></div>
                  <div style={{
                    height: '8px',
                    backgroundColor: '#F3F4F6',
                    borderRadius: '4px',
                    width: '70%'
                  }}></div>
                </div>

                {/* Arrow/Flow indicator */}
                <div style={{
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  color: '#D1D5DB',
                  margin: '16px 0'
                }}>
                  ↓
                </div>

                {/* Output mockup */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '24px'
                }}>
                  <div style={{
                    height: '10px',
                    backgroundColor: '#111827',
                    borderRadius: '4px',
                    width: '50%',
                    marginBottom: '16px'
                  }}></div>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{
                      height: '8px',
                      backgroundColor: i === 4 ? '#F3F4F6' : '#E5E7EB',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      width: i === 4 ? '60%' : '100%'
                    }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{
        padding: '100px 40px',
        backgroundColor: '#FAFAFA'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#111827',
            margin: '0 0 16px 0',
            letterSpacing: '-1px'
          }}>
            Simple, Transparent Pricing
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#6B7280',
            margin: '0 0 64px 0'
          }}>
            Choose the plan that works best for you
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1px',
            maxWidth: '1100px',
            margin: '0 auto',
            backgroundColor: '#E5E7EB',
            border: '1px solid #E5E7EB'
          }}>
            {[
              { name: 'Free', price: '$0', period: 'forever', features: ['5 lesson plans/month', 'Basic templates', 'Community support', 'Standard AI model'] },
              { name: 'Pro', price: '$19', period: 'per month', features: ['Unlimited lesson plans', 'Advanced templates', 'Priority support', 'Advanced AI model', 'Custom branding', 'Export to multiple formats'], popular: true },
              { name: 'School', price: '$99', period: 'per month', features: ['Everything in Pro', 'Up to 50 teachers', 'Admin dashboard', 'Dedicated support', 'Custom integrations', 'Training sessions'] }
            ].map((plan, i) => (
              <div key={i} style={{
                padding: '48px 40px',
                backgroundColor: plan.popular ? '#111827' : '#FFFFFF',
                position: 'relative',
                textAlign: 'left'
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '24px',
                    right: '24px',
                    padding: '6px 14px',
                    backgroundColor: '#FFFFFF',
                    color: '#111827',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px'
                  }}>
                    POPULAR
                  </div>
                )}
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: plan.popular ? '#FFFFFF' : '#111827',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.5px'
                }}>
                  {plan.name}
                </h3>
                <div style={{ marginBottom: '32px' }}>
                  <span style={{
                    fontSize: '3rem',
                    fontWeight: 700,
                    color: plan.popular ? '#FFFFFF' : '#111827',
                    letterSpacing: '-1px'
                  }}>
                    {plan.price}
                  </span>
                  <span style={{
                    fontSize: '0.95rem',
                    color: plan.popular ? '#D1D5DB' : '#6B7280',
                    marginLeft: '8px'
                  }}>
                    {plan.period}
                  </span>
                </div>
                <button onClick={handleGetStartedClick} style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: plan.popular ? '#FFFFFF' : '#111827',
                  color: plan.popular ? '#111827' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '32px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}>
                  Get Started
                </button>
                <div style={{
                  borderTop: `1px solid ${plan.popular ? '#374151' : '#E5E7EB'}`,
                  paddingTop: '24px'
                }}>
                  {plan.features.map((feature, j) => (
                    <div key={j} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '14px'
                    }}>
                      <span style={{
                        color: plan.popular ? '#FFFFFF' : '#111827',
                        fontSize: '1.1rem',
                        minWidth: '20px'
                      }}>✓</span>
                      <span style={{
                        fontSize: '0.95rem',
                        color: plan.popular ? '#D1D5DB' : '#6B7280',
                        lineHeight: '1.6'
                      }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

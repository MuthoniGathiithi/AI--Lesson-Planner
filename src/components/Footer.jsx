import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToSection = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer style={{
      padding: '60px 20px 30px',
      backgroundColor: '#000',
      color: '#fff'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '48px'
      }}>
        {/* Top Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          width: '100%'
        }}>
          {/* Brand */}
          <div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '16px'
            }}>
              FunzoIQ
            </div>
            <p style={{
              fontSize: '0.9rem',
              color: '#9CA3AF',
              lineHeight: '1.6'
            }}>
              Empowering educators with AI-powered lesson planning tools.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '16px',
              color: '#fff'
            }}>
              Product
            </h4>
            <div
              style={{ fontSize: '0.9rem', color: '#9CA3AF', marginBottom: '12px', cursor: 'pointer' }}
              onClick={() => goToSection('about')}
              onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
              onMouseOut={(e) => e.currentTarget.style.color = '#9CA3AF'}
            >
              About Us
            </div>
            <div
              style={{ fontSize: '0.9rem', color: '#9CA3AF', marginBottom: '12px', cursor: 'pointer' }}
              onClick={() => goToSection('how-it-works')}
              onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
              onMouseOut={(e) => e.currentTarget.style.color = '#9CA3AF'}
            >
              How It Works
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h4 style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '16px',
              color: '#fff'
            }}>
              Legal
            </h4>
            {['Privacy Policy', 'Terms of Service', 'Disclaimer'].map((item, i) => (
              <div key={i} style={{
                fontSize: '0.9rem',
                color: '#9CA3AF',
                marginBottom: '12px',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.color = '#fff'}
              onMouseOut={(e) => e.target.style.color = '#9CA3AF'}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div style={{
          borderTop: '1px solid #374151',
          paddingTop: '24px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#6B7280'
        }}>
          © 2026 FunzoIQ. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

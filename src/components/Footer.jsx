import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      padding: '60px 40px 30px',
      backgroundColor: '#000',
      color: '#FFFFFF'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
          marginBottom: '48px'
        }}>
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
          
          <div>
            <h4 style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '16px',
              color: '#FFFFFF'
            }}>
              Product
            </h4>
            {['Features', 'Pricing', 'Templates', 'Resources'].map((item, i) => (
              <div key={i} style={{
                fontSize: '0.9rem',
                color: '#9CA3AF',
                marginBottom: '12px',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.color = '#FFFFFF'}
              onMouseOut={(e) => e.target.style.color = '#9CA3AF'}>
                {item}
              </div>
            ))}
          </div>
          
          <div>
            <h4 style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '16px',
              color: '#FFFFFF'
            }}>
              Company
            </h4>
            {['About', 'Blog', 'Careers', 'Contact'].map((item, i) => (
              <div key={i} style={{
                fontSize: '0.9rem',
                color: '#9CA3AF',
                marginBottom: '12px',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.color = '#FFFFFF'}
              onMouseOut={(e) => e.target.style.color = '#9CA3AF'}>
                {item}
              </div>
            ))}
          </div>
          
          <div>
            <h4 style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '16px',
              color: '#FFFFFF'
            }}>
              Legal
            </h4>
            {['Privacy', 'Terms', 'Security'].map((item, i) => (
              <div key={i} style={{
                fontSize: '0.9rem',
                color: '#9CA3AF',
                marginBottom: '12px',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.color = '#FFFFFF'}
              onMouseOut={(e) => e.target.style.color = '#9CA3AF'}>
                {item}
              </div>
            ))}
          </div>
        </div>
        
        <div style={{
          borderTop: '1px solid #374151',
          paddingTop: '24px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#6B7280'
        }}>
          © 2025 FunzoIQ. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

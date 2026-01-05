import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Scroll detection for sections on home page
  useEffect(() => {
    const handleScroll = () => {
      // global scrolled state — header color change when user scrolls down
      setScrolled(window.scrollY > 10);

      if (location.pathname !== '/') return;

      const sections = [
        { id: 'about', name: 'about' },
        { id: 'how-it-works', name: 'how-it-works' },
        { id: 'pricing', name: 'pricing' }
      ];

      let currentSection = '';
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            currentSection = section.name;
          }
        }
      }
      // if we're at the very top (no section reached), mark as 'home'
      if (!currentSection) {
        setActiveSection('home');
      } else {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // run once to set initial active section on mount
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleAboutClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('about');
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById('about');
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHomeClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 120);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection('home');
    }
  };

  const handleHowItWorksClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('how-it-works');
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById('how-it-works');
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePricingClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('pricing');
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById('pricing');
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignInClick = () => {
    navigate('/signin');
  };

  const handleGetStartedClick = () => {
    navigate('/signup');
  };

  const activeColor = '#4F46E5';
  // when scrolled, use white for inactive links for visibility on dark bg; otherwise dark text
  const inactiveColor = scrolled ? '#FFFFFF' : '#111827';

  // navbar background: black when scrolled, translucent white at top
  const navBackground = scrolled ? '#000' : 'rgba(255, 255, 255, 0.95)';
  const navBorder = scrolled ? '#000' : '#E5E7EB';

  // logo color: purple if home+active, otherwise white when scrolled for contrast
  const logoColor = (location.pathname === '/' && activeSection === 'home') ? activeColor : (scrolled ? '#FFFFFF' : '#111827');

  // Get Started button colors adapt when scrolled for visibility
  const primaryButtonBg = isActive('/signup') ? activeColor : (scrolled ? '#FFFFFF' : '#111827');
  const primaryButtonText = isActive('/signup') ? '#FFFFFF' : (scrolled ? '#111827' : '#FFFFFF');

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: navBackground,
      backdropFilter: 'blur(10px)',
      borderBottom: 'none',
      zIndex: 60,
      padding: '16px 36px',
      transition: 'background-color 200ms, border-color 200ms, padding 200ms',
      pointerEvents: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <Link to="/" style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: logoColor,
          letterSpacing: '-0.5px',
          textDecoration: 'none',
          transition: 'color 0.2s',
          fontFamily: 'Inter, sans-serif'
        }}>
          FunzoIQ
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <button onClick={handleHomeClick} style={{
            background: 'transparent',
            border: 'none',
            color: activeSection === 'home' ? activeColor : inactiveColor,
            fontSize: '1.25rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 6px',
            transition: 'color 0.15s',
            textShadow: scrolled ? '0 1px 2px rgba(0,0,0,0.6)' : '0 1px 0 rgba(255,255,255,0.6)'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = activeColor}
          onMouseOut={(e) => e.currentTarget.style.color = activeSection === 'home' ? activeColor : inactiveColor}>
            Home
          </button>

          <button onClick={handleAboutClick} style={{
            background: 'transparent',
            border: 'none',
            color: activeSection === 'about' ? activeColor : inactiveColor,
            fontSize: '1.25rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 6px',
            transition: 'color 0.15s',
            textShadow: scrolled ? '0 1px 2px rgba(0,0,0,0.6)' : '0 1px 0 rgba(255,255,255,0.6)'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = activeColor}
          onMouseOut={(e) => e.currentTarget.style.color = activeSection === 'about' ? activeColor : inactiveColor}>
            About Us
          </button>

          <button onClick={handleHowItWorksClick} style={{
            background: 'transparent',
            border: 'none',
            color: activeSection === 'how-it-works' ? activeColor : inactiveColor,
            fontSize: '1.25rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 6px',
            transition: 'color 0.15s',
            textShadow: scrolled ? '0 1px 2px rgba(0,0,0,0.6)' : '0 1px 0 rgba(255,255,255,0.6)'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = activeColor}
          onMouseOut={(e) => e.currentTarget.style.color = activeSection === 'how-it-works' ? activeColor : inactiveColor}>
            How It Works
          </button>

          <button onClick={handlePricingClick} style={{
            background: 'transparent',
            border: 'none',
            fontSize: '1.25rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'color 0.15s',
            color: activeSection === 'pricing' ? activeColor : inactiveColor,
            padding: '6px 6px',
            textShadow: scrolled ? '0 1px 2px rgba(0,0,0,0.6)' : '0 1px 0 rgba(255,255,255,0.6)'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = activeColor}
          onMouseOut={(e) => e.currentTarget.style.color = activeSection === 'pricing' ? activeColor : inactiveColor}>
            Contacts
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={handleSignInClick} style={{
            background: 'none',
            border: 'none',
            color: isActive('/signin') ? activeColor : inactiveColor,
            fontSize: '1.25rem',
            fontWeight: 500,
            padding: '8px 20px',
            cursor: 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.color = activeColor}
          onMouseOut={(e) => e.target.style.color = isActive('/signin') ? activeColor : inactiveColor}>
            Sign In
          </button>
          <button onClick={handleGetStartedClick} style={{
            background: primaryButtonBg,
            border: 'none',
            color: primaryButtonText,
            fontSize: '0.95rem',
            fontWeight: 600,
            padding: '10px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = activeColor;
            e.target.style.color = '#FFFFFF';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = primaryButtonBg;
            e.target.style.color = primaryButtonText;
            e.target.style.transform = 'translateY(0)';
          }}>
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

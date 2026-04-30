import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Animated background orbs */}
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="grid-pattern"></div>

      <div className="landing-container">
        {/* Header */}
        <header className="landing-header animate-fade-in-up">
          <div className="logo-container">
            <div className="logo-icon">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="28" height="24" rx="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12h28" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 4v8" stroke="currentColor" strokeWidth="2"/>
                <path d="M22 4v8" stroke="currentColor" strokeWidth="2"/>
                <path d="M11 18l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="logo-text">
              <h1>AttendEase</h1>
              <span className="logo-tagline">Smart Attendance System</span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="landing-hero">
          <div className="hero-content animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Powered by Intelligence
            </div>
            <h2 className="hero-title">
              Streamline Your
              <br />
              <span className="gradient-text">Attendance Tracking</span>
            </h2>
            <p className="hero-subtitle">
              A modern, secure platform for managing student attendance 
              with real-time insights and seamless workflow.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="role-cards animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {/* Admin Card */}
            <button
              className="role-card role-card-admin"
              onClick={() => navigate('/admin/login')}
              id="admin-login-card"
            >
              <div className="card-glow card-glow-admin"></div>
              <div className="card-content">
                <div className="card-icon-wrapper admin-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C8.7 15 2 16.65 2 20V22H22V20C22 16.65 15.3 15 12 15Z" fill="currentColor" opacity="0.3"/>
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="currentColor"/>
                    <path d="M20 9V7H18V9H16V11H18V13H20V11H22V9H20Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="card-info">
                  <h3>Admin Portal</h3>
                  <p>Manage attendance records, view analytics, and oversee student data</p>
                </div>
                <div className="card-action">
                  <span>Sign In</span>
                  <svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </button>

            {/* Divider */}
            <div className="cards-divider">
              <div className="divider-line"></div>
              <span className="divider-text">OR</span>
              <div className="divider-line"></div>
            </div>

            {/* Student Card */}
            <button
              className="role-card role-card-student"
              onClick={() => navigate('/student/login')}
              id="student-login-card"
            >
              <div className="card-glow card-glow-student"></div>
              <div className="card-content">
                <div className="card-icon-wrapper student-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" fill="currentColor" opacity="0.3"/>
                    <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="card-info">
                  <h3>Student Portal</h3>
                  <p>View your attendance records, track progress, and stay updated</p>
                </div>
                <div className="card-action">
                  <span>Sign In</span>
                  <svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="landing-footer animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <p>© 2024 AttendEase — Attendance Management System</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;

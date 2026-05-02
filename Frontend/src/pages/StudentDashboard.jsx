import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner';
import AttendanceSummary from '../components/AttendanceSummary';
import './Dashboard.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'scan', label: 'Scan QR', icon: '📷' },
  { id: 'attendance', label: 'My Attendance', icon: '📋' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      <div className="grid-pattern"></div>

      {/* ─── Navbar ─── */}
      <nav className="dashboard-nav glass">
        <div className="nav-brand">
          <div className="nav-logo">
            <svg viewBox="0 0 32 32" fill="none" width="24" height="24">
              <rect x="2" y="4" width="28" height="24" rx="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 12h28" stroke="currentColor" strokeWidth="2"/>
              <path d="M11 18l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="nav-title">AttendEase</span>
          <span className="nav-badge student-badge">Student</span>
        </div>

        {/* Mobile-only greeting shown between brand and logout */}
        <span className="nav-mobile-greeting">{user?.name}</span>

        <div className="nav-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              id={`tab-${tab.id}`}
            >
              <span className="nav-tab-icon">{tab.icon}</span>
              <span className="nav-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="nav-user">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">UID: {user?.uid} · Year {user?.year}</span>
          </div>
          <button className="logout-btn desktop-only" onClick={handleLogout} id="student-logout-btn">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd"/>
              <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 00-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd"/>
            </svg>
            <span className="logout-btn-label">Logout</span>
          </button>
        </div>
      </nav>

      {/* ─── Mobile tab bar ─── */}
      <div className="mobile-tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`mobile-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span className="mobile-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Content ─── */}
      <main className="dashboard-content">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in-up">
            <div className="welcome-section">
              <h1>Welcome, <span className="gradient-text-teal">{user?.name}</span></h1>
              <p>Year {user?.year} Student · UID: {user?.uid}</p>
            </div>
            <div className="stats-grid" style={{ animationDelay: '0.15s' }}>
              <div className="stat-card glass" onClick={() => setActiveTab('scan')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary-400)' }}>
                  <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <path d="M14 14h2v2h-2zM18 14h3v2h-3zM14 18h3v2h-3zM19 18h2v3h-2z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Scan QR</span>
                  <span className="stat-value" style={{ fontSize: '1rem', fontWeight: 600 }}>Mark Attendance →</span>
                </div>
              </div>
              <div className="stat-card glass" onClick={() => setActiveTab('attendance')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon" style={{ background: 'rgba(20,184,166,0.12)', color: 'var(--accent-400)' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">My Attendance</span>
                  <span className="stat-value" style={{ fontSize: '1rem', fontWeight: 600 }}>View Report →</span>
                </div>
              </div>
            </div>

            {/* Quick scan CTA */}
            <div className="scan-cta glass animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="scan-cta-left">
                <h3>Ready to mark attendance?</h3>
                <p>Ask your teacher to display the QR code, then tap Scan.</p>
              </div>
              <button
                className="scan-cta-btn"
                onClick={() => setActiveTab('scan')}
                id="quick-scan-btn"
              >
                📷 Scan QR Now
              </button>
            </div>
          </div>
        )}

        {/* QR Scanner */}
        {activeTab === 'scan' && (
          <div className="animate-fade-in-up">
            <div className="tab-header">
              <h2 className="tab-title">📷 Scan QR Code</h2>
              <p className="tab-sub">Mark your attendance by scanning the QR displayed by your teacher</p>
            </div>
            <QRScanner />
          </div>
        )}

        {/* My Attendance */}
        {activeTab === 'attendance' && (
          <div className="animate-fade-in-up">
            <div className="tab-header">
              <h2 className="tab-title">📋 My Attendance</h2>
              <p className="tab-sub">View your attendance records, stats, and history for each subject</p>
            </div>
            <AttendanceSummary />
          </div>
        )}

        {/* Profile / Logout */}
        {activeTab === 'profile' && (
          <div className="animate-fade-in-up">
            <div className="tab-header">
              <h2 className="tab-title">👤 My Profile</h2>
              <p className="tab-sub">Manage your account and view your details</p>
            </div>
            
            <div className="profile-card glass">
              <div className="profile-header">
                <div className="profile-avatar">
                  {user?.name?.charAt(0) || 'S'}
                </div>
                <div className="profile-info">
                  <h3>{user?.name}</h3>
                  <p>Year {user?.year} Student</p>
                </div>
              </div>
              
              <div className="profile-details">
                <div className="profile-detail-item">
                  <span className="label">University ID</span>
                  <span className="value">{user?.uid}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="label">Academic Year</span>
                  <span className="value">Year {user?.year}</span>
                </div>
              </div>

              <button className="profile-logout-btn" onClick={handleLogout}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                  <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd"/>
                  <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 00-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd"/>
                </svg>
                Logout from Device
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;

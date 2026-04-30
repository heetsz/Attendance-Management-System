import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SubjectManager from '../components/SubjectManager';
import './Dashboard.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'subjects', label: 'Subjects & QR', icon: '📚' },
];

const AdminDashboard = () => {
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
          <span className="nav-badge admin-badge">Admin</span>
        </div>
        <div className="nav-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              id={`admin-tab-${tab.id}`}
            >
              <span className="nav-tab-icon">{tab.icon}</span>
              <span className="nav-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="nav-user">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">@{user?.username}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout} id="admin-logout-btn">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd"/>
              <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 00-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd"/>
            </svg>
            Logout
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
              <h1>Welcome back, <span className="gradient-text">{user?.name}</span></h1>
              <p>Manage subjects and generate QR codes for attendance tracking.</p>
            </div>
            <div className="stats-grid" style={{ animationDelay: '0.15s' }}>
              <div
                className="stat-card glass"
                onClick={() => setActiveTab('subjects')}
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary-400)' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Subjects & QR</span>
                  <span className="stat-value" style={{ fontSize: '1rem', fontWeight: 600 }}>Manage →</span>
                </div>
              </div>
            </div>

            <div className="admin-info-box glass animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h3>📡 How QR Attendance Works</h3>
              <ol className="admin-steps">
                <li>Go to <strong>Subjects & QR</strong> tab and add subjects for each year with a predefined teacher</li>
                <li>Click <strong>📷 QR</strong> next to a subject to generate a one-time QR code (valid 10 min)</li>
                <li>Display the QR code on screen — students scan it with their app</li>
                <li>Attendance is automatically recorded per student per lecture</li>
              </ol>
            </div>
          </div>
        )}

        {/* Subjects & QR */}
        {activeTab === 'subjects' && (
          <div className="animate-fade-in-up">
            <div className="tab-header">
              <h2 className="tab-title">📚 Subjects & QR Generator</h2>
              <p className="tab-sub">Add subjects per year with a teacher, then generate a QR code for each lecture</p>
            </div>
            <SubjectManager />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

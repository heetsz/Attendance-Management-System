import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TakeAttendance from '../components/TakeAttendance';
import './Dashboard.css';

const SIDEBAR_TABS = [
  { id: 'attendance', label: 'Take Attendance', icon: '📋' },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('attendance');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      <div className="grid-pattern"></div>

      {/* ─── Collapsible Sidebar ─── */}
      <aside className={`admin-sidebar glass ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="nav-logo">
              <svg viewBox="0 0 32 32" fill="none" width="22" height="22">
                <rect x="2" y="4" width="28" height="24" rx="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12h28" stroke="currentColor" strokeWidth="2"/>
                <path d="M11 18l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {sidebarOpen && <span className="sidebar-title">AttendEase</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(prev => !prev)}
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              {sidebarOpen ? (
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd"/>
              ) : (
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd"/>
              )}
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {SIDEBAR_TABS.map(tab => (
            <button
              key={tab.id}
              className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
            >
              <span className="sidebar-tab-icon">{tab.icon}</span>
              {sidebarOpen && <span className="sidebar-tab-label">{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="sidebar-user">
              <div className="sidebar-avatar">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.name}</span>
                <span className="sidebar-user-role">Admin</span>
              </div>
            </div>
          )}
          <button
            className="sidebar-logout"
            onClick={handleLogout}
            title="Logout"
            id="admin-logout-btn"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd"/>
              <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 00-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd"/>
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ─── Mobile bottom bar ─── */}
      <div className="mobile-tab-bar admin-mobile-bar">
        {SIDEBAR_TABS.map(tab => (
          <button
            key={tab.id}
            className={`mobile-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span className="mobile-tab-label">{tab.label}</span>
          </button>
        ))}
        <button className="mobile-tab" onClick={handleLogout}>
          <span>🚪</span>
          <span className="mobile-tab-label">Logout</span>
        </button>
      </div>

      {/* ─── Main Content ─── */}
      <main className="admin-main">
        <div className="admin-content-header">
          <h1>Welcome back, <span className="gradient-text">{user?.name}</span></h1>
          <p>Smart attendance tracking powered by QR codes</p>
        </div>

        {activeTab === 'attendance' && (
          <div className="animate-fade-in-up">
            <div className="tab-header">
              <h2 className="tab-title">📋 Take Attendance</h2>
              <p className="tab-sub">Select a year, view today's schedule, and start attendance for the current lecture</p>
            </div>
            <TakeAttendance />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

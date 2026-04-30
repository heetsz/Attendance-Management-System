import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const StudentLogin = () => {
  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginStudent } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!uid || !password) { setError('Please fill in all fields'); return; }
    setIsLoading(true);
    try {
      await loginStudent(uid, password);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-bg-orbs">
        <div className="login-orb login-orb-1 student-orb-1"></div>
        <div className="login-orb login-orb-2 student-orb-2"></div>
      </div>
      <div className="grid-pattern"></div>

      <div className="login-container animate-fade-in-up">
        <Link to="/" className="back-link" id="student-back-link">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l3.158 2.96a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd"/>
          </svg>
          Back to Home
        </Link>

        <div className="login-card glass">
          <div className="login-card-accent accent-student"></div>
          <div className="login-header">
            <div className="login-icon-wrapper student-login-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
              </svg>
            </div>
            <h2 className="login-title">Student Sign In</h2>
            <p className="login-subtitle">Access your attendance portal</p>
          </div>

          {error && (
            <div className="login-error animate-fade-in" id="student-login-error">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="student-uid" className="form-label">University ID</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm4.75 6.75a.75.75 0 00-1.5 0v2.546l-.943-1.048a.75.75 0 10-1.114 1.004l2.25 2.5a.75.75 0 001.114 0l2.25-2.5a.75.75 0 00-1.114-1.004l-.943 1.048V8.75z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input type="text" id="student-uid" className="form-input" placeholder="e.g. 2023300208" value={uid} onChange={(e) => setUid(e.target.value)} autoComplete="username" required/>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="student-password" className="form-label">Password</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input type={showPassword ? 'text' : 'password'} id="student-password" className="form-input" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required/>
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/>
                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn student-login-btn" disabled={isLoading} id="student-submit-btn">
              {isLoading ? (<div className="btn-loading"><div className="spinner"></div><span>Signing in...</span></div>) : (<span>Sign In to Portal</span>)}
            </button>
          </form>

          <div className="login-card-footer">
            <p>Are you an admin? <Link to="/admin/login" className="switch-link">Sign in here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;

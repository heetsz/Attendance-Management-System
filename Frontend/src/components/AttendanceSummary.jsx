import { useState, useEffect } from 'react';
import api from '../services/api';
import './AttendanceSummary.css';

const AttendanceSummary = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [history, setHistory] = useState({});
  const [historyLoading, setHistoryLoading] = useState(null);

  useEffect(() => {
    api.get('/attendance/my-attendance')
      .then(r => setData(r.data.attendance))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (subjectId) => {
    if (expandedId === subjectId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(subjectId);

    // Fetch history if not cached
    if (!history[subjectId]) {
      setHistoryLoading(subjectId);
      try {
        const { data } = await api.get(`/attendance/my-attendance/${subjectId}/history`);
        setHistory(prev => ({ ...prev, [subjectId]: data.history }));
      } catch {
        setHistory(prev => ({ ...prev, [subjectId]: [] }));
      } finally {
        setHistoryLoading(null);
      }
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="as-loading">
        <div className="as-spinner"/>
        <p>Loading attendance…</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="as-empty glass">
        <div className="as-empty-icon">📋</div>
        <p>No subjects found for your year. The admin hasn't set up subjects yet.</p>
      </div>
    );
  }

  // Overall stats
  const totalAttended = data.reduce((a, s) => a + s.attended, 0);
  const totalLectures = data.reduce((a, s) => a + s.totalLectures, 0);
  const totalMissed = totalLectures - totalAttended;
  const overallPct = totalLectures > 0 ? Math.round((totalAttended / totalLectures) * 100) : 0;

  const getColor = (pct) => {
    if (pct >= 75) return 'var(--success)';
    if (pct >= 50) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <div className="as-container">
      {/* Overall stats grid */}
      <div className="as-stats-row">
        <div className="as-stat-card glass">
          <span className="as-stat-icon">📚</span>
          <span className="as-stat-num">{totalLectures}</span>
          <span className="as-stat-lbl">Total Lectures</span>
        </div>
        <div className="as-stat-card glass">
          <span className="as-stat-icon">✅</span>
          <span className="as-stat-num" style={{ color: 'var(--success)' }}>{totalAttended}</span>
          <span className="as-stat-lbl">Attended</span>
        </div>
        <div className="as-stat-card glass">
          <span className="as-stat-icon">❌</span>
          <span className="as-stat-num" style={{ color: 'var(--error)' }}>{totalMissed}</span>
          <span className="as-stat-lbl">Missed</span>
        </div>
      </div>

      {/* Overall percentage card */}
      <div className="as-overall glass">
        <div className="as-overall-left">
          <p className="as-overall-label">Overall Attendance</p>
          <p className="as-overall-pct" style={{ color: getColor(overallPct) }}>
            {overallPct}%
          </p>
          <p className="as-overall-sub">
            {overallPct >= 75 ? '✨ Great work! Keep it up' :
             overallPct >= 50 ? '⚠️ Needs improvement' :
             '🚨 Critical — attend more lectures'}
          </p>
        </div>
        <div className="as-overall-ring">
          <svg viewBox="0 0 80 80" width="80" height="80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
            <circle
              cx="40" cy="40" r="32" fill="none"
              stroke={getColor(overallPct)}
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 32}`}
              strokeDashoffset={`${2 * Math.PI * 32 * (1 - overallPct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <span className="as-ring-label" style={{ color: getColor(overallPct) }}>{overallPct}%</span>
        </div>
      </div>

      {/* Per-subject rows — clickable to expand */}
      <div className="as-subjects">
        <p className="as-section-title">Subject Breakdown</p>
        {data.map(s => {
          const color = getColor(s.percentage);
          const dashArray = 2 * Math.PI * 18;
          const dashOffset = dashArray * (1 - s.percentage / 100);
          const isExpanded = expandedId === s.subjectId;
          const subHistory = history[s.subjectId] || [];
          const isLoadingHistory = historyLoading === s.subjectId;

          return (
            <div key={s.subjectId} className={`as-row-wrapper ${isExpanded ? 'expanded' : ''}`}>
              <div
                className="as-row glass"
                onClick={() => toggleExpand(s.subjectId)}
                role="button"
                tabIndex={0}
              >
                <div className="as-row-info">
                  <p className="as-row-name">{s.name}</p>
                  <p className="as-row-teacher">{s.teacher}</p>
                  <div className="as-row-stats">
                    <span className="as-stat-chip attended">✓ {s.attended}</span>
                    <span className="as-stat-chip missed">✗ {s.missed}</span>
                    <span className="as-stat-chip total">📚 {s.totalLectures}</span>
                  </div>
                </div>
                <div className="as-row-right">
                  <div className="as-row-ring">
                    <svg viewBox="0 0 44 44" width="48" height="48">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
                      <circle
                        cx="22" cy="22" r="18" fill="none"
                        stroke={color}
                        strokeWidth="5"
                        strokeDasharray={dashArray}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        transform="rotate(-90 22 22)"
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                      />
                    </svg>
                    <span className="as-ring-pct" style={{ color }}>{s.percentage}%</span>
                  </div>
                  <span className={`as-expand-icon ${isExpanded ? 'open' : ''}`}>▾</span>
                </div>
              </div>

              {/* Expanded History */}
              {isExpanded && (
                <div className="as-history">
                  {isLoadingHistory && (
                    <div className="as-history-loading">
                      <div className="as-spinner-sm" />
                      <span>Loading history…</span>
                    </div>
                  )}
                  {!isLoadingHistory && subHistory.length === 0 && (
                    <div className="as-history-empty">
                      No attendance records yet
                    </div>
                  )}
                  {!isLoadingHistory && subHistory.length > 0 && (
                    <div className="as-history-list">
                      {subHistory.map((h, i) => (
                        <div key={h.id} className="as-history-item" style={{ animationDelay: `${i * 0.05}s` }}>
                          <div className="as-history-dot" />
                          <div className="as-history-content">
                            <span className="as-history-date">{formatDate(h.markedAt)}</span>
                            <span className="as-history-time">{formatTime(h.markedAt)}</span>
                          </div>
                          <span className="as-history-badge">Present</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceSummary;

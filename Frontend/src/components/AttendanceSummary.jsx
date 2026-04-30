import { useState, useEffect } from 'react';
import api from '../services/api';
import './AttendanceSummary.css';

const AttendanceSummary = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/my-attendance')
      .then(r => setData(r.data.attendance))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
  const overallPct = totalLectures > 0 ? Math.round((totalAttended / totalLectures) * 100) : 0;

  const getColor = (pct) => {
    if (pct >= 75) return 'var(--success)';
    if (pct >= 50) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <div className="as-container">
      {/* Overall card */}
      <div className="as-overall glass">
        <div className="as-overall-left">
          <p className="as-overall-label">Overall Attendance</p>
          <p className="as-overall-pct" style={{ color: getColor(overallPct) }}>
            {overallPct}%
          </p>
          <p className="as-overall-sub">
            {totalAttended} attended · {totalLectures - totalAttended} missed · {totalLectures} total
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

      {/* Per-subject rows */}
      <div className="as-subjects">
        {data.map(s => {
          const color = getColor(s.percentage);
          const dashArray = 2 * Math.PI * 18;
          const dashOffset = dashArray * (1 - s.percentage / 100);
          return (
            <div key={s.subjectId} className="as-row glass">
              <div className="as-row-info">
                <p className="as-row-name">{s.name}</p>
                <p className="as-row-teacher">{s.teacher}</p>
                <div className="as-row-stats">
                  <span className="as-stat-chip attended">✓ {s.attended} attended</span>
                  <span className="as-stat-chip missed">✗ {s.missed} missed</span>
                </div>
              </div>
              <div className="as-row-ring">
                <svg viewBox="0 0 44 44" width="52" height="52">
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceSummary;

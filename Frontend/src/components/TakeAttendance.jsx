import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import './TakeAttendance.css';

const YEARS = [1, 2, 3, 4];

const TakeAttendance = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch today's timetable
  const fetchToday = async (year) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/attendance/timetable/${year}/today`);
      setTodayData(data);
    } catch (err) {
      setError('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedYear) fetchToday(selectedYear);
  }, [selectedYear]);

  const handleStartAttendance = async (slot) => {
    setQrLoading(true);
    setError('');
    try {
      const { data } = await api.post('/attendance/timetable/start', {
        subjectId: slot.subjectId,
        year: selectedYear,
      });
      setQrData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start attendance');
    } finally {
      setQrLoading(false);
    }
  };

  const closeQr = () => {
    setQrData(null);
    if (selectedYear) fetchToday(selectedYear);
  };

  // Format time for display
  const formatTime = (t) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="ta-container">
      {/* Year Selector */}
      {!selectedYear && (
        <div className="ta-year-select animate-fade-in-up">
          <div className="ta-year-header">
            <div className="ta-year-icon">🎓</div>
            <h3>Select Year</h3>
            <p>Choose the class year to take attendance</p>
          </div>
          <div className="ta-year-grid">
            {YEARS.map(y => (
              <button
                key={y}
                className="ta-year-card glass"
                onClick={() => setSelectedYear(y)}
              >
                <span className="ta-year-num">Year {y}</span>
                <span className="ta-year-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Today's Schedule */}
      {selectedYear && !qrData && (
        <div className="animate-fade-in-up">
          <div className="ta-schedule-header">
            <button className="ta-back-btn" onClick={() => { setSelectedYear(null); setTodayData(null); }}>
              ← Back
            </button>
            <div>
              <h3>Year {selectedYear} — Today's Schedule</h3>
              {todayData && <span className="ta-day-badge">{todayData.day}</span>}
            </div>
          </div>

          {loading && <div className="ta-loading">Loading schedule…</div>}
          {error && <div className="ta-error">{error}</div>}

          {todayData && todayData.slots.length === 0 && (
            <div className="ta-empty glass">
              <span className="ta-empty-icon">📭</span>
              <p>{todayData.message || 'No lectures scheduled for today'}</p>
            </div>
          )}

          {todayData && todayData.slots.length > 0 && (
            <div className="ta-slots">
              {todayData.slots.map((slot, i) => (
                <div
                  key={slot._id}
                  className={`ta-slot glass ${i === todayData.currentSlotIndex ? 'current' : ''} ${slot.status === 'taken' ? 'taken' : ''}`}
                >
                  <div className="ta-slot-time">
                    <span className="ta-time-start">{formatTime(slot.startTime)}</span>
                    <span className="ta-time-sep">–</span>
                    <span className="ta-time-end">{formatTime(slot.endTime)}</span>
                  </div>
                  <div className="ta-slot-info">
                    <span className="ta-slot-subject">{slot.subject}</span>
                    <span className="ta-slot-teacher">{slot.teacher}</span>
                  </div>
                  <div className="ta-slot-action">
                    {slot.status === 'taken' ? (
                      <span className="ta-taken-badge">✓ Taken</span>
                    ) : i === todayData.currentSlotIndex ? (
                      <button
                        className="ta-start-btn pulse-glow"
                        onClick={() => handleStartAttendance(slot)}
                        disabled={qrLoading}
                      >
                        {qrLoading ? '⏳' : '▶ START'}
                      </button>
                    ) : (
                      <button
                        className="ta-start-btn secondary"
                        onClick={() => handleStartAttendance(slot)}
                        disabled={qrLoading}
                      >
                        {qrLoading ? '⏳' : 'Start'}
                      </button>
                    )}
                  </div>
                  {i === todayData.currentSlotIndex && slot.status !== 'taken' && (
                    <div className="ta-current-label">◉ HAPPENING NOW</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QR Display Modal — rendered via Portal to escape parent stacking contexts */}
      {qrData && createPortal(
        <div className="ta-qr-overlay" onClick={closeQr}>
          <div className="ta-qr-modal glass" onClick={e => e.stopPropagation()}>
            <button className="ta-qr-close" onClick={closeQr}>✕</button>

            <h3 className="ta-qr-title">
              {qrData.subject.name}
              <span className="ta-qr-sub">Year {qrData.subject.year} · {qrData.subject.teacher}</span>
            </h3>

            <div className="ta-qr-img-wrap">
              <img src={qrData.qrDataUrl} alt="QR Code" className="ta-qr-img" />
            </div>

            <p className="ta-qr-timer">⏱ Expires in <strong>10 minutes</strong></p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TakeAttendance;

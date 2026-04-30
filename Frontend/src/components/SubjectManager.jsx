import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { io } from 'socket.io-client';
import './SubjectManager.css';

// Predefined teachers per course/department
const PREDEFINED_TEACHERS = [
  'Prof. Anil Mehta',
  'Dr. Sunita Rao',
  'Prof. Rajesh Sharma',
  'Dr. Kavita Patel',
  'Prof. Deepak Verma',
  'Dr. Priya Nair',
  'Prof. Suresh Kumar',
  'Dr. Meena Joshi',
  'Prof. Vikram Singh',
  'Dr. Anita Desai',
];

const YEARS = [1, 2, 3, 4];

const SubjectManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [filterYear, setFilterYear] = useState('all');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', teacher: '', year: '1' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // QR state
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrSubjectId, setQrSubjectId] = useState(null);
  
  // Real-time state
  const [scanCount, setScanCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  const fetchSubjects = async (year) => {
    setLoading(true);
    try {
      const params = year !== 'all' ? { year } : {};
      const { data } = await api.get('/attendance/subjects', { params });
      setSubjects(data.subjects);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects(filterYear);

    // Setup Socket
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socketRef.current = io(socketUrl, { withCredentials: true });

    socketRef.current.on('student_scanned', (data) => {
      // Only process if the modal is open for THIS session
      if (qrData && data.sessionId === qrData.sessionId) {
        setScanCount(prev => prev + 1);
        
        // Add notification
        const id = Date.now();
        setNotifications(prev => [{ id, name: data.studentName }, ...prev].slice(0, 5));
        
        // Remove notification after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [filterYear, qrData]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!form.name.trim() || !form.teacher || !form.year) {
      setFormError('All fields are required.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/attendance/subjects', form);
      setFormSuccess('Subject added successfully!');
      setForm({ name: '', teacher: '', year: '1' });
      fetchSubjects(filterYear);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add subject.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await api.delete(`/attendance/subjects/${id}`);
      fetchSubjects(filterYear);
    } catch {
      // ignore
    }
  };

  const handleGenerateQR = async (subjectId) => {
    setQrLoading(true);
    setQrSubjectId(subjectId);
    setQrData(null);
    setScanCount(0);
    setNotifications([]);
    try {
      const { data } = await api.post('/attendance/qr/generate', { subjectId });
      setQrData(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate QR');
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div className="sm-container">
      {/* Add Subject Form */}
      <div className="sm-card glass">
        <h3 className="sm-card-title">
          <span className="sm-icon">📚</span>
          Add Subject
        </h3>
        <form className="sm-form" onSubmit={handleAdd}>
          <div className="sm-form-row">
            <div className="sm-field">
              <label>Subject Name</label>
              <input
                type="text"
                className="sm-input"
                placeholder="e.g. Data Structures"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                id="subject-name-input"
              />
            </div>
            <div className="sm-field">
              <label>Year</label>
              <select
                className="sm-input"
                value={form.year}
                onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                id="subject-year-select"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
            <div className="sm-field sm-field-wide">
              <label>Teacher</label>
              <select
                className="sm-input"
                value={form.teacher}
                onChange={e => setForm(p => ({ ...p, teacher: e.target.value }))}
                id="subject-teacher-select"
              >
                <option value="">— Select Teacher —</option>
                {PREDEFINED_TEACHERS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          {formError && <p className="sm-error">{formError}</p>}
          {formSuccess && <p className="sm-success">{formSuccess}</p>}
          <button className="sm-btn-primary" type="submit" disabled={submitting} id="add-subject-btn">
            {submitting ? 'Adding…' : '+ Add Subject'}
          </button>
        </form>
      </div>

      {/* Subject List */}
      <div className="sm-card glass">
        <div className="sm-list-header">
          <h3 className="sm-card-title">
            <span className="sm-icon">🗂️</span>
            Subjects
          </h3>
          <div className="sm-year-tabs">
            <button
              className={`sm-year-tab ${filterYear === 'all' ? 'active' : ''}`}
              onClick={() => setFilterYear('all')}
            >All</button>
            {YEARS.map(y => (
              <button
                key={y}
                className={`sm-year-tab ${filterYear === String(y) ? 'active' : ''}`}
                onClick={() => setFilterYear(String(y))}
              >Y{y}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="sm-loading">Loading subjects…</div>
        ) : subjects.length === 0 ? (
          <div className="sm-empty">No subjects found. Add one above.</div>
        ) : (
          <div className="sm-table-wrap">
            <table className="sm-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(s => (
                  <tr key={s._id}>
                    <td className="sm-subject-name">{s.name}</td>
                    <td className="sm-teacher">{s.teacher}</td>
                    <td><span className="sm-year-badge">Year {s.year}</span></td>
                    <td>
                      <div className="sm-actions">
                        <button
                          className="sm-btn-qr"
                          onClick={() => handleGenerateQR(s._id)}
                          disabled={qrLoading && qrSubjectId === s._id}
                          id={`qr-btn-${s._id}`}
                        >
                          {qrLoading && qrSubjectId === s._id ? '⏳' : '📷 QR'}
                        </button>
                        <button
                          className="sm-btn-del"
                          onClick={() => handleDelete(s._id)}
                          id={`del-btn-${s._id}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrData && (
        <div className="sm-qr-overlay" onClick={() => setQrData(null)}>
          <div className="sm-qr-modal glass" onClick={e => e.stopPropagation()}>
            <button className="sm-qr-close" onClick={() => setQrData(null)}>✕</button>
            <h3 className="sm-qr-title">
              {qrData.subject.name}
              <span className="sm-qr-sub">Year {qrData.subject.year} · {qrData.subject.teacher}</span>
            </h3>
            
            <div className="sm-qr-img-wrap">
              <img src={qrData.qrDataUrl} alt="QR Code" className="sm-qr-img" />
              <div className="sm-qr-live-badge">LIVE</div>
            </div>

            <div className="sm-qr-stats">
              <div className="sm-stat-item">
                <span className="sm-stat-val animate-pop">{scanCount}</span>
                <span className="sm-stat-label">Students Present</span>
              </div>
            </div>

            <p className="sm-qr-info">⏱ Expires in <strong>10 minutes</strong></p>

            {/* Live Popups / Notifications */}
            <div className="sm-notifications">
              {notifications.map(n => (
                <div key={n.id} className="sm-notif animate-fade-in-right">
                  <span className="sm-notif-icon">✅</span>
                  <span className="sm-notif-text"><strong>{n.name}</strong> marked present</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManager;

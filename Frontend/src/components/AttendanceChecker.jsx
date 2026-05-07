import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import './AttendanceChecker.css';

const YEARS = [1, 2, 3, 4];

const AttendanceChecker = ({ onStateChange }) => {
  const [year, setYear] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState('');

  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState('');
  const [overview, setOverview] = useState(null);

  const selectedSubject = useMemo(() => {
    return subjects.find(s => s._id === selectedSubjectId) || null;
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    const fetchSubjects = async () => {
      setSubjectsLoading(true);
      setSubjectsError('');
      setSubjects([]);
      setSelectedSubjectId('');
      setOverview(null);
      setOverviewError('');

      try {
        const { data } = await api.get('/attendance/subjects', { params: { year } });
        setSubjects(data.subjects || []);
      } catch (err) {
        setSubjectsError(err.response?.data?.message || 'Failed to load subjects');
      } finally {
        setSubjectsLoading(false);
      }
    };

    fetchSubjects();
  }, [year]);

  useEffect(() => {
    const fetchOverview = async () => {
      if (!selectedSubjectId) return;

      setOverviewLoading(true);
      setOverviewError('');
      setOverview(null);

      try {
        const { data } = await api.get(`/attendance/subject-attendance/${selectedSubjectId}`);
        setOverview(data);
      } catch (err) {
        setOverviewError(err.response?.data?.message || 'Failed to load attendance');
      } finally {
        setOverviewLoading(false);
      }
    };

    fetchOverview();
  }, [selectedSubjectId]);

  useEffect(() => {
    if (typeof onStateChange !== 'function') return;
    onStateChange({
      year,
      selectedSubjectId,
      selectedSubject,
      subjects,
      overview,
      subjectsLoading,
      overviewLoading,
      subjectsError,
      overviewError,
    });
  }, [
    onStateChange,
    year,
    selectedSubjectId,
    selectedSubject,
    subjects,
    overview,
    subjectsLoading,
    overviewLoading,
    subjectsError,
    overviewError,
  ]);

  return (
    <div className="ac-container">
      <div className="ac-card glass">
        <div className="ac-header">
          <div>
            <h3 className="ac-title">📊 Attendance Checker</h3>
            <p className="ac-sub">Pick a year and subject to see each student’s attendance.</p>
          </div>
        </div>

        <div className="ac-controls">
          <div className="ac-year-tabs">
            {YEARS.map(y => (
              <button
                key={y}
                className={`ac-year-tab ${year === y ? 'active' : ''}`}
                onClick={() => setYear(y)}
                type="button"
              >
                Year {y}
              </button>
            ))}
          </div>

          <div className="ac-subject-select">
            <label className="ac-label">Subject</label>
            <select
              className="ac-select"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={subjectsLoading || subjects.length === 0}
            >
              <option value="">— Select Subject —</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.teacher})
                </option>
              ))}
            </select>
          </div>
        </div>

        {subjectsLoading && <div className="ac-info">Loading subjects…</div>}
        {subjectsError && <div className="ac-error">{subjectsError}</div>}

        {!subjectsLoading && !subjectsError && subjects.length === 0 && (
          <div className="ac-info">No subjects found for Year {year}.</div>
        )}
      </div>

      <div className="ac-card glass">
        <div className="ac-overview-header">
          <div>
            <h3 className="ac-title">🧾 Subject Attendance</h3>
            {selectedSubject ? (
              <p className="ac-sub">
                {selectedSubject.name} · {selectedSubject.teacher} · Year {selectedSubject.year}
              </p>
            ) : (
              <p className="ac-sub">Select a subject to view attendance.</p>
            )}
          </div>

          {overview?.totalLectures != null && (
            <div className="ac-metric">
              <span className="ac-metric-val">{overview.totalLectures}</span>
              <span className="ac-metric-label">Total Lectures</span>
            </div>
          )}
        </div>

        {overviewLoading && <div className="ac-info">Loading attendance…</div>}
        {overviewError && <div className="ac-error">{overviewError}</div>}

        {!overviewLoading && !overviewError && overview?.rows?.length > 0 && (
          <div className="ac-table-wrap">
            <table className="ac-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>UID</th>
                  <th>Attended</th>
                  <th>Missed</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {overview.rows.map((r) => (
                  <tr key={r.studentId}>
                    <td className="ac-student">{r.name}</td>
                    <td className="ac-uid">{r.uid}</td>
                    <td>{r.attended}</td>
                    <td>{r.missed}</td>
                    <td>
                      <span className={`ac-pill ${r.percentage > 75 ? 'good' : 'bad'}`}>
                        {r.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!overviewLoading && !overviewError && selectedSubjectId && overview?.rows?.length === 0 && (
          <div className="ac-info">No students found for this subject/year.</div>
        )}
      </div>
    </div>
  );
};

export default AttendanceChecker;

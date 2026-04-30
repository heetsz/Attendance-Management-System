import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './QRScanner.css';

// Lazy-load html5-qrcode only when needed
let Html5Qrcode;

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const html5QrRef = useRef(null);

  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    setResult(null);
    setError('');

    // Lazy-load library
    if (!Html5Qrcode) {
      try {
        const mod = await import('html5-qrcode');
        Html5Qrcode = mod.Html5Qrcode;
      } catch {
        setError('QR library failed to load.');
        return;
      }
    }

    setScanning(true);
    await new Promise(r => setTimeout(r, 100));

    const qr = new Html5Qrcode('qr-reader');
    html5QrRef.current = qr;

    try {
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          await qr.stop().catch(() => {});
          setScanning(false);
          html5QrRef.current = null;
          await submitToken(decodedText);
        },
        () => {}
      );
    } catch (err) {
      setScanning(false);
      html5QrRef.current = null;
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('notallowed')) {
        setError('camera_denied');
      } else {
        setError('Camera unavailable. Please check your browser permissions.');
      }
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      await html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  const submitToken = async (token) => {
    const trimmed = token.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/attendance/qr/scan', { token: trimmed });
      setResult({
        success: true,
        message: data.message,
        subject: data.subject,
        teacher: data.teacher,
        markedAt: data.markedAt,
      });
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Failed to mark attendance.' });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError('');
  };

  // ── Result screen ──
  if (result) {
    return (
      <div className="qrs-container">
        <div className="qrs-card glass">
          <div className={`qrs-result ${result.success ? 'success' : 'fail'}`}>
            <div className="qrs-result-icon">
              {result.success ? (
                <svg viewBox="0 0 24 24" fill="none" width="56" height="56">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" width="56" height="56">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <h3 className="qrs-result-msg">{result.message}</h3>
            {result.success && (
              <div className="qrs-result-details">
                <div className="qrs-detail-row">
                  <span className="qrs-detail-label">Subject</span>
                  <span className="qrs-detail-val">{result.subject}</span>
                </div>
                <div className="qrs-detail-row">
                  <span className="qrs-detail-label">Teacher</span>
                  <span className="qrs-detail-val">{result.teacher}</span>
                </div>
                <div className="qrs-detail-row">
                  <span className="qrs-detail-label">Time</span>
                  <span className="qrs-detail-val">
                    {new Date(result.markedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )}
            <button className="qrs-btn-reset" onClick={reset} id="scan-again-btn">
              Mark Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qrs-container">
      <div className="qrs-card glass">
        <div className="qrs-camera-section">
          {!scanning && error !== 'camera_denied' && (
            <>
              <div className="qrs-cam-info">
                <div className="qrs-cam-icon">📷</div>
                <h4>Scan QR Code</h4>
                <p>Point your camera at the QR code shown by your teacher</p>
              </div>
              {error && (
                <div className="qrs-error-box">{error}</div>
              )}
              <button className="qrs-btn-start" onClick={startScanner} id="start-scan-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
                Start Camera
              </button>
              <p className="qrs-note">🔒 Camera only used while scanning</p>
            </>
          )}

          {error === 'camera_denied' && (
            <div className="qrs-denied-box">
              <div className="qrs-denied-icon">🚫</div>
              <h4>Camera Access Denied</h4>
              <p>Your browser blocked camera access. Please ensure you are using <strong>HTTPS</strong> or allow camera permissions in your settings.</p>
              <button
                className="qrs-btn-start"
                onClick={startScanner}
              >
                Try Again
              </button>
            </div>
          )}

          {scanning && (
            <>
              <div className="qrs-viewport">
                <div id="qr-reader"></div>
                <div className="qrs-frame">
                  <div className="qrs-corner tl"/><div className="qrs-corner tr"/>
                  <div className="qrs-corner bl"/><div className="qrs-corner br"/>
                  <div className="qrs-scan-line"/>
                </div>
                <p className="qrs-hint">Align QR code within the frame</p>
              </div>
              <button className="qrs-btn-stop" onClick={stopScanner} id="stop-scan-btn">
                ⏹ Stop Camera
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;

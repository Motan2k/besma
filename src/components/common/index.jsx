// ── MODAL ──────────────────────────────────────────────────
import React, { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children, width = 560 }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 14, width: '100%', maxWidth: width, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #E8E6E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#888780', padding: 4, borderRadius: 6, display: 'flex', lineHeight: 1 }}>
            <i className="ti ti-x" />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: 20, flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ── FORM FIELDS ────────────────────────────────────────────
const inputStyle = { width: '100%', padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', border: '0.5px solid #C8C6BE', borderRadius: 7, background: 'white', color: '#1a1a18', outline: 'none', transition: 'border-color 0.15s' };

export function Field({ label, required, error, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#5F5E5A', marginBottom: 5 }}>
        {label} {required && <span style={{ color: '#A32D2D' }}>*</span>}
      </label>}
      {children}
      {hint && <div style={{ fontSize: 11, color: '#888780', marginTop: 3 }}>{hint}</div>}
      {error && <div style={{ fontSize: 11, color: '#A32D2D', marginTop: 3 }}>{error}</div>}
    </div>
  );
}

export function Input({ error, ...props }) {
  return <input style={{ ...inputStyle, borderColor: error ? '#A32D2D' : '#C8C6BE' }}
    onFocus={e => e.target.style.borderColor = '#185FA5'}
    onBlur={e => e.target.style.borderColor = error ? '#A32D2D' : '#C8C6BE'} {...props} />;
}

export function Select({ error, children, ...props }) {
  return <select style={{ ...inputStyle, borderColor: error ? '#A32D2D' : '#C8C6BE', cursor: 'pointer' }} {...props}>{children}</select>;
}

export function Textarea({ error, rows = 3, ...props }) {
  return <textarea rows={rows} style={{ ...inputStyle, borderColor: error ? '#A32D2D' : '#C8C6BE', resize: 'vertical' }}
    onFocus={e => e.target.style.borderColor = '#185FA5'}
    onBlur={e => e.target.style.borderColor = error ? '#A32D2D' : '#C8C6BE'} {...props} />;
}

export function Row({ children, cols = 2 }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>{children}</div>;
}

export function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 14px' }}>
      <div style={{ flex: 1, height: 0.5, background: '#E8E6E0' }} />
      {label && <span style={{ fontSize: 11, color: '#888780', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>}
      <div style={{ flex: 1, height: 0.5, background: '#E8E6E0' }} />
    </div>
  );
}

export function FormActions({ onCancel, loading, submitLabel = 'Salvează' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '0.5px solid #E8E6E0' }}>
      <button type="button" onClick={onCancel}
        style={{ padding: '8px 16px', borderRadius: 7, fontSize: 13, border: '0.5px solid #C8C6BE', background: 'white', color: '#1a1a18', cursor: 'pointer', fontFamily: 'inherit' }}>
        Anulează
      </button>
      <button type="submit" disabled={loading}
        style={{ padding: '8px 20px', borderRadius: 7, fontSize: 13, background: loading ? '#B5D4F4' : '#185FA5', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
        {loading && <i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} />}
        {loading ? 'Se salvează...' : submitLabel}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 7, padding: '10px 14px', fontSize: 13, color: '#A32D2D', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <i className="ti ti-alert-circle" style={{ fontSize: 16, flexShrink: 0 }} />{message}
    </div>
  );
}

export function SuccessBox({ message }) {
  if (!message) return null;
  return (
    <div style={{ background: '#EAF3DE', border: '0.5px solid #C0DD97', borderRadius: 7, padding: '10px 14px', fontSize: 13, color: '#3B6D11', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <i className="ti ti-circle-check" style={{ fontSize: 16, flexShrink: 0 }} />{message}
    </div>
  );
}

// ── FILE UPLOAD ────────────────────────────────────────────
export function FileUpload({ onFile, accept = '.pdf,.jpg,.jpeg,.png', maxMB = 10, label = 'Atașează fișier' }) {
  const ref = React.useRef();
  const [dragOver, setDragOver] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [error, setError] = React.useState('');

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > maxMB * 1024 * 1024) { setError(`Fișierul depășește ${maxMB}MB`); return; }
    setError(''); setFile(f); onFile(f);
  };

  return (
    <div>
      <div onClick={() => ref.current.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        style={{ border: `1.5px dashed ${dragOver ? '#185FA5' : '#C8C6BE'}`, borderRadius: 8, padding: '16px 20px', textAlign: 'center', cursor: 'pointer', background: dragOver ? '#E6F1FB' : '#FAFAF8', transition: 'all 0.15s' }}>
        <i className="ti ti-cloud-upload" style={{ fontSize: 24, color: '#888780', display: 'block', marginBottom: 6 }} />
        {file ? (
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#185FA5' }}>{file.name}</div>
            <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>{(file.size / 1024).toFixed(0)} KB</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 13, color: '#5F5E5A' }}>{label}</div>
            <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>Trage fișierul sau click — max {maxMB}MB</div>
          </div>
        )}
      </div>
      {error && <div style={{ fontSize: 11, color: '#A32D2D', marginTop: 4 }}>{error}</div>}
      <input ref={ref} type="file" accept={accept} style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      {file && (
        <button type="button" onClick={() => { setFile(null); onFile(null); }}
          style={{ marginTop: 6, fontSize: 11, color: '#888780', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          <i className="ti ti-x" /> Elimină fișier
        </button>
      )}
    </div>
  );
}

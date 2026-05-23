import React from 'react';

export function Field({ label, required, error, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{
          display: 'block', fontSize: 12, fontWeight: 500,
          color: '#5F5E5A', marginBottom: 5,
        }}>
          {label} {required && <span style={{ color: '#A32D2D' }}>*</span>}
        </label>
      )}
      {children}
      {hint && <div style={{ fontSize: 11, color: '#888780', marginTop: 3 }}>{hint}</div>}
      {error && <div style={{ fontSize: 11, color: '#A32D2D', marginTop: 3 }}>{error}</div>}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '8px 12px',
  fontSize: 13, fontFamily: 'inherit',
  border: '0.5px solid #C8C6BE', borderRadius: 7,
  background: 'white', color: '#1a1a18',
  outline: 'none', transition: 'border-color 0.15s',
};

export function Input({ error, ...props }) {
  return (
    <input
      style={{ ...inputStyle, borderColor: error ? '#A32D2D' : '#C8C6BE' }}
      onFocus={e => e.target.style.borderColor = '#185FA5'}
      onBlur={e => e.target.style.borderColor = error ? '#A32D2D' : '#C8C6BE'}
      {...props}
    />
  );
}

export function Select({ error, children, ...props }) {
  return (
    <select
      style={{ ...inputStyle, borderColor: error ? '#A32D2D' : '#C8C6BE', cursor: 'pointer' }}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ error, rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      style={{ ...inputStyle, borderColor: error ? '#A32D2D' : '#C8C6BE', resize: 'vertical' }}
      onFocus={e => e.target.style.borderColor = '#185FA5'}
      onBlur={e => e.target.style.borderColor = error ? '#A32D2D' : '#C8C6BE'}
      {...props}
    />
  );
}

export function Row({ children, cols = 2 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 12,
    }}>
      {children}
    </div>
  );
}

export function Divider({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      margin: '18px 0 14px',
    }}>
      <div style={{ flex: 1, height: 0.5, background: '#E8E6E0' }} />
      {label && <span style={{ fontSize: 11, color: '#888780', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>}
      <div style={{ flex: 1, height: 0.5, background: '#E8E6E0' }} />
    </div>
  );
}

export function FormActions({ onCancel, loading, submitLabel = 'Salvează' }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'flex-end', gap: 8,
      marginTop: 20, paddingTop: 16,
      borderTop: '0.5px solid #E8E6E0',
    }}>
      <button
        type="button" onClick={onCancel}
        style={{
          padding: '8px 16px', borderRadius: 7, fontSize: 13,
          border: '0.5px solid #C8C6BE', background: 'white',
          color: '#1a1a18', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        Anulează
      </button>
      <button
        type="submit" disabled={loading}
        style={{
          padding: '8px 20px', borderRadius: 7, fontSize: 13,
          background: loading ? '#B5D4F4' : '#185FA5',
          color: 'white', border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
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
    <div style={{
      background: '#FCEBEB', border: '0.5px solid #F09595',
      borderRadius: 7, padding: '10px 14px',
      fontSize: 13, color: '#A32D2D',
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 14,
    }}>
      <i className="ti ti-alert-circle" style={{ fontSize: 16, flexShrink: 0 }} />
      {message}
    </div>
  );
}

export function SuccessBox({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background: '#EAF3DE', border: '0.5px solid #C0DD97',
      borderRadius: 7, padding: '10px 14px',
      fontSize: 13, color: '#3B6D11',
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 14,
    }}>
      <i className="ti ti-circle-check" style={{ fontSize: 16, flexShrink: 0 }} />
      {message}
    </div>
  );
}

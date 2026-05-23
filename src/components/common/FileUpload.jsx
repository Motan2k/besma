import React, { useRef, useState } from 'react';

export default function FileUpload({ onFile, accept = '.pdf,.jpg,.jpeg,.png', maxMB = 10, label = 'Atașează fișier' }) {
  const ref = useRef();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > maxMB * 1024 * 1024) {
      setError(`Fișierul depășește ${maxMB}MB`);
      return;
    }
    setError('');
    setFile(f);
    onFile(f);
  };

  return (
    <div>
      <div
        onClick={() => ref.current.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `1.5px dashed ${dragOver ? '#185FA5' : '#C8C6BE'}`,
          borderRadius: 8, padding: '16px 20px',
          textAlign: 'center', cursor: 'pointer',
          background: dragOver ? '#E6F1FB' : '#FAFAF8',
          transition: 'all 0.15s',
        }}
      >
        <i className="ti ti-cloud-upload" style={{ fontSize: 24, color: '#888780', display: 'block', marginBottom: 6 }} />
        {file ? (
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#185FA5' }}>{file.name}</div>
            <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>
              {(file.size / 1024).toFixed(0)} KB
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 13, color: '#5F5E5A' }}>{label}</div>
            <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>
              Trage fișierul aici sau click — max {maxMB}MB
            </div>
          </div>
        )}
      </div>
      {error && <div style={{ fontSize: 11, color: '#A32D2D', marginTop: 4 }}>{error}</div>}
      <input
        ref={ref} type="file" accept={accept}
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
      {file && (
        <button
          type="button"
          onClick={() => { setFile(null); onFile(null); }}
          style={{
            marginTop: 6, fontSize: 11, color: '#888780',
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <i className="ti ti-x" /> Elimină fișier
        </button>
      )}
    </div>
  );
}

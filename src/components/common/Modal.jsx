import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, width = 560 }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'white', borderRadius: 14,
        width: '100%', maxWidth: width,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        {/* HEADER */}
        <div style={{
          padding: '16px 20px', borderBottom: '0.5px solid #E8E6E0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 20, color: '#888780', padding: 4, borderRadius: 6,
              display: 'flex', lineHeight: 1,
            }}
          >
            <i className="ti ti-x" />
          </button>
        </div>
        {/* BODY */}
        <div style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

function LoginTab() {
  const { login, loading, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, parola);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 7, padding: '10px 14px', fontSize: 13, color: '#A32D2D', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <i className="ti ti-alert-circle" style={{ fontSize: 16, flexShrink: 0 }} />
          {error}
        </div>
      )}
      <div className="field field-icon">
        <label>Email</label>
        <i className="ti ti-mail fi" />
        <input type="email" placeholder="email@firma.ro" value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }} required />
      </div>
      <div className="field field-icon">
        <label>Parolă</label>
        <i className="ti ti-lock fi" />
        <input type="password" placeholder="••••••••" value={parola}
          onChange={e => { setParola(e.target.value); setError(''); }} required />
      </div>
      <button className="btn-auth" type="submit" disabled={loading} style={{ marginTop: 6 }}>
        {loading
          ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Se autentifică...</>
          : <><i className="ti ti-login" /> Autentificare</>
        }
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}

function ResetForm({ onBack }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [trimis, setTrimis] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await resetPassword(email);
    setTrimis(true);
  };

  return (
    <div>
      <span className="back-link" onClick={onBack}>
        <i className="ti ti-arrow-left" /> Înapoi la login
      </span>
      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, marginBottom: 6 }}>Resetare parolă</div>
      <p style={{ fontSize: 13, color: '#888780', marginBottom: 20 }}>Îți trimitem un link de resetare pe email.</p>
      {trimis ? (
        <div className="success-box">
          <i className="ti ti-circle-check" style={{ fontSize: 18 }} />
          Email trimis! Verifică inbox-ul.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="field field-icon">
            <label>Email</label>
            <i className="ti ti-mail fi" />
            <input type="email" placeholder="email@firma.ro" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button className="btn-auth" type="submit">
            <i className="ti ti-send" /> Trimite link
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  const [showReset, setShowReset] = useState(false);

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: 42, height: 42, background: '#185FA5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <i className="ti ti-car" style={{ fontSize: 22, color: 'white' }} />
          </div>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, color: 'white', letterSpacing: -0.5 }}>BesmaTracking</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Managementul flotei auto</div>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          {[
            { icon: 'ti-file-certificate', titlu: 'Documente în siguranță', desc: 'RCA, ITP, Rovignetă cu alerte automate.' },
            { icon: 'ti-map-pin', titlu: 'Gestionare pe locații', desc: 'Fiecare manager vede doar flota lui.' },
            { icon: 'ti-tool', titlu: 'Istoric service complet', desc: 'Intervenții, costuri și facturi atașate.' },
            { icon: 'ti-bell', titlu: 'Notificări email automate', desc: 'Alertă la 30, 14 și 7 zile înainte de expirare.' },
          ].map(f => (
            <div className="feature-item" key={f.icon}>
              <div className="feature-dot"><i className={`ti ${f.icon}`} /></div>
              <div className="feature-text"><strong>{f.titlu}</strong> — {f.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ position: 'relative', zIndex: 1, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
          © 2026 BesmaTracking
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          {showReset ? (
            <div className="auth-card">
              <ResetForm onBack={() => setShowReset(false)} />
            </div>
          ) : (
            <>
              <div className="auth-title">Bun venit</div>
              <div className="auth-sub">Autentifică-te în contul tău</div>
              <div className="auth-card">
                <LoginTab />
                <div className="forgot-link" style={{ marginTop: 12 }}>
                  <a onClick={() => setShowReset(true)}>Ai uitat parola?</a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

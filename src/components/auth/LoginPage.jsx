import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
        <div className="success-box" style={{ background: '#FCEBEB', borderColor: '#F09595', color: '#A32D2D', marginBottom: 14 }}>
          <i className="ti ti-alert-circle" style={{ fontSize: 18, flexShrink: 0 }} />
          {error}
        </div>
      )}
      <div className="field field-icon">
        <label>Email</label>
        <i className="ti ti-mail fi" />
        <input
          type="email" placeholder="email@firma.ro"
          value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
          required
        />
      </div>
      <div className="field field-icon">
        <label>Parolă</label>
        <i className="ti ti-lock fi" />
        <input
          type="password" placeholder="••••••••"
          value={parola} onChange={e => { setParola(e.target.value); setError(''); }}
          required
        />
      </div>
      <button className="btn-auth" type="submit" disabled={loading} style={{ marginTop: 6 }}>
        {loading
          ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Autentificare...</>
          : <><i className="ti ti-login" /> Autentificare</>
        }
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}

function ActivareTab() {
  const [trimis, setTrimis] = useState(false);

  if (trimis) return (
    <div className="success-box">
      <i className="ti ti-circle-check" style={{ fontSize: 20, flexShrink: 0 }} />
      <div>Cont activat cu succes! Întoarce-te la tab-ul <strong>Autentificare</strong> pentru a te loga.</div>
    </div>
  );

  return (
    <form onSubmit={e => { e.preventDefault(); setTrimis(true); }}>
      <div className="info-box">
        <i className="ti ti-info-circle" style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }} />
        <span>Folosește acest formular dacă ai primit o invitație pe email de la administrator.</span>
      </div>
      <div className="field field-icon">
        <label>Email (din invitație)</label>
        <i className="ti ti-mail fi" />
        <input type="email" placeholder="email@firma.ro" required />
      </div>
      <div className="field field-icon">
        <label>Nume complet</label>
        <i className="ti ti-user fi" />
        <input type="text" placeholder="Ion Popescu" required />
      </div>
      <div className="field field-icon">
        <label>Telefon</label>
        <i className="ti ti-phone fi" />
        <input type="text" placeholder="07xx xxx xxx" />
      </div>
      <div className="field field-icon">
        <label>Parolă nouă</label>
        <i className="ti ti-lock fi" />
        <input type="password" placeholder="Minim 8 caractere" required minLength={8} />
      </div>
      <button className="btn-auth" type="submit">
        <i className="ti ti-check" /> Activează contul
      </button>
    </form>
  );
}

function ResetForm({ onBack }) {
  const [trimis, setTrimis] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div>
      <span className="back-link" onClick={onBack}>
        <i className="ti ti-arrow-left" /> Înapoi la login
      </span>
      <div className="auth-title" style={{ fontSize: 22 }}>Resetare parolă</div>
      <p style={{ fontSize: 13, color: '#888780', margin: '6px 0 20px' }}>
        Îți trimitem un link de resetare pe email.
      </p>
      {trimis ? (
        <div className="success-box">
          <i className="ti ti-circle-check" style={{ fontSize: 20, flexShrink: 0 }} />
          Email trimis! Verifică inbox-ul și urmează instrucțiunile.
        </div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); setTrimis(true); }}>
          <div className="field field-icon">
            <label>Adresa de email</label>
            <i className="ti ti-mail fi" />
            <input type="email" placeholder="email@firma.ro" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button className="btn-auth" type="submit">
            <i className="ti ti-send" /> Trimite link de resetare
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [showReset, setShowReset] = useState(false);

  return (
    <div className="auth-shell">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: 40, height: 40, background: '#185FA5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <i className="ti ti-car" style={{ fontSize: 22, color: 'white' }} />
          </div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: 'white', letterSpacing: -0.3 }}>FleetRO</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4, fontWeight: 300 }}>Managementul flotei tale auto</div>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          {[
            { icon: 'ti-file-certificate', titlu: 'Documente în siguranță', desc: 'RCA, ITP, Rovignetă cu alerte automate înainte de expirare.' },
            { icon: 'ti-map-pin', titlu: 'Gestionare pe locații', desc: 'Fiecare manager vede doar flota lui, adminul vede tot.' },
            { icon: 'ti-tool', titlu: 'Istoric service complet', desc: 'Intervenții, costuri și facturi atașate per mașină.' },
            { icon: 'ti-bell', titlu: 'Notificări email automate', desc: 'Alertă la 30, 14 și 7 zile înainte de orice expirare.' },
          ].map(f => (
            <div className="feature-item" key={f.icon}>
              <div className="feature-dot"><i className={`ti ${f.icon}`} /></div>
              <div className="feature-text"><strong>{f.titlu}</strong> — {f.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ position: 'relative', zIndex: 1, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
          © 2026 FleetRO
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          {showReset ? (
            <div className="auth-card">
              <ResetForm onBack={() => setShowReset(false)} />
            </div>
          ) : (
            <>
              <div className="auth-title">Bun venit</div>
              <div className="auth-sub">Intră în contul tău sau acceptă invitația</div>

              {/* demo hint */}
              <div className="info-box" style={{ marginBottom: 16 }}>
                <i className="ti ti-key" style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12 }}>
                  <strong>Demo:</strong> admin@fleetro.ro / admin123 &nbsp;·&nbsp; manager@fleetro.ro / manager123
                </div>
              </div>

              <div className="auth-card">
                <div className="tab-row">
                  <div className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Autentificare</div>
                  <div className={`tab ${tab === 'activare' ? 'active' : ''}`} onClick={() => setTab('activare')}>Activare cont</div>
                </div>
                {tab === 'login' ? (
                  <>
                    <LoginTab />
                    <div className="forgot-link" style={{ marginTop: 12 }}>
                      <a onClick={() => setShowReset(true)}>Ai uitat parola?</a>
                    </div>
                  </>
                ) : (
                  <ActivareTab />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

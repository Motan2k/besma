import React from 'react';
import { useDocumenteExpira, useMasini, useServicii } from '../../hooks/useData';

function formatData(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function Spinner() {
  return (
    <div style={{ padding: 20, color: '#888780', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
      <i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Se încarcă...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function Dashboard() {
  const { data: expirari, loading: loadExp } = useDocumenteExpira(60);
  const { data: masini, loading: loadMasini } = useMasini();
  const { data: servicii, loading: loadServ } = useServicii();

  const critice = expirari?.filter(d => d.zile_ramase <= 14).length ?? 0;
  const atentie = expirari?.filter(d => d.zile_ramase > 14 && d.zile_ramase <= 30).length ?? 0;
  const urgente = expirari?.slice(0, 6) ?? [];
  const ultimeleServicii = servicii?.slice(0, 4) ?? [];

  return (
    <>
      {critice > 0 && (
        <div className="alert-banner">
          <i className="ti ti-alert-triangle" />
          <span><strong>{critice} document{critice > 1 ? 'e' : ''}</strong> expiră în mai puțin de 14 zile — acțiune necesară.</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total mașini</div>
          <div className="stat-val">{loadMasini ? '…' : masini?.length ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Documente critice</div>
          <div className="stat-val red">{loadExp ? '…' : critice}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Expiră în 30 zile</div>
          <div className="stat-val amber">{loadExp ? '…' : atentie}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-val green">
            {loadMasini ? '…' : masini?.filter(m => m.status === 'activa').length ?? 0}
          </div>
        </div>
      </div>

      <div className="two-col">
        <div>
          <div className="section-title">Expirări urgente</div>
          <div className="card">
            {loadExp ? <Spinner /> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Mașină</th><th>Document</th><th>Expiră</th><th>Zile</th></tr></thead>
                  <tbody>
                    {urgente.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888780', padding: 24, fontSize: 13 }}>
                        Nicio expirare în curând 🎉
                      </td></tr>
                    )}
                    {urgente.map((d, i) => (
                      <tr key={i}>
                        <td><span className="plate">{d.nr_inmatriculare}</span></td>
                        <td style={{ fontWeight: 500 }}>{d.tip}</td>
                        <td style={{ fontWeight: 500, color: d.zile_ramase <= 14 ? '#A32D2D' : '#854F0B' }}>
                          {formatData(d.data_expirare)}
                        </td>
                        <td>
                          <span className={`badge ${d.zile_ramase <= 0 ? 'badge-red' : d.zile_ramase <= 14 ? 'badge-red' : 'badge-amber'}`}>
                            {d.zile_ramase <= 0 ? 'Expirat' : `${d.zile_ramase} zile`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="section-title">Ultimele intervenții service</div>
          <div className="card">
            {loadServ ? <Spinner /> : (
              ultimeleServicii.length === 0
                ? <div style={{ padding: 24, color: '#888780', fontSize: 13 }}>Nicio intervenție înregistrată.</div>
                : ultimeleServicii.map(s => (
                  <div className="service-item" key={s.id}>
                    <div className="service-icon-wrap"><i className="ti ti-tool" /></div>
                    <div className="service-info">
                      <div className="service-title">{s.titlu}</div>
                      <div className="service-meta">
                        {s.masini?.nr_inmatriculare} · {formatData(s.data_interventie)}
                        {s.km_la_interventie ? ` · ${s.km_la_interventie.toLocaleString('ro-RO')} km` : ''}
                      </div>
                    </div>
                    {s.cost && <div className="service-cost">{parseFloat(s.cost).toLocaleString('ro-RO')} {s.moneda}</div>}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

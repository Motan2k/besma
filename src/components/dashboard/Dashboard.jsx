import React, { useMemo } from 'react';
import { masini, servicii, formatData, zileRamase, statusExpirare } from '../../data/demo';

function BadgeExpirare({ zile }) {
  const s = statusExpirare(zile);
  const cls = s === 'valid' ? 'badge-green' : s === 'atentie' ? 'badge-amber' : 'badge-red';
  const text = zile <= 0 ? 'Expirat' : `${zile} zile`;
  return <span className={`badge ${cls}`}>{text}</span>;
}

export default function Dashboard() {
  const documente = useMemo(() => {
    const docs = [];
    masini.forEach(m => {
      [
        { tip: 'RCA', data: m.rca.expira },
        { tip: 'ITP', data: m.itp.expira },
        { tip: 'Rovignetă', data: m.rovigneta.expira },
      ].forEach(({ tip, data }) => {
        const zile = zileRamase(data);
        docs.push({ masina: m, tip, expira: data, zile });
      });
    });
    return docs.sort((a, b) => a.zile - b.zile);
  }, []);

  const critice = documente.filter(d => d.zile <= 14).length;
  const atentie = documente.filter(d => d.zile > 14 && d.zile <= 30).length;
  const urgente = documente.slice(0, 5);
  const ultimeleServicii = [...servicii].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 3);

  return (
    <>
      {critice > 0 && (
        <div className="alert-banner">
          <i className="ti ti-alert-triangle" />
          <span><strong>{critice} document{critice > 1 ? 'e' : ''}</strong> expiră în următoarele 14 zile — verificați secțiunea Documente.</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Total mașini</div><div className="stat-val">{masini.length}</div></div>
        <div className="stat-card"><div className="stat-label">Expirate / critice</div><div className="stat-val red">{critice}</div></div>
        <div className="stat-card"><div className="stat-label">Expiră în 30 zile</div><div className="stat-val amber">{atentie}</div></div>
        <div className="stat-card"><div className="stat-label">Active</div><div className="stat-val green">{masini.filter(m => m.status === 'activa').length}</div></div>
      </div>

      <div className="two-col">
        <div>
          <div className="section-title">Expirări urgente</div>
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mașină</th>
                    <th>Document</th>
                    <th>Expiră</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {urgente.map((d, i) => (
                    <tr key={i}>
                      <td><span className="plate">{d.masina.nr_inmatriculare}</span></td>
                      <td style={{ fontWeight: 500 }}>{d.tip}</td>
                      <td style={{ fontWeight: 500, color: d.zile <= 14 ? 'var(--red-600)' : d.zile <= 30 ? 'var(--amber-600)' : 'inherit' }}>
                        {formatData(d.expira)}
                      </td>
                      <td><BadgeExpirare zile={d.zile} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="section-title">Ultimele intervenții service</div>
          <div className="card">
            {ultimeleServicii.map(s => {
              const m = masini.find(x => x.id === s.masina_id);
              return (
                <div className="service-item" key={s.id}>
                  <div className="service-icon-wrap"><i className="ti ti-tool" /></div>
                  <div className="service-info">
                    <div className="service-title">{s.titlu}</div>
                    <div className="service-meta">{m?.nr_inmatriculare} · {formatData(s.data)} · {s.km.toLocaleString('ro-RO')} km</div>
                  </div>
                  <div className="service-cost">{s.cost.toLocaleString('ro-RO')} lei</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

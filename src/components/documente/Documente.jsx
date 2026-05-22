import React, { useMemo, useState } from 'react';
import { masini, locatii, formatData, zileRamase, statusExpirare } from '../../data/demo';

function BadgeStatus({ zile }) {
  const s = statusExpirare(zile);
  if (s === 'expirat') return <span className="badge badge-red">Expirat</span>;
  if (s === 'critic') return <span className="badge badge-red">Critic</span>;
  if (s === 'atentie') return <span className="badge badge-amber">Atenție</span>;
  return <span className="badge badge-green">Valid</span>;
}

function BadgeZile({ zile }) {
  const s = statusExpirare(zile);
  const cls = s === 'valid' ? 'badge-green' : s === 'atentie' ? 'badge-amber' : 'badge-red';
  return <span className={`badge ${cls}`}>{zile <= 0 ? 'Expirat' : `${zile} zile`}</span>;
}

export default function Documente() {
  const [filtruTip, setFiltruTip] = useState('');
  const [filtruLoc, setFiltruLoc] = useState('');

  const docs = useMemo(() => {
    const list = [];
    masini.forEach(m => {
      const loc = locatii.find(l => l.id === m.locatie_id);
      [
        { tip: 'RCA', expira: m.rca.expira, detalii: `${m.rca.asigurator} · ${m.rca.polita}`, fisier: true },
        { tip: 'ITP', expira: m.itp.expira, detalii: 'Stație autorizată', fisier: true },
        { tip: 'Rovignetă', expira: m.rovigneta.expira, detalii: m.rovigneta.tip, fisier: false },
      ].forEach(doc => {
        list.push({ ...doc, masina: m, locatie: loc, zile: zileRamase(doc.expira) });
      });
    });
    return list.sort((a, b) => a.zile - b.zile);
  }, []);

  const filtered = docs.filter(d => {
    if (filtruTip && d.tip !== filtruTip) return false;
    if (filtruLoc && d.masina.locatie_id !== parseInt(filtruLoc)) return false;
    return true;
  });

  return (
    <>
      <div className="topbar" style={{ marginTop: -20, marginLeft: -24, marginRight: -24, paddingLeft: 24, marginBottom: 20, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="filter-select" value={filtruTip} onChange={e => setFiltruTip(e.target.value)}>
            <option value="">Toate tipurile</option>
            <option value="RCA">RCA</option>
            <option value="ITP">ITP</option>
            <option value="Rovignetă">Rovignetă</option>
          </select>
          <select className="filter-select" value={filtruLoc} onChange={e => setFiltruLoc(e.target.value)}>
            <option value="">Toate locațiile</option>
            {locatii.map(l => <option key={l.id} value={l.id}>{l.nume}</option>)}
          </select>
        </div>
        <button className="btn"><i className="ti ti-download" /> Export PDF</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mașină</th>
                <th>Tip</th>
                <th>Detalii</th>
                <th>Locație</th>
                <th>Expiră</th>
                <th>Zile rămase</th>
                <th>Status</th>
                <th>Fișier</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={i}>
                  <td><span className="plate">{d.masina.nr_inmatriculare}</span></td>
                  <td style={{ fontWeight: 500 }}>{d.tip}</td>
                  <td style={{ fontSize: 12, color: '#888780' }}>{d.detalii}</td>
                  <td>
                    <div className="loc-label">
                      <i className="ti ti-map-pin" />{d.locatie?.nume}
                    </div>
                  </td>
                  <td style={{
                    fontWeight: 500,
                    color: d.zile <= 14 ? 'var(--red-600)' : d.zile <= 30 ? 'var(--amber-600)' : 'inherit'
                  }}>
                    {formatData(d.expira)}
                  </td>
                  <td><BadgeZile zile={d.zile} /></td>
                  <td><BadgeStatus zile={d.zile} /></td>
                  <td>
                    {d.fisier
                      ? <button className="btn-icon" title="Descarcă"><i className="ti ti-file-download" /></button>
                      : <span style={{ color: '#B4B2A9', fontSize: 13 }}>—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

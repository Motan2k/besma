import React, { useState } from 'react';
import { servicii, masini, formatData } from '../../data/demo';

export default function Service() {
  const [filtruMasina, setFiltruMasina] = useState('');

  const filtered = servicii.filter(s => {
    if (filtruMasina && s.masina_id !== parseInt(filtruMasina)) return false;
    return true;
  }).sort((a, b) => new Date(b.data) - new Date(a.data));

  const totalCost = filtered.reduce((sum, s) => sum + s.cost, 0);

  return (
    <>
      <div className="topbar" style={{ marginTop: -20, marginLeft: -24, marginRight: -24, paddingLeft: 24, marginBottom: 20, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="filter-select" value={filtruMasina} onChange={e => setFiltruMasina(e.target.value)}>
            <option value="">Toate mașinile</option>
            {masini.map(m => <option key={m.id} value={m.id}>{m.nr_inmatriculare} — {m.marca} {m.model}</option>)}
          </select>
          {filtruMasina && (
            <span style={{ fontSize: 12, color: '#888780' }}>
              Total: <strong style={{ color: '#1a1a18' }}>{totalCost.toLocaleString('ro-RO')} lei</strong>
            </span>
          )}
        </div>
        <button className="btn btn-primary"><i className="ti ti-plus" /> Adaugă intervenție</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mașină</th>
                <th>Dată</th>
                <th>Km</th>
                <th>Intervenție</th>
                <th>Service auto</th>
                <th>Cost</th>
                <th>Următor service</th>
                <th>Docs</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const m = masini.find(x => x.id === s.masina_id);
                return (
                  <tr key={s.id}>
                    <td><span className="plate">{m?.nr_inmatriculare}</span></td>
                    <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{formatData(s.data)}</td>
                    <td style={{ fontSize: 13, fontFamily: 'Courier New, monospace' }}>{s.km.toLocaleString('ro-RO')}</td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{s.titlu}</div>
                      <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>{s.descriere}</div>
                    </td>
                    <td style={{ fontSize: 12, color: '#888780' }}>{s.service_auto}</td>
                    <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{s.cost.toLocaleString('ro-RO')} lei</td>
                    <td>
                      {s.urmator_data && <span className="badge badge-green">{formatData(s.urmator_data)}</span>}
                      {s.urmator_km && <span className="badge badge-blue">{s.urmator_km.toLocaleString('ro-RO')} km</span>}
                      {!s.urmator_data && !s.urmator_km && <span style={{ color: '#B4B2A9', fontSize: 13 }}>—</span>}
                    </td>
                    <td>
                      {s.documente.length > 0
                        ? <span className="badge badge-gray"><i className="ti ti-paperclip" style={{ fontSize: 12 }} /> {s.documente.length}</span>
                        : <span style={{ color: '#B4B2A9', fontSize: 13 }}>—</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <button className="btn-icon" title="Editează"><i className="ti ti-edit" /></button>
                        <button className="btn-icon" title="Șterge"><i className="ti ti-trash" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

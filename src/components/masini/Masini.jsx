import React, { useState } from 'react';
import { masini, soferi, locatii, statusExpirare, zileRamase } from '../../data/demo';

function statusMasina(m) {
  const minZile = Math.min(zileRamase(m.rca.expira), zileRamase(m.itp.expira), zileRamase(m.rovigneta.expira));
  return statusExpirare(minZile);
}

export default function Masini() {
  const [filtruLoc, setFiltruLoc] = useState('');
  const [filtruStatus, setFiltruStatus] = useState('');

  const filtered = masini.filter(m => {
    if (filtruLoc && m.locatie_id !== parseInt(filtruLoc)) return false;
    if (filtruStatus && m.status !== filtruStatus) return false;
    return true;
  });

  return (
    <>
      <div className="topbar" style={{ marginTop: -20, marginLeft: -24, marginRight: -24, paddingLeft: 24, marginBottom: 20, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="filter-select" value={filtruLoc} onChange={e => setFiltruLoc(e.target.value)}>
            <option value="">Toate locațiile</option>
            {locatii.map(l => <option key={l.id} value={l.id}>{l.nume}</option>)}
          </select>
          <select className="filter-select" value={filtruStatus} onChange={e => setFiltruStatus(e.target.value)}>
            <option value="">Toate statusurile</option>
            <option value="activa">Activă</option>
            <option value="service">În service</option>
          </select>
        </div>
        <button className="btn btn-primary">
          <i className="ti ti-plus" /> Adaugă mașină
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mașină</th>
                <th>Nr. înmatriculare</th>
                <th>Locație</th>
                <th>Șofer</th>
                <th>GPS</th>
                <th>Status</th>
                <th>Documente</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const sofer = soferi.find(s => s.id === m.sofer_id);
                const loc = locatii.find(l => l.id === m.locatie_id);
                const docStatus = statusMasina(m);
                return (
                  <tr key={m.id}>
                    <td>
                      <div className="car-cell">
                        <div className="car-name">{m.marca} {m.model} {m.an}</div>
                        <div className="car-vin">VIN: {m.vin}</div>
                      </div>
                    </td>
                    <td><span className="plate">{m.nr_inmatriculare}</span></td>
                    <td>
                      <div className="loc-label">
                        <i className="ti ti-map-pin" />
                        {loc?.nume}
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: sofer ? 'inherit' : '#B4B2A9' }}>
                      {sofer?.nume || 'Neatribuit'}
                    </td>
                    <td>
                      <div className="gps-wrap">
                        <span className={`gps-dot ${m.gps_status}`} />
                        {m.gps_status === 'online' ? 'Live' : 'Offline'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${m.status === 'activa' ? 'badge-green' : 'badge-blue'}`}>
                        {m.status === 'activa' ? 'Activă' : 'În service'}
                      </span>
                    </td>
                    <td>
                      {docStatus === 'critic' && <span className="badge badge-red">Exp. critice</span>}
                      {docStatus === 'atentie' && <span className="badge badge-amber">Expiră curând</span>}
                      {docStatus === 'valid' && <span className="badge badge-green">OK</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <button className="btn-icon" title="Editează"><i className="ti ti-edit" /></button>
                        <button className="btn-icon" title="Service"><i className="ti ti-tool" /></button>
                        <button className="btn-icon" title="Detalii"><i className="ti ti-eye" /></button>
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

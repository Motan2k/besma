// ── MASINI PAGE ────────────────────────────────────────────
import React, { useState } from 'react';
import { useMasini, useLocatii } from '../../hooks/useData';
import FormularMasina from './FormularMasina';

export function Masini() {
  const [filtruLoc, setFiltruLoc] = useState('');
  const [filtruStatus, setFiltruStatus] = useState('');
  const [modalMasina, setModalMasina] = useState(false);
  const [editMasina, setEditMasina] = useState(null);
  const { data: masini, loading, refetch } = useMasini({ locatieId: filtruLoc || undefined, status: filtruStatus || undefined });
  const { data: locatii } = useLocatii();

  return (
    <>
      <div className="topbar" style={{ marginTop:-20, marginLeft:-24, marginRight:-24, paddingLeft:24, marginBottom:20, position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', gap:8 }}>
          <select className="filter-select" value={filtruLoc} onChange={e => setFiltruLoc(e.target.value)}>
            <option value="">Toate locațiile</option>
            {locatii?.map(l => <option key={l.id} value={l.id}>{l.nume}</option>)}
          </select>
          <select className="filter-select" value={filtruStatus} onChange={e => setFiltruStatus(e.target.value)}>
            <option value="">Toate statusurile</option>
            <option value="activa">Activă</option>
            <option value="service">În service</option>
            <option value="arhivata">Arhivată</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditMasina(null); setModalMasina(true); }}>
          <i className="ti ti-plus" /> Adaugă mașină
        </button>
      </div>

      {loading ? <Spinner /> : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Mașină</th><th>Nr. înmatriculare</th><th>Locație</th><th>Șofer</th><th>GPS</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {(!masini || masini.length === 0) && (
                  <tr><td colSpan={7} style={{ textAlign:'center', color:'#888780', padding:32, fontSize:13 }}>
                    <i className="ti ti-car-off" style={{ fontSize:32, display:'block', marginBottom:8, color:'#C8C6BE' }} />
                    Nicio mașină. Apasă "Adaugă mașină" pentru a începe.
                  </td></tr>
                )}
                {masini?.map(m => (
                  <tr key={m.id}>
                    <td><div className="car-cell"><div className="car-name">{m.marca} {m.model} {m.an_fabricatie}</div><div className="car-vin">VIN: {m.vin || '—'}</div></div></td>
                    <td><span className="plate">{m.nr_inmatriculare}</span></td>
                    <td><div className="loc-label"><i className="ti ti-map-pin" />{m.locatii?.nume || '—'}</div></td>
                    <td style={{ fontSize:13, color: m.profiles ? 'inherit' : '#B4B2A9' }}>{m.profiles?.full_name || 'Neatribuit'}</td>
                    <td><div className="gps-wrap"><span className={`gps-dot ${m.gps_status}`} />{m.gps_status === 'online' ? 'Live' : 'Offline'}</div></td>
                    <td><span className={`badge ${m.status === 'activa' ? 'badge-green' : m.status === 'service' ? 'badge-blue' : 'badge-gray'}`}>
                      {m.status === 'activa' ? 'Activă' : m.status === 'service' ? 'În service' : 'Arhivată'}
                    </span></td>
                    <td><div style={{ display:'flex', gap:2 }}>
                      <button className="btn-icon" title="Editează" onClick={() => { setEditMasina(m); setModalMasina(true); }}><i className="ti ti-edit" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FormularMasina isOpen={modalMasina} onClose={() => setModalMasina(false)} masina={editMasina} onSuccess={refetch} />
    </>
  );
}

function Spinner() {
  return <div style={{ color:'#888780', fontSize:13, padding:20, display:'flex', gap:8, alignItems:'center' }}>
    <i className="ti ti-loader-2" style={{ animation:'spin 1s linear infinite' }} /> Se încarcă...
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>;
}

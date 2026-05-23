import React, { useState } from 'react';
import { useDocumente, useLocatii, useMasini } from '../../hooks/useData';
import FormularDocument from './FormularDocument';

function formatData(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function zileRamase(d) { return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24)); }

export default function Documente() {
  const [filtruTip, setFiltruTip] = useState('');
  const [filtruLoc, setFiltruLoc] = useState('');
  const [modalDoc, setModalDoc] = useState(false);
  const [selectedMasina, setSelectedMasina] = useState(null);

  const { data: documente, loading, refetch } = useDocumente({ tip: filtruTip || undefined });
  const { data: locatii } = useLocatii();
  const { data: masini } = useMasini();

  const filtered = documente?.filter(d => {
    if (filtruLoc && d.masini?.locatie_id !== filtruLoc) return false;
    return true;
  }) || [];

  return (
    <>
      <div className="topbar" style={{ marginTop:-20, marginLeft:-24, marginRight:-24, paddingLeft:24, marginBottom:20, position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', gap:8 }}>
          <select className="filter-select" value={filtruTip} onChange={e => setFiltruTip(e.target.value)}>
            <option value="">Toate tipurile</option>
            {['RCA','ITP','Rovignetă','CASCO','Altele'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="filter-select" value={filtruLoc} onChange={e => setFiltruLoc(e.target.value)}>
            <option value="">Toate locațiile</option>
            {locatii?.map(l => <option key={l.id} value={l.id}>{l.nume}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelectedMasina(null); setModalDoc(true); }}>
          <i className="ti ti-plus" /> Adaugă document
        </button>
      </div>

      {loading ? (
        <div style={{ color:'#888780', fontSize:13, padding:20, display:'flex', gap:8, alignItems:'center' }}>
          <i className="ti ti-loader-2" style={{ animation:'spin 1s linear infinite' }} /> Se încarcă...
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Mașină</th><th>Tip</th><th>Detalii</th><th>Locație</th><th>Expiră</th><th>Zile rămase</th><th>Status</th><th>Fișier</th></tr></thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign:'center', color:'#888780', padding:32, fontSize:13 }}>
                    <i className="ti ti-file-off" style={{ fontSize:32, display:'block', marginBottom:8, color:'#C8C6BE' }} />
                    Niciun document. Adaugă primul document.
                  </td></tr>
                )}
                {filtered.map((d, i) => {
                  const zile = zileRamase(d.data_expirare);
                  const cls = zile <= 0 ? 'badge-red' : zile <= 14 ? 'badge-red' : zile <= 30 ? 'badge-amber' : 'badge-green';
                  const statusCls = zile <= 0 ? 'badge-red' : zile <= 14 ? 'badge-red' : zile <= 30 ? 'badge-amber' : 'badge-green';
                  const statusLabel = zile <= 0 ? 'Expirat' : zile <= 14 ? 'Critic' : zile <= 30 ? 'Atenție' : 'Valid';
                  return (
                    <tr key={i}>
                      <td><span className="plate">{d.masini?.nr_inmatriculare || '—'}</span></td>
                      <td style={{ fontWeight:500 }}>{d.tip}</td>
                      <td style={{ fontSize:12, color:'#888780' }}>{d.asigurator || d.detalii || '—'}</td>
                      <td><div className="loc-label"><i className="ti ti-map-pin" />{d.masini?.locatii?.nume || '—'}</div></td>
                      <td style={{ fontWeight:500, color: zile <= 14 ? '#A32D2D' : zile <= 30 ? '#854F0B' : 'inherit' }}>
                        {formatData(d.data_expirare)}
                      </td>
                      <td><span className={`badge ${cls}`}>{zile <= 0 ? 'Expirat' : `${zile} zile`}</span></td>
                      <td><span className={`badge ${statusCls}`}>{statusLabel}</span></td>
                      <td>
                        {d.fisier_url
                          ? <a href={d.fisier_url} target="_blank" rel="noreferrer"><button className="btn-icon" title="Descarcă"><i className="ti ti-file-download" /></button></a>
                          : <span style={{ color:'#B4B2A9', fontSize:13 }}>—</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FormularDocument
        isOpen={modalDoc}
        onClose={() => setModalDoc(false)}
        masinaId={selectedMasina?.id}
        masina={selectedMasina}
        onSuccess={refetch}
      />
    </>
  );
}

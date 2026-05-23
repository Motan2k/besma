// ── MASINI PAGE ────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useMasini, useLocatii, useDocumente } from '../../hooks/useData';
import FormularMasina from './FormularMasina';
import FormularDocument from '../documente/FormularDocument';

function zileRamase(dataStr) {
  if (!dataStr) return null;
  return Math.ceil((new Date(dataStr) - new Date()) / (1000 * 60 * 60 * 24));
}

function formatData(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function BadgeDoc({ data_expirare, onAdd }) {
  if (!data_expirare) return (
    <button onClick={onAdd} style={{ background: 'none', border: '0.5px dashed #C8C6BE', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: '#888780', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
      <i className="ti ti-plus" style={{ fontSize: 11 }} /> Adaugă
    </button>
  );

  const zile = zileRamase(data_expirare);
  const cls = zile <= 0 ? 'badge-red' : zile <= 14 ? 'badge-red' : zile <= 30 ? 'badge-amber' : 'badge-green';
  const text = zile <= 0 ? 'Expirat' : zile <= 30 ? `${zile}z` : formatData(data_expirare);

  return (
    <span className={`badge ${cls}`} title={formatData(data_expirare)} style={{ cursor: 'default' }}>
      {text}
    </span>
  );
}

// Hook care aduce documentele per mașină
function useDocumenteMasini(masini) {
  const [docMap, setDocMap] = useState({});
  const { data: documente } = useDocumente();

  useEffect(() => {
    if (!documente || !masini) return;
    const map = {};
    masini.forEach(m => {
      const docs = documente.filter(d => d.masina_id === m.id);
      map[m.id] = {
        rca: docs.filter(d => d.tip === 'RCA').sort((a, b) => new Date(b.data_expirare) - new Date(a.data_expirare))[0],
        itp: docs.filter(d => d.tip === 'ITP').sort((a, b) => new Date(b.data_expirare) - new Date(a.data_expirare))[0],
        rovigneta: docs.filter(d => d.tip === 'Rovignetă').sort((a, b) => new Date(b.data_expirare) - new Date(a.data_expirare))[0],
      };
    });
    setDocMap(map);
  }, [documente, masini]);

  return docMap;
}

export function Masini() {
  const [filtruLoc, setFiltruLoc] = useState('');
  const [filtruStatus, setFiltruStatus] = useState('');
  const [modalMasina, setModalMasina] = useState(false);
  const [modalDoc, setModalDoc] = useState(false);
  const [editMasina, setEditMasina] = useState(null);
  const [selectedMasina, setSelectedMasina] = useState(null);
  const [tipDocPreselect, setTipDocPreselect] = useState('RCA');

  const { data: masini, loading, refetch } = useMasini({
    locatieId: filtruLoc || undefined,
    status: filtruStatus || undefined,
  });
  const { data: locatii } = useLocatii();
  const docMap = useDocumenteMasini(masini);

  const openAddDoc = (masina, tip) => {
    setSelectedMasina(masina);
    setTipDocPreselect(tip);
    setModalDoc(true);
  };

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
              <thead>
                <tr>
                  <th>Mașină</th>
                  <th>Nr. înmatriculare</th>
                  <th>Locație</th>
                  <th>Șofer</th>
                  <th>RCA</th>
                  <th>ITP</th>
                  <th>Rovignetă</th>
                  <th>GPS</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(!masini || masini.length === 0) && (
                  <tr><td colSpan={10} style={{ textAlign:'center', color:'#888780', padding:32, fontSize:13 }}>
                    <i className="ti ti-car-off" style={{ fontSize:32, display:'block', marginBottom:8, color:'#C8C6BE' }} />
                    Nicio mașină. Apasă "Adaugă mașină" pentru a începe.
                  </td></tr>
                )}
                {masini?.map(m => {
                  const docs = docMap[m.id] || {};
                  return (
                    <tr key={m.id}>
                      <td>
                        <div className="car-cell">
                          <div className="car-name">{m.marca} {m.model} {m.an_fabricatie}</div>
                          <div className="car-vin">VIN: {m.vin || '—'}</div>
                        </div>
                      </td>
                      <td><span className="plate">{m.nr_inmatriculare}</span></td>
                      <td>
                        <div className="loc-label">
                          <i className="ti ti-map-pin" />{m.locatii?.nume || '—'}
                        </div>
                      </td>
                      <td style={{ fontSize:13, color: m.profiles ? 'inherit' : '#B4B2A9' }}>
                        {m.profiles?.full_name || 'Neatribuit'}
                      </td>
                      {/* RCA */}
                      <td>
                        <BadgeDoc
                          data_expirare={docs.rca?.data_expirare}
                          onAdd={() => openAddDoc(m, 'RCA')}
                        />
                      </td>
                      {/* ITP */}
                      <td>
                        <BadgeDoc
                          data_expirare={docs.itp?.data_expirare}
                          onAdd={() => openAddDoc(m, 'ITP')}
                        />
                      </td>
                      {/* ROVIGNETĂ */}
                      <td>
                        <BadgeDoc
                          data_expirare={docs.rovigneta?.data_expirare}
                          onAdd={() => openAddDoc(m, 'Rovignetă')}
                        />
                      </td>
                      <td>
                        <div className="gps-wrap">
                          <span className={`gps-dot ${m.gps_status}`} />
                          {m.gps_status === 'online' ? 'Live' : 'Offline'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${m.status === 'activa' ? 'badge-green' : m.status === 'service' ? 'badge-blue' : 'badge-gray'}`}>
                          {m.status === 'activa' ? 'Activă' : m.status === 'service' ? 'În service' : 'Arhivată'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:2 }}>
                          <button className="btn-icon" title="Editează" onClick={() => { setEditMasina(m); setModalMasina(true); }}>
                            <i className="ti ti-edit" />
                          </button>
                          <button className="btn-icon" title="Adaugă document" onClick={() => openAddDoc(m, 'RCA')}>
                            <i className="ti ti-file-plus" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FormularMasina
        isOpen={modalMasina}
        onClose={() => setModalMasina(false)}
        masina={editMasina}
        onSuccess={refetch}
      />

      <FormularDocument
        isOpen={modalDoc}
        onClose={() => { setModalDoc(false); setSelectedMasina(null); }}
        masinaId={selectedMasina?.id}
        masina={selectedMasina}
        tipPreselect={tipDocPreselect}
        onSuccess={refetch}
      />
    </>
  );
}

function Spinner() {
  return (
    <div style={{ color:'#888780', fontSize:13, padding:20, display:'flex', gap:8, alignItems:'center' }}>
      <i className="ti ti-loader-2" style={{ animation:'spin 1s linear infinite' }} /> Se încarcă...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

import React, { useState } from 'react';
import { useMasini, useLocatii } from '../../hooks/useData';
import FormularMasina from './FormularMasina';
import FormularDocument from '../documente/FormularDocument';
import FormularService from '../service/FormularService';

function statusDoc(masina) {
  // placeholder — în producție calculezi din documente reale
  return 'valid';
}

export default function Masini() {
  const [filtruLoc, setFiltruLoc] = useState('');
  const [filtruStatus, setFiltruStatus] = useState('');
  const { data: masini, loading, refetch } = useMasini({
    locatieId: filtruLoc || undefined,
    status: filtruStatus || undefined,
  });
  const { data: locatii } = useLocatii();

  // Modal state
  const [modalMasina, setModalMasina] = useState(false);
  const [modalDoc, setModalDoc] = useState(false);
  const [modalService, setModalService] = useState(false);
  const [selectedMasina, setSelectedMasina] = useState(null);
  const [editMasina, setEditMasina] = useState(null);

  const openDoc = (m) => { setSelectedMasina(m); setModalDoc(true); };
  const openService = (m) => { setSelectedMasina(m); setModalService(true); };
  const openEdit = (m) => { setEditMasina(m); setModalMasina(true); };
  const openAdd = () => { setEditMasina(null); setModalMasina(true); };

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar" style={{ marginTop: -20, marginLeft: -24, marginRight: -24, paddingLeft: 24, marginBottom: 20, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
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
        <button className="btn btn-primary" onClick={openAdd}>
          <i className="ti ti-plus" /> Adaugă mașină
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <div style={{ color: '#888780', fontSize: 13, padding: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
          <i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Se încarcă...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
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
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {masini?.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#888780', fontSize: 13, padding: 32 }}>
                      <i className="ti ti-car-off" style={{ fontSize: 32, display: 'block', marginBottom: 8, color: '#C8C6BE' }} />
                      Nicio mașină găsită. Apasă "Adaugă mașină" pentru a începe.
                    </td>
                  </tr>
                )}
                {masini?.map(m => (
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
                    <td style={{ fontSize: 13, color: m.profiles ? 'inherit' : '#B4B2A9' }}>
                      {m.profiles?.full_name || 'Neatribuit'}
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
                      <div style={{ display: 'flex', gap: 2 }}>
                        <button className="btn-icon" title="Editează mașina" onClick={() => openEdit(m)}>
                          <i className="ti ti-edit" />
                        </button>
                        <button className="btn-icon" title="Adaugă document" onClick={() => openDoc(m)}>
                          <i className="ti ti-file-plus" />
                        </button>
                        <button className="btn-icon" title="Adaugă service" onClick={() => openService(m)}>
                          <i className="ti ti-tool" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      <FormularMasina
        isOpen={modalMasina}
        onClose={() => setModalMasina(false)}
        masina={editMasina}
        onSuccess={refetch}
      />
      <FormularDocument
        isOpen={modalDoc}
        onClose={() => setModalDoc(false)}
        masinaId={selectedMasina?.id}
        masina={selectedMasina}
        onSuccess={refetch}
      />
      <FormularService
        isOpen={modalService}
        onClose={() => setModalService(false)}
        masinaId={selectedMasina?.id}
        masina={selectedMasina}
        onSuccess={refetch}
      />
    </>
  );
}

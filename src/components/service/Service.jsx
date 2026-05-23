import React, { useState } from 'react';
import { useServicii, useMasini } from '../../hooks/useData';
import FormularService from './FormularService';

function formatData(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Service() {
  const [filtruMasina, setFiltruMasina] = useState('');
  const [modalService, setModalService] = useState(false);
  const [selectedMasina, setSelectedMasina] = useState(null);

  const { data: servicii, loading, refetch } = useServicii({
    masinaId: filtruMasina || undefined,
  });
  const { data: masini } = useMasini();

  const openAdd = () => {
    const masina = masini?.find(m => m.id === filtruMasina) || null;
    setSelectedMasina(masina);
    setModalService(true);
  };

  const totalCost = servicii?.reduce((sum, s) => sum + (parseFloat(s.cost) || 0), 0) || 0;

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar" style={{
        marginTop: -20, marginLeft: -24, marginRight: -24,
        paddingLeft: 24, marginBottom: 20,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            className="filter-select"
            value={filtruMasina}
            onChange={e => setFiltruMasina(e.target.value)}
          >
            <option value="">Toate mașinile</option>
            {masini?.map(m => (
              <option key={m.id} value={m.id}>
                {m.nr_inmatriculare} — {m.marca} {m.model}
              </option>
            ))}
          </select>
          {filtruMasina && servicii?.length > 0 && (
            <span style={{ fontSize: 12, color: '#888780' }}>
              Total: <strong style={{ color: '#1a1a18' }}>
                {totalCost.toLocaleString('ro-RO')} lei
              </strong>
            </span>
          )}
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <i className="ti ti-plus" /> Adaugă intervenție
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
                {(!servicii || servicii.length === 0) && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', color: '#888780', fontSize: 13, padding: 32 }}>
                      <i className="ti ti-tool" style={{ fontSize: 32, display: 'block', marginBottom: 8, color: '#C8C6BE' }} />
                      Nicio intervenție înregistrată. Apasă "Adaugă intervenție" pentru a începe.
                    </td>
                  </tr>
                )}
                {servicii?.map(s => {
                  const masina = masini?.find(m => m.id === s.masina_id);
                  return (
                    <tr key={s.id}>
                      <td>
                        <span className="plate">
                          {s.masini?.nr_inmatriculare || masina?.nr_inmatriculare || '—'}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                        {formatData(s.data_interventie)}
                      </td>
                      <td style={{ fontSize: 13, fontFamily: 'Courier New, monospace' }}>
                        {s.km_la_interventie?.toLocaleString('ro-RO') || '—'}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{s.titlu}</div>
                        {s.descriere && (
                          <div style={{ fontSize: 11, color: '#888780', marginTop: 2, maxWidth: 260 }}>
                            {s.descriere.length > 80 ? s.descriere.slice(0, 80) + '...' : s.descriere}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: '#888780' }}>
                        {s.service_auto || '—'}
                      </td>
                      <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {s.cost ? `${parseFloat(s.cost).toLocaleString('ro-RO')} ${s.moneda}` : '—'}
                      </td>
                      <td>
                        {s.urmator_data && (
                          <span className="badge badge-green">{formatData(s.urmator_data)}</span>
                        )}
                        {s.urmator_km && (
                          <span className="badge badge-blue">
                            {s.urmator_km.toLocaleString('ro-RO')} km
                          </span>
                        )}
                        {!s.urmator_data && !s.urmator_km && (
                          <span style={{ color: '#B4B2A9', fontSize: 13 }}>—</span>
                        )}
                      </td>
                      <td>
                        {s.servicii_documente?.length > 0 ? (
                          <span className="badge badge-gray">
                            <i className="ti ti-paperclip" style={{ fontSize: 12 }} />
                            {s.servicii_documente.length}
                          </span>
                        ) : (
                          <span style={{ color: '#B4B2A9', fontSize: 13 }}>—</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 2 }}>
                          <button
                            className="btn-icon"
                            title="Adaugă service pentru această mașină"
                            onClick={() => {
                              setSelectedMasina(s.masini || masina);
                              setModalService(true);
                            }}
                          >
                            <i className="ti ti-plus" />
                          </button>
                          <button className="btn-icon" title="Șterge">
                            <i className="ti ti-trash" />
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

      {/* MODAL */}
      <FormularService
        isOpen={modalService}
        onClose={() => { setModalService(false); setSelectedMasina(null); }}
        masinaId={selectedMasina?.id}
        masina={selectedMasina}
        onSuccess={refetch}
        masiniLista={masini}
      />
    </>
  );
}

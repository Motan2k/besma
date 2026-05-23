// ── LOCAȚII ────────────────────────────────────────────────
import React, { useState } from 'react';
import { useLocatii, useLocatiiActions, useMasini, useProfiles } from '../../hooks/useData';
import { Modal, Field, Input, Textarea, Row, Divider, FormActions, ErrorBox, SuccessBox } from '../common/index.jsx';

function FormularLocatie({ isOpen, onClose, locatie, onSuccess }) {
  const { adaugaLocatie, updateLocatie } = useLocatiiActions();
  const isEdit = !!locatie;
  const [form, setForm] = useState({ nume: '', adresa: '', tip: '', telefon: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setForm(locatie ? { nume: locatie.nume||'', adresa: locatie.adresa||'', tip: locatie.tip||'', telefon: locatie.telefon||'', email: locatie.email||'' } : { nume:'', adresa:'', tip:'', telefon:'', email:'' });
      setError(''); setSuccess('');
    }
  }, [isOpen, locatie]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.nume) { setError('Numele locației este obligatoriu.'); return; }
    setLoading(true);
    const { error } = isEdit ? await updateLocatie(locatie.id, form) : await adaugaLocatie(form);
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess(isEdit ? 'Locația a fost actualizată!' : 'Locația a fost adăugată!');
    setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editează locația' : 'Adaugă locație nouă'} width={480}>
      <form onSubmit={handleSubmit}>
        <ErrorBox message={error} /><SuccessBox message={success} />
        <Field label="Nume locație" required><Input placeholder="ex: București" value={form.nume} onChange={set('nume')} /></Field>
        <Field label="Tip"><Input placeholder="ex: Sediu central, Sucursală..." value={form.tip} onChange={set('tip')} /></Field>
        <Field label="Adresă"><Input placeholder="ex: Str. Mihai Eminescu 14, Sector 2" value={form.adresa} onChange={set('adresa')} /></Field>
        <Row cols={2}>
          <Field label="Telefon"><Input placeholder="ex: 021 123 4567" value={form.telefon} onChange={set('telefon')} /></Field>
          <Field label="Email"><Input type="email" placeholder="ex: bucuresti@firma.ro" value={form.email} onChange={set('email')} /></Field>
        </Row>
        <FormActions onCancel={onClose} loading={loading} submitLabel={isEdit ? 'Salvează' : 'Adaugă locația'} />
      </form>
    </Modal>
  );
}

export function Locatii() {
  const { data: locatii, loading, refetch } = useLocatii();
  const { data: masini } = useMasini();
  const [modal, setModal] = useState(false);
  const [editLoc, setEditLoc] = useState(null);

  const colors = [
    { bg:'#E6F1FB', color:'#185FA5' }, { bg:'#EAF3DE', color:'#3B6D11' },
    { bg:'#FAEEDA', color:'#854F0B' }, { bg:'#FBEAF0', color:'#993556' },
    { bg:'#F1EFE8', color:'#5F5E5A' },
  ];

  return (
    <>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        <button className="btn btn-primary" onClick={() => { setEditLoc(null); setModal(true); }}>
          <i className="ti ti-plus" /> Adaugă locație
        </button>
      </div>

      {loading ? <div style={{ color:'#888780', fontSize:13, padding:20 }}>Se încarcă...</div> : (
        <div className="loc-grid">
          {(!locatii || locatii.length === 0) && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', color:'#888780', padding:32, fontSize:13 }}>
              Nicio locație. Adaugă prima locație.
            </div>
          )}
          {locatii?.map((loc, i) => {
            const c = colors[i % colors.length];
            const nrMasini = masini?.filter(m => m.locatie_id === loc.id).length || 0;
            return (
              <div className="loc-card" key={loc.id}>
                <div style={{ width:36, height:36, borderRadius:8, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                  <i className="ti ti-building" style={{ color:c.color, fontSize:18 }} />
                </div>
                <div style={{ fontWeight:500, fontSize:14, marginBottom:2 }}>{loc.nume}</div>
                {loc.tip && <div style={{ fontSize:11, color:'#888780', marginBottom:6 }}>{loc.tip}</div>}
                {loc.adresa && <div style={{ fontSize:12, color:'#888780', marginBottom:10 }}>{loc.adresa}</div>}
                <div style={{ display:'flex', gap:6, marginBottom:12 }}>
                  <span className="badge badge-blue">{nrMasini} mașini</span>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn btn-sm" onClick={() => { setEditLoc(loc); setModal(true); }}>
                    <i className="ti ti-edit" /> Editează
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FormularLocatie isOpen={modal} onClose={() => setModal(false)} locatie={editLoc} onSuccess={refetch} />
    </>
  );
}

// ── ȘOFERI ─────────────────────────────────────────────────
export function Soferi() {
  const { data: soferi, loading } = useProfiles({ role: 'driver' });
  const { data: masini } = useMasini();
  const { data: locatii } = useLocatii();

  const avatarColors = ['avatar-blue', 'avatar-green', 'avatar-amber'];

  return (
    <>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        <button className="btn btn-primary" disabled title="Invitați prin email din Settings">
          <i className="ti ti-user-plus" /> Invită șofer
        </button>
      </div>

      {loading ? <div style={{ color:'#888780', fontSize:13, padding:20 }}>Se încarcă...</div> : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Șofer</th><th>Locație</th><th>Telefon</th><th>Mașină atribuită</th><th>Status</th></tr></thead>
              <tbody>
                {(!soferi || soferi.length === 0) && (
                  <tr><td colSpan={5} style={{ textAlign:'center', color:'#888780', padding:32, fontSize:13 }}>
                    Niciun șofer înregistrat.
                  </td></tr>
                )}
                {soferi?.map((s, i) => {
                  const loc = locatii?.find(l => l.id === s.locatie_id);
                  const masina = masini?.find(m => m.sofer_id === s.id);
                  const initiale = s.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
                  return (
                    <tr key={s.id}>
                      <td><div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className={`avatar ${avatarColors[i % avatarColors.length]}`}>{initiale}</div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:500 }}>{s.full_name}</div>
                          <div style={{ fontSize:11, color:'#888780' }}>{s.id === s.id ? s.phone || '' : ''}</div>
                        </div>
                      </div></td>
                      <td><div className="loc-label"><i className="ti ti-map-pin" />{loc?.nume || '—'}</div></td>
                      <td style={{ fontSize:13 }}>{s.phone || '—'}</td>
                      <td>{masina ? <span className="plate">{masina.nr_inmatriculare}</span> : <span style={{ fontSize:12, color:'#B4B2A9' }}>Neatribuit</span>}</td>
                      <td><span className="badge badge-green">Activ</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

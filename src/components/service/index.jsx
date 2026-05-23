// ── FORMULAR SERVICE ────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { Modal, Field, Input, Select, Textarea, Row, Divider, FormActions, ErrorBox, SuccessBox, FileUpload } from '../common/index.jsx';
import { useServiciiActions } from '../../hooks/useData';
import { supabase } from '../../lib/supabase';

const TIPURI_SERVICE = ['Schimb ulei','Filtre','Frâne','Anvelope','Distribuție','Suspensie','Electricitate','Caroserie','ITP','Revizie','Altele'];

export function FormularService({ isOpen, onClose, masinaId, masina, onSuccess, masiniLista = [] }) {
  const { adaugaServiciu, uploadDocumentServiciu } = useServiciiActions();
  const [selectedMasinaId, setSelectedMasinaId] = useState(masinaId || '');
  const [form, setForm] = useState({ data_interventie: new Date().toISOString().split('T')[0], km_la_interventie: '', titlu: '', descriere: '', tip: 'Altele', service_auto: '', cost: '', moneda: 'RON', urmator_data: '', urmator_km: '', note: '' });
  const [fisiere, setFisiere] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedMasinaId(masinaId || '');
      setForm({ data_interventie: new Date().toISOString().split('T')[0], km_la_interventie: masina?.km_actuali || '', titlu: '', descriere: '', tip: 'Altele', service_auto: '', cost: '', moneda: 'RON', urmator_data: '', urmator_km: '', note: '' });
      setFisiere([]); setError(''); setSuccess('');
    }
  }, [isOpen, masina, masinaId]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    const targetId = masinaId || selectedMasinaId;
    if (!targetId) { setError('Selectează mașina.'); return; }
    if (!form.titlu) { setError('Completează titlul intervenției.'); return; }
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    const { data: serviciu, error: sErr } = await adaugaServiciu({
      masina_id: targetId, data_interventie: form.data_interventie,
      km_la_interventie: parseInt(form.km_la_interventie) || null,
      titlu: form.titlu, descriere: form.descriere || null, tip: form.tip,
      service_auto: form.service_auto || null,
      cost: parseFloat(form.cost) || null, moneda: form.moneda,
      urmator_data: form.urmator_data || null, urmator_km: parseInt(form.urmator_km) || null,
      note: form.note || null, created_by: user?.id,
    });

    if (sErr) { setError(sErr.message); setLoading(false); return; }
    for (const f of fisiere) await uploadDocumentServiciu(serviciu.id, f);

    setLoading(false);
    setSuccess('Intervenția a fost salvată!');
    setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={masina ? `Adaugă intervenție — ${masina.nr_inmatriculare}` : 'Adaugă intervenție service'} width={660}>
      <form onSubmit={handleSubmit}>
        <ErrorBox message={error} /><SuccessBox message={success} />

        {!masinaId && (
          <Field label="Mașină" required>
            <Select value={selectedMasinaId} onChange={e => setSelectedMasinaId(e.target.value)}>
              <option value="">Selectează mașina</option>
              {masiniLista.map(m => <option key={m.id} value={m.id}>{m.nr_inmatriculare} — {m.marca} {m.model}</option>)}
            </Select>
          </Field>
        )}

        <Divider label="Detalii intervenție" />
        <Field label="Titlu intervenție" required>
          <Input placeholder="ex: Schimb ulei + filtre" value={form.titlu} onChange={set('titlu')} />
        </Field>
        <Row cols={2}>
          <Field label="Tip intervenție">
            <Select value={form.tip} onChange={set('tip')}>{TIPURI_SERVICE.map(t => <option key={t} value={t}>{t}</option>)}</Select>
          </Field>
          <Field label="Service auto">
            <Input placeholder="ex: Auto Total SRL" value={form.service_auto} onChange={set('service_auto')} />
          </Field>
        </Row>
        <Field label="Descriere detaliată">
          <Textarea placeholder="Detalii piesele folosite, lucrări efectuate..." value={form.descriere} onChange={set('descriere')} rows={3} />
        </Field>

        <Divider label="Date tehnice" />
        <Row cols={2}>
          <Field label="Data intervenției" required><Input type="date" value={form.data_interventie} onChange={set('data_interventie')} /></Field>
          <Field label="Km la intervenție"><Input type="number" min="0" placeholder="ex: 87400" value={form.km_la_interventie} onChange={set('km_la_interventie')} /></Field>
        </Row>
        <Row cols={2}>
          <Field label="Cost"><Input type="number" min="0" step="0.01" placeholder="ex: 520" value={form.cost} onChange={set('cost')} /></Field>
          <Field label="Monedă"><Select value={form.moneda} onChange={set('moneda')}><option value="RON">RON</option><option value="EUR">EUR</option></Select></Field>
        </Row>

        <Divider label="Următor service (opțional)" />
        <Row cols={2}>
          <Field label="Dată estimată"><Input type="date" value={form.urmator_data} onChange={set('urmator_data')} /></Field>
          <Field label="Km estimați"><Input type="number" min="0" placeholder="ex: 95000" value={form.urmator_km} onChange={set('urmator_km')} /></Field>
        </Row>
        <Field label="Note interne"><Textarea placeholder="Observații..." value={form.note} onChange={set('note')} rows={2} /></Field>

        <Divider label="Documente atașate (facturi, devize)" />
        <FileUpload onFile={f => f && setFisiere(prev => [...prev, f])} accept=".pdf,.jpg,.jpeg,.png" maxMB={20} label="Atașează factură sau deviz" />
        {fisiere.length > 0 && (
          <div style={{ marginTop:10 }}>
            {fisiere.map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12, padding:'6px 10px', background:'#FAFAF8', borderRadius:6, marginBottom:4, border:'0.5px solid #E8E6E0' }}>
                <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <i className="ti ti-file" style={{ color:'#185FA5' }} />{f.name}
                  <span style={{ color:'#888780', fontSize:11 }}>({(f.size/1024).toFixed(0)} KB)</span>
                </span>
                <button type="button" onClick={() => setFisiere(prev => prev.filter((_,j) => j!==i))}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#888780', fontSize:16, display:'flex' }}>
                  <i className="ti ti-x" />
                </button>
              </div>
            ))}
          </div>
        )}

        <FormActions onCancel={onClose} loading={loading} submitLabel="Salvează intervenția" />
      </form>
    </Modal>
  );
}

// ── SERVICE PAGE ───────────────────────────────────────────
export function Service() {
  const [filtruMasina, setFiltruMasina] = useState('');
  const [modalService, setModalService] = useState(false);
  const [selectedMasina, setSelectedMasina] = useState(null);
  const { data: servicii, loading, refetch } = useServicii({ masinaId: filtruMasina || undefined });
  const { data: masini } = useMasini();

  function formatData(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('ro-RO', { day:'2-digit', month:'2-digit', year:'numeric' }); }
  const totalCost = servicii?.reduce((sum, s) => sum + (parseFloat(s.cost) || 0), 0) || 0;

  return (
    <>
      <div className="topbar" style={{ marginTop:-20, marginLeft:-24, marginRight:-24, paddingLeft:24, marginBottom:20, position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <select className="filter-select" value={filtruMasina} onChange={e => setFiltruMasina(e.target.value)}>
            <option value="">Toate mașinile</option>
            {masini?.map(m => <option key={m.id} value={m.id}>{m.nr_inmatriculare} — {m.marca} {m.model}</option>)}
          </select>
          {filtruMasina && servicii?.length > 0 && (
            <span style={{ fontSize:12, color:'#888780' }}>Total: <strong style={{ color:'#1a1a18' }}>{totalCost.toLocaleString('ro-RO')} lei</strong></span>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => { setSelectedMasina(null); setModalService(true); }}>
          <i className="ti ti-plus" /> Adaugă intervenție
        </button>
      </div>

      {loading ? <div style={{ color:'#888780', fontSize:13, padding:20, display:'flex', gap:8, alignItems:'center' }}><i className="ti ti-loader-2" style={{ animation:'spin 1s linear infinite' }} /> Se încarcă...<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div> : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Mașină</th><th>Dată</th><th>Km</th><th>Intervenție</th><th>Service auto</th><th>Cost</th><th>Următor</th><th>Docs</th></tr></thead>
              <tbody>
                {(!servicii || servicii.length === 0) && (
                  <tr><td colSpan={8} style={{ textAlign:'center', color:'#888780', padding:32, fontSize:13 }}>
                    <i className="ti ti-tool" style={{ fontSize:32, display:'block', marginBottom:8, color:'#C8C6BE' }} />
                    Nicio intervenție. Apasă "Adaugă intervenție" pentru a începe.
                  </td></tr>
                )}
                {servicii?.map(s => (
                  <tr key={s.id}>
                    <td><span className="plate">{s.masini?.nr_inmatriculare || '—'}</span></td>
                    <td style={{ fontSize:13, whiteSpace:'nowrap' }}>{formatData(s.data_interventie)}</td>
                    <td style={{ fontSize:13, fontFamily:'Courier New, monospace' }}>{s.km_la_interventie?.toLocaleString('ro-RO') || '—'}</td>
                    <td>
                      <div style={{ fontWeight:500, fontSize:13 }}>{s.titlu}</div>
                      {s.descriere && <div style={{ fontSize:11, color:'#888780', marginTop:2 }}>{s.descriere.length > 70 ? s.descriere.slice(0,70)+'...' : s.descriere}</div>}
                    </td>
                    <td style={{ fontSize:12, color:'#888780' }}>{s.service_auto || '—'}</td>
                    <td style={{ fontWeight:500, whiteSpace:'nowrap' }}>{s.cost ? `${parseFloat(s.cost).toLocaleString('ro-RO')} ${s.moneda}` : '—'}</td>
                    <td>
                      {s.urmator_data && <span className="badge badge-green">{formatData(s.urmator_data)}</span>}
                      {s.urmator_km && <span className="badge badge-blue">{s.urmator_km.toLocaleString('ro-RO')} km</span>}
                      {!s.urmator_data && !s.urmator_km && <span style={{ color:'#B4B2A9', fontSize:13 }}>—</span>}
                    </td>
                    <td>
                      {s.servicii_documente?.length > 0
                        ? <span className="badge badge-gray"><i className="ti ti-paperclip" style={{ fontSize:12 }} /> {s.servicii_documente.length}</span>
                        : <span style={{ color:'#B4B2A9', fontSize:13 }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FormularService isOpen={modalService} onClose={() => { setModalService(false); setSelectedMasina(null); }}
        masinaId={selectedMasina?.id} masina={selectedMasina} onSuccess={refetch} masiniLista={masini || []} />
    </>
  );
}

// Imports needed inside this file
import { useServicii, useMasini } from '../../hooks/useData';

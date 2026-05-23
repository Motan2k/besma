import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import {
  Field, Input, Select, Textarea, Row,
  Divider, FormActions, ErrorBox, SuccessBox
} from '../common/FormFields';
import FileUpload from '../common/FileUpload';
import { useServiciiActions } from '../../hooks/useData';
import { supabase } from '../../lib/supabase';

const TIPURI_SERVICE = [
  'Schimb ulei', 'Filtre', 'Frâne', 'Anvelope', 'Distribuție',
  'Suspensie', 'Electricitate', 'Caroserie', 'ITP', 'Revizie', 'Altele'
];

export default function FormularService({
  isOpen, onClose, masinaId, masina, onSuccess, masiniLista = []
}) {
  const { adaugaServiciu, uploadDocumentServiciu } = useServiciiActions();

  const [selectedMasinaId, setSelectedMasinaId] = useState(masinaId || '');
  const [form, setForm] = useState({
    data_interventie: new Date().toISOString().split('T')[0],
    km_la_interventie: '',
    titlu: '', descriere: '',
    tip: 'Altele',
    service_auto: '',
    cost: '', moneda: 'RON',
    urmator_data: '', urmator_km: '',
    note: '',
  });
  const [fisiere, setFisiere] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedMasinaId(masinaId || '');
      setForm({
        data_interventie: new Date().toISOString().split('T')[0],
        km_la_interventie: masina?.km_actuali || '',
        titlu: '', descriere: '', tip: 'Altele',
        service_auto: '', cost: '', moneda: 'RON',
        urmator_data: '', urmator_km: '', note: '',
      });
      setFisiere([]);
      setError('');
      setSuccess('');
    }
  }, [isOpen, masina, masinaId]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const targetMasinaId = masinaId || selectedMasinaId;
    if (!targetMasinaId) { setError('Selectează mașina pentru care adaugi intervenția.'); return; }
    if (!form.titlu) { setError('Completează titlul intervenției.'); return; }
    if (!form.data_interventie) { setError('Completează data intervenției.'); return; }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data: serviciu, error: sErr } = await adaugaServiciu({
      masina_id: targetMasinaId,
      data_interventie: form.data_interventie,
      km_la_interventie: parseInt(form.km_la_interventie) || null,
      titlu: form.titlu,
      descriere: form.descriere || null,
      tip: form.tip,
      service_auto: form.service_auto || null,
      cost: parseFloat(form.cost) || null,
      moneda: form.moneda,
      urmator_data: form.urmator_data || null,
      urmator_km: parseInt(form.urmator_km) || null,
      note: form.note || null,
      created_by: user?.id,
    });

    if (sErr) { setError(sErr.message); setLoading(false); return; }

    for (const f of fisiere) {
      await uploadDocumentServiciu(serviciu.id, f);
    }

    setLoading(false);
    setSuccess('Intervenția a fost salvată cu succes!');
    setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={masina ? `Adaugă intervenție — ${masina.nr_inmatriculare}` : 'Adaugă intervenție service'} width={660}>
      <form onSubmit={handleSubmit}>
        <ErrorBox message={error} />
        <SuccessBox message={success} />

        {!masinaId && (
          <Field label="Mașină" required>
            <Select value={selectedMasinaId} onChange={e => setSelectedMasinaId(e.target.value)}>
              <option value="">Selectează mașina</option>
              {masiniLista.map(m => (
                <option key={m.id} value={m.id}>{m.nr_inmatriculare} — {m.marca} {m.model}</option>
              ))}
            </Select>
          </Field>
        )}

        <Divider label="Detalii intervenție" />
        <Field label="Titlu intervenție" required>
          <Input placeholder="ex: Schimb ulei + filtre" value={form.titlu} onChange={set('titlu')} />
        </Field>
        <Row cols={2}>
          <Field label="Tip intervenție">
            <Select value={form.tip} onChange={set('tip')}>
              {TIPURI_SERVICE.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Service auto">
            <Input placeholder="ex: Auto Total SRL" value={form.service_auto} onChange={set('service_auto')} />
          </Field>
        </Row>
        <Field label="Descriere detaliată">
          <Textarea placeholder="ex: Ulei 5W-40 Castrol 5L, filtru ulei Mann..." value={form.descriere} onChange={set('descriere')} rows={3} />
        </Field>

        <Divider label="Date tehnice" />
        <Row cols={2}>
          <Field label="Data intervenției" required>
            <Input type="date" value={form.data_interventie} onChange={set('data_interventie')} />
          </Field>
          <Field label="Km la intervenție">
            <Input type="number" min="0" placeholder="ex: 87400" value={form.km_la_interventie} onChange={set('km_la_interventie')} />
          </Field>
        </Row>
        <Row cols={2}>
          <Field label="Cost">
            <Input type="number" min="0" step="0.01" placeholder="ex: 520" value={form.cost} onChange={set('cost')} />
          </Field>
          <Field label="Monedă">
            <Select value={form.moneda} onChange={set('moneda')}>
              <option value="RON">RON</option>
              <option value="EUR">EUR</option>
            </Select>
          </Field>
        </Row>

        <Divider label="Următor service (opțional)" />
        <Row cols={2}>
          <Field label="Dată estimată">
            <Input type="date" value={form.urmator_data} onChange={set('urmator_data')} />
          </Field>
          <Field label="Km estimați">
            <Input type="number" min="0" placeholder="ex: 95000" value={form.urmator_km} onChange={set('urmator_km')} />
          </Field>
        </Row>

        <Field label="Note interne">
          <Textarea placeholder="Observații pentru echipă..." value={form.note} onChange={set('note')} rows={2} />
        </Field>

        <Divider label="Documente atașate (facturi, devize)" />
        <FileUpload
          onFile={f => f && setFisiere(prev => [...prev, f])}
          accept=".pdf,.jpg,.jpeg,.png"
          maxMB={20}
          label="Atașează factură sau deviz (PDF / imagine)"
        />
        {fisiere.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#5F5E5A', marginBottom: 6 }}>
              Fișiere selectate ({fisiere.length}):
            </div>
            {fisiere.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontSize: 12, padding: '6px 10px', background: '#FAFAF8',
                borderRadius: 6, marginBottom: 4, border: '0.5px solid #E8E6E0',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="ti ti-file" style={{ color: '#185FA5' }} />
                  {f.name}
                  <span style={{ color: '#888780', fontSize: 11 }}>({(f.size / 1024).toFixed(0)} KB)</span>
                </span>
                <button type="button" onClick={() => setFisiere(prev => prev.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888780', fontSize: 16, display: 'flex' }}>
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

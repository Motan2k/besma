import React, { useState, useEffect } from 'react';
import { Modal, Field, Input, Select, Row, Divider, FormActions, ErrorBox, SuccessBox, FileUpload } from '../common/index.jsx';
import { useDocumenteActions, useMasini } from '../../hooks/useData';
import { supabase } from '../../lib/supabase';

const TIPURI = ['RCA', 'ITP', 'Rovignetă', 'CASCO', 'Altele'];

export default function FormularDocument({ isOpen, onClose, masinaId, masina, onSuccess, tipPreselect }) {
  const { adaugaDocument, uploadFisier } = useDocumenteActions();
  const { data: masini } = useMasini();

  const [selectedMasinaId, setSelectedMasinaId] = useState(masinaId || '');
  const [form, setForm] = useState({ tip: tipPreselect || 'RCA', asigurator: '', nr_polita: '', data_start: '', data_expirare: '', detalii: '' });
  const [fisier, setFisier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedMasinaId(masinaId || '');
      setForm({ tip: tipPreselect || 'RCA', asigurator: '', nr_polita: '', data_start: '', data_expirare: '', detalii: '' });
      setFisier(null); setError(''); setSuccess('');
    }
  }, [isOpen, masinaId, tipPreselect]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    const targetMasinaId = masinaId || selectedMasinaId;
    if (!targetMasinaId) { setError('Selectează mașina pentru care adaugi documentul.'); return; }
    if (!form.data_expirare) { setError('Completează data expirării.'); return; }
    setLoading(true);

    let fisier_url = null, fisier_name = null;
    if (fisier) {
      const path = `${targetMasinaId}/${form.tip}/${Date.now()}_${fisier.name}`;
      const { url, error: upErr } = await uploadFisier('documente', path, fisier);
      if (upErr) { setError('Eroare upload: ' + upErr.message); setLoading(false); return; }
      fisier_url = url; fisier_name = fisier.name;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await adaugaDocument({
      masina_id: targetMasinaId, tip: form.tip,
      asigurator: form.asigurator || null, nr_polita: form.nr_polita || null,
      data_start: form.data_start || null, data_expirare: form.data_expirare,
      detalii: form.detalii || null, fisier_url, fisier_name, created_by: user?.id,
    });

    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess('Documentul a fost adăugat!');
    setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
  };

  const masinaSelectata = masina || masini?.find(m => m.id === selectedMasinaId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adaugă document${masinaSelectata ? ` — ${masinaSelectata.nr_inmatriculare}` : ''}`} width={540}>
      <form onSubmit={handleSubmit}>
        <ErrorBox message={error} /><SuccessBox message={success} />

        {!masinaId && (
          <Field label="Mașină" required>
            <Select value={selectedMasinaId} onChange={e => setSelectedMasinaId(e.target.value)}>
              <option value="">Selectează mașina</option>
              {masini?.map(m => <option key={m.id} value={m.id}>{m.nr_inmatriculare} — {m.marca} {m.model}</option>)}
            </Select>
          </Field>
        )}

        <Field label="Tip document" required>
          <Select value={form.tip} onChange={set('tip')}>
            {TIPURI.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>

        {(form.tip === 'RCA' || form.tip === 'CASCO') && (
          <>
            <Divider label="Detalii poliță" />
            <Row cols={2}>
              <Field label="Asigurător"><Input placeholder="ex: Allianz" value={form.asigurator} onChange={set('asigurator')} /></Field>
              <Field label="Nr. poliță"><Input placeholder="ex: POL-2026-12345" value={form.nr_polita} onChange={set('nr_polita')} /></Field>
            </Row>
          </>
        )}

        {form.tip === 'Rovignetă' && (
          <>
            <Divider label="Tip rovignetă" />
            <Field label="Perioadă">
              <Select value={form.detalii} onChange={set('detalii')}>
                <option value="">Selectează</option>
                {['1 zi', '7 zile', '30 zile', '1 an'].map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
          </>
        )}

        <Divider label="Valabilitate" />
        <Row cols={2}>
          <Field label="Data început"><Input type="date" value={form.data_start} onChange={set('data_start')} /></Field>
          <Field label="Data expirare" required><Input type="date" value={form.data_expirare} onChange={set('data_expirare')} /></Field>
        </Row>

        {form.tip !== 'Rovignetă' && (
          <Field label="Detalii suplimentare"><Input placeholder="Observații..." value={form.detalii} onChange={set('detalii')} /></Field>
        )}

        <Divider label="Fișier document" />
        <FileUpload onFile={setFisier} accept=".pdf,.jpg,.jpeg,.png" maxMB={10} label="Atașează polița / certificatul (PDF sau imagine)" />

        <FormActions onCancel={onClose} loading={loading} submitLabel="Adaugă documentul" />
      </form>
    </Modal>
  );
}

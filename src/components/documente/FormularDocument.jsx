import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Field, Input, Select, Row, Divider, FormActions, ErrorBox, SuccessBox } from '../common/FormFields';
import FileUpload from '../common/FileUpload';
import { useDocumenteActions } from '../../hooks/useData';
import { supabase } from '../../lib/supabase';

const TIPURI = ['RCA', 'ITP', 'Rovignetă', 'CASCO', 'Altele'];
const ROVIGNETA_TIPURI = ['1 zi', '7 zile', '30 zile', '1 an'];

export default function FormularDocument({ isOpen, onClose, masinaId, masina, onSuccess }) {
  const { adaugaDocument, uploadFisier } = useDocumenteActions();

  const [form, setForm] = useState({
    tip: 'RCA',
    asigurator: '', nr_polita: '',
    data_start: '', data_expirare: '',
    detalii: '',
  });
  const [fisier, setFisier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm({ tip: 'RCA', asigurator: '', nr_polita: '', data_start: '', data_expirare: '', detalii: '' });
      setFisier(null); setError(''); setSuccess('');
    }
  }, [isOpen]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.tip || !form.data_expirare) {
      setError('Completează tipul documentului și data expirării.');
      return;
    }
    setLoading(true);

    let fisier_url = null;
    let fisier_name = null;

    if (fisier) {
      const path = `${masinaId}/${form.tip}/${Date.now()}_${fisier.name}`;
      const { url, error: uploadErr } = await uploadFisier('documente', path, fisier);
      if (uploadErr) { setError('Eroare la upload fișier: ' + uploadErr.message); setLoading(false); return; }
      fisier_url = url;
      fisier_name = fisier.name;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await adaugaDocument({
      masina_id: masinaId,
      tip: form.tip,
      asigurator: form.asigurator || null,
      nr_polita: form.nr_polita || null,
      data_start: form.data_start || null,
      data_expirare: form.data_expirare,
      detalii: form.detalii || null,
      fisier_url,
      fisier_name,
      created_by: user?.id,
    });

    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess('Documentul a fost adăugat cu succes!');
    setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adaugă document${masina ? ` — ${masina.nr_inmatriculare}` : ''}`} width={560}>
      <form onSubmit={handleSubmit}>
        <ErrorBox message={error} />
        <SuccessBox message={success} />

        <Field label="Tip document" required>
          <Select value={form.tip} onChange={set('tip')}>
            {TIPURI.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>

        {form.tip === 'RCA' && (
          <>
            <Divider label="Detalii poliță RCA" />
            <Row cols={2}>
              <Field label="Asigurător">
                <Input placeholder="ex: Allianz, Omniasig..." value={form.asigurator} onChange={set('asigurator')} />
              </Field>
              <Field label="Nr. poliță">
                <Input placeholder="ex: POL-2026-12345" value={form.nr_polita} onChange={set('nr_polita')} />
              </Field>
            </Row>
          </>
        )}

        {form.tip === 'CASCO' && (
          <>
            <Divider label="Detalii CASCO" />
            <Row cols={2}>
              <Field label="Asigurător">
                <Input placeholder="ex: Generali, Groupama..." value={form.asigurator} onChange={set('asigurator')} />
              </Field>
              <Field label="Nr. poliță">
                <Input placeholder="ex: CSC-2026-12345" value={form.nr_polita} onChange={set('nr_polita')} />
              </Field>
            </Row>
          </>
        )}

        {form.tip === 'Rovignetă' && (
          <>
            <Divider label="Tip rovignetă" />
            <Field label="Perioadă valabilitate">
              <Select value={form.detalii} onChange={set('detalii')}>
                <option value="">Selectează perioada</option>
                {ROVIGNETA_TIPURI.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
          </>
        )}

        <Divider label="Valabilitate" />
        <Row cols={2}>
          <Field label="Data început">
            <Input type="date" value={form.data_start} onChange={set('data_start')} />
          </Field>
          <Field label="Data expirare" required>
            <Input type="date" value={form.data_expirare} onChange={set('data_expirare')} />
          </Field>
        </Row>

        {form.tip !== 'Rovignetă' && (
          <Field label="Detalii suplimentare">
            <Input placeholder="Observații..." value={form.detalii} onChange={set('detalii')} />
          </Field>
        )}

        <Divider label="Fișier document" />
        <FileUpload
          onFile={setFisier}
          accept=".pdf,.jpg,.jpeg,.png"
          maxMB={10}
          label="Atașează polița / certificatul (PDF sau imagine)"
        />

        <FormActions onCancel={onClose} loading={loading} submitLabel="Adaugă documentul" />
      </form>
    </Modal>
  );
}

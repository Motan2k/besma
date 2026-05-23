import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Field, Input, Select, Textarea, Row, Divider, FormActions, ErrorBox, SuccessBox } from '../common/FormFields';
import { useMasiniActions } from '../../hooks/useData';
import { useLocatii, useProfiles } from '../../hooks/useData';

const COMBUSTIBILI = ['Benzină', 'Diesel', 'Hybrid', 'Electric', 'GPL'];
const ANI = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

export default function FormularMasina({ isOpen, onClose, masina = null, onSuccess }) {
  const isEdit = !!masina;
  const { adaugaMasina, updateMasina } = useMasiniActions();
  const { data: locatii } = useLocatii();
  const { data: soferi } = useProfiles({ role: 'driver' });

  const [form, setForm] = useState({
    marca: '', model: '', an_fabricatie: new Date().getFullYear(),
    culoare: '', combustibil: 'Benzină',
    nr_inmatriculare: '', vin: '',
    km_actuali: 0, locatie_id: '', sofer_id: '',
    gps_imei: '', note: '', status: 'activa',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (masina) {
      setForm({
        marca: masina.marca || '',
        model: masina.model || '',
        an_fabricatie: masina.an_fabricatie || new Date().getFullYear(),
        culoare: masina.culoare || '',
        combustibil: masina.combustibil || 'Benzină',
        nr_inmatriculare: masina.nr_inmatriculare || '',
        vin: masina.vin || '',
        km_actuali: masina.km_actuali || 0,
        locatie_id: masina.locatie_id || '',
        sofer_id: masina.sofer_id || '',
        gps_imei: masina.gps_imei || '',
        note: masina.note || '',
        status: masina.status || 'activa',
      });
    } else {
      setForm({
        marca: '', model: '', an_fabricatie: new Date().getFullYear(),
        culoare: '', combustibil: 'Benzină',
        nr_inmatriculare: '', vin: '',
        km_actuali: 0, locatie_id: '', sofer_id: '',
        gps_imei: '', note: '', status: 'activa',
      });
    }
    setError('');
    setSuccess('');
  }, [masina, isOpen]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.marca || !form.model || !form.nr_inmatriculare || !form.locatie_id) {
      setError('Completează câmpurile obligatorii: Marcă, Model, Nr. înmatriculare.');
      return;
    }
    setLoading(true);
    const payload = {
      ...form,
      an_fabricatie: parseInt(form.an_fabricatie),
      km_actuali: parseInt(form.km_actuali) || 0,
      sofer_id: form.sofer_id || null,
      gps_imei: form.gps_imei || null,
      vin: form.vin || null,
    };
    const { error } = isEdit
      ? await updateMasina(masina.id, payload)
      : await adaugaMasina(payload);

    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess(isEdit ? 'Mașina a fost actualizată!' : 'Mașina a fost adăugată cu succes!');
    setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editează mașina' : 'Adaugă mașină nouă'} width={620}>
      <form onSubmit={handleSubmit}>
        <ErrorBox message={error} />
        <SuccessBox message={success} />

        <Divider label="Informații vehicul" />
        <Row cols={2}>
          <Field label="Marcă" required>
            <Input placeholder="ex: Dacia" value={form.marca} onChange={set('marca')} />
          </Field>
          <Field label="Model" required>
            <Input placeholder="ex: Logan" value={form.model} onChange={set('model')} />
          </Field>
        </Row>
        <Row cols={3}>
          <Field label="An fabricație">
            <Select value={form.an_fabricatie} onChange={set('an_fabricatie')}>
              {ANI.map(a => <option key={a} value={a}>{a}</option>)}
            </Select>
          </Field>
          <Field label="Culoare">
            <Input placeholder="ex: Alb" value={form.culoare} onChange={set('culoare')} />
          </Field>
          <Field label="Combustibil">
            <Select value={form.combustibil} onChange={set('combustibil')}>
              {COMBUSTIBILI.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
        </Row>

        <Divider label="Identificare" />
        <Row cols={2}>
          <Field label="Nr. înmatriculare" required>
            <Input
              placeholder="ex: B 123 ABC"
              value={form.nr_inmatriculare}
              onChange={e => setForm(f => ({ ...f, nr_inmatriculare: e.target.value.toUpperCase() }))}
            />
          </Field>
          <Field label="Serie VIN">
            <Input
              placeholder="ex: UU1LSDB256..."
              value={form.vin}
              onChange={e => setForm(f => ({ ...f, vin: e.target.value.toUpperCase() }))}
            />
          </Field>
        </Row>
        <Row cols={2}>
          <Field label="Km actuali">
            <Input type="number" min="0" value={form.km_actuali} onChange={set('km_actuali')} />
          </Field>
          <Field label="IMEI GPS Tracker">
            <Input placeholder="ex: 358000000000000" value={form.gps_imei} onChange={set('gps_imei')} />
          </Field>
        </Row>

        <Divider label="Organizare" />
        <Row cols={2}>
          <Field label="Locație">
            <Select value={form.locatie_id} onChange={set('locatie_id')}>
              <option value="">Selectează locația</option>
              {locatii?.map(l => <option key={l.id} value={l.id}>{l.nume}</option>)}
            </Select>
          </Field>
          <Field label="Șofer atribuit">
            <Select value={form.sofer_id} onChange={set('sofer_id')}>
              <option value="">Neatribuit</option>
              {soferi?.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </Select>
          </Field>
        </Row>
        {isEdit && (
          <Field label="Status">
            <Select value={form.status} onChange={set('status')}>
              <option value="activa">Activă</option>
              <option value="service">În service</option>
              <option value="arhivata">Arhivată</option>
            </Select>
          </Field>
        )}
        <Field label="Note">
          <Textarea placeholder="Observații suplimentare..." value={form.note} onChange={set('note')} />
        </Field>

        <FormActions onCancel={onClose} loading={loading} submitLabel={isEdit ? 'Salvează modificările' : 'Adaugă mașina'} />
      </form>
    </Modal>
  );
}

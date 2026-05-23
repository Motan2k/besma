import React, { useState, useRef } from 'react';
import { useMasiniActions, useDocumenteActions, useLocatii } from '../../hooks/useData';
import { supabase } from '../../lib/supabase';

const ANTHROPIC_API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;

// ── HELPERS ───────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function analyzeImageWithClaude(base64Image, mediaType, prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Image } },
          { type: 'text', text: prompt }
        ]
      }]
    })
  });

  if (!response.ok) throw new Error('Eroare API Claude: ' + response.statusText);
  const data = await response.json();
  const text = data.content[0].text;

  // Extrage JSON din răspuns
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Nu am putut extrage datele din imagine.');
  return JSON.parse(jsonMatch[0]);
}

// ── UPLOAD ZONE ───────────────────────────────────────────
function UploadZone({ label, sublabel, icon, onFile, file, status }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);

  const bgColor = status === 'success' ? '#EAF3DE' : status === 'error' ? '#FCEBEB' : drag ? '#E6F1FB' : '#FAFAF8';
  const borderColor = status === 'success' ? '#3B6D11' : status === 'error' ? '#A32D2D' : drag ? '#185FA5' : '#C8C6BE';

  return (
    <div
      onClick={() => ref.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); }}
      style={{
        border: `2px dashed ${borderColor}`, borderRadius: 12,
        padding: '32px 24px', textAlign: 'center', cursor: 'pointer',
        background: bgColor, transition: 'all 0.2s', flex: 1,
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      {file ? (
        <>
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }}
          />
          <div style={{ fontSize: 13, fontWeight: 500, color: '#185FA5' }}>{file.name}</div>
          <div style={{ fontSize: 11, color: '#888780', marginTop: 3 }}>Click pentru a schimba</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#1a1a18', marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 12, color: '#888780' }}>{sublabel}</div>
          <div style={{ fontSize: 11, color: '#B4B2A9', marginTop: 8 }}>JPG, PNG — max 5MB</div>
        </>
      )}
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
    </div>
  );
}

// ── FIELD EDITABLE ────────────────────────────────────────
function EditField({ label, value, onChange, type = 'text', required }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888780', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label} {required && <span style={{ color: '#A32D2D' }}>*</span>}
      </label>
      <input
        type={type} value={value || ''} onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '8px 12px', fontSize: 13, fontFamily: 'inherit',
          border: '0.5px solid #C8C6BE', borderRadius: 7, background: 'white',
          color: '#1a1a18', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = '#185FA5'}
        onBlur={e => e.target.style.borderColor = '#C8C6BE'}
      />
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────
export default function AutoID() {
  const { adaugaMasina } = useMasiniActions();
  const { adaugaDocument } = useDocumenteActions();
  const { data: locatii } = useLocatii();

  const [talonFile, setTalonFile] = useState(null);
  const [rcaFile, setRcaFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState('upload'); // upload | review | saving | done
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  // Date extrase
  const [masina, setMasina] = useState({
    marca: '', model: '', an_fabricatie: '', culoare: '',
    nr_inmatriculare: '', vin: '', combustibil: 'Diesel',
    locatie_id: '', km_actuali: 0, status: 'activa',
  });
  const [rca, setRca] = useState({
    asigurator: '', nr_polita: '', data_start: '', data_expirare: '',
  });
  const [hasRca, setHasRca] = useState(false);

  const updateMasina = (key) => (val) => setMasina(m => ({ ...m, [key]: val }));
  const updateRca = (key) => (val) => setRca(r => ({ ...r, [key]: val }));

  // Găsește ID-ul Bucureștiului ca default
  const idBucuresti = locatii?.find(l => l.nume === 'București')?.id || '';

  const handleAnalyze = async () => {
    if (!talonFile) { setError('Te rugăm să încarci cel puțin poza talonului.'); return; }
    setError('');
    setAnalyzing(true);

    try {
      // Analizează talonul
      setProgress('Analizez talonul mașinii...');
      const talonBase64 = await fileToBase64(talonFile);
      const talonMediaType = talonFile.type || 'image/jpeg';

      const talonData = await analyzeImageWithClaude(
        talonBase64, talonMediaType,
        `Analizează această imagine a talonului/certificatului de înmatriculare al unui vehicul și extrage datele.
        Răspunde DOAR cu un obiect JSON valid, fără text suplimentar:
        {
          "marca": "marca vehiculului",
          "model": "modelul vehiculului",
          "an_fabricatie": "anul fabricației ca număr",
          "culoare": "culoarea vehiculului",
          "nr_inmatriculare": "numărul de înmatriculare",
          "vin": "seria VIN/numărul de șasiu",
          "combustibil": "tipul de combustibil (Benzină/Diesel/Hybrid/Electric/GPL)"
        }
        Dacă un câmp nu este vizibil sau nu poate fi citit, folosește string gol "".`
      );

      setMasina(m => ({
        ...m,
        marca: talonData.marca || '',
        model: talonData.model || '',
        an_fabricatie: talonData.an_fabricatie ? parseInt(talonData.an_fabricatie) : '',
        culoare: talonData.culoare || '',
        nr_inmatriculare: talonData.nr_inmatriculare || '',
        vin: talonData.vin || '',
        combustibil: talonData.combustibil || 'Diesel',
        locatie_id: idBucuresti,
      }));

      // Analizează RCA dacă există
      if (rcaFile) {
        setProgress('Analizez polița RCA...');
        const rcaBase64 = await fileToBase64(rcaFile);
        const rcaMediaType = rcaFile.type || 'image/jpeg';

        const rcaData = await analyzeImageWithClaude(
          rcaBase64, rcaMediaType,
          `Analizează această imagine a poliței RCA și extrage datele.
          Răspunde DOAR cu un obiect JSON valid, fără text suplimentar:
          {
            "asigurator": "numele companiei de asigurare",
            "nr_polita": "numărul poliței",
            "data_start": "data de început în format YYYY-MM-DD",
            "data_expirare": "data expirării în format YYYY-MM-DD"
          }
          Dacă un câmp nu este vizibil, folosește string gol "".`
        );

        setRca({
          asigurator: rcaData.asigurator || '',
          nr_polita: rcaData.nr_polita || '',
          data_start: rcaData.data_start || '',
          data_expirare: rcaData.data_expirare || '',
        });
        setHasRca(true);
      }

      setStep('review');
    } catch (err) {
      setError('Eroare la analiză: ' + err.message);
    } finally {
      setAnalyzing(false);
      setProgress('');
    }
  };

  const handleSave = async () => {
    if (!masina.nr_inmatriculare) { setError('Numărul de înmatriculare este obligatoriu.'); return; }
    if (!masina.marca || !masina.model) { setError('Marca și modelul sunt obligatorii.'); return; }
    setError('');
    setStep('saving');

    try {
      // Salvează mașina
      const { data: masinaCreata, error: masinaErr } = await adaugaMasina({
        ...masina,
        an_fabricatie: masina.an_fabricatie ? parseInt(masina.an_fabricatie) : null,
        km_actuali: parseInt(masina.km_actuali) || 0,
        locatie_id: masina.locatie_id || null,
        vin: masina.vin || null,
      });

      if (masinaErr) throw new Error(masinaErr.message);

      // Salvează RCA dacă există
      if (hasRca && rca.data_expirare) {
        const { data: { user } } = await supabase.auth.getUser();
        await adaugaDocument({
          masina_id: masinaCreata.id,
          tip: 'RCA',
          asigurator: rca.asigurator || null,
          nr_polita: rca.nr_polita || null,
          data_start: rca.data_start || null,
          data_expirare: rca.data_expirare,
          created_by: user?.id,
        });
      }

      setStep('done');
    } catch (err) {
      setError('Eroare la salvare: ' + err.message);
      setStep('review');
    }
  };

  const handleReset = () => {
    setTalonFile(null); setRcaFile(null);
    setStep('upload'); setError(''); setProgress('');
    setMasina({ marca: '', model: '', an_fabricatie: '', culoare: '', nr_inmatriculare: '', vin: '', combustibil: 'Diesel', locatie_id: idBucuresti, km_actuali: 0, status: 'activa' });
    setRca({ asigurator: '', nr_polita: '', data_start: '', data_expirare: '' });
    setHasRca(false);
  };

  // ── RENDER: DONE ────────────────────────────────────────
  if (step === 'done') return (
    <div style={{ maxWidth: 560, margin: '60px auto', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: '#1a1a18', marginBottom: 8 }}>Mașina a fost adăugată!</div>
      <div style={{ fontSize: 14, color: '#888780', marginBottom: 32 }}>
        <strong>{masina.nr_inmatriculare}</strong> — {masina.marca} {masina.model}
        {hasRca && rca.data_expirare && <><br />RCA adăugat cu succes.</>}
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={handleReset} className="btn btn-primary">
          <i className="ti ti-plus" /> Adaugă altă mașină
        </button>
        <a href="/masini" className="btn">
          <i className="ti ti-car" /> Vezi mașinile
        </a>
      </div>
    </div>
  );

  // ── RENDER: SAVING ──────────────────────────────────────
  if (step === 'saving') return (
    <div style={{ maxWidth: 560, margin: '60px auto', textAlign: 'center' }}>
      <i className="ti ti-loader-2" style={{ fontSize: 48, color: '#185FA5', animation: 'spin 1s linear infinite' }} />
      <div style={{ fontSize: 16, color: '#888780', marginTop: 16 }}>Se salvează mașina și documentele...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── RENDER: REVIEW ──────────────────────────────────────
  if (step === 'review') return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ti ti-check" style={{ color: '#3B6D11', fontSize: 20 }} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Date identificate — verifică și confirmă</div>
          <div style={{ fontSize: 13, color: '#888780' }}>Poți modifica orice câmp înainte de salvare</div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 7, padding: '10px 14px', fontSize: 13, color: '#A32D2D', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <i className="ti ti-alert-circle" /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: hasRca ? '1fr 1fr' : '1fr', gap: 16 }}>

        {/* MAȘINĂ */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <i className="ti ti-car" style={{ fontSize: 18, color: '#185FA5' }} />
            <div style={{ fontSize: 14, fontWeight: 500 }}>Date mașină</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <EditField label="Nr. înmatriculare" value={masina.nr_inmatriculare} onChange={updateMasina('nr_inmatriculare')} required />
            </div>
            <EditField label="Marcă" value={masina.marca} onChange={updateMasina('marca')} required />
            <EditField label="Model" value={masina.model} onChange={updateMasina('model')} required />
            <EditField label="An fabricație" value={masina.an_fabricatie} onChange={updateMasina('an_fabricatie')} type="number" />
            <EditField label="Culoare" value={masina.culoare} onChange={updateMasina('culoare')} />
            <div style={{ gridColumn: '1/-1' }}>
              <EditField label="Serie VIN" value={masina.vin} onChange={updateMasina('vin')} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888780', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Combustibil</label>
            <select value={masina.combustibil} onChange={e => updateMasina('combustibil')(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '0.5px solid #C8C6BE', borderRadius: 7, background: 'white', fontFamily: 'inherit' }}>
              {['Benzină', 'Diesel', 'Hybrid', 'Electric', 'GPL'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888780', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Locație</label>
            <select value={masina.locatie_id} onChange={e => updateMasina('locatie_id')(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '0.5px solid #C8C6BE', borderRadius: 7, background: 'white', fontFamily: 'inherit' }}>
              <option value="">Fără locație</option>
              {locatii?.map(l => <option key={l.id} value={l.id}>{l.nume}</option>)}
            </select>
          </div>
        </div>

        {/* RCA */}
        {hasRca && (
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <i className="ti ti-file-certificate" style={{ fontSize: 18, color: '#3B6D11' }} />
              <div style={{ fontSize: 14, fontWeight: 500 }}>Date RCA</div>
            </div>
            <EditField label="Asigurător" value={rca.asigurator} onChange={updateRca('asigurator')} />
            <EditField label="Nr. poliță" value={rca.nr_polita} onChange={updateRca('nr_polita')} />
            <EditField label="Data start" value={rca.data_start} onChange={updateRca('data_start')} type="date" />
            <EditField label="Data expirare" value={rca.data_expirare} onChange={updateRca('data_expirare')} type="date" required />
          </div>
        )}
      </div>

      {/* PREVIEW POZE */}
      <div style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
        {talonFile && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#888780', marginBottom: 4 }}>TALON</div>
            <img src={URL.createObjectURL(talonFile)} alt="talon"
              style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, border: '0.5px solid #E8E6E0' }} />
          </div>
        )}
        {rcaFile && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#888780', marginBottom: 4 }}>RCA</div>
            <img src={URL.createObjectURL(rcaFile)} alt="rca"
              style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, border: '0.5px solid #E8E6E0' }} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <button onClick={handleReset} className="btn">
          <i className="ti ti-arrow-left" /> Înapoi
        </button>
        <button onClick={handleSave} className="btn btn-primary">
          <i className="ti ti-check" /> Confirmă și salvează
        </button>
      </div>
    </div>
  );

  // ── RENDER: UPLOAD ──────────────────────────────────────
  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 28 }}>
          🤖
        </div>
        <div style={{ fontSize: 20, fontWeight: 500, color: '#1a1a18', marginBottom: 6 }}>Auto ID</div>
        <div style={{ fontSize: 14, color: '#888780', maxWidth: 460, margin: '0 auto' }}>
          Fotografiază talonul și polița RCA — Claude AI va identifica automat datele mașinii și documentele.
        </div>
      </div>

      {error && (
        <div style={{ background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 7, padding: '10px 14px', fontSize: 13, color: '#A32D2D', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <i className="ti ti-alert-circle" /> {error}
        </div>
      )}

      {/* UPLOAD ZONE */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <UploadZone
          label="Talon / Certificat înmatriculare"
          sublabel="Fotografie clară cu datele vizibile"
          icon="📋"
          onFile={setTalonFile}
          file={talonFile}
        />
        <UploadZone
          label="Poliță RCA"
          sublabel="Opțional — pentru a adăuga și asigurarea"
          icon="📄"
          onFile={setRcaFile}
          file={rcaFile}
        />
      </div>

      {/* TIPS */}
      <div style={{ background: '#F5F4F0', borderRadius: 10, padding: '14px 16px', marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#5F5E5A', marginBottom: 8 }}>
          <i className="ti ti-bulb" style={{ marginRight: 6, color: '#185FA5' }} />
          Sfaturi pentru rezultate mai bune
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
          {[
            'Fotografiază în lumină naturală',
            'Asigură-te că textul e clar și lizibil',
            'Evită umbre și reflexii',
            'Include toate datele în cadru',
          ].map((tip, i) => (
            <div key={i} style={{ fontSize: 12, color: '#888780', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#185FA5' }}>✓</span> {tip}
            </div>
          ))}
        </div>
      </div>

      {/* ANALYZING STATE */}
      {analyzing && (
        <div style={{ background: '#E6F1FB', border: '0.5px solid #B5D4F4', borderRadius: 10, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <i className="ti ti-loader-2" style={{ fontSize: 22, color: '#185FA5', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#185FA5' }}>{progress}</div>
            <div style={{ fontSize: 12, color: '#888780', marginTop: 2 }}>Acest proces poate dura 10-20 secunde</div>
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* BUTTON */}
      <button
        onClick={handleAnalyze}
        disabled={analyzing || !talonFile}
        style={{
          width: '100%', padding: '14px', borderRadius: 10,
          background: (!talonFile || analyzing) ? '#B5D4F4' : '#185FA5',
          color: 'white', border: 'none',
          cursor: (!talonFile || analyzing) ? 'not-allowed' : 'pointer',
          fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}
      >
        {analyzing
          ? <><i className="ti ti-loader-2" style={{ animation: 'spin 1s linear infinite' }} /> Se analizează...</>
          : <><i className="ti ti-cpu" /> Identifică datele cu AI</>
        }
      </button>

      {!talonFile && (
        <div style={{ textAlign: 'center', fontSize: 12, color: '#B4B2A9', marginTop: 10 }}>
          Încarcă cel puțin poza talonului pentru a continua
        </div>
      )}
    </div>
  );
}

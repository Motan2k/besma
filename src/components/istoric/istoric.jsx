import React, { useState, useMemo, useRef } from 'react';
import { useMasini, useDocumente, useServicii } from '../../hooks/useData';

function formatData(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDataLung(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function zileRamase(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
}

// ── TIMELINE EVENT ─────────────────────────────────────────
function TimelineEvent({ event, isLast }) {
  const config = {
    masina_adaugata: { icon: 'ti-car', color: '#185FA5', bg: '#E6F1FB', label: 'Mașină adăugată' },
    document_rca:    { icon: 'ti-shield-check', color: '#3B6D11', bg: '#EAF3DE', label: 'RCA' },
    document_itp:    { icon: 'ti-certificate', color: '#854F0B', bg: '#FAEEDA', label: 'ITP' },
    document_rov:    { icon: 'ti-road', color: '#185FA5', bg: '#E6F1FB', label: 'Rovignetă' },
    document_casco:  { icon: 'ti-shield', color: '#993556', bg: '#FBEAF0', label: 'CASCO' },
    document_alt:    { icon: 'ti-file', color: '#5F5E5A', bg: '#F1EFE8', label: 'Document' },
    service:         { icon: 'ti-tool', color: '#185FA5', bg: '#E6F1FB', label: 'Service' },
  };

  const c = config[event.type] || config.document_alt;

  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: isLast ? 0 : 0 }}>
      {/* LINIE + ICON */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.bg, border: `2px solid ${c.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className={`ti ${c.icon}`} style={{ fontSize: 16, color: c.color }} />
        </div>
        {!isLast && <div style={{ width: 2, flex: 1, background: '#E8E6E0', margin: '6px 0', minHeight: 24 }} />}
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1 }}>
            {/* Data */}
            <div style={{ fontSize: 11, color: '#888780', marginBottom: 4, fontFamily: 'Courier New, monospace' }}>
              {formatDataLung(event.data)}
            </div>
            {/* Titlu */}
            <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a18', marginBottom: 4 }}>
              {event.titlu}
            </div>
            {/* Detalii */}
            {event.detalii && (
              <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.5 }}>{event.detalii}</div>
            )}
            {/* Sub-info */}
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              {event.tags?.map((tag, i) => (
                <span key={i} style={{ fontSize: 11, background: '#F5F4F0', color: '#5F5E5A', padding: '2px 8px', borderRadius: 20 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {/* Badge dreapta */}
          {event.badge && (
            <span className={`badge ${event.badgeCls || 'badge-gray'}`} style={{ flexShrink: 0 }}>
              {event.badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── STAT CARD ──────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = '#185FA5', bg = '#E6F1FB' }) {
  return (
    <div style={{ background: 'white', border: '0.5px solid #E8E6E0', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 20, color }} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#888780', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 500, color: '#1a1a18' }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: '#888780', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────
export default function Istoric() {
  const [selectedMasinaId, setSelectedMasinaId] = useState('');
  const printRef = useRef();

  const { data: masini } = useMasini();
  const { data: documente } = useDocumente({ masinaId: selectedMasinaId || undefined });
  const { data: servicii } = useServicii({ masinaId: selectedMasinaId || undefined });

  const masina = masini?.find(m => m.id === selectedMasinaId);

  // Construiește timeline-ul
  const timeline = useMemo(() => {
    if (!selectedMasinaId || !masina) return [];
    const events = [];

    // Eveniment: mașina adăugată
    events.push({
      type: 'masina_adaugata',
      data: masina.created_at,
      titlu: `${masina.marca} ${masina.model} adăugată în flotă`,
      detalii: `Nr. înmatriculare: ${masina.nr_inmatriculare}${masina.vin ? ` · VIN: ${masina.vin}` : ''}`,
      tags: [masina.combustibil, masina.an_fabricatie ? `An ${masina.an_fabricatie}` : null, masina.culoare].filter(Boolean),
      badge: masina.locatii?.nume,
      badgeCls: 'badge-blue',
    });

    // Evenimente: documente
    documente?.forEach(doc => {
      const tipMap = { RCA: 'document_rca', ITP: 'document_itp', Rovignetă: 'document_rov', CASCO: 'document_casco' };
      const type = tipMap[doc.tip] || 'document_alt';
      const zile = zileRamase(doc.data_expirare);
      const badgeCls = !zile ? 'badge-gray' : zile <= 0 ? 'badge-red' : zile <= 14 ? 'badge-red' : zile <= 30 ? 'badge-amber' : 'badge-green';
      const badgeText = !zile ? '—' : zile <= 0 ? 'Expirat' : `Exp. ${formatData(doc.data_expirare)}`;

      events.push({
        type,
        data: doc.data_start || doc.created_at,
        titlu: `${doc.tip} ${doc.asigurator ? `— ${doc.asigurator}` : ''}`,
        detalii: [
          doc.nr_polita ? `Poliță: ${doc.nr_polita}` : null,
          doc.data_start ? `Start: ${formatData(doc.data_start)}` : null,
          `Expiră: ${formatData(doc.data_expirare)}`,
          doc.detalii || null,
        ].filter(Boolean).join(' · '),
        tags: doc.fisier_name ? ['📎 Document atașat'] : [],
        badge: badgeText,
        badgeCls,
      });
    });

    // Evenimente: service
    servicii?.forEach(s => {
      events.push({
        type: 'service',
        data: s.data_interventie,
        titlu: s.titlu,
        detalii: [
          s.service_auto ? `Service: ${s.service_auto}` : null,
          s.km_la_interventie ? `${s.km_la_interventie.toLocaleString('ro-RO')} km` : null,
          s.descriere || null,
        ].filter(Boolean).join(' · '),
        tags: [
          s.cost ? `${parseFloat(s.cost).toLocaleString('ro-RO')} ${s.moneda || 'RON'}` : null,
          s.urmator_km ? `Următor: ${s.urmator_km.toLocaleString('ro-RO')} km` : null,
          s.urmator_data ? `Următor: ${formatData(s.urmator_data)}` : null,
          s.servicii_documente?.length ? `📎 ${s.servicii_documente.length} doc.` : null,
        ].filter(Boolean),
        badge: s.tip !== 'Altele' ? s.tip : null,
        badgeCls: 'badge-blue',
      });
    });

    // Sortează cronologic descrescător
    return events.sort((a, b) => new Date(b.data) - new Date(a.data));
  }, [selectedMasinaId, masina, documente, servicii]);

  // Statistici
  const stats = useMemo(() => {
    if (!masina) return null;
    const totalCost = servicii?.reduce((sum, s) => sum + (parseFloat(s.cost) || 0), 0) || 0;
    const rcaDoc = documente?.filter(d => d.tip === 'RCA').sort((a, b) => new Date(b.data_expirare) - new Date(a.data_expirare))[0];
    const itpDoc = documente?.filter(d => d.tip === 'ITP').sort((a, b) => new Date(b.data_expirare) - new Date(a.data_expirare))[0];
    return { totalCost, rcaDoc, itpDoc, nrService: servicii?.length || 0, nrDoc: documente?.length || 0 };
  }, [masina, documente, servicii]);

  const handlePrint = () => window.print();

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { padding: 0 !important; }
          body { background: white !important; }
        }
      `}</style>

      {/* TOPBAR */}
      <div className="topbar no-print" style={{ marginTop:-20, marginLeft:-24, marginRight:-24, paddingLeft:24, marginBottom:20, position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <select className="filter-select" style={{ minWidth: 280, fontSize: 13, padding: '7px 12px' }}
            value={selectedMasinaId} onChange={e => setSelectedMasinaId(e.target.value)}>
            <option value="">— Selectează mașina —</option>
            {masini?.map(m => (
              <option key={m.id} value={m.id}>
                {m.nr_inmatriculare} — {m.marca} {m.model} {m.an_fabricatie || ''}
              </option>
            ))}
          </select>
        </div>
        {masina && (
          <button className="btn" onClick={handlePrint}>
            <i className="ti ti-printer" /> Export PDF
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {!selectedMasinaId && (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'#888780' }}>
          <i className="ti ti-history" style={{ fontSize:48, display:'block', marginBottom:16, color:'#C8C6BE' }} />
          <div style={{ fontSize:16, fontWeight:500, color:'#5F5E5A', marginBottom:6 }}>Selectează o mașină</div>
          <div style={{ fontSize:13 }}>Alege o mașină din lista de sus pentru a vedea istoricul complet.</div>
        </div>
      )}

      {/* CONTENT */}
      {masina && (
        <div ref={printRef} className="print-area">

          {/* HEADER MAȘINĂ */}
          <div style={{ background:'white', border:'0.5px solid #E8E6E0', borderRadius:12, padding:'20px 24px', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:20, fontWeight:500, marginBottom:4 }}>
                  {masina.marca} {masina.model}
                  {masina.an_fabricatie && <span style={{ fontSize:15, color:'#888780', fontWeight:400 }}> · {masina.an_fabricatie}</span>}
                </div>
                <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
                  <span className="plate" style={{ fontSize:14 }}>{masina.nr_inmatriculare}</span>
                  {masina.vin && <span style={{ fontSize:12, color:'#888780', fontFamily:'Courier New' }}>VIN: {masina.vin}</span>}
                  {masina.locatii?.nume && <span className="badge badge-blue">{masina.locatii.nume}</span>}
                  <span className={`badge ${masina.status === 'activa' ? 'badge-green' : 'badge-gray'}`}>
                    {masina.status === 'activa' ? 'Activă' : masina.status === 'service' ? 'În service' : 'Arhivată'}
                  </span>
                </div>
                {masina.profiles && (
                  <div style={{ fontSize:12, color:'#888780', marginTop:8 }}>
                    <i className="ti ti-user" style={{ marginRight:4 }} />
                    Șofer: {masina.profiles.full_name}
                  </div>
                )}
              </div>
              <div style={{ fontSize:11, color:'#888780', textAlign:'right' }}>
                <div>Adăugată</div>
                <div style={{ fontWeight:500, color:'#1a1a18' }}>{formatData(masina.created_at)}</div>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
            <StatCard icon="ti-tool" label="Intervenții service" value={stats.nrService} color="#185FA5" bg="#E6F1FB" />
            <StatCard icon="ti-file-certificate" label="Documente" value={stats.nrDoc} color="#3B6D11" bg="#EAF3DE" />
            <StatCard
              icon="ti-coin" label="Cost total service"
              value={`${stats.totalCost.toLocaleString('ro-RO')} RON`}
              color="#854F0B" bg="#FAEEDA"
            />
            <StatCard
              icon="ti-shield-check" label="RCA expiră"
              value={stats.rcaDoc ? formatData(stats.rcaDoc.data_expirare) : 'Nesetat'}
              color={stats.rcaDoc && zileRamase(stats.rcaDoc.data_expirare) <= 30 ? '#A32D2D' : '#3B6D11'}
              bg={stats.rcaDoc && zileRamase(stats.rcaDoc.data_expirare) <= 30 ? '#FCEBEB' : '#EAF3DE'}
            />
          </div>

          {/* TIMELINE */}
          <div style={{ background:'white', border:'0.5px solid #E8E6E0', borderRadius:12, padding:'20px 24px' }}>
            <div style={{ fontSize:14, fontWeight:500, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
              <i className="ti ti-history" style={{ color:'#185FA5' }} />
              Istoric cronologic
              <span style={{ fontSize:12, color:'#888780', fontWeight:400 }}>({timeline.length} evenimente)</span>
            </div>

            {timeline.length === 0 && (
              <div style={{ textAlign:'center', color:'#888780', fontSize:13, padding:'20px 0' }}>
                Niciun eveniment înregistrat.
              </div>
            )}

            {timeline.map((event, i) => (
              <TimelineEvent key={i} event={event} isLast={i === timeline.length - 1} />
            ))}
          </div>

        </div>
      )}
    </>
  );
}

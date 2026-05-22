import React from 'react';
import { locatii, masini } from '../../data/demo';

const locColors = [
  { bg: '#E6F1FB', color: '#185FA5', iconBg: '#E6F1FB' },
  { bg: '#EAF3DE', color: '#3B6D11', iconBg: '#EAF3DE' },
  { bg: '#FAEEDA', color: '#854F0B', iconBg: '#FAEEDA' },
  { bg: '#FBEAF0', color: '#993556', iconBg: '#FBEAF0' },
];

export default function Locatii() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary"><i className="ti ti-plus" /> Adaugă locație</button>
      </div>

      <div className="loc-grid">
        {locatii.map((loc, i) => {
          const c = locColors[i % locColors.length];
          const nrMasini = masini.filter(m => m.locatie_id === loc.id).length;
          return (
            <div className="loc-card" key={loc.id}>
              <div className="loc-card-icon" style={{ background: c.bg }}>
                <i className="ti ti-building" style={{ color: c.color }} />
              </div>
              <div className="loc-card-name">{loc.nume}</div>
              <div className="loc-card-tip">{loc.tip}</div>
              <div className="loc-card-adresa">{loc.adresa}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="badge badge-blue">{nrMasini} mașini</span>
                <span className="badge badge-gray">{loc.manageri} manageri</span>
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
                <button className="btn btn-sm"><i className="ti ti-edit" /> Editează</button>
                <button className="btn btn-sm"><i className="ti ti-eye" /> Detalii</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

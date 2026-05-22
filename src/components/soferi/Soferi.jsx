import React from 'react';
import { soferi, masini, locatii } from '../../data/demo';

const avatarColors = {
  blue: 'avatar-blue',
  green: 'avatar-green',
  amber: 'avatar-amber',
  pink: 'avatar-pink',
};

export default function Soferi() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary"><i className="ti ti-plus" /> Adaugă șofer</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Șofer</th>
                <th>Locație</th>
                <th>Telefon</th>
                <th>Mașină atribuită</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {soferi.map(s => {
                const loc = locatii.find(l => l.id === s.locatie_id);
                const masina = masini.find(m => m.id === s.masina_id);
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className={`avatar ${avatarColors[s.culoare] || 'avatar-blue'}`}>
                          {s.initiale}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{s.nume}</div>
                          <div style={{ fontSize: 11, color: '#888780' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="loc-label">
                        <i className="ti ti-map-pin" />{loc?.nume}
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{s.telefon}</td>
                    <td>
                      {masina
                        ? <span className="plate">{masina.nr_inmatriculare}</span>
                        : <span style={{ fontSize: 12, color: '#B4B2A9' }}>Neatribuit</span>
                      }
                    </td>
                    <td><span className="badge badge-green">Activ</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <button className="btn-icon" title="Editează"><i className="ti ti-edit" /></button>
                        <button className="btn-icon" title="Dezactivează"><i className="ti ti-user-off" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

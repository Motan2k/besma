import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/': 'Dashboard', '/masini': 'Mașini',
  '/documente': 'Documente & Expirări', '/service': 'Istoric Service',
  '/locatii': 'Locații', '/soferi': 'Șoferi', '/setari': 'Setări',
};

export default function AppLayout() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const title = pageTitles[location.pathname] || 'BesmaTracking';
  const azi = new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const initiale = (profile?.full_name || user?.email || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div className="page-title">{title}</div>
          <div className="topbar-right">
            <span style={{ fontSize: 12, color: '#888780', textTransform: 'capitalize' }}>{azi}</span>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#185FA5' }}>
              {initiale}
            </div>
          </div>
        </div>
        <div className="content"><Outlet /></div>
      </div>
    </div>
  );
}

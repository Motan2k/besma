import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navMain = [
  { to: '/', icon: 'ti-layout-dashboard', label: 'Dashboard', end: true },
  { to: '/masini', icon: 'ti-car', label: 'Mașini' },
  { to: '/documente', icon: 'ti-file-certificate', label: 'Documente' },
  { to: '/service', icon: 'ti-tool', label: 'Service' },
];
const navOrg = [
  { to: '/locatii', icon: 'ti-map-pin', label: 'Locații' },
  { to: '/soferi', icon: 'ti-users', label: 'Șoferi' },
];
const navAdmin = [
  { to: '/setari', icon: 'ti-settings', label: 'Setări' },
];

export default function Sidebar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const roleLabel = { super_admin: 'Super Admin', manager: 'Manager', driver: 'Șofer' };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"><i className="ti ti-car" /></div>
        <div className="logo-name">BesmaTracking</div>
        <div className="logo-sub">Management flotă auto</div>
      </div>

      <nav className="nav">
        {navMain.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <i className={`ti ${item.icon}`} />{item.label}
          </NavLink>
        ))}
        <div className="nav-section">Organizare</div>
        {navOrg.map(item => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <i className={`ti ${item.icon}`} />{item.label}
          </NavLink>
        ))}
        {profile?.role === 'super_admin' && (
          <>
            <div className="nav-section">Admin</div>
            {navAdmin.map(item => (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <i className={`ti ${item.icon}`} />{item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 500 }}>
              {profile?.full_name || user?.email}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
              {roleLabel[profile?.role] || ''}
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 18, padding: 4, borderRadius: 6, display: 'flex' }}
            title="Logout">
            <i className="ti ti-logout" />
          </button>
        </div>
      </div>
    </aside>
  );
}

import React from 'react';

function Placeholder({ icon, titlu, desc }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#888780', textAlign: 'center' }}>
      <i className={`ti ${icon}`} style={{ fontSize: 48, marginBottom: 16, color: '#C8C6BE' }} />
      <div style={{ fontSize: 16, fontWeight: 500, color: '#5F5E5A', marginBottom: 6 }}>{titlu}</div>
      <div style={{ fontSize: 13 }}>{desc}</div>
    </div>
  );
}

export function Notificari() {
  return <Placeholder icon="ti-bell" titlu="Notificări" desc="Configurarea alertelor email va fi disponibilă după conectarea Supabase." />;
}

export function Setari() {
  return <Placeholder icon="ti-settings" titlu="Setări" desc="Setările aplicației vor fi disponibile după conectarea Supabase." />;
}

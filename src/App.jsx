import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import { Masini } from './components/masini/Masini';
import Documente from './components/documente/Documente';
import { Service } from './components/service/index.jsx';
import { Locatii, Soferi } from './components/locatii/index.jsx';
import AutoID from './components/autoid/AutoID';
//import Istoric from './components/istoric/Istoric';


function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#888780', fontSize:13, gap:8 }}>
      <i className="ti ti-loader-2" style={{ animation:'spin 1s linear infinite' }} /> Se încarcă...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function Setari() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, color:'#888780', textAlign:'center' }}>
      <i className="ti ti-settings" style={{ fontSize:48, marginBottom:16, color:'#C8C6BE' }} />
      <div style={{ fontSize:16, fontWeight:500, color:'#5F5E5A', marginBottom:6 }}>Setări</div>
      <div style={{ fontSize:13 }}>Invitați utilizatori din Supabase Dashboard → Authentication → Users</div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="masini" element={<Masini />} />
        <Route path="documente" element={<Documente />} />
        <Route path="service" element={<Service />} />
        <Route path="locatii" element={<Locatii />} />
        <Route path="soferi" element={<Soferi />} />
        <Route path="setari" element={<Setari />} />
	    <Route path="autoid" element={<AutoID />} />
	   // <Route path="istoric" element={<Istoric />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

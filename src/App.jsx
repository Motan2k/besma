import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import Masini from './components/masini/Masini';
import Documente from './components/documente/Documente';
import Service from './components/service/Service';
import Locatii from './components/locatii/Locatii';
import Soferi from './components/soferi/Soferi';
import { Notificari, Setari } from './components/Placeholders';
import './index.css';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return children;
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
        <Route path="notificari" element={<Notificari />} />
        <Route path="setari" element={<Setari />} />
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

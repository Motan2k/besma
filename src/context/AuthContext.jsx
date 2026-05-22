import React, { createContext, useContext, useState } from 'react';

// Demo users
const DEMO_USERS = [
  { id: 1, email: 'admin@fleetro.ro', parola: 'admin123', role: 'super_admin', nume: 'Admin FleetRO', locatie_id: null },
  { id: 2, email: 'manager@fleetro.ro', parola: 'manager123', role: 'manager', nume: 'Mihai Manager', locatie_id: 1 },
  { id: 3, email: 'sofer@fleetro.ro', parola: 'sofer123', role: 'driver', nume: 'Ion Popescu', locatie_id: 1 },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (email, parola) => {
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600)); // simulează request
    const found = DEMO_USERS.find(u => u.email === email && u.parola === parola);
    if (found) {
      const { parola: _, ...safeUser } = found;
      setUser(safeUser);
      setLoading(false);
      return true;
    } else {
      setError('Email sau parolă incorectă.');
      setLoading(false);
      return false;
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

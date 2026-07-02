import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminCards from './pages/AdminCards';
import AdminUsers from './pages/AdminUsers';
import { AuthProvider } from './AuthContext';

const RedirectExternal: React.FC = () => {
  useEffect(() => {
    window.location.replace('https://agri-record.vercel.app/');
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <p>Redirecting to Agri Record...</p>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminCards />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="*" element={<RedirectExternal />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

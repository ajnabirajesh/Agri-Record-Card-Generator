import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminCards from './pages/AdminCards';
import AdminUsers from './pages/AdminUsers';
import VersionSelector from './pages/VersionSelector';
import { AuthProvider } from './AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<VersionSelector />} />
          <Route path="/admin" element={<AdminCards />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="*" element={<VersionSelector />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

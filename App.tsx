import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import RefundPolicy from './pages/RefundPolicy';
import MyCards from './pages/MyCards';
import AdminCards from './pages/AdminCards';
import AdminUsers from './pages/AdminUsers';
import { AuthProvider } from './AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/my-cards" element={<MyCards />} />
          <Route path="/admin" element={<AdminCards />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

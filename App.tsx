import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import RefundPolicy from './pages/RefundPolicy';
import Disclaimer from './pages/Disclaimer';
import MyCards from './pages/MyCards';
import AdminCards from './pages/AdminCards';
import AdminUsers from './pages/AdminUsers';
import { AuthProvider } from './AuthContext';
import WhatsAppButton from './components/WhatsAppButton';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="bg-amber-50 text-amber-800 text-xs md:text-sm font-bold text-center px-4 py-2 border-b border-amber-200 no-print flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
        <span className="text-amber-600">⚠️ Disclaimer:</span> This website is a private design and document generation platform. It is not affiliated with any Government Department.
      </div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/my-cards" element={<MyCards />} />
          <Route path="/admin" element={<AdminCards />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Routes>
        <WhatsAppButton />
      </Router>
    </AuthProvider>
  );
};

export default App;

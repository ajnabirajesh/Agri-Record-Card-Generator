import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-semibold mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when using the Agri Record Management System. This includes personal details such as name, contact information, and agricultural land details necessary for generating the Farmer ID card.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            The information collected is strictly used for the purpose of generating your Farmer ID card and processing payments. We do not sell, rent, or share your personal information with third parties for marketing purposes.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">4. Payment Information</h2>
          <p>
            All payment transactions are processed securely through Razorpay. We do not store your credit card details or sensitive payment information on our servers.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">5. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at ajnabicreation@gamil.com.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

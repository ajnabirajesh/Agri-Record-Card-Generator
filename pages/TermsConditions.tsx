import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-semibold mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-6">Terms & Conditions</h1>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Agri Record Management System, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you may not use our service.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. Description of Service</h2>
          <p>
            We provide a platform to generate professional Farmer ID cards (Agri Records) with QR codes and land details. This service is provided "as is" and is intended for informational and record-keeping purposes.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. User Responsibilities</h2>
          <p>
            You are responsible for providing accurate and truthful information when generating an ID card. You agree not to use the service for any illegal or unauthorized purpose, including generating fraudulent identification documents.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">4. Payment and Fees</h2>
          <p>
            The generation of a Farmer ID card requires a non-refundable fee of ₹21 (INR). Payments are processed securely via Razorpay. By initiating a payment, you authorize us to charge the specified amount.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">5. Intellectual Property</h2>
          <p>
            All content, design, and functionality of the Agri Record Management System are the exclusive property of Ajnabi Creation. You may not copy, modify, or distribute our intellectual property without prior written consent.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">6. Limitation of Liability</h2>
          <p>
            Ajnabi Creation shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our service, or from any information obtained through the service.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">7. Governing Law</h2>
          <p>
            These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in Bihar, India.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">8. Contact Information</h2>
          <p>
            If you have any questions about these Terms & Conditions, please contact us at ajnabicreation@gamil.com.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;

import React from 'react';
import { FileText } from 'lucide-react';
import PageModalLayout from '../components/PageModalLayout';

const TermsConditions: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return (
    <PageModalLayout 
      icon={<FileText className="w-6 h-6" />}
      title="Terms & Conditions / नियम व शर्तें"
      onClose={onClose}
    >
      <div className="space-y-6 text-sm md:text-base text-slate-600 font-medium">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          LAST UPDATED: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        
        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Agri Record Management System, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you may not use our service.
          </p>
        </div>

        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">2. Description of Service</h2>
          <p>
            We provide a platform to generate professional Farmer ID cards (Agri Records) with QR codes and land details. This service is provided "as is" and is intended for informational and record-keeping purposes.
          </p>
        </div>

        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">3. User Responsibilities</h2>
          <p>
            You are responsible for providing accurate and truthful information when generating an ID card. You agree not to use the service for any illegal or unauthorized purpose, including generating fraudulent identification documents.
          </p>
        </div>

        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">4. Payment and Fees</h2>
          <p>
            The generation of a Farmer ID card requires a non-refundable fee of ₹15 (INR). Payments are processed securely via Razorpay. By initiating a payment, you authorize us to charge the specified amount.
          </p>
        </div>

        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">5. Limitation of Liability</h2>
          <p>
            Ajnabi Creation shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our service.
          </p>
        </div>

        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">6. Governing Law</h2>
          <p>
            These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in Bihar, India.
          </p>
        </div>
      </div>
    </PageModalLayout>
  );
};

export default TermsConditions;

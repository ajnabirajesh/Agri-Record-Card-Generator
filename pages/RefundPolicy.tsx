import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-semibold mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-6">Refund & Cancellation Policy</h1>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Digital Product Delivery</h2>
          <p>
            The Agri Record Management System provides a digital service (Farmer ID Card Generation). Upon successful payment of ₹21, the digital card is immediately generated and made available for download and printing.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. No Refund Policy</h2>
          <p>
            Due to the immediate and digital nature of our service, <strong>all sales are final and non-refundable</strong>. Once a payment is processed and the ID card is generated, we cannot issue a refund.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. Exceptions</h2>
          <p>
            Refunds will only be considered under the following exceptional circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Duplicate Payment:</strong> If you were charged multiple times for a single transaction due to a technical error.</li>
            <li><strong>Service Failure:</strong> If your payment was successful but the system failed to generate the ID card, and our support team is unable to resolve the issue within 48 hours.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">4. Requesting a Refund</h2>
          <p>
            If you believe you are eligible for a refund based on the exceptions above, please contact our support team within 7 days of the transaction.
          </p>
          <p>
            To request a refund, email us at <strong>ajnabicreation@gamil.com</strong> with the following details:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your full name and contact number</li>
            <li>Date of transaction</li>
            <li>Razorpay Payment ID or Order ID</li>
            <li>A brief explanation of the issue</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">5. Refund Processing</h2>
          <p>
            Approved refunds will be processed within 5-7 business days and credited back to the original method of payment.
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">6. Cancellations</h2>
          <p>
            As the service is delivered instantly upon payment, cancellations are not applicable once the payment has been successfully processed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;

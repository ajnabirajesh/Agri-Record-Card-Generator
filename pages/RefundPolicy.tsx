import React from 'react';
import { Banknote } from 'lucide-react';
import PageModalLayout from '../components/PageModalLayout';

const RefundPolicy: React.FC = () => {
  return (
    <PageModalLayout 
      icon={<Banknote className="w-6 h-6" />}
      title="Refund Policy / धनवापसी नीति"
    >
      <div className="space-y-6 text-sm md:text-base text-slate-600 font-medium">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          LAST UPDATED: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        
        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">1. Digital Product Delivery</h2>
          <p>
            The Agri Record Management System provides a digital service. Upon successful payment, the digital card is immediately generated and made available for download and printing.
          </p>
        </div>

        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">2. No Refund Policy</h2>
          <p>
            Due to the immediate and digital nature of our service, <strong>all sales are final and non-refundable</strong>. Once a payment is processed and the ID card is generated, we cannot issue a refund.
          </p>
        </div>

        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">3. Exceptions</h2>
          <p>
            Refunds will only be considered under the following exceptional circumstances:
          </p>
          <ul className="list-disc list-outside ml-4 mt-2 space-y-1">
            <li><strong>Duplicate Payment:</strong> If you were charged multiple times for a single transaction due to a technical error.</li>
            <li><strong>Service Failure:</strong> If your payment was successful but the system failed to generate the ID card, and our support team is unable to resolve the issue within 48 hours.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">4. Requesting a Refund</h2>
          <p>
            If you believe you are eligible for a refund, email us at <strong className="text-emerald-700">ajnabicreation@gmail.com</strong> with:
          </p>
          <ul className="list-disc list-outside ml-4 mt-2 space-y-1">
            <li>Your full name and contact number</li>
            <li>Date of transaction & Payment ID</li>
            <li>A brief explanation of the issue</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">5. Refund Processing & Cancellations</h2>
          <p>
            Approved refunds will be processed within 5-7 business days to the original payment method. As the service is instant, cancellations are not applicable post-payment.
          </p>
        </div>
      </div>
    </PageModalLayout>
  );
};

export default RefundPolicy;

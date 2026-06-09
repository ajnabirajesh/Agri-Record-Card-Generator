import React from 'react';
import { ShieldCheck } from 'lucide-react';
import PageModalLayout from '../components/PageModalLayout';

const PrivacyPolicy: React.FC = () => {
  return (
    <PageModalLayout 
      icon={<ShieldCheck className="w-6 h-6" />}
      title="Privacy Policy / गोपनीयता नीति"
    >
      <div className="space-y-6 text-sm md:text-base text-slate-600 font-medium">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          LAST UPDATED: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        
        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when using the Agri Record Management System. This includes personal details such as name, contact information, and agricultural land details necessary for generating the Farmer ID card.
          </p>
        </div>

        <div>
           <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">2. How We Use Your Information</h2>
           <p>
             The information collected is strictly used for the purpose of generating your Farmer ID card and processing payments. We do not sell, rent, or share your personal information with third parties for marketing purposes.
           </p>
        </div>

        <div>
           <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">3. Data Security</h2>
           <p>
             We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
           </p>
        </div>

        <div>
           <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">4. Payment Information</h2>
           <p>
             All payment transactions are processed securely through Razorpay. We do not store your credit card details or sensitive payment information on our servers.
           </p>
        </div>

        <div>
           <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 uppercase tracking-wide">5. Contact Us</h2>
           <p>
             If you have any questions about this Privacy Policy, please contact us at <a href="mailto:ajnabicreation@gmail.com" className="text-emerald-600 hover:underline">ajnabicreation@gmail.com</a>.
           </p>
        </div>
      </div>
    </PageModalLayout>
  );
};

export default PrivacyPolicy;

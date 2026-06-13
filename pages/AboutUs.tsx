import React from 'react';
import { HelpCircle } from 'lucide-react';
import PageModalLayout from '../components/PageModalLayout';

const AboutUs: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return (
    <PageModalLayout 
      icon={<HelpCircle className="w-6 h-6" />}
      title="About Our Platform / हमारे बारे में"
      onClose={onClose}
    >
      <div className="text-sm md:text-base leading-relaxed text-slate-600 font-medium space-y-6">
        <p>
          <strong>Agri Record Management System</strong> is an innovative, dedicated digital formatting service engineered specifically for Indian farmers. We believe that physical documentation should be highly durable, digitally secure, and easy to carry.
        </p>
        
        <div className="border-l-4 border-emerald-500 bg-emerald-50 p-4 text-emerald-800 italic rounded-r-lg font-medium">
          "हमारा लक्ष्य देश के हर किसान को एक आधुनिक, सुरक्षित और आसानी से सत्यापन योग्य डिजिटल पहचान पत्र प्रदान करना है।"
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="border border-slate-100 rounded-2xl p-6 bg-white shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm md:text-base mb-4 uppercase tracking-wide">
              Key Objectives <span className="text-emerald-600">/ मुख्य उद्देश्य</span>
            </h3>
            <ul className="space-y-2 text-xs md:text-sm text-slate-600 list-disc list-outside ml-4">
              <li>Generate high-fidelity pocket identity cards.</li>
              <li>Secure QR codes for quick instant verification.</li>
              <li>Visual management of verified land and record details.</li>
              <li>Local-first security ensuring full data privacy.</li>
            </ul>
          </div>
          
          <div className="border border-slate-100 rounded-2xl p-6 bg-white shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm md:text-base mb-4 uppercase tracking-wide">
              Technology Stack <span className="text-emerald-600">/ तकनीकी संरचना</span>
            </h3>
            <p className="text-xs md:text-sm leading-relaxed text-slate-600">
              Designed with high performance and zero external exposure. Your personal details, photos, and official documents are processed directly in your local session, securing your identity from leaks.
            </p>
          </div>
        </div>
      </div>
    </PageModalLayout>
  );
};

export default AboutUs;

import React from 'react';
import { Mail, Phone, MapPin, Contact } from 'lucide-react';
import PageModalLayout from '../components/PageModalLayout';

const ContactUs: React.FC = () => {
  return (
    <PageModalLayout 
      icon={<Contact className="w-6 h-6" />}
      title="Contact Us / संपर्क करें"
    >
      <div className="space-y-6 text-sm md:text-base text-slate-600 font-medium">
        <p>
          We're here to help! If you have any questions, concerns, or feedback, please don't hesitate to reach out to us using the contact information below.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm flex items-start gap-4">
            <div className="bg-emerald-100 p-3 rounded-full shrink-0">
              <Mail className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-1">Email Address</h3>
              <p className="text-emerald-700 font-bold">ajnabicreation@gmail.com</p>
              <p className="text-xs text-slate-500 mt-1">Response within 24 hours.</p>
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm flex items-start gap-4">
            <div className="bg-emerald-100 p-3 rounded-full shrink-0">
              <Phone className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-1">Phone Number</h3>
              <p className="text-emerald-700 font-bold">+91 70702 00199</p>
              <p className="text-xs text-slate-500 mt-1">Mon-Fri, 10:00 AM - 6:00 PM IST.</p>
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm flex items-start gap-4 md:col-span-2">
            <div className="bg-emerald-100 p-3 rounded-full shrink-0">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-1">Office Address</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Ajnabi Creation<br/>
                Supaul, Bihar, India<br/>
                PIN: 852131
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageModalLayout>
  );
};

export default ContactUs;

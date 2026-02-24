import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

const ContactUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-semibold mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-6">Contact Us</h1>
        
        <div className="space-y-8 text-slate-600 leading-relaxed">
          <p>
            We're here to help! If you have any questions, concerns, or feedback, please don't hesitate to reach out to us using the contact information below.
          </p>
          
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-200/50 p-3 rounded-full shrink-0">
                <Mail className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Email Address</h3>
                <p className="text-emerald-800 font-medium">ajnabicreation@gmail.com</p>
                <p className="text-sm text-slate-500 mt-1">We aim to respond to all emails within 24 hours.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-emerald-200/50 p-3 rounded-full shrink-0">
                <Phone className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Phone Number</h3>
                <p className="text-emerald-800 font-medium">+91 70702 00199</p>
                <p className="text-sm text-slate-500 mt-1">Available Monday to Friday, 10:00 AM - 6:00 PM IST.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-emerald-200/50 p-3 rounded-full shrink-0">
                <MapPin className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Office Address</h3>
                <p className="text-emerald-800 font-medium">
                  Ajnabi Creation<br/>
                  Supaul, Bihar, India<br/>
                  PIN: 852131
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

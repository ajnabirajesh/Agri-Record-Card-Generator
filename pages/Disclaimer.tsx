import React from 'react';
import { ShieldAlert } from 'lucide-react';
import PageModalLayout from '../components/PageModalLayout';

const Disclaimer: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return (
    <PageModalLayout 
      icon={<ShieldAlert className="w-6 h-6" />}
      title="Disclaimer / अस्वीकरण"
      onClose={onClose}
    >
      <div className="space-y-6 text-sm md:text-base text-slate-600 font-medium">
        <p>
          <strong>Agri Record</strong> is an independent private platform and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with any Government Department, Government Agency, or Government Organization.
        </p>

        <p>
          Any names, references, or information provided on this platform are used solely for informational, educational, or document-generation purposes. Users are solely responsible for the accuracy and legality of the information they provide.
        </p>

        <p>
          This website does not issue any government-approved certificate, identity card, license, registration document, or official government record. Any document generated through this platform is for personal, informational, design, or record-keeping purposes only.
        </p>

        <p>
          By using this website, users acknowledge and agree that <strong>Agri Record</strong> is a private service platform and not an official government portal.
        </p>
      </div>
    </PageModalLayout>
  );
};

export default Disclaimer;

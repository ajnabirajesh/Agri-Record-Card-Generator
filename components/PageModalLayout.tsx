import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

interface PageModalLayoutProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const PageModalLayout: React.FC<PageModalLayoutProps> = ({ icon, title, subtitle = "AGRI RECORD MANAGEMENT SYSTEM", children }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 selection:bg-emerald-100 selection:text-emerald-900 font-sans relative">
      {/* Background elements just to make it feel like an overlay over the app */}
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-64 bg-emerald-800/20"></div>
      </div>

      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        
        {/* Header content */}
        <div className="p-6 md:p-8 flex items-start justify-between relative">
          <div className="flex gap-4">
             {icon && (
               <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                 {icon}
               </div>
             )}
             <div>
               <h2 className="text-xl md:text-2xl font-black text-slate-800">{title}</h2>
               <p className="text-xs md:text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">{subtitle}</p>
             </div>
          </div>
          
          <button 
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors absolute top-6 right-6"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Separator */}
        <div className="h-px bg-slate-100 w-[calc(100%-4rem)] mx-auto"></div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 text-slate-600 space-y-6">
          {children}
        </div>

        {/* Separator */}
        <div className="h-px bg-slate-100 w-[calc(100%-4rem)] mx-auto"></div>

        {/* Footer */}
        <div className="p-6 md:p-8 flex items-center justify-between mt-auto">
          <div className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-wider">
            © {new Date().getFullYear()} AGRI RECORD SYSTEM
          </div>
          
          <button 
            onClick={() => navigate('/')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs md:text-sm font-bold py-2.5 px-6 rounded-full transition-colors"
          >
            CLOSE / बंद करें
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default PageModalLayout;


import React, { useState } from 'react';
import { FarmerData, INITIAL_FARMER_DATA } from './types';
import FarmerForm from './components/FarmerForm';
import CardPreview from './components/CardPreview';
import { Printer, Download, Leaf, FileText, Info, Loader2, CheckCircle2, Youtube, Heart } from 'lucide-react';

const App: React.FC = () => {
  const [farmerData, setFarmerData] = useState<FarmerData>(INITIAL_FARMER_DATA);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAsPDF = () => {
    // Relying on native browser print for the 'Save' button as well
    // This opens the system print dialog which allows "Save as PDF" reliably.
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Header */}
      <header className="no-print sticky top-0 z-50 bg-[#064e3b] text-white shadow-2xl border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 h-14 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 group cursor-default">
            <div className="bg-white p-1 rounded-lg md:rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300 shrink-0">
                <Leaf className="w-4 h-4 md:w-8 h-8 text-[#064e3b]" />
            </div>
            <div className="overflow-hidden">
                <h1 className="text-sm md:text-2xl font-black italic tracking-tight leading-none">
                    Agri<span className="text-[#cddc39]">record</span>
                </h1>
                <p className="hidden sm:block text-[8px] md:text-xs tracking-widest uppercase font-bold text-emerald-300/80 mt-1 truncate">Farmer Card Generator Pro</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-3">
             <a 
                href="https://youtube.com/@ajnabihelps" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Support"
                className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600 text-white font-bold p-1.5 md:px-4 md:py-3 rounded-lg md:rounded-xl transition-all border border-red-600/30 active:scale-95"
             >
               <Youtube className="w-3.5 h-3.5 md:w-4 h-4" />
               <span className="hidden lg:inline text-xs uppercase tracking-wider">Support</span>
             </a>

             <button 
                onClick={handlePrint}
                title="Print"
                className="group flex items-center gap-2 bg-emerald-700/50 hover:bg-emerald-700 text-white font-bold p-1.5 md:px-4 md:py-3 rounded-lg md:rounded-xl transition-all border border-emerald-600 active:scale-95"
             >
               <Printer className="w-3.5 h-3.5 md:w-4 h-4" />
               <span className="hidden md:inline text-xs uppercase tracking-wider">Print</span>
             </button>

             <button 
                onClick={handleSaveAsPDF}
                className="group flex items-center gap-2 bg-[#cddc39] hover:bg-[#dce775] text-[#064e3b] font-extrabold px-2.5 py-1.5 md:px-6 md:py-3 rounded-lg md:rounded-xl transition-all shadow-xl shadow-emerald-950/20 active:scale-95"
             >
               <Download className="w-3.5 h-3.5 md:w-5 h-5 group-hover:-translate-y-1 transition-transform" />
               <span className="text-[9px] md:text-base uppercase tracking-tight md:tracking-normal font-black">
                 SAVE
               </span>
             </button>
          </div>
        </div>
      </header>

      {/* Main UI */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        
        {/* Live Preview */}
        <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col">
            <div className="no-print flex items-center justify-between mb-4 md:mb-8 bg-white/50 p-3 rounded-2xl border border-slate-100 md:bg-transparent md:p-0 md:border-none">
                <h2 className="text-lg md:text-2xl font-black text-slate-800 flex items-center gap-2 md:gap-3">
                    <CheckCircle2 className="w-4 h-4 md:w-6 h-6 text-[#8bc34a]" /> Preview
                </h2>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Live Syncing</span>
                </div>
            </div>
            
            <div id="preview-area" className="flex-1 w-full min-h-0">
                <CardPreview data={farmerData} />
            </div>

            <div className="no-print mt-12 p-10 bg-[#064e3b] rounded-[40px] shadow-2xl relative overflow-hidden group text-center">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:rotate-45 transition-transform duration-1000">
                    <Leaf className="w-64 h-64" />
                </div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md mb-6 border border-white/20">
                        <Printer className="w-10 h-10 text-[#cddc39]" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Print / Save Farmer ID</h3>
                    <p className="text-emerald-100/70 max-w-md text-sm leading-relaxed mb-8">
                        Click Save to open the print dialog. Select <b>"Save as PDF"</b> to download your high-quality card.
                    </p>
                    <button 
                        onClick={handleSaveAsPDF}
                        className="bg-[#cddc39] text-[#064e3b] px-12 py-4 rounded-2xl font-black text-lg hover:bg-white transition-all shadow-2xl shadow-black/40 flex items-center gap-3 active:scale-95 w-full md:w-auto justify-center"
                    >
                        <Download className="w-5 h-5" />
                        SAVE / DOWNLOAD
                    </button>
                </div>
            </div>
        </div>

        {/* Editor Sidebar */}
        <div className="no-print lg:col-span-5 order-2 lg:order-1">
          <div className="sticky top-28 space-y-6">
            <div className="hidden md:flex bg-emerald-50 border border-emerald-100 p-5 rounded-2xl gap-4 text-emerald-800 shadow-sm">
                <div className="bg-emerald-200/50 p-2 rounded-full h-fit">
                    <Info className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                    <h4 className="font-bold text-sm mb-1">How it works</h4>
                    <p className="text-xs leading-relaxed opacity-80">
                        Fill in the details. Use the "Scan Old Card" feature to auto-fill details using AI.
                    </p>
                </div>
            </div>

            <div className="glass-card rounded-3xl shadow-xl overflow-hidden border-2 border-emerald-50/50">
                <FarmerForm data={farmerData} onChange={setFarmerData} />
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER SECTION - RESTORED CREDITS PER REQUEST */}
      <footer className="no-print bg-white border-t py-12 md:py-20 mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <div className="flex flex-col items-center gap-10">
              <div className="space-y-2">
                <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-[0.5em] leading-relaxed">
                    © 2026 Agri Record Management System <span className="hidden md:inline mx-3 text-slate-200">|</span> Digital India
                </p>
              </div>

              <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-400">CRAFTED WITH</span>
                    <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-400">BY</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <a 
                      href="https://instagram.com/ajnabicreation" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-6 py-3 bg-emerald-50 hover:bg-[#064e3b] rounded-2xl border border-emerald-100 transition-all duration-300 shadow-sm active:scale-95"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:bg-[#cddc39]"></div>
                      <span className="text-sm font-black text-[#064e3b] group-hover:text-white">Ajnabi Creation</span>
                    </a>
                    
                    <span className="text-slate-300 font-black text-lg italic">&</span>
                    
                    <a 
                      href="https://instagram.com/ajnabirajesh" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-6 py-3 bg-slate-50 hover:bg-slate-900 rounded-2xl border border-slate-100 transition-all duration-300 shadow-sm active:scale-95"
                    >
                      <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-[#cddc39]"></div>
                      <span className="text-sm font-black text-slate-700 group-hover:text-white">Rajesh Yadav</span>
                    </a>
                  </div>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
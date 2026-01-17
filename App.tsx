
import React, { useState } from 'react';
import { FarmerData, INITIAL_FARMER_DATA } from './types';
import FarmerForm from './components/FarmerForm';
import CardPreview from './components/CardPreview';
import { Printer, Download, Leaf, FileText, Info, Loader2, CheckCircle2, Youtube } from 'lucide-react';

const App: React.FC = () => {
  const [farmerData, setFarmerData] = useState<FarmerData>(INITIAL_FARMER_DATA);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = () => {
    setIsGenerating(true);
    // Artificial delay for premium feel
    setTimeout(() => {
        setIsGenerating(false);
        window.print();
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Premium Header */}
      <header className="no-print sticky top-0 z-50 bg-[#064e3b] text-white shadow-2xl border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="bg-white p-2 rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                <Leaf className="w-8 h-8 text-[#064e3b]" />
            </div>
            <div>
                <h1 className="text-2xl font-black italic tracking-tight leading-none">
                    Agri<span className="text-[#cddc39]">record</span>
                </h1>
                <p className="text-xs tracking-widest uppercase font-bold text-emerald-300/80 mt-1">Farmer Card Generator Pro</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
             {/* Support Button */}
             <a 
                href="https://youtube.com/@ajnabihelps" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600 text-white font-bold px-3 py-2.5 md:px-4 md:py-3 rounded-xl transition-all border border-red-600/30 active:scale-95 text-xs uppercase tracking-wider"
             >
               <Youtube className="w-4 h-4" />
               <span className="hidden lg:inline">Support</span>
             </a>

             {/* Dedicated Print Button */}
             <button 
                onClick={handlePrint}
                disabled={isGenerating}
                className="group flex items-center gap-2 bg-emerald-700/50 hover:bg-emerald-700 text-white font-bold px-3 py-2.5 md:px-4 md:py-3 rounded-xl transition-all border border-emerald-600 active:scale-95 disabled:opacity-50"
             >
               <Printer className="w-4 h-4" />
               <span className="hidden md:inline text-xs uppercase tracking-wider">Print</span>
             </button>

             {/* Existing Download Button */}
             <button 
                onClick={handlePrint}
                disabled={isGenerating}
                className="group flex items-center gap-2 md:gap-3 bg-[#cddc39] hover:bg-[#dce775] text-[#064e3b] font-extrabold px-4 py-2.5 md:px-6 md:py-3 rounded-xl transition-all shadow-xl shadow-emerald-950/20 active:scale-95 disabled:opacity-50"
             >
               {isGenerating ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
               ) : (
                 <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
               )}
               <span className="hidden sm:inline text-xs md:text-base">
                 {isGenerating ? 'GENERATING...' : 'DOWNLOAD'}
               </span>
             </button>
          </div>
        </div>
      </header>

      {/* Main UI */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Editor Sidebar */}
        <div className="no-print lg:col-span-5 order-2 lg:order-1">
          <div className="sticky top-28 space-y-6">
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex gap-4 text-emerald-800 shadow-sm">
                <div className="bg-emerald-200/50 p-2 rounded-full h-fit">
                    <Info className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                    <h4 className="font-bold text-sm mb-1">Quick Instructions</h4>
                    <p className="text-xs leading-relaxed opacity-80">
                        Update the farmer's details below. Changes reflect instantly on the card preview. Use high-quality photos for the best results.
                    </p>
                </div>
            </div>

            <div className="glass-card rounded-3xl shadow-xl overflow-hidden">
                <FarmerForm data={farmerData} onChange={setFarmerData} />
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3 text-slate-500">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <div>
                        <span className="text-sm font-bold block text-slate-700">Official CR80 Format</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Standard Identity Dimensions</span>
                    </div>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-300"></div>
                </div>
            </div>
          </div>
        </div>

        {/* Live Preview & Final CTA */}
        <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col">
            <div className="no-print flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#8bc34a]" /> Final ID Card Preview
                </h2>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Live Syncing</span>
                </div>
            </div>
            
            <div id="print-area" className="flex-1 flex flex-col items-center justify-start min-h-[500px]">
                <div className="transform hover:scale-[1.02] transition-transform duration-500 ease-out">
                    <CardPreview data={farmerData} />
                </div>
            </div>

            {/* Bottom Download Card */}
            <div className="no-print mt-12 p-10 bg-[#064e3b] rounded-[40px] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:rotate-45 transition-transform duration-1000">
                    <Leaf className="w-64 h-64" />
                </div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md mb-6 border border-white/20">
                        <Printer className="w-10 h-10 text-[#cddc39]" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">Ready for Distribution?</h3>
                    <p className="text-emerald-100/70 max-w-md text-sm leading-relaxed mb-8">
                        Your professional Agri Record Farmer ID is ready. Download it as a high-resolution PDF suitable for printing on PVC or standard card stock.
                    </p>
                    <button 
                        onClick={handlePrint}
                        disabled={isGenerating}
                        className="bg-[#cddc39] text-[#064e3b] px-12 py-4 rounded-2xl font-black text-lg hover:bg-white transition-all shadow-2xl shadow-black/40 flex items-center gap-3 active:scale-95"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Download />}
                        {isGenerating ? 'PREPARING PDF...' : 'GENERATE OFFICIAL PDF'}
                    </button>
                    <div className="mt-6 flex gap-6">
                        <div className="flex items-center gap-1.5 text-xs text-white/40 font-bold uppercase tracking-widest">
                            <CheckCircle2 className="w-3 h-3" /> QR Valid
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-white/40 font-bold uppercase tracking-widest">
                            <CheckCircle2 className="w-3 h-3" /> ISO Card size
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* Print-Only Overlay */}
      <div className="hidden print-only fixed inset-0 bg-white">
        <div className="p-10 space-y-10 flex flex-col items-center justify-center min-h-screen">
          <CardPreview data={farmerData} />
        </div>
      </div>

      <footer className="no-print bg-white border-t py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <div className="flex justify-center gap-4 mb-4 opacity-20">
              <Leaf className="w-5 h-5" />
              <Leaf className="w-5 h-5" />
              <Leaf className="w-5 h-5" />
           </div>
           <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">
             © 2026 Agri Record Management System • Digital India Initiative
           </p>
           <p className="mt-2 text-[10px] text-slate-300">Powered by Ajnabi Creation & Rajesh Yadav</p>
           <div className="mt-6">
             <a 
              href="https://youtube.com/@ajnabihelps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 font-black text-[10px] uppercase tracking-widest border-b border-red-100 pb-1"
             >
               <Youtube className="w-3 h-3" /> Need Help? Visit Ajnabi Helps
             </a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;


import React, { useState } from 'react';
import { FarmerData, INITIAL_FARMER_DATA } from './types';
import FarmerForm from './components/FarmerForm';
import CardPreview from './components/CardPreview';
import { Printer, Download, Leaf, FileText, Info, Loader2, CheckCircle2, Youtube, Heart } from 'lucide-react';

const App: React.FC = () => {
  const [farmerData, setFarmerData] = useState<FarmerData>(INITIAL_FARMER_DATA);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAsPDF = async () => {
    setIsGenerating(true);
    
    // Allow a bit more time for any pending renders
    await new Promise(resolve => setTimeout(resolve, 1000));

    const element = document.getElementById('pdf-download-area');
    if (!element) {
      setIsGenerating(false);
      return;
    }

    // Configure options specifically for better rendering
    const opt = {
      margin:       [10, 10, 10, 10], // mm
      filename:     `AgriCard_${farmerData.nameEnglish.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 1.0 },
      html2canvas:  { 
        scale: 2.5, // High resolution
        useCORS: true, 
        backgroundColor: '#ffffff',
        scrollY: 0,
        scrollX: 0
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // Use the worker API for more reliable output
      // @ts-ignore
      const worker = window.html2pdf().from(element).set(opt);
      await worker.save();
    } catch (err) {
      console.error("PDF Error:", err);
      alert("There was an issue saving the PDF. Please try again or use the Print button.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Premium Header */}
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
                disabled={isGenerating}
                className="group flex items-center gap-2 bg-[#cddc39] hover:bg-[#dce775] text-[#064e3b] font-extrabold px-2.5 py-1.5 md:px-6 md:py-3 rounded-lg md:rounded-xl transition-all shadow-xl shadow-emerald-950/20 active:scale-95 disabled:opacity-50"
             >
               {isGenerating ? (
                 <Loader2 className="w-3.5 h-3.5 md:w-5 h-5 animate-spin" />
               ) : (
                 <Download className="w-3.5 h-3.5 md:w-5 h-5 group-hover:-translate-y-1 transition-transform" />
               )}
               <span className="text-[9px] md:text-base uppercase tracking-tight md:tracking-normal font-black">
                 {isGenerating ? 'WAIT...' : 'SAVE'}
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

            <div className="no-print mt-12 p-10 bg-[#064e3b] rounded-[40px] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:rotate-45 transition-transform duration-1000">
                    <Leaf className="w-64 h-64" />
                </div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md mb-6 border border-white/20">
                        <Printer className="w-10 h-10 text-[#cddc39]" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Download Professional ID Card</h3>
                    <p className="text-emerald-100/70 max-w-md text-sm leading-relaxed mb-6">
                        Get a high-resolution PDF copy. Standard 1:1 scale. Perfect for PVC card printing.
                    </p>
                    <button 
                        onClick={handleSaveAsPDF}
                        disabled={isGenerating}
                        className="bg-[#cddc39] text-[#064e3b] px-12 py-4 rounded-2xl font-black text-lg hover:bg-white transition-all shadow-2xl shadow-black/40 flex items-center gap-3 active:scale-95 w-full md:w-auto justify-center"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Download />}
                        {isGenerating ? 'GENERATING PDF...' : 'SAVE AS PDF'}
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
                    <h4 className="font-bold text-sm mb-1">Quick Instructions</h4>
                    <p className="text-xs leading-relaxed opacity-80">
                        Enter farmer details. Upload a square photo for best results. Use the scan button to auto-fill details from an existing card.
                    </p>
                </div>
            </div>

            <div className="glass-card rounded-3xl shadow-xl overflow-hidden border-2 border-emerald-50/50">
                <FarmerForm data={farmerData} onChange={setFarmerData} />
            </div>
          </div>
        </div>
      </main>

      {/* Hidden PDF Capture Container (Better handled now) */}
      <div id="pdf-download-area" className="pdf-capture-area">
        <div style={{ padding: '20px', background: 'white', width: '650px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <CardPreview data={farmerData} forceFullScale={true} />
        </div>
      </div>

      <footer className="no-print bg-white border-t py-16 mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <div className="flex flex-col items-center gap-6">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] leading-relaxed">
                © 2026 Agri Record Management System <span className="mx-3 text-slate-200">|</span> Digital India Initiative
              </p>
              <div className="flex items-center justify-center gap-1.5 text-slate-400">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-widest">Developed with care for Indian Farmers</span>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

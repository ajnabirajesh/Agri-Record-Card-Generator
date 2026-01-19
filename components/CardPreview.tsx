import React, { useState, useEffect, useRef } from 'react';
import { FarmerData } from '../types';
import QRCodeGen from './QRCodeGen';
import { Sprout, Leaf, ShieldCheck } from 'lucide-react';

interface CardPreviewProps {
  data: FarmerData;
  forceFullScale?: boolean; // Prop to override responsive scaling
}

interface ScaledCardProps {
  children: React.ReactNode;
  forceFullScale: boolean;
  scale: number;
}

const ScaledCard: React.FC<ScaledCardProps> = ({ children, forceFullScale, scale }) => (
  <div 
    className={`card-container-transition origin-top flex flex-col items-center ${!forceFullScale ? 'print-force-scale' : ''}`}
    style={forceFullScale ? {
      width: '600px',
      height: '380px',
      marginBottom: '2rem'
    } : { 
      transform: `scale(${scale})`,
      height: `${380 * scale}px`,
      width: '100%',
      marginBottom: '2.5rem'
    }}
  >
    {children}
  </div>
);

const CardPreview: React.FC<CardPreviewProps> = ({ data, forceFullScale = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Bihar Government Logo URL (High Quality Seal)
  const biharLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Seal_of_Bihar.svg/1200px-Seal_of_Bihar.svg.png";

  // Dynamic Scaling Logic for Preview
  useEffect(() => {
    if (forceFullScale) {
      setScale(1);
      return;
    }

    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.offsetWidth;
        const availableWidth = parentWidth - 32;
        if (availableWidth < 600) {
          const newScale = availableWidth / 600;
          setScale(newScale);
        } else {
          setScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [forceFullScale]);

  const displayIssueDate = !data.downloadDate || data.downloadDate === '0' || data.downloadDate.trim() === ''
    ? new Date().toLocaleDateString('en-GB') 
    : data.downloadDate;

  const qrValue = `Name: ${data.nameEnglish}\nDOB: ${data.dob}\nMobile: ${data.mobile}\nFarmer ID: ${data.farmerId}\nAddress: ${data.address}\nIssued: ${displayIssueDate}`;

  const currentScale = forceFullScale ? 1 : scale;

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center card-preview-container">
      
      {/* Front Side */}
      <ScaledCard forceFullScale={forceFullScale} scale={currentScale}>
        <div className="card-ratio bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden border border-gray-200 relative card-pattern select-none">
          {/* Transparent Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
              <img src={biharLogoUrl} alt="Bihar Watermark" crossOrigin="anonymous" className="w-[300px] h-[300px] object-contain grayscale" />
          </div>

          <div className="absolute top-0 left-0 right-0 h-1 bg-[#8bc34a]"></div>

          <div className="bg-[#064e3b] text-white px-5 py-3 flex justify-between items-center h-[68px] shadow-md relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg shadow-inner">
                  <Sprout className="w-8 h-8 text-[#064e3b]" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black italic leading-none tracking-tight">
                  Agri<span className="text-[#cddc39]">record</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80 mt-0.5">Farmer Identity Card</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               <div className="flex flex-col items-end leading-none mr-2">
                  <span className="text-[9px] font-bold text-[#cddc39] uppercase tracking-tighter">Bihar Sarkar</span>
                  <span className="text-[7px] text-white/60 uppercase">Govt. of Bihar</span>
               </div>
               <div className="bg-white p-1 rounded-full shadow-lg">
                  <img src={biharLogoUrl} alt="Bihar Govt" crossOrigin="anonymous" className="w-10 h-10 object-contain" />
               </div>
            </div>
          </div>

          <div className="flex p-5 gap-6 h-[calc(100%-128px)] relative z-10">
            <div className="flex flex-col gap-3 items-center">
               <div className="w-[120px] h-[150px] border-[3px] border-[#064e3b] rounded-md overflow-hidden bg-gray-50 flex items-center justify-center shadow-lg relative">
                  {data.photoUrl ? (
                      <img src={data.photoUrl} alt="Farmer" crossOrigin="anonymous" className="w-full h-full object-cover" />
                  ) : (
                      <div className="text-gray-300 w-16 h-16 flex items-center justify-center">
                          <Leaf className="w-12 h-12" />
                      </div>
                  )}
                  <div className="absolute bottom-1 right-1 bg-[#8bc34a] text-white p-1 rounded-full shadow-sm">
                     <img src={biharLogoUrl} crossOrigin="anonymous" className="w-3.5 h-3.5 brightness-0 invert" alt="seal" />
                  </div>
               </div>
               <div className="flex flex-col items-center">
                   <img src="https://img.icons8.com/color/48/leaf.png" className="w-6 h-6 opacity-20 rotate-45" alt="leaf" />
                   <span className="text-[9px] font-black text-emerald-900/40 uppercase tracking-tighter">Verified Member</span>
               </div>
            </div>

            <div className="flex-1 flex flex-col justify-start pt-1">
              <div className="mb-4">
                <span className="text-[11px] font-extrabold text-[#064e3b] uppercase block tracking-widest">Name / नाम</span>
                <div className="flex flex-col leading-tight mt-1">
                  <span className="text-2xl font-black text-slate-900">{data.nameHindi}</span>
                  <span className="text-base font-bold text-slate-500 uppercase tracking-wide">{data.nameEnglish}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-[#064e3b] uppercase leading-tight">Date of Birth / जन्म तिथि</span>
                  <span className="text-sm font-bold text-slate-800">{data.dob}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-[#064e3b] uppercase leading-tight">Gender / लिंग</span>
                  <span className="text-sm font-bold text-slate-800">{data.gender}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-[#064e3b] uppercase leading-tight">Aadhaar No. / आधार</span>
                  <span className="text-sm font-bold text-slate-800">{data.aadhaar.replace(/(\d{4})/g, '$1 ')}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-[#064e3b] uppercase leading-tight">Mobile / मोबाइल</span>
                  <span className="text-sm font-bold text-slate-800">+91 {data.mobile}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-start py-1">
              <div className="bg-white p-1.5 rounded-xl shadow-md border border-gray-100 mt-1">
                 <QRCodeGen value={qrValue} size={85} />
              </div>
            </div>

            <div className="absolute bottom-2 right-5 flex items-center gap-1.5">
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Issue Date:</span>
                 <span className="text-[10px] font-black text-slate-600 tracking-wider">{displayIssueDate}</span>
            </div>
          </div>

          {/* Redesigned Bottom ID Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#064e3b] via-[#085a44] to-[#064e3b] text-white p-4 flex justify-center items-center shadow-[0_-8px_25px_rgba(0,0,0,0.2)] relative z-10 border-t border-[#cddc39]/30">
             <div className="absolute left-4 opacity-20">
                <ShieldCheck className="w-8 h-8 text-[#cddc39]" />
             </div>
             <div className="flex flex-col items-center leading-none">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-[1px] bg-[#cddc39]/40"></span>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#cddc39]">Digital Farmer ID / डिजिटल किसान आईडी</span>
                  <span className="w-6 h-[1px] bg-[#cddc39]/40"></span>
                </div>
                <span className="text-3xl font-black tracking-[0.25em] drop-shadow-lg text-white font-mono">{data.farmerId}</span>
             </div>
             <div className="absolute right-4 opacity-20 rotate-12">
                <Sprout className="w-8 h-8 text-[#cddc39]" />
             </div>
          </div>
        </div>
      </ScaledCard>

      {/* Back Side */}
      <ScaledCard forceFullScale={forceFullScale} scale={currentScale}>
        <div className="card-ratio bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden border border-gray-200 p-6 flex flex-col relative card-pattern select-none">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
              <img src={biharLogoUrl} alt="Bihar Watermark" crossOrigin="anonymous" className="w-[300px] h-[300px] object-contain grayscale" />
          </div>

          <div className="absolute top-0 left-0 right-0 h-1 bg-[#8bc34a]"></div>
          
          <div className="flex justify-between items-start mb-5 border-b pb-3 border-emerald-100 relative z-10">
            <div className="flex-1 pr-12">
              <h3 className="text-[#064e3b] font-black text-[11px] mb-1.5 uppercase tracking-widest">Permanent Address / स्थायी पता</h3>
              <p className="text-[12.5px] text-slate-800 leading-relaxed font-bold">
                {data.address}
              </p>
            </div>
            <div className="flex flex-col items-end">
               <img src={biharLogoUrl} crossOrigin="anonymous" className="w-12 h-12 opacity-20 grayscale" alt="Bihar seal" />
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative z-10">
            <h3 className="text-[#064e3b] font-black text-[11px] mb-2.5 uppercase tracking-widest flex items-center gap-2">
              <img src={biharLogoUrl} crossOrigin="anonymous" className="w-4 h-4" alt="seal" /> Land Records / भूमि का विवरण
            </h3>
            <div className="rounded-xl overflow-hidden border border-emerald-100 shadow-sm bg-white/50">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-50 text-[#064e3b] font-black border-b border-emerald-100">
                    <th className="px-3 py-2.5">District</th>
                    <th className="px-3 py-2.5">Sub-District</th>
                    <th className="px-3 py-2.5">Village</th>
                    <th className="px-3 py-2.5">M. Owner No.</th>
                    <th className="px-3 py-2.5">Khasra</th>
                    <th className="px-3 py-2.5 text-right">Area</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {data.landDetails.map((land, idx) => (
                    <tr key={land.id} className={idx % 2 === 0 ? 'bg-white/70' : 'bg-emerald-50/30'}>
                      <td className="px-3 py-2.5 text-slate-900 font-bold">{land.district}</td>
                      <td className="px-3 py-2.5 text-slate-800 font-medium">{land.subDistrict}</td>
                      <td className="px-3 py-2.5 text-slate-800 font-medium">{land.village}</td>
                      <td className="px-3 py-2.5 text-slate-950 font-black">{land.mOwnerNo}</td>
                      <td className="px-3 py-2.5 text-slate-950 font-black">{land.khasra}</td>
                      <td className="px-3 py-2.5 text-right font-black text-emerald-900">{land.area}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-end border-t pt-2 border-emerald-50 relative z-10">
             <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-[10px] font-black text-[#064e3b] uppercase tracking-tighter">Issued On: {displayIssueDate}</span>
                </div>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Digital card generated via Agri Record Management System. Verify using QR code.</span>
                <span className="text-[8px] text-slate-500 font-medium uppercase tracking-tighter italic">यह डिजिटल कार्ड कृषि रिकॉर्ड प्रबंधन प्रणाली के माध्यम से तैयार किया गया है।</span>
             </div>
             <div className="flex gap-2 opacity-10 pb-1">
                <Leaf className="w-4 h-4 text-[#064e3b]" />
                <Leaf className="w-4 h-4 text-[#064e3b]" />
             </div>
          </div>
        </div>
      </ScaledCard>
    </div>
  );
};

export default CardPreview;
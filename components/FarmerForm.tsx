
import React, { useState, useEffect } from 'react';
import { FarmerData, LandDetail } from '../types';
import { Plus, Trash2, Camera, Wand2, Loader2, UserCircle, Database, Calendar, AlertCircle, Key } from 'lucide-react';
import { extractFarmerDataFromImage } from '../services/geminiService';

interface FarmerFormProps {
  data: FarmerData;
  onChange: (data: FarmerData) => void;
}

const FarmerForm: React.FC<FarmerFormProps> = ({ data, onChange }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  // Check if API Key is selected on mount
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setNeedsApiKey(!hasKey);
      }
    };
    checkKey();
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (extractError) {
      const timer = setTimeout(() => setExtractError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [extractError]);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setNeedsApiKey(false); // Proceed after triggering
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoFillFromImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // If we know a key is needed and not set, trigger dialog
    if (needsApiKey) {
        handleSelectKey();
        return;
    }

    setExtractError(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setIsExtracting(true);
      try {
        const extracted = await extractFarmerDataFromImage(base64);
        
        if (extracted) {
          const hasData = Object.entries(extracted).some(([key, val]) => {
            if (key === 'landDetails' && Array.isArray(val)) return val.length > 0;
            return typeof val === 'string' && val.trim().length > 0;
          });

          if (!hasData) {
            setExtractError("AI couldn't read clear text. Try a higher resolution photo.");
            setIsExtracting(false);
            return;
          }

          const mergedData: FarmerData = {
            ...data,
            nameHindi: extracted.nameHindi || data.nameHindi,
            nameEnglish: extracted.nameEnglish || data.nameEnglish,
            dob: extracted.dob || data.dob,
            gender: extracted.gender || data.gender,
            mobile: extracted.mobile ? extracted.mobile.replace(/\s/g, '') : data.mobile,
            aadhaar: extracted.aadhaar ? extracted.aadhaar.replace(/\s/g, '') : data.aadhaar,
            farmerId: extracted.farmerId || data.farmerId,
            address: extracted.address || data.address,
            landDetails: extracted.landDetails && extracted.landDetails.length > 0 
              ? extracted.landDetails.map((l: any, idx: number) => ({
                  ...l,
                  id: `ai-${Date.now()}-${idx}`
                }))
              : data.landDetails
          };
          onChange(mergedData);
        }
      } catch (err: any) {
        console.error("Auto-fill extraction error:", err);
        // Specifically check for API Key errors
        if (err.message?.includes("API Key") || err.message?.includes("entity was not found")) {
            setNeedsApiKey(true);
            setExtractError("Please select a valid paid API Key to continue.");
        } else {
            setExtractError(err.message || "An error occurred during AI scanning.");
        }
      } finally {
        setIsExtracting(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const updateLandDetail = (id: string, field: keyof LandDetail, value: string) => {
    const newDetails = data.landDetails.map((land) => 
      land.id === id ? { ...land, [field]: value } : land
    );
    onChange({ ...data, landDetails: newDetails });
  };

  const addLandDetail = () => {
    const newLand: LandDetail = {
      id: Date.now().toString(),
      district: '',
      subDistrict: '',
      village: '',
      mOwnerNo: '',
      khasra: '',
      area: '',
    };
    onChange({ ...data, landDetails: [...data.landDetails, newLand] });
  };

  const removeLandDetail = (id: string) => {
    onChange({ ...data, landDetails: data.landDetails.filter((l) => l.id !== id) });
  };

  return (
    <div className="bg-white/80 p-8 flex flex-col gap-10">
      
      {/* AI Magic Section */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
            <Wand2 className="w-16 h-16" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-black flex items-center gap-2 mb-1">
              <Wand2 className={`w-5 h-5 text-[#cddc39] ${isExtracting ? 'animate-spin' : ''}`} /> Magic Auto-Fill
            </h3>
            <p className="text-xs text-emerald-100/80 font-medium">Extract details from photo instantly.</p>
          </div>
          
          <div className="flex flex-col gap-2">
            {needsApiKey ? (
                <button 
                    onClick={handleSelectKey}
                    className="flex items-center gap-3 px-6 py-3 rounded-xl cursor-pointer transition-all font-black text-xs shadow-xl shadow-black/20 bg-white text-emerald-800 hover:bg-[#cddc39] hover:text-[#064e3b]"
                >
                    <Key className="w-4 h-4" />
                    <span>SELECT API KEY</span>
                </button>
            ) : (
                <label className={`flex items-center gap-3 px-6 py-3 rounded-xl cursor-pointer transition-all font-black text-xs shadow-xl shadow-black/20 ${isExtracting ? 'bg-white/20 text-white cursor-not-allowed animate-pulse' : 'bg-[#cddc39] text-[#064e3b] hover:bg-white'}`}>
                    {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    <span>{isExtracting ? 'AI IS SCANNING...' : 'SCAN OLD CARD'}</span>
                    {!isExtracting && <input type="file" className="hidden" accept="image/*" onChange={handleAutoFillFromImage} />}
                </label>
            )}
            
            {needsApiKey && (
                <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[9px] text-center font-bold text-emerald-200 hover:text-white underline"
                >
                    Billing Setup Guide
                </a>
            )}
          </div>
        </div>

        {extractError && (
          <div className="mt-4 bg-red-500/90 border border-red-400 p-3 rounded-xl flex items-start gap-3 text-[10px] font-bold text-white relative z-10 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <div className="flex flex-col">
              <span className="uppercase tracking-widest text-[8px] opacity-70 mb-0.5">Extraction Notice</span>
              <p className="leading-tight">{extractError}</p>
            </div>
          </div>
        )}
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <UserCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Personal Details</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Photo</label>
            <div className="flex items-center gap-4 p-3 border-2 border-dashed border-emerald-100 rounded-xl bg-emerald-50/30">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border shadow-sm overflow-hidden">
                    {data.photoUrl ? <img src={data.photoUrl} className="w-full h-full object-cover" /> : <Camera className="text-slate-300" />}
                </div>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-xs text-slate-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Farmer ID</label>
            <input name="farmerId" value={data.farmerId} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aadhaar Number</label>
            <input name="aadhaar" value={data.aadhaar} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">+91</span>
                <input 
                    name="mobile" 
                    value={data.mobile} 
                    onChange={handleInputChange} 
                    maxLength={10}
                    placeholder="Enter 10 digits"
                    className="w-full p-3 pl-12 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold" 
                />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</label>
            <input name="dob" value={data.dob} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name (Hindi)</label>
            <input name="nameHindi" value={data.nameHindi} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name (English)</label>
            <input name="nameEnglish" value={data.nameEnglish} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
            <select name="gender" value={data.gender} onChange={(e) => onChange({...data, gender: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold bg-white">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue / Download Date</label>
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text"
                  name="downloadDate" 
                  value={data.downloadDate === '0' ? '' : data.downloadDate} 
                  placeholder="DD/MM/YYYY"
                  onChange={handleInputChange} 
                  className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold" 
                />
            </div>
            <p className="text-[9px] text-slate-400 mt-1 italic">Leave empty to use current date</p>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Address</label>
            <textarea name="address" value={data.address} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold h-20 resize-none" />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Land Records</h2>
            </div>
            <button onClick={addLandDetail} className="flex items-center gap-2 text-[10px] font-black uppercase bg-[#064e3b] text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition-all shadow-lg">
                <Plus className="w-3 h-3" /> Add Plot
            </button>
        </div>
        
        <div className="space-y-4">
            {data.landDetails.map((land) => (
                <div key={land.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 relative group hover:bg-white hover:shadow-xl transition-all duration-300">
                    <button onClick={() => removeLandDetail(land.id)} className="absolute -top-2 -right-2 bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 border border-red-100">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase">District</label>
                            <input value={land.district} onChange={(e) => updateLandDetail(land.id, 'district', e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase">Sub-District</label>
                            <input value={land.subDistrict} onChange={(e) => updateLandDetail(land.id, 'subDistrict', e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase">Village</label>
                            <input value={land.village} onChange={(e) => updateLandDetail(land.id, 'village', e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase">M. Owner No.</label>
                            <input value={land.mOwnerNo} onChange={(e) => updateLandDetail(land.id, 'mOwnerNo', e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase">Khasra</label>
                            <input value={land.khasra} onChange={(e) => updateLandDetail(land.id, 'khasra', e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase">Area (Acre)</label>
                            <input value={land.area} onChange={(e) => updateLandDetail(land.id, 'area', e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 font-black text-emerald-700" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default FarmerForm;


import React, { useState } from 'react';
import { FarmerData, LandDetail } from '../types';
import { Plus, Trash2, Camera, Wand2, Loader2, UserCircle, MapPin, Database } from 'lucide-react';
import { extractFarmerDataFromImage } from '../services/geminiService';

interface FarmerFormProps {
  data: FarmerData;
  onChange: (data: FarmerData) => void;
}

const FarmerForm: React.FC<FarmerFormProps> = ({ data, onChange }) => {
  const [isExtracting, setIsExtracting] = useState(false);

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

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setIsExtracting(true);
      const extractedData = await extractFarmerDataFromImage(base64);
      setIsExtracting(false);

      if (extractedData) {
        onChange({
          ...data,
          ...extractedData,
          landDetails: extractedData.landDetails?.map((l: any, idx: number) => ({
            ...l,
            id: Date.now().toString() + idx
          })) || data.landDetails
        });
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
      khata: '',
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
      
      {/* AI Power Section */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
            <Wand2 className="w-16 h-16" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-black flex items-center gap-2 mb-1">
              <Wand2 className="w-5 h-5 text-[#cddc39]" /> Magic Auto-Fill
            </h3>
            <p className="text-xs text-emerald-100/80 font-medium">Extract farmer details from a photo instantly.</p>
          </div>
          <label className="flex items-center gap-3 px-6 py-3 bg-[#cddc39] text-[#064e3b] rounded-xl cursor-pointer hover:bg-white transition-all font-black text-xs shadow-xl shadow-black/20">
            {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            <span>{isExtracting ? 'ANALYZING...' : 'SCAN OLD CARD'}</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleAutoFillFromImage} disabled={isExtracting} />
          </label>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <UserCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Personal Profiles</h2>
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
            <input name="farmerId" value={data.farmerId} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold transition-all" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aadhaar Number</label>
            <input name="aadhaar" value={data.aadhaar} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold" />
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</label>
            <input name="dob" value={data.dob} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
            <select name="gender" value={data.gender} onChange={(e) => onChange({...data, gender: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold bg-white">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
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
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Land Holdings</h2>
            </div>
            <button onClick={addLandDetail} className="flex items-center gap-2 text-[10px] font-black uppercase bg-[#064e3b] text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-950/10">
                <Plus className="w-3 h-3" /> New Plot
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
                            <label className="text-[8px] font-black text-slate-400 uppercase">Village</label>
                            <input value={land.village} onChange={(e) => updateLandDetail(land.id, 'village', e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase">Khata</label>
                            <input value={land.khata} onChange={(e) => updateLandDetail(land.id, 'khata', e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase">Khasra</label>
                            <input value={land.khasra} onChange={(e) => updateLandDetail(land.id, 'khasra', e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" />
                        </div>
                        <div className="flex flex-col gap-1 col-span-1 lg:col-span-2">
                            <label className="text-[8px] font-black text-slate-400 uppercase">Area (Acre)</label>
                            <input value={land.area} onChange={(e) => updateLandDetail(land.id, 'area', e.target.value)} className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 font-black text-emerald-700" />
                        </div>
                    </div>
                </div>
            ))}
            {data.landDetails.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center gap-3">
                    <MapPin className="w-10 h-10 text-slate-200" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No land records linked</p>
                </div>
            )}
        </div>
      </section>
    </div>
  );
};

export default FarmerForm;

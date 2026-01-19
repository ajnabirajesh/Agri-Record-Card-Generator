
import React from 'react';
import { FarmerData, LandDetail, BIHAR_DISTRICTS, BIHAR_SUB_DISTRICTS } from '../types';
import { Plus, Trash2, Camera, UserCircle, Database, Calendar } from 'lucide-react';

interface FarmerFormProps {
  data: FarmerData;
  onChange: (data: FarmerData) => void;
}

const FarmerForm: React.FC<FarmerFormProps> = ({ data, onChange }) => {
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

  const updateLandDetail = (id: string, field: keyof LandDetail, value: string) => {
    const newDetails = data.landDetails.map((land) => {
      if (land.id === id) {
        if (field === 'district') {
          return { ...land, [field]: value, subDistrict: '' };
        }
        return { ...land, [field]: value };
      }
      return land;
    });
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
            <input name="farmerId" value={data.farmerId} onChange={handleInputChange} placeholder="Ex: 123-45-678-90" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aadhaar Number</label>
            <input name="aadhaar" value={data.aadhaar} onChange={handleInputChange} maxLength={12} placeholder="12 Digit Aadhaar" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold" />
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
                    placeholder="10 Digit Mobile"
                    className="w-full p-3 pl-12 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold" 
                />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</label>
            <input name="dob" value={data.dob} onChange={handleInputChange} placeholder="DD/MM/YYYY" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name (Hindi)</label>
            <input name="nameHindi" value={data.nameHindi} onChange={handleInputChange} placeholder="नाम यहाँ लिखें" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name (English)</label>
            <input name="nameEnglish" value={data.nameEnglish} onChange={handleInputChange} placeholder="NAME IN ENGLISH" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold" />
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
            <textarea name="address" value={data.address} onChange={handleInputChange} placeholder="VILL-..., PO-..., DIST-..., STATE-BIHAR" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold h-20 resize-none" />
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
            {data.landDetails.map((land) => {
                const availableBlocks = land.district ? (BIHAR_SUB_DISTRICTS[land.district] || []) : [];
                
                return (
                    <div key={land.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 relative group hover:bg-white hover:shadow-xl transition-all duration-300">
                        <button onClick={() => removeLandDetail(land.id)} className="absolute -top-2 -right-2 bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 border border-red-100">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase">District (Bihar)</label>
                                <select 
                                    value={land.district} 
                                    onChange={(e) => updateLandDetail(land.id, 'district', e.target.value)} 
                                    className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-white"
                                >
                                    <option value="">Select District</option>
                                    {BIHAR_DISTRICTS.map(dist => (
                                        <option key={dist} value={dist}>{dist}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase">Sub-District (Block)</label>
                                <select 
                                    value={land.subDistrict} 
                                    disabled={!land.district}
                                    onChange={(e) => updateLandDetail(land.id, 'subDistrict', e.target.value)} 
                                    className={`text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-white ${!land.district ? 'opacity-50 cursor-not-allowed italic' : ''}`}
                                >
                                    <option value="">{land.district ? "Select Block" : "Select District First"}</option>
                                    {availableBlocks.map(block => (
                                        <option key={block} value={block}>{block}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase">Village</label>
                                <input value={land.village} onChange={(e) => updateLandDetail(land.id, 'village', e.target.value)} placeholder="Village Name" className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase">M. Owner No. (Khata)</label>
                                <input value={land.mOwnerNo} onChange={(e) => updateLandDetail(land.id, 'mOwnerNo', e.target.value)} placeholder="Khata No" className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase">Khasra</label>
                                <input value={land.khasra} onChange={(e) => updateLandDetail(land.id, 'khasra', e.target.value)} placeholder="Plot No" className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase">Area (Acre)</label>
                                <input value={land.area} onChange={(e) => updateLandDetail(land.id, 'area', e.target.value)} placeholder="0.00" className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 font-black text-emerald-700" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </section>
    </div>
  );
};

export default FarmerForm;

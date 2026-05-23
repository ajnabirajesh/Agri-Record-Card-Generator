
import React, { useState } from 'react';
import { FarmerData, LandDetail, BIHAR_DISTRICTS, BIHAR_SUB_DISTRICTS, UP_DISTRICTS, MAHARASHTRA_DISTRICTS, MP_DISTRICTS, RAJASTHAN_DISTRICTS } from '../types';
import { Plus, Trash2, Camera, UserCircle, Database, Calendar, ScanText, Loader2 } from 'lucide-react';

interface FarmerFormProps {
  data: FarmerData;
  onChange: (data: FarmerData) => void;
}

const FarmerForm: React.FC<FarmerFormProps> = ({ data, onChange }) => {
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            onChange({ ...data, photoUrl: compressedBase64 });
          } else {
            onChange({ ...data, photoUrl: reader.result as string });
          }
        };
        img.src = reader.result as string;
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

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrProcessing(true);
    try {
      const Tesseract = (await import('tesseract.js')).default;
      const result = await Tesseract.recognize(file, 'eng+hin');
      const text = result.data.text;
      
      // Simple regex to extract some details (Aadhaar, DOB)
      const aadhaarMatch = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
      const dobMatch = text.match(/\b\d{2}[/-]\d{2}[/-]\d{4}\b/);
      
      const updates: Partial<FarmerData> = {};
      if (aadhaarMatch) updates.aadhaar = aadhaarMatch[0].replace(/\s/g, '');
      if (dobMatch) updates.dob = dobMatch[0].replace(/-/g, '/');

      // Name extraction heuristic (Aadhaar format)
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 2);
      const hindiStopWords = ['भारत', 'सरकार', 'मेरा', 'आधार', 'पहचान', 'प्राधिकरण', 'जन्म', 'तिथि', 'पुरुष', 'महिला', 'पता', 'वर्ष', 'पिता', 'पति', 'निवासी', 'पुत्र', 'पुत्री', 'पत्नी', 'तथा', 'के', 'लिए', 'आम', 'आदमी', 'अधिकार', 'संगठन'];
      const englishStopWords = ['GOVERNMENT', 'INDIA', 'DOB', 'YEAR', 'BIRTH', 'MALE', 'FEMALE', 'ADDRESS', 'FATHER', 'MOTHER', 'W/O', 'S/O', 'D/O', 'C/O', 'UNIQUE', 'IDENTIFICATION', 'AUTHORITY', 'MERA', 'AADHAAR', 'MERI', 'PEHCHAN', 'TO', 'ENROLLMENT', 'VID', 'UPDATE', 'HELP', 'WWW', 'NET', 'COM', 'GOV', 'STATE', 'DISTRICT'];

      let extractedHindi = '';
      let extractedEnglish = '';

      for (let line of lines) {
        // Remove numbers and common noise characters, keep letters and spaces
        let cleanLine = line.replace(/[0-9!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~-]/g, ' ').replace(/\s+/g, ' ').trim();
        if (cleanLine.length < 3) continue;

        const hasHindi = /[\u0900-\u097F]/.test(cleanLine);
        const hasEnglish = /[A-Za-z]/.test(cleanLine);
        const upperLine = cleanLine.toUpperCase();

        if (hasHindi) {
          const isStopWord = hindiStopWords.some(word => cleanLine.includes(word));
          if (!isStopWord && !extractedHindi && cleanLine.split(' ').length <= 5) {
            // Remove any stray English characters from Hindi name
            extractedHindi = cleanLine.replace(/[A-Za-z]/g, '').trim();
          }
        } else if (hasEnglish && !hasHindi) {
          const isStopWord = englishStopWords.some(word => upperLine.includes(word));
          if (!isStopWord && !extractedEnglish && cleanLine.split(' ').length <= 5) {
            extractedEnglish = cleanLine;
          }
        }
      }

      if (extractedHindi) updates.nameHindi = extractedHindi;
      if (extractedEnglish) updates.nameEnglish = extractedEnglish;

      if (Object.keys(updates).length > 0) {
        onChange({ ...data, ...updates });
        alert("Successfully extracted some details from the document!");
      } else {
        alert("Could not find any recognizable details in the document.");
      }
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Failed to process the image for OCR.");
    } finally {
      setIsOcrProcessing(false);
      // Reset the file input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white/80 p-8 flex flex-col gap-10">
      
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
                <UserCircle className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Personal Details</h2>
            </div>
            
            <div className="relative">
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleOcrUpload} 
                    disabled={isOcrProcessing}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                    title="Upload document for OCR auto-fill"
                />
                <button 
                    disabled={isOcrProcessing}
                    className="flex items-center gap-2 text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-100 transition-all shadow-sm border border-indigo-200 disabled:opacity-50"
                >
                    {isOcrProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ScanText className="w-3 h-3" />}
                    {isOcrProcessing ? 'Scanning...' : 'Auto-fill (OCR)'}
                </button>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1 col-span-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State</label>
            <select name="state" value={data.state || 'Bihar'} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold bg-white">
                <option value="Bihar">Bihar</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Rajasthan">Rajasthan</option>
            </select>
          </div>

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
                const state = data.state || 'Bihar';
                let availableDistricts = BIHAR_DISTRICTS;
                if (state === 'Uttar Pradesh') availableDistricts = UP_DISTRICTS;
                if (state === 'Maharashtra') availableDistricts = MAHARASHTRA_DISTRICTS;
                if (state === 'Madhya Pradesh') availableDistricts = MP_DISTRICTS;
                if (state === 'Rajasthan') availableDistricts = RAJASTHAN_DISTRICTS;

                const isBihar = state === 'Bihar';
                const availableBlocks = isBihar && land.district ? (BIHAR_SUB_DISTRICTS[land.district] || []) : [];
                
                return (
                    <div key={land.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 relative group hover:bg-white hover:shadow-xl transition-all duration-300">
                        <button onClick={() => removeLandDetail(land.id)} className="absolute -top-2 -right-2 bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 border border-red-100">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase">District</label>
                                <select 
                                    value={land.district} 
                                    onChange={(e) => updateLandDetail(land.id, 'district', e.target.value)} 
                                    className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-white"
                                >
                                    <option value="">Select District</option>
                                    {availableDistricts.map(dist => (
                                        <option key={dist} value={dist}>{dist}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase">Sub-District (Block/Tehsil)</label>
                                {!isBihar ? (
                                     <input 
                                         value={land.subDistrict} 
                                         onChange={(e) => updateLandDetail(land.id, 'subDistrict', e.target.value)} 
                                         placeholder="Sub-District/Tehsil" 
                                         className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" 
                                     />
                                ) : (
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
                                )}
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

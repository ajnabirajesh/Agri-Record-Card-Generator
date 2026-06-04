import React, { useState } from 'react';
import { FarmerData } from '../types';
import { X, Save, Edit3 } from 'lucide-react';

interface EditCardModalProps {
  cardId: string;
  initialData: FarmerData;
  onSave: (id: string, newData: FarmerData) => Promise<void>;
  onClose: () => void;
}

const EditCardModal: React.FC<EditCardModalProps> = ({ cardId, initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState<FarmerData>(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLandChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newLandDetails = [...prev.landDetails];
      newLandDetails[index] = {
        ...newLandDetails[index],
        [name]: value
      };
      return { ...prev, landDetails: newLandDetails };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(cardId, formData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  let localLangLabel = "Hindi";
  switch (formData.state) {
    case "Tamil Nadu": localLangLabel = "Tamil"; break;
    case "Telangana":
    case "Andhra Pradesh": localLangLabel = "Telugu"; break;
    case "Gujarat": localLangLabel = "Gujarati"; break;
    case "Maharashtra": localLangLabel = "Marathi"; break;
    case "Punjab": localLangLabel = "Punjabi"; break;
    case "Kerala": localLangLabel = "Malayalam"; break;
    case "Odisha": localLangLabel = "Odia"; break;
    case "Assam": localLangLabel = "Assamese"; break;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm no-print">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-emerald-600" /> Edit Farmer Card
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Name (English)</label>
                <input required type="text" name="nameEnglish" value={formData.nameEnglish} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Name ({localLangLabel})</label>
                <input required type="text" name="nameHindi" value={formData.nameHindi} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile / Phone</label>
                <input required type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Aadhaar No.</label>
                <input required type="text" name="aadhaar" value={formData.aadhaar} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input required type="text" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Farmer ID</label>
                <input required type="text" name="farmerId" value={formData.farmerId} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">State</label>
                <input type="text" name="state" value={formData.state || ''} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Card Color</label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Default', value: '' },
                { name: 'Green', value: 'green', bgColor: 'bg-[#8bc34a]' },
                { name: 'Red', value: 'red', bgColor: 'bg-[#dc2626]' },
                { name: 'Orange', value: 'orange', bgColor: 'bg-[#ea580c]' },
                { name: 'Blue', value: 'blue', bgColor: 'bg-[#0ea5e9]' },
                { name: 'Purple', value: 'purple', bgColor: 'bg-[#d946ef]' },
              ].map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, cardColor: color.value }))}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all border ${
                    formData.cardColor === color.value || (color.value === '' && !formData.cardColor)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {color.bgColor && (
                    <span className={`w-3.5 h-3.5 rounded-full ${color.bgColor} shadow-sm border border-black/10`} />
                  )}
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
            <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
          </div>
          
          <div className="mb-4">
             <label className="block text-sm font-semibold text-slate-700 mb-4">Land Records</label>
             <div className="space-y-4">
                {formData.landDetails.map((land, index) => (
                  <div key={land.id || index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 lg:grid-cols-6 gap-3">
                     <div>
                       <label className="block text-xs font-semibold text-slate-500 mb-1">District</label>
                       <input type="text" name="district" value={land.district} onChange={(e) => handleLandChange(index, e)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm" />
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-slate-500 mb-1">Sub-District</label>
                       <input type="text" name="subDistrict" value={land.subDistrict} onChange={(e) => handleLandChange(index, e)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm" />
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-slate-500 mb-1">Village</label>
                       <input type="text" name="village" value={land.village} onChange={(e) => handleLandChange(index, e)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm" />
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-slate-500 mb-1">M. Owner No.</label>
                       <input type="text" name="mOwnerNo" value={land.mOwnerNo} onChange={(e) => handleLandChange(index, e)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm" />
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-slate-500 mb-1">Khasra</label>
                       <input type="text" name="khasra" value={land.khasra} onChange={(e) => handleLandChange(index, e)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm" />
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-slate-500 mb-1">Area</label>
                       <input type="text" name="area" value={land.area} onChange={(e) => handleLandChange(index, e)} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm" />
                     </div>
                  </div>
                ))}
                {formData.landDetails.length === 0 && (
                   <div className="text-sm text-slate-500 text-center py-2">No land records found.</div>
                )}
             </div>
          </div>

        </form>
        
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
           <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
              Cancel
           </button>
           <button 
             onClick={handleSubmit} 
             disabled={isSaving}
             className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
           >
             {isSaving ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <Save className="w-5 h-5" />}
             {isSaving ? 'Saving...' : 'Save Changes'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default EditCardModal;

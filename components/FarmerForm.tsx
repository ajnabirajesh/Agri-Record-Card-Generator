import React, { useState } from "react";
import {
  FarmerData,
  LandDetail,
  BIHAR_DISTRICTS,
  BIHAR_SUB_DISTRICTS,
  UP_DISTRICTS,
  MAHARASHTRA_DISTRICTS,
  MP_DISTRICTS,
  RAJASTHAN_DISTRICTS,
  KERALA_DISTRICTS,
  CHHATTISGARH_DISTRICTS,
  TAMIL_NADU_DISTRICTS,
  GUJARAT_DISTRICTS,
  HARYANA_DISTRICTS,
  PUNJAB_DISTRICTS,
  ANDHRA_PRADESH_DISTRICTS,
  ASSAM_DISTRICTS,
  ODISHA_DISTRICTS,
  JHARKHAND_DISTRICTS,
  TELANGANA_DISTRICTS,
} from "../types";
import {
  Plus,
  Trash2,
  Camera,
  UserCircle,
  Database,
  Calendar,
  ScanText,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  FileCheck,
  Upload
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import CardPreview from "./CardPreview";

const ENABLE_FARMER_SEARCH = false;

interface FarmerFormProps {
  data: FarmerData;
  onChange: (data: FarmerData) => void;
}

const FarmerForm: React.FC<FarmerFormProps> = ({ data, onChange }) => {
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [searchType, setSearchType] = useState("mobileNumber");
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<FarmerData | null>(null);
  const [searchMessage, setSearchMessage] = useState<{ text: React.ReactNode, type: string }>({ text: "", type: "" });
  const [searchDetails, setSearchDetails] = useState<{ date: string; total: number; id: string } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const { user, isAdmin } = useAuth();

  const handleSearch = async () => {
    if (!ENABLE_FARMER_SEARCH) return;
    
    if (!user) {
      setSearchMessage({ text: "Please login to search records.", type: "error" });
      return;
    }
    if (!searchValue.trim()) {
      setSearchMessage({ text: "Please enter a search value.", type: "error" });
      return;
    }

    setIsSearching(true);
    setSearchMessage({ text: "", type: "" });
    setSearchResult(null);
    setSearchDetails(null);

    try {
      const normalizeStr = (str?: string) => (str || '').replace(/\s+/g, '').toLowerCase();
      const normSearchVal = normalizeStr(searchValue);
      
      let q;
      if (searchType === 'mobileNumber') {
        q = query(collection(db, "cards"), where("mobileNumber", "==", searchValue));
      } else if (searchType === 'aadhaarNumber') {
        q = query(collection(db, "cards"), where("aadhaarNumber", "==", searchValue));
      } else {
        q = query(collection(db, "cards"), where("farmerId", "==", searchValue));
      }
      
      const querySnapshot = await getDocs(q);
      
      let matchedDocs: any[] = [];
      querySnapshot.forEach(doc => {
         const data = doc.data() as any;
         if (!data.isDeleted) {
             matchedDocs.push({ id: doc.id, ...data });
         }
      });
      
      if (matchedDocs.length === 0) {
        setSearchMessage({ 
          text: (
            <div className="flex flex-col gap-1.5 -mt-0.5">
              <span className="font-bold text-[15px] pb-1 flex items-center gap-2"><Search className="w-4 h-4" /> कोई रिकॉर्ड नहीं मिला</span>
              <span className="text-[13px] font-semibold text-red-600/90 leading-snug">इस Farmer ID / Mobile Number / Aadhaar Number से संबंधित डेटा हमारी वेबसाइट पर उपलब्ध नहीं है।</span>
              <span className="text-[13px] font-semibold text-red-600/90">Please fill all farmer details manually to generate a new card.</span>
            </div>
          ), 
          type: "error" 
        });
      } else {
        // Sort by createdAt descending locally
        matchedDocs.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        const latestRecord = matchedDocs[0];
        const parsedData: FarmerData = typeof latestRecord.farmerData === 'string' ? JSON.parse(latestRecord.farmerData) : latestRecord.farmerData;
        
        const generatedDate = latestRecord.createdAt?.toDate ? latestRecord.createdAt.toDate().toLocaleDateString() : 'Unknown';

        setSearchResult(parsedData);
        setSearchDetails({ date: generatedDate, total: matchedDocs.length, id: latestRecord.id });
        setSearchMessage({ text: "Farmer Record Found", type: "success" });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      setSearchMessage({ text: "Error: " + (error.message || "Unknown error"), type: "error" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAutoFill = () => {
    if (searchResult) {
      onChange({ ...data, ...searchResult });
      setSearchMessage({ text: "Form successfully auto-filled!", type: "success" });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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
          const canvas = document.createElement("canvas");
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
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
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

  const updateLandDetail = (
    id: string,
    field: keyof LandDetail,
    value: string,
  ) => {
    const newDetails = data.landDetails.map((land) => {
      if (land.id === id) {
        if (field === "district") {
          return { ...land, [field]: value, subDistrict: "" };
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
      district: "",
      subDistrict: "",
      village: "",
      mOwnerNo: "",
      khasra: "",
      area: "",
    };
    onChange({ ...data, landDetails: [...data.landDetails, newLand] });
  };

  const removeLandDetail = (id: string) => {
    onChange({
      ...data,
      landDetails: data.landDetails.filter((l) => l.id !== id),
    });
  };

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrProcessing(true);
    try {
      const Tesseract = (await import("tesseract.js")).default;
      const result = await Tesseract.recognize(file, "eng+hin");
      const text = result.data.text;

      // Simple regex to extract some details (Aadhaar, DOB)
      const aadhaarMatch = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
      const dobMatch = text.match(/\b\d{2}[/-]\d{2}[/-]\d{4}\b/);

      const updates: Partial<FarmerData> = {};
      if (aadhaarMatch) updates.aadhaar = aadhaarMatch[0].replace(/\s/g, "");
      if (dobMatch) updates.dob = dobMatch[0].replace(/-/g, "/");

      // Name extraction heuristic (Aadhaar format)
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 2);
      const hindiStopWords = [
        "भारत",
        "सरकार",
        "मेरा",
        "आधार",
        "पहचान",
        "प्राधिकरण",
        "जन्म",
        "तिथि",
        "पुरुष",
        "महिला",
        "पता",
        "वर्ष",
        "पिता",
        "पति",
        "निवासी",
        "पुत्र",
        "पुत्री",
        "पत्नी",
        "तथा",
        "के",
        "लिए",
        "आम",
        "आदमी",
        "अधिकार",
        "संगठन",
      ];
      const englishStopWords = [
        "GOVERNMENT",
        "INDIA",
        "DOB",
        "YEAR",
        "BIRTH",
        "MALE",
        "FEMALE",
        "ADDRESS",
        "FATHER",
        "MOTHER",
        "W/O",
        "S/O",
        "D/O",
        "C/O",
        "UNIQUE",
        "IDENTIFICATION",
        "AUTHORITY",
        "MERA",
        "AADHAAR",
        "MERI",
        "PEHCHAN",
        "TO",
        "ENROLLMENT",
        "VID",
        "UPDATE",
        "HELP",
        "WWW",
        "NET",
        "COM",
        "GOV",
        "STATE",
        "DISTRICT",
      ];

      let extractedHindi = "";
      let extractedEnglish = "";

      for (let line of lines) {
        // Remove numbers and common noise characters, keep letters and spaces
        let cleanLine = line
          .replace(/[0-9!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~-]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (cleanLine.length < 3) continue;

        const hasHindi = /[\u0900-\u097F]/.test(cleanLine);
        const hasEnglish = /[A-Za-z]/.test(cleanLine);
        const upperLine = cleanLine.toUpperCase();

        if (hasHindi) {
          const isStopWord = hindiStopWords.some((word) =>
            cleanLine.includes(word),
          );
          if (
            !isStopWord &&
            !extractedHindi &&
            cleanLine.split(" ").length <= 5
          ) {
            // Remove any stray English characters from Hindi name
            extractedHindi = cleanLine.replace(/[A-Za-z]/g, "").trim();
          }
        } else if (hasEnglish && !hasHindi) {
          const isStopWord = englishStopWords.some((word) =>
            upperLine.includes(word),
          );
          if (
            !isStopWord &&
            !extractedEnglish &&
            cleanLine.split(" ").length <= 5
          ) {
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
      e.target.value = "";
    }
  };

  let localLangLabel = "Hindi";
  let localNamePlaceholder = "नाम यहाँ लिखें";

  switch (data.state) {
    case "Tamil Nadu":
      localLangLabel = "Tamil";
      localNamePlaceholder = "பெயரை இங்கே எழுதவும்";
      break;
    case "Telangana":
    case "Andhra Pradesh":
      localLangLabel = "Telugu";
      localNamePlaceholder = "పేరు ఇక్కడ రాయండి";
      break;
    case "Gujarat":
      localLangLabel = "Gujarati";
      localNamePlaceholder = "નામ અહીં લખો";
      break;
    case "Maharashtra":
      localLangLabel = "Marathi";
      localNamePlaceholder = "नाव येथे लिहा";
      break;
    case "Punjab":
      localLangLabel = "Punjabi";
      localNamePlaceholder = "ਨਾਮ ਇੱਥੇ ਲਿਖੋ";
      break;
    case "Kerala":
      localLangLabel = "Malayalam";
      localNamePlaceholder = "പേര് ഇവിടെ എഴുതുക";
      break;
    case "Odisha":
      localLangLabel = "Odia";
      localNamePlaceholder = "ନାମ ଏଠାରେ ଲେଖନ୍ତୁ";
      break;
    case "Assam":
      localLangLabel = "Assamese";
      localNamePlaceholder = "নাম ইয়াত লিখক";
      break;
  }

  return (
    <div className="bg-white/80 p-8 flex flex-col gap-10">
      {/* Search Section */}
      {ENABLE_FARMER_SEARCH && (
        <section className="space-y-6 bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Search className="w-32 h-32" />
          </div>
        <div className="flex items-center gap-3 border-b border-emerald-200/50 pb-3 relative">
          <Search className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
            Search Existing Farmer
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4 relative">
          <div className="flex-1 space-y-1">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search By</label>
             <select
               value={searchType}
               onChange={(e) => setSearchType(e.target.value)}
               className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold bg-white"
             >
               <option value="farmerId">Farmer ID</option>
               <option value="mobileNumber">Mobile Number</option>
               <option value="aadhaarNumber">Aadhaar Number</option>
             </select>
          </div>
          <div className="flex-[2] space-y-1">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter Value</label>
             <div className="flex flex-col sm:flex-row gap-2">
               <input
                 type="text"
                 value={searchValue}
                 onChange={(e) => setSearchValue(e.target.value)}
                 placeholder="Enter ID / Mobile / Aadhaar"
                 className="flex-1 w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold bg-white"
                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               />
               <button
                 onClick={handleSearch}
                 disabled={isSearching}
                 className="flex items-center justify-center gap-2 px-6 py-3 bg-[#064e3b] text-white rounded-xl font-bold hover:bg-emerald-800 transition-colors disabled:opacity-50"
               >
                 {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                 <span>Search</span>
               </button>
             </div>
          </div>
        </div>

        {searchMessage.text && (
          <div className={`p-4 rounded-xl border ${searchMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white shadow-sm border-emerald-200 text-slate-800'} flex flex-col relative`}>
             <div className={`flex items-start gap-3 font-bold text-sm ${searchMessage.type === 'success' ? 'items-center text-emerald-700' : ''}`}>
                {searchMessage.type === 'error' ? (typeof searchMessage.text === 'string' ? <XCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-0 hidden sm:block" />) : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                <div className="flex-1">
                  {searchMessage.text}
                </div>
             </div>
             
             {searchResult && searchDetails && searchMessage.type === 'success' && (
               <div className="flex flex-col lg:flex-row gap-3 justify-between lg:items-center pt-3 border-t border-slate-100">
                 <div className="flex items-center gap-3 min-w-0">
                   <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 overflow-hidden shrink-0 flex items-center justify-center">
                     {searchResult.photoUrl && (searchResult.photoUrl.startsWith('data:') || searchResult.photoUrl.startsWith('http')) ? (
                       <img src={searchResult.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                       <UserCircle className="w-5 h-5 text-emerald-300" />
                     )}
                   </div>
                   <div className="min-w-0 flex-1">
                     <h4 className="font-black text-slate-800 text-sm truncate">{searchResult.nameEnglish || searchResult.nameHindi}</h4>
                     <p className="text-[11px] text-slate-500 font-bold mt-0.5 truncate">
                       {searchResult.mobile} • {searchResult.farmerId}
                     </p>
                     <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider truncate">
                       Gen: {searchDetails.date} • Total: {searchDetails.total}
                     </p>
                   </div>
                 </div>
                 
                 <div className="flex gap-2 shrink-0">
                    <button
                      onClick={handleAutoFill}
                      className="flex-1 items-center justify-center gap-1.5 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg text-[11px] transition-colors flex"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      Auto Fill
                    </button>
                    <button
                      onClick={() => setShowPreviewModal(true)}
                      className="flex-1 items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-lg text-[11px] transition-colors flex"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                 </div>
               </div>
             )}
          </div>
        )}
      </section>
      )}

      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <UserCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Personal Details
            </h2>
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
              {isOcrProcessing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <ScanText className="w-3 h-3" />
              )}
              {isOcrProcessing ? "Scanning..." : "Auto-fill (OCR)"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1 col-span-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              State
            </label>
            <select
              name="state"
              value={data.state || "Bihar"}
              onChange={handleInputChange}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold bg-white"
            >
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Assam">Assam</option>
              <option value="Bihar">Bihar</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Kerala">Kerala</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Odisha">Odisha</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
            </select>
          </div>

          <div className="space-y-1 col-span-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Card Color
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'Default State Color', value: '' },
                { name: 'Green', value: 'green', bgColor: 'bg-[#8bc34a]' },
                { name: 'Red', value: 'red', bgColor: 'bg-[#dc2626]' },
                { name: 'Orange', value: 'orange', bgColor: 'bg-[#ea580c]' },
                { name: 'Blue', value: 'blue', bgColor: 'bg-[#0ea5e9]' },
                { name: 'Purple', value: 'purple', bgColor: 'bg-[#d946ef]' },
              ].map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => onChange({ ...data, cardColor: color.value })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all border ${
                    data.cardColor === color.value || (color.value === '' && !data.cardColor)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {color.bgColor && (
                    <span className={`w-4 h-4 rounded-full ${color.bgColor} shadow-sm border border-black/10`} />
                  )}
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
              Profile Photo
            </label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-4 p-3 border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50/30 hover:bg-emerald-50 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-emerald-100 shadow-sm overflow-hidden shrink-0 group-hover:border-emerald-300 group-hover:shadow transition-all relative">
                  {data.photoUrl ? (
                    <>
                      <img
                        src={data.photoUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                    </>
                  ) : (
                    <Camera className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 group-hover:scale-110 transition-all" />
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                    {data.photoUrl ? 'Change Photo' : 'Upload Profile Photo'}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Click to browse files (JPG, PNG)
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Farmer ID
            </label>
            <input
              name="farmerId"
              value={data.farmerId}
              onChange={handleInputChange}
              placeholder="Ex: 1234567890"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Aadhaar Number
            </label>
            <input
              name="aadhaar"
              value={data.aadhaar}
              onChange={handleInputChange}
              maxLength={12}
              placeholder="12 Digit Aadhaar"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                +91
              </span>
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Date of Birth
            </label>
            <input
              name="dob"
              value={data.dob}
              onChange={handleInputChange}
              placeholder="DD/MM/YYYY"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Name ({localLangLabel})
            </label>
            <input
              name="nameHindi"
              value={data.nameHindi}
              onChange={handleInputChange}
              placeholder={localNamePlaceholder}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Name (English)
            </label>
            <input
              name="nameEnglish"
              value={data.nameEnglish}
              onChange={handleInputChange}
              placeholder="NAME IN ENGLISH"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Gender
            </label>
            <select
              name="gender"
              value={data.gender}
              onChange={(e) => onChange({ ...data, gender: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Issue / Download Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                name="downloadDate"
                value={data.downloadDate === "0" ? "" : data.downloadDate}
                placeholder="DD/MM/YYYY"
                onChange={handleInputChange}
                className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold"
              />
            </div>
            <p className="text-[9px] text-slate-400 mt-1 italic">
              Leave empty to use current date
            </p>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Full Address
            </label>
            <textarea
              name="address"
              value={data.address}
              onChange={handleInputChange}
              placeholder="VILL-..., PO-..., DIST-..., STATE-BIHAR"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-sm font-bold h-20 resize-none"
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Land Records
            </h2>
          </div>
          <button
            onClick={addLandDetail}
            className="flex items-center gap-2 text-[10px] font-black uppercase bg-[#064e3b] text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition-all shadow-lg"
          >
            <Plus className="w-3 h-3" /> Add Plot
          </button>
        </div>

        <div className="space-y-4">
          {data.landDetails.map((land) => {
            const state = data.state || "Bihar";
            let availableDistricts = BIHAR_DISTRICTS;
            if (state === "Uttar Pradesh") availableDistricts = UP_DISTRICTS;
            if (state === "Maharashtra")
              availableDistricts = MAHARASHTRA_DISTRICTS;
            if (state === "Madhya Pradesh") availableDistricts = MP_DISTRICTS;
            if (state === "Rajasthan") availableDistricts = RAJASTHAN_DISTRICTS;
            if (state === "Kerala") availableDistricts = KERALA_DISTRICTS;
            if (state === "Chhattisgarh")
              availableDistricts = CHHATTISGARH_DISTRICTS;
            if (state === "Tamil Nadu")
              availableDistricts = TAMIL_NADU_DISTRICTS;
            if (state === "Gujarat") availableDistricts = GUJARAT_DISTRICTS;
            if (state === "Haryana") availableDistricts = HARYANA_DISTRICTS;
            if (state === "Punjab") availableDistricts = PUNJAB_DISTRICTS;
            if (state === "Andhra Pradesh")
              availableDistricts = ANDHRA_PRADESH_DISTRICTS;
            if (state === "Assam") availableDistricts = ASSAM_DISTRICTS;
            if (state === "Odisha") availableDistricts = ODISHA_DISTRICTS;
            if (state === "Jharkhand") availableDistricts = JHARKHAND_DISTRICTS;
            if (state === "Telangana") availableDistricts = TELANGANA_DISTRICTS;

            const isBihar = state === "Bihar";
            const availableBlocks =
              isBihar && land.district
                ? BIHAR_SUB_DISTRICTS[land.district] || []
                : [];

            return (
              <div
                key={land.id}
                className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 relative group hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                <button
                  onClick={() => removeLandDetail(land.id)}
                  className="absolute -top-2 -right-2 bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 border border-red-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase">
                      District
                    </label>
                    <select
                      value={land.district}
                      onChange={(e) =>
                        updateLandDetail(land.id, "district", e.target.value)
                      }
                      className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="">Select District</option>
                      {availableDistricts.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase">
                      Sub-District (Block/Tehsil)
                    </label>
                    {!isBihar ? (
                      <input
                        value={land.subDistrict}
                        onChange={(e) =>
                          updateLandDetail(
                            land.id,
                            "subDistrict",
                            e.target.value,
                          )
                        }
                        placeholder="Sub-District/Tehsil"
                        className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                      />
                    ) : (
                      <select
                        value={land.subDistrict}
                        disabled={!land.district}
                        onChange={(e) =>
                          updateLandDetail(
                            land.id,
                            "subDistrict",
                            e.target.value,
                          )
                        }
                        className={`text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-white ${!land.district ? "opacity-50 cursor-not-allowed italic" : ""}`}
                      >
                        <option value="">
                          {land.district
                            ? "Select Block"
                            : "Select District First"}
                        </option>
                        {availableBlocks.map((block) => (
                          <option key={block} value={block}>
                            {block}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase">
                      Village
                    </label>
                    <input
                      value={land.village}
                      onChange={(e) =>
                        updateLandDetail(land.id, "village", e.target.value)
                      }
                      placeholder="Village Name"
                      className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase">
                      M. Owner No. (Khata)
                    </label>
                    <input
                      value={land.mOwnerNo}
                      onChange={(e) =>
                        updateLandDetail(land.id, "mOwnerNo", e.target.value)
                      }
                      placeholder="Khata No"
                      className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase">
                      Khasra
                    </label>
                    <input
                      value={land.khasra}
                      onChange={(e) =>
                        updateLandDetail(land.id, "khasra", e.target.value)
                      }
                      placeholder="Plot No"
                      className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase">
                      Area (Acre)
                    </label>
                    <input
                      value={land.area}
                      onChange={(e) =>
                        updateLandDetail(land.id, "area", e.target.value)
                      }
                      placeholder="0.00"
                      className="text-xs p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 font-black text-emerald-700"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Preview Modal */}
      {showPreviewModal && searchResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
               <h3 className="font-black text-slate-800 flex items-center gap-2">
                 <Search className="w-4 h-4 text-emerald-600" /> Previous Card Preview
               </h3>
               <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                 <XCircle className="w-5 h-5 text-slate-500" />
               </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100/50">
               <div className="opacity-90 pointer-events-none origin-top flex items-center justify-center">
                   <div className="transform scale-[0.6] sm:scale-75 md:scale-100 transform-gpu">
                       <CardPreview data={searchResult} />
                   </div>
               </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex flex-wrap justify-end gap-3 rounded-b-3xl">
               <button onClick={() => setShowPreviewModal(false)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-xl transition-colors">
                 Close
               </button>
               <button onClick={() => { handleAutoFill(); setShowPreviewModal(false); }} className="px-6 py-2.5 bg-[#064e3b] hover:bg-emerald-800 font-bold text-white rounded-xl transition-colors flex items-center justify-center gap-2">
                 <FileCheck className="w-4 h-4" /> Use This Data
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerForm;

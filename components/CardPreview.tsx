import React, { useState, useEffect, useRef } from "react";
import { FarmerData } from "../types";
import QRCodeGen from "./QRCodeGen";
import { Sprout, Leaf, ShieldCheck } from "lucide-react";

interface CardPreviewProps {
  data: FarmerData;
  forceFullScale?: boolean; // Prop to override responsive scaling
}

interface ScaledCardProps {
  children: React.ReactNode;
  forceFullScale: boolean;
  scale: number;
}

const ScaledCard: React.FC<ScaledCardProps> = ({
  children,
  forceFullScale,
  scale,
}) => (
  <div
    className={`card-container-transition origin-top flex flex-col items-center ${!forceFullScale ? "print-force-scale" : ""}`}
    style={
      forceFullScale
        ? {
            width: "600px",
            height: "380px",
            marginBottom: "2rem",
          }
        : {
            transform: `scale(${scale})`,
            height: `${380 * scale}px`,
            width: "100%",
            marginBottom: "2.5rem",
          }
    }
  >
    {children}
  </div>
);

const CardPreview: React.FC<CardPreviewProps> = ({
  data,
  forceFullScale = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Government Logo URLs
  const biharLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Seal_of_Bihar.svg/960px-Seal_of_Bihar.svg.png";
  const upLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Seal_of_Uttar_Pradesh.svg/960px-Seal_of_Uttar_Pradesh.svg.png";
  const maharashtraLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Seal_of_Maharashtra.svg/960px-Seal_of_Maharashtra.svg.png";
  const mpLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Emblem_of_Madhya_Pradesh.svg/960px-Emblem_of_Madhya_Pradesh.svg.png";
  const rajasthanLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/1/1e/Emblem_Rajasthan.png";
  const keralaLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Government_of_Kerala_Logo.svg/1280px-Government_of_Kerala_Logo.svg.png";
  const chhattisgarhLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Coat_of_arms_of_Chhattisgarh.svg/960px-Coat_of_arms_of_Chhattisgarh.svg.png";
  const tamilNaduLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seal_of_Tamil_Nadu.svg/500px-Seal_of_Tamil_Nadu.svg.png";
  const gujaratLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Government_Of_Gujarat_Seal_In_All_Languages.svg/960px-Government_Of_Gujarat_Seal_In_All_Languages.svg.png";
  const haryanaLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Emblem_of_Haryana.svg/500px-Emblem_of_Haryana.svg.png";
  const punjabLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Seal_of_the_Government_Of_Punjab_%28Black_On_White%29.svg/500px-Seal_of_the_Government_Of_Punjab_%28Black_On_White%29.svg.png";
  const andhraPradeshLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Emblem_of_Andhra_Pradesh.svg/500px-Emblem_of_Andhra_Pradesh.svg.png";
  const assamLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Seal_of_Assam.svg/500px-Seal_of_Assam.svg.png";
  const odishaLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Seal_of_Odisha.svg/330px-Seal_of_Odisha.svg.png";
  const jharkhandLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Jharkhand_Rajakiya_Chihna.svg/500px-Jharkhand_Rajakiya_Chihna.svg.png";
  const telanganaLogoUrl =
    "https://upload.wikimedia.org/wikipedia/en/thumb/6/61/Emblem_of_Telangana.svg/500px-Emblem_of_Telangana.svg.png";

  let logoUrl = biharLogoUrl;
  let stateNameHi = "बिहार सरकार";
  let stateNameEn = "Govt. of Bihar";
  let bgTheme = "bg-gradient-to-r from-[#8bc34a] to-[#cddc39]";
  let headerTheme = "bg-[#064e3b]";
  let textTheme = "text-[#064e3b]";
  let borderColorTheme = "border-[#064e3b]";
  let highlightColorTheme = "text-[#cddc39]";
  let highlightTopTheme = "bg-[#8bc34a]";
  let lightBorderTheme = "border-emerald-100";
  let lightBgTheme = "bg-emerald-50";
  let lightBgHoverTheme = "bg-emerald-50/30";
  let lightDivideTheme = "divide-emerald-50";
  let lightTextTheme = "text-emerald-900";
  let footerGradient = "from-[#064e3b] via-[#085a44] to-[#064e3b]";
  let footerBorderTheme = "border-[#cddc39]/30";
  let footerDividerTheme = "bg-[#cddc39]/20";
  let watermarkOpacity = "opacity-[0.04] grayscale";

  switch (data.state) {
    case "Uttar Pradesh":
      logoUrl = upLogoUrl;
      stateNameHi = "उत्तर प्रदेश सरकार";
      stateNameEn = "Govt. of Uttar Pradesh";
      bgTheme = "bg-gradient-to-r from-[#d97706] to-[#f59e0b]";
      headerTheme = "bg-[#78350f]";
      textTheme = "text-[#78350f]";
      borderColorTheme = "border-[#78350f]";
      highlightColorTheme = "text-[#fcd34d]";
      highlightTopTheme = "bg-[#d97706]";
      lightBorderTheme = "border-amber-100";
      lightBgTheme = "bg-amber-50";
      lightBgHoverTheme = "bg-amber-50/30";
      lightDivideTheme = "divide-amber-50";
      lightTextTheme = "text-amber-900";
      footerGradient = "from-[#78350f] via-[#92400e] to-[#78350f]";
      footerBorderTheme = "border-[#fcd34d]/30";
      footerDividerTheme = "bg-[#fcd34d]/20";
      watermarkOpacity = "opacity-[0.05] grayscale";
      break;
    case "Maharashtra":
      logoUrl = maharashtraLogoUrl;
      stateNameHi = "महाराष्ट्र शासन";
      stateNameEn = "Govt. of Maharashtra";
      bgTheme = "bg-gradient-to-r from-[#ea580c] to-[#f97316]";
      headerTheme = "bg-[#9a3412]";
      textTheme = "text-[#9a3412]";
      borderColorTheme = "border-[#9a3412]";
      highlightColorTheme = "text-[#fdba74]";
      highlightTopTheme = "bg-[#ea580c]";
      lightBorderTheme = "border-orange-100";
      lightBgTheme = "bg-orange-50";
      lightBgHoverTheme = "bg-orange-50/30";
      lightDivideTheme = "divide-orange-50";
      lightTextTheme = "text-orange-900";
      footerGradient = "from-[#9a3412] via-[#c2410c] to-[#9a3412]";
      footerBorderTheme = "border-[#fdba74]/30";
      footerDividerTheme = "bg-[#fdba74]/20";
      watermarkOpacity = "opacity-[0.08]"; // Removed grayscale and increased opacity for thin yellow log
      break;
    case "Madhya Pradesh":
      logoUrl = mpLogoUrl;
      stateNameHi = "मध्य प्रदेश शासन";
      stateNameEn = "Govt. of Madhya Pradesh";
      bgTheme = "bg-gradient-to-r from-[#dc2626] to-[#ef4444]";
      headerTheme = "bg-[#7f1d1d]";
      textTheme = "text-[#7f1d1d]";
      borderColorTheme = "border-[#7f1d1d]";
      highlightColorTheme = "text-[#fca5a5]";
      highlightTopTheme = "bg-[#dc2626]";
      lightBorderTheme = "border-red-100";
      lightBgTheme = "bg-red-50";
      lightBgHoverTheme = "bg-red-50/30";
      lightDivideTheme = "divide-red-50";
      lightTextTheme = "text-red-900";
      footerGradient = "from-[#7f1d1d] via-[#991b1b] to-[#7f1d1d]";
      footerBorderTheme = "border-[#fca5a5]/30";
      footerDividerTheme = "bg-[#fca5a5]/20";
      watermarkOpacity = "opacity-[0.05] grayscale";
      break;
    case "Rajasthan":
      logoUrl = rajasthanLogoUrl;
      stateNameHi = "राजस्थान सरकार";
      stateNameEn = "Govt. of Rajasthan";
      bgTheme = "bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]";
      headerTheme = "bg-[#0c4a6e]";
      textTheme = "text-[#0c4a6e]";
      borderColorTheme = "border-[#0c4a6e]";
      highlightColorTheme = "text-[#7dd3fc]";
      highlightTopTheme = "bg-[#0ea5e9]";
      lightBorderTheme = "border-sky-100";
      lightBgTheme = "bg-sky-50";
      lightBgHoverTheme = "bg-sky-50/30";
      lightDivideTheme = "divide-sky-50";
      lightTextTheme = "text-sky-900";
      footerGradient = "from-[#0c4a6e] via-[#075985] to-[#0c4a6e]";
      footerBorderTheme = "border-[#7dd3fc]/30";
      footerDividerTheme = "bg-[#7dd3fc]/20";
      watermarkOpacity = "opacity-[0.04] grayscale";
      break;
    case "Kerala":
      logoUrl = keralaLogoUrl;
      stateNameHi = "കേരള സർക്കാർ";
      stateNameEn = "Govt. of Kerala";
      bgTheme = "bg-gradient-to-r from-[#d946ef] to-[#e879f9]";
      headerTheme = "bg-[#701a75]";
      textTheme = "text-[#701a75]";
      borderColorTheme = "border-[#701a75]";
      highlightColorTheme = "text-[#f0abfc]";
      highlightTopTheme = "bg-[#d946ef]";
      lightBorderTheme = "border-fuchsia-100";
      lightBgTheme = "bg-fuchsia-50";
      lightBgHoverTheme = "bg-fuchsia-50/30";
      lightDivideTheme = "divide-fuchsia-50";
      lightTextTheme = "text-fuchsia-900";
      footerGradient = "from-[#701a75] via-[#86198f] to-[#701a75]";
      footerBorderTheme = "border-[#f0abfc]/30";
      footerDividerTheme = "bg-[#f0abfc]/20";
      watermarkOpacity = "opacity-[0.05] grayscale";
      break;
    case "Chhattisgarh":
      logoUrl = chhattisgarhLogoUrl;
      stateNameHi = "छत्तीसगढ़ शासन";
      stateNameEn = "Govt. of Chhattisgarh";
      bgTheme = "bg-gradient-to-r from-[#10b981] to-[#34d399]";
      headerTheme = "bg-[#064e3b]";
      textTheme = "text-[#064e3b]";
      borderColorTheme = "border-[#064e3b]";
      highlightColorTheme = "text-[#6ee7b7]";
      highlightTopTheme = "bg-[#10b981]";
      lightBorderTheme = "border-emerald-100";
      lightBgTheme = "bg-emerald-50";
      lightBgHoverTheme = "bg-emerald-50/30";
      lightDivideTheme = "divide-emerald-50";
      lightTextTheme = "text-emerald-900";
      footerGradient = "from-[#064e3b] via-[#047857] to-[#064e3b]";
      footerBorderTheme = "border-[#6ee7b7]/30";
      footerDividerTheme = "bg-[#6ee7b7]/20";
      watermarkOpacity = "opacity-[0.05] grayscale";
      break;
    case "Tamil Nadu":
      logoUrl = tamilNaduLogoUrl;
      stateNameHi = "தமிழ்நாடு அரசு";
      stateNameEn = "Govt. of Tamil Nadu";
      bgTheme = "bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]";
      headerTheme = "bg-[#78350f]";
      textTheme = "text-[#78350f]";
      borderColorTheme = "border-[#78350f]";
      highlightColorTheme = "text-[#fcd34d]";
      highlightTopTheme = "bg-[#f59e0b]";
      lightBorderTheme = "border-amber-100";
      lightBgTheme = "bg-amber-50";
      lightBgHoverTheme = "bg-amber-50/30";
      lightDivideTheme = "divide-amber-50";
      lightTextTheme = "text-amber-900";
      footerGradient = "from-[#78350f] via-[#92400e] to-[#78350f]";
      footerBorderTheme = "border-[#fcd34d]/30";
      footerDividerTheme = "bg-[#fcd34d]/20";
      watermarkOpacity = "opacity-[0.05] grayscale";
      break;
    case "Gujarat":
      logoUrl = gujaratLogoUrl;
      stateNameHi = "ગુજરાત સરકાર";
      stateNameEn = "Govt. of Gujarat";
      bgTheme = "bg-gradient-to-r from-[#ea580c] to-[#f97316]";
      headerTheme = "bg-[#7c2d12]";
      textTheme = "text-[#7c2d12]";
      borderColorTheme = "border-[#7c2d12]";
      highlightColorTheme = "text-[#ffedd5]";
      highlightTopTheme = "bg-[#ea580c]";
      lightBorderTheme = "border-orange-100";
      lightBgTheme = "bg-orange-50";
      lightBgHoverTheme = "bg-orange-50/30";
      lightDivideTheme = "divide-orange-50";
      lightTextTheme = "text-orange-900";
      footerGradient = "from-[#7c2d12] via-[#ea580c] to-[#7c2d12]";
      footerBorderTheme = "border-[#ffedd5]/30";
      footerDividerTheme = "bg-[#ffedd5]/20";
      watermarkOpacity = "opacity-[0.05] grayscale";
      break;
    case "Haryana":
      logoUrl = haryanaLogoUrl;
      stateNameHi = "हरियाणा सरकार";
      stateNameEn = "Govt. of Haryana";
      bgTheme = "bg-gradient-to-r from-[#059669] to-[#10b981]";
      headerTheme = "bg-[#064e3b]";
      textTheme = "text-[#064e3b]";
      borderColorTheme = "border-[#064e3b]";
      highlightColorTheme = "text-[#a7f3d0]";
      highlightTopTheme = "bg-[#059669]";
      lightBorderTheme = "border-emerald-100";
      lightBgTheme = "bg-emerald-50";
      lightBgHoverTheme = "bg-emerald-50/30";
      lightDivideTheme = "divide-emerald-50";
      lightTextTheme = "text-emerald-900";
      footerGradient = "from-[#064e3b] via-[#047857] to-[#064e3b]";
      footerBorderTheme = "border-[#a7f3d0]/30";
      footerDividerTheme = "bg-[#a7f3d0]/20";
      watermarkOpacity = "opacity-[0.05] grayscale";
      break;
    case "Punjab":
      logoUrl = punjabLogoUrl;
      stateNameHi = "ਪੰਜਾਬ ਸਰਕਾਰ";
      stateNameEn = "Govt. of Punjab";
      bgTheme = "bg-gradient-to-r from-[#d97706] to-[#f59e0b]";
      headerTheme = "bg-[#78350f]";
      textTheme = "text-[#78350f]";
      borderColorTheme = "border-[#78350f]";
      highlightColorTheme = "text-[#fef3c7]";
      highlightTopTheme = "bg-[#d97706]";
      lightBorderTheme = "border-amber-100";
      lightBgTheme = "bg-amber-50";
      lightBgHoverTheme = "bg-amber-50/30";
      lightDivideTheme = "divide-amber-50";
      lightTextTheme = "text-amber-900";
      footerGradient = "from-[#78350f] via-[#92400e] to-[#78350f]";
      footerBorderTheme = "border-[#fef3c7]/30";
      footerDividerTheme = "bg-[#fef3c7]/20";
      watermarkOpacity = "opacity-[0.05] grayscale";
      break;
    case "Andhra Pradesh":
      logoUrl = andhraPradeshLogoUrl;
      stateNameHi = "ఆంధ్రప్రదేశ్ ప్రభుత్వం";
      stateNameEn = "Govt. of Andhra Pradesh";
      bgTheme = "bg-gradient-to-r from-[#0d9488] to-[#14b8a6]";
      headerTheme = "bg-[#115e59]";
      textTheme = "text-[#115e59]";
      borderColorTheme = "border-[#115e59]";
      highlightColorTheme = "text-[#ccfbf1]";
      highlightTopTheme = "bg-[#0d9488]";
      lightBorderTheme = "border-teal-100";
      lightBgTheme = "bg-teal-50";
      lightBgHoverTheme = "bg-teal-50/30";
      lightDivideTheme = "divide-teal-50";
      lightTextTheme = "text-teal-900";
      footerGradient = "from-[#115e59] via-[#0f766e] to-[#115e59]";
      footerBorderTheme = "border-[#ccfbf1]/30";
      footerDividerTheme = "bg-[#ccfbf1]/20";
      watermarkOpacity = "opacity-[0.05] grayscale";
      break;
    case "Assam":
      logoUrl = assamLogoUrl;
      stateNameHi = "অসম চৰকাৰ";
      stateNameEn = "Govt. of Assam";
      bgTheme = "bg-gradient-to-r from-[#e11d48] to-[#f43f5e]";
      headerTheme = "bg-[#881337]";
      textTheme = "text-[#881337]";
      borderColorTheme = "border-[#881337]";
      highlightColorTheme = "text-[#ffe4e6]";
      highlightTopTheme = "bg-[#e11d48]";
      lightBorderTheme = "border-rose-100";
      lightBgTheme = "bg-rose-50";
      lightBgHoverTheme = "bg-rose-50/30";
      lightDivideTheme = "divide-rose-50";
      lightTextTheme = "text-rose-900";
      footerGradient = "from-[#881337] via-[#be123c] to-[#881337]";
      footerBorderTheme = "border-[#ffe4e6]/30";
      footerDividerTheme = "bg-[#ffe4e6]/20";
      watermarkOpacity = "opacity-[0.05] grayscale";
      break;
    case "Odisha":
      logoUrl = odishaLogoUrl;
      stateNameHi = "ଓଡ଼ିଶା ସରକାର";
      stateNameEn = "Govt. of Odisha";
      bgTheme = "bg-gradient-to-r from-[#4f46e5] to-[#6366f1]";
      headerTheme = "bg-[#1e1b4b]";
      textTheme = "text-[#1e1b4b]";
      borderColorTheme = "border-[#1e1b4b]";
      highlightColorTheme = "text-[#e0e7ff]";
      highlightTopTheme = "bg-[#4f46e5]";
      lightBorderTheme = "border-indigo-100";
      lightBgTheme = "bg-indigo-50";
      lightBgHoverTheme = "bg-indigo-50/30";
      lightDivideTheme = "divide-indigo-50";
      lightTextTheme = "text-indigo-900";
      footerGradient = "from-[#1e1b4b] via-[#3730a3] to-[#1e1b4b]";
      footerBorderTheme = "border-[#e0e7ff]/30";
      footerDividerTheme = "bg-[#e0e7ff]/20";
      watermarkOpacity = "opacity-[0.05] grayscale";
      break;
    case "Jharkhand":
      logoUrl = jharkhandLogoUrl;
      stateNameHi = "झारखण्ड सरकार";
      stateNameEn = "Govt. of Jharkhand";
      bgTheme = "bg-gradient-to-r from-[#15803d] to-[#22c55e]";
      headerTheme = "bg-[#14532d]";
      textTheme = "text-[#14532d]";
      borderColorTheme = "border-[#14532d]";
      highlightColorTheme = "text-[#dcfce7]";
      highlightTopTheme = "bg-[#15803d]";
      lightBorderTheme = "border-green-100";
      lightBgTheme = "bg-green-50";
      lightBgHoverTheme = "bg-green-50/30";
      lightDivideTheme = "divide-green-50";
      lightTextTheme = "text-green-900";
      footerGradient = "from-[#14532d] via-[#15803d] to-[#14532d]";
      footerBorderTheme = "border-[#dcfce7]/30";
      footerDividerTheme = "bg-[#dcfce7]/20";
      watermarkOpacity = "opacity-[0.05] grayscale";
      break;
    case "Telangana":
      logoUrl = telanganaLogoUrl;
      stateNameHi = "తెలంగాణ ప్రభుత్వం";
      stateNameEn = "Govt. of Telangana";
      bgTheme = "bg-gradient-to-r from-[#ec4899] to-[#f472b6]";
      headerTheme = "bg-[#831843]";
      textTheme = "text-[#831843]";
      borderColorTheme = "border-[#831843]";
      highlightColorTheme = "text-[#fce7f3]";
      highlightTopTheme = "bg-[#ec4899]";
      lightBorderTheme = "border-pink-100";
      lightBgTheme = "bg-pink-50";
      lightBgHoverTheme = "bg-pink-50/30";
      lightDivideTheme = "divide-pink-50";
      lightTextTheme = "text-pink-900";
      footerGradient = "from-[#831843] via-[#9d174d] to-[#831843]";
      footerBorderTheme = "border-[#fce7f3]/30";
      footerDividerTheme = "bg-[#fce7f3]/20";
      watermarkOpacity = "opacity-[0.05] grayscale";
      break;
  }

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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [forceFullScale]);

  const displayIssueDate =
    !data.downloadDate ||
    data.downloadDate === "0" ||
    data.downloadDate.trim() === ""
      ? new Date().toLocaleDateString("en-GB")
      : data.downloadDate;

  // Formatting Land Details for QR Code
  const landInfo = data.landDetails
    .filter((l) => l.district || l.mOwnerNo || l.khasra) // Filter out empty entries
    .map(
      (l, i) =>
        `P${i + 1}: ${l.district}/${l.subDistrict}, V:${l.village}, Khata:${l.mOwnerNo}, Khasra:${l.khasra}, Area:${l.area}`,
    )
    .join(" | ");

  const qrValue = `Name: ${data.nameEnglish}\nID: ${data.farmerId}\nDOB: ${data.dob}\nMob: ${data.mobile}\nAddr: ${data.address}\nLand: ${landInfo}\nIssued: ${displayIssueDate}`;

  const currentScale = forceFullScale ? 1 : scale;

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center card-preview-container"
    >
      {/* Front Side */}
      <ScaledCard forceFullScale={forceFullScale} scale={currentScale}>
        <div className="card-ratio bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden border border-gray-200 relative card-pattern select-none">
          {/* Transparent Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <img
              src={logoUrl}
              alt="State Watermark"
              crossOrigin="anonymous"
              className={`w-[300px] h-[300px] object-contain ${watermarkOpacity}`}
            />
          </div>

          <div
            className={`absolute top-0 left-0 right-0 h-1 ${highlightTopTheme}`}
          ></div>

          <div
            className={`${headerTheme} text-white px-5 py-3 flex justify-between items-center h-[68px] shadow-md relative z-10`}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg shadow-inner">
                <Sprout className={`w-8 h-8 ${textTheme}`} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black italic leading-none tracking-tight">
                  Agri<span className={highlightColorTheme}>record</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80 mt-0.5">
                  Farmer Identity Card
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end justify-center mr-2 gap-0.5">
                <span
                  className={`text-[9px] font-bold ${highlightColorTheme} uppercase tracking-tighter leading-snug`}
                >
                  {stateNameHi}
                </span>
                <span className="text-[7px] text-white/60 uppercase leading-snug">
                  {stateNameEn}
                </span>
              </div>
              <div className="bg-white p-1 rounded-full shadow-lg">
                <img
                  src={logoUrl}
                  alt="State Govt"
                  crossOrigin="anonymous"
                  className="w-10 h-10 object-contain"
                />
              </div>
            </div>
          </div>

          <div className="flex p-5 gap-6 h-[calc(100%-145px)] relative z-10">
            <div className="flex flex-col gap-3 items-center">
              <div
                className={`w-[120px] h-[150px] border-[3px] ${borderColorTheme} rounded-md overflow-hidden bg-gray-50 flex items-center justify-center shadow-lg relative`}
              >
                {data.photoUrl ? (
                  <img
                    src={data.photoUrl}
                    alt="Farmer"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-300 w-16 h-16 flex items-center justify-center">
                    <Leaf className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow-sm">
                  <img
                    src={logoUrl}
                    crossOrigin="anonymous"
                    className="w-4 h-4 object-contain drop-shadow-sm"
                    alt="seal"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src="https://img.icons8.com/color/48/leaf.png"
                  className="w-6 h-6 opacity-20 rotate-45"
                  alt="leaf"
                />
                <span className="text-[9px] font-black text-emerald-900/40 uppercase tracking-tighter">
                  Verified Member
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-start pt-1">
              <div className="mb-4">
                <span
                  className={`text-[11px] font-extrabold ${textTheme} uppercase block tracking-widest`}
                >
                  Name / नाम
                </span>
                <div className="flex flex-col leading-tight mt-1">
                  <span className="text-2xl font-black text-slate-900">
                    {data.nameHindi}
                  </span>
                  <span className="text-base font-bold text-slate-500 uppercase tracking-wide">
                    {data.nameEnglish}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div className="flex flex-col">
                  <span
                    className={`text-[9px] font-black ${textTheme} uppercase leading-tight`}
                  >
                    Date of Birth / जन्म तिथि
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {data.dob}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-[9px] font-black ${textTheme} uppercase leading-tight`}
                  >
                    Gender / लिंग
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {data.gender}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-[9px] font-black ${textTheme} uppercase leading-tight`}
                  >
                    Aadhaar No. / आधार
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {data.aadhaar.replace(/(\d{4})/g, "$1 ")}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-[9px] font-black ${textTheme} uppercase leading-tight`}
                  >
                    Mobile / मोबाइल
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    +91 {data.mobile}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-start py-1">
              <div className="bg-white p-1.5 rounded-xl shadow-md border border-gray-100 mt-1">
                <QRCodeGen value={qrValue} size={85} />
              </div>
            </div>

            <div className="absolute bottom-2 right-5 flex items-center gap-1.5">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                Issue Date:
              </span>
              <span className="text-[10px] font-black text-slate-600 tracking-wider">
                {displayIssueDate}
              </span>
            </div>
          </div>

          {/* Full-width Bottom ID Bar with Swapped Positions and Adjusted Vertical Spacing to shift text UP */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-r ${footerGradient} text-white pt-3 pb-16 flex justify-center items-center shadow-[0_-8px_25px_rgba(0,0,0,0.2)] relative z-10 border-t ${footerBorderTheme}`}
          >
            <div className="absolute left-6 opacity-20">
              <ShieldCheck className={`w-8 h-8 ${highlightColorTheme}`} />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              {/* Farmer ID Number on Top */}
              <span className="text-3xl font-black tracking-[0.3em] drop-shadow-xl text-white font-mono leading-none">
                {data.farmerId}
              </span>

              {/* Label on Bottom with Line Accents - Moved even further up by pb-16 */}
              <div className="flex items-center gap-3">
                <span className={`w-8 h-[1px] ${footerDividerTheme}`}></span>
                <span
                  className={`text-[8px] font-black uppercase tracking-[0.25em] ${highlightColorTheme} drop-shadow-sm whitespace-nowrap`}
                >
                  Digital Farmer ID / डिजिटल किसान आईडी
                </span>
                <span className={`w-8 h-[1px] ${footerDividerTheme}`}></span>
              </div>
            </div>
            <div className="absolute right-6 opacity-20 rotate-12">
              <Sprout className={`w-8 h-8 ${highlightColorTheme}`} />
            </div>
          </div>
        </div>
      </ScaledCard>

      {/* Back Side */}
      <ScaledCard forceFullScale={forceFullScale} scale={currentScale}>
        <div className="card-ratio bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden border border-gray-200 p-6 flex flex-col relative card-pattern select-none">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <img
              src={logoUrl}
              alt="State Watermark"
              crossOrigin="anonymous"
              className={`w-[300px] h-[300px] object-contain ${watermarkOpacity}`}
            />
          </div>

          <div
            className={`absolute top-0 left-0 right-0 h-1 ${highlightTopTheme}`}
          ></div>

          <div className="flex justify-between items-start mb-5 border-b pb-3 border-emerald-100 relative z-10">
            <div className="flex-1 pr-12">
              <h3
                className={`${textTheme} font-black text-[11px] mb-1.5 uppercase tracking-widest`}
              >
                Permanent Address / स्थायी पता
              </h3>
              <p className="text-[12.5px] text-slate-800 leading-relaxed font-bold">
                {data.address}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <img
                src={logoUrl}
                crossOrigin="anonymous"
                className="w-12 h-12 opacity-20 grayscale"
                alt="State seal"
              />
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative z-10">
            <h3
              className={`${textTheme} font-black text-[11px] mb-2.5 uppercase tracking-widest flex items-center gap-2`}
            >
              <img
                src={logoUrl}
                crossOrigin="anonymous"
                className="w-4 h-4"
                alt="seal"
              />{" "}
              Land Records / भूमि का विवरण
            </h3>
            <div
              className={`rounded-xl overflow-hidden border ${lightBorderTheme} shadow-sm bg-white/50`}
            >
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr
                    className={`${lightBgTheme} ${textTheme} font-black border-b ${lightBorderTheme}`}
                  >
                    <th className="px-3 py-2.5">District</th>
                    <th className="px-3 py-2.5">Sub-District</th>
                    <th className="px-3 py-2.5">Village</th>
                    <th className="px-3 py-2.5">M. Owner No.</th>
                    <th className="px-3 py-2.5">Khasra</th>
                    <th className="px-3 py-2.5 text-right">Area</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${lightDivideTheme}`}>
                  {data.landDetails.map((land, idx) => (
                    <tr
                      key={land.id}
                      className={
                        idx % 2 === 0 ? "bg-white/70" : lightBgHoverTheme
                      }
                    >
                      <td className="px-3 py-2.5 text-slate-900 font-bold">
                        {land.district}
                      </td>
                      <td className="px-3 py-2.5 text-slate-800 font-medium">
                        {land.subDistrict}
                      </td>
                      <td className="px-3 py-2.5 text-slate-800 font-medium">
                        {land.village}
                      </td>
                      <td className="px-3 py-2.5 text-slate-950 font-black">
                        {land.mOwnerNo}
                      </td>
                      <td className="px-3 py-2.5 text-slate-950 font-black">
                        {land.khasra}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-right font-black ${lightTextTheme}`}
                      >
                        {land.area}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className={`mt-4 flex justify-between items-end border-t pt-2 ${lightBorderTheme} relative z-10`}
          >
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-black ${textTheme} uppercase tracking-tighter`}
                >
                  Issued On: {displayIssueDate}
                </span>
              </div>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
                Digital card generated via Agri Record Management System. Verify
                using QR code.
              </span>
              <span className="text-[8px] text-slate-500 font-medium uppercase tracking-tighter italic">
                यह डिजिटल कार्ड कृषि रिकॉर्ड प्रबंधन प्रणाली के माध्यम से तैयार
                किया गया है।
              </span>
            </div>
            <div className="flex gap-2 opacity-10 pb-1">
              <Leaf className={`w-4 h-4 ${textTheme}`} />
              <Leaf className={`w-4 h-4 ${textTheme}`} />
            </div>
          </div>
        </div>
      </ScaledCard>
    </div>
  );
};

export default CardPreview;

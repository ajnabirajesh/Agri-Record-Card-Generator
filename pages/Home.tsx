
import React, { useState } from 'react';
import { FarmerData, INITIAL_FARMER_DATA } from '../types';
import FarmerForm from '../components/FarmerForm';
import CardPreview from '../components/CardPreview';
import { Printer, Download, Leaf, FileText, Info, Loader2, CheckCircle2, Youtube, Heart, Lock, AlertCircle, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Home: React.FC = () => {
  const [farmerData, setFarmerData] = useState<FarmerData>(INITIAL_FARMER_DATA);
  const [hasPaid, setHasPaid] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const { user, isAdmin, signIn, signOut } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Check if the prompt was saved globally by the floating component
    if ((window as any).__DEFERRED_PROMPT__) {
      setDeferredPrompt((window as any).__DEFERRED_PROMPT__);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__DEFERRED_PROMPT__ = e;
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      (window as any).__DEFERRED_PROMPT__ = null;
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        if (!hasPaid && !isAdmin) {
          e.preventDefault();
          alert("Please complete the payment of ₹11 to print or save the ID card.");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPaid, isAdmin]);

  const handlePayment = async (onSuccess: () => void) => {
    if (!user) {
      alert("Please log in first to generate and save your card permanently.");
      try {
        await signIn();
      } catch (e) {
        return;
      }
    }

    if (hasPaid) {
      onSuccess();
      return;
    }

    if (isAdmin) {
      try {
        await addDoc(collection(db, 'cards'), {
          userId: user.uid,
          userEmail: user.email,
          farmerData: JSON.stringify(farmerData),
          transactionId: `admin_bypass_${Date.now()}`,
          createdAt: serverTimestamp()
        });
        setHasPaid(true);
        onSuccess();
      } catch (err) {
        console.error("Error saving card as admin:", err);
        alert("Admin save failed.");
      }
      return;
    }

    setIsProcessingPayment(true);
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: 11 }), // 11 INR
      });

      const order = await response.json();

      if (order.error) {
        alert("Payment Error: " + order.error + "\n\nPlease configure Razorpay keys in AI Studio environment variables (VITE_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET).");
        setIsProcessingPayment(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Agri Record",
        description: "Farmer Card Generation Fee",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Save to Firestore
            if (user) {
              await addDoc(collection(db, 'cards'), {
                userId: user.uid,
                userEmail: user.email,
                farmerData: JSON.stringify(farmerData),
                transactionId: response.razorpay_payment_id || order.id,
                createdAt: serverTimestamp()
              });
            }
            setHasPaid(true);
            onSuccess();
          } catch (err) {
            console.error("Error saving card to database:", err);
            alert("Payment was successful, but there was an error saving your card to the database. Please contact support.");
            setHasPaid(true);
            onSuccess();
          }
        },
        prefill: {
          name: farmerData.nameEnglish || farmerData.nameHindi || "Farmer",
          contact: "9999999999",
        },
        theme: {
          color: "#064e3b"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        alert("Payment Failed. Please try again.");
      });
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Ensure the server is running.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePrint = () => {
    handlePayment(() => {
      setShowPrintConfirm(true);
    });
  };

  const handleSaveAsPDF = () => {
    handlePayment(() => {
      setShowPrintConfirm(true);
    });
  };

  const confirmPrint = () => {
    setShowPrintConfirm(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const isPrintBlocked = !hasPaid && !isAdmin;

  return (
    <div className={`min-h-screen bg-[#f8fafc] flex flex-col ${isPrintBlocked ? 'print-blocked' : ''}`}>
      {/* Print Block Overlay */}
      {isPrintBlocked && (
        <div className="hidden print:flex fixed inset-0 z-[9999] bg-white items-center justify-center text-center p-10">
          <h1 className="text-3xl font-black text-[#064e3b]">
            Please complete the payment of ₹11 to print or save the ID card.
          </h1>
        </div>
      )}

      {/* Header */}
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
             {user ? (
               <div className="flex items-center gap-2">
                 {isAdmin && (
                   <Link 
                     to="/admin"
                     className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold p-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all border border-purple-500 active:scale-95"
                   >
                     <span className="hidden lg:inline text-xs uppercase tracking-wider">Admin</span>
                   </Link>
                 )}
                 <Link 
                   to="/my-cards"
                   className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold p-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all border border-emerald-600 active:scale-95"
                 >
                   <UserIcon className="w-3.5 h-3.5 md:w-4 h-4" />
                   <span className="hidden lg:inline text-xs uppercase tracking-wider">My Cards</span>
                 </Link>
                 <button 
                   onClick={signOut}
                   className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600 text-white font-bold p-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all border border-red-600/30 active:scale-95"
                 >
                   <LogOut className="w-3.5 h-3.5 md:w-4 h-4" />
                   <span className="hidden lg:inline text-xs uppercase tracking-wider">Logout</span>
                 </button>
               </div>
             ) : (
               <button 
                 onClick={signIn}
                 className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold p-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all border border-emerald-600 active:scale-95"
               >
                 <LogIn className="w-3.5 h-3.5 md:w-4 h-4" />
                 <span className="hidden lg:inline text-xs uppercase tracking-wider">Login</span>
               </button>
             )}

             <button 
                onClick={handlePrint}
                title="Print"
                disabled={isProcessingPayment}
                className="group flex flex-col items-center justify-center bg-emerald-700/50 hover:bg-emerald-700 text-white font-bold p-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all border border-emerald-600 active:scale-95 disabled:opacity-50"
             >
               <div className="flex items-center gap-2">
                 {isProcessingPayment ? <Loader2 className="w-3.5 h-3.5 md:w-4 h-4 animate-spin" /> : (hasPaid ? <Printer className="w-3.5 h-3.5 md:w-4 h-4" /> : <Lock className="w-3.5 h-3.5 md:w-4 h-4" />)}
                 <span className="hidden md:inline text-xs uppercase tracking-wider">{hasPaid ? 'Print' : 'Pay & Print'}</span>
               </div>
               {!hasPaid && <span className="text-[8px] md:text-[10px] text-emerald-200 mt-0.5">₹11 Only</span>}
             </button>

             <button 
                onClick={handleSaveAsPDF}
                disabled={isProcessingPayment}
                className="group flex flex-col items-center justify-center bg-[#cddc39] hover:bg-[#dce775] text-[#064e3b] font-extrabold px-2.5 py-1.5 md:px-6 md:py-2 rounded-lg md:rounded-xl transition-all shadow-xl shadow-emerald-950/20 active:scale-95 disabled:opacity-50"
             >
               <div className="flex items-center gap-2">
                 {isProcessingPayment ? <Loader2 className="w-3.5 h-3.5 md:w-5 h-5 animate-spin" /> : (hasPaid ? <Download className="w-3.5 h-3.5 md:w-5 h-5 group-hover:-translate-y-1 transition-transform" /> : <Lock className="w-3.5 h-3.5 md:w-5 h-5 group-hover:-translate-y-1 transition-transform" />)}
                 <span className="text-[9px] md:text-base uppercase tracking-tight md:tracking-normal font-black">
                   {hasPaid ? 'SAVE' : 'PAY & SAVE'}
                 </span>
               </div>
               {!hasPaid && <span className="text-[8px] md:text-[10px] text-emerald-800 mt-0.5">₹11 Only</span>}
             </button>
          </div>
        </div>
      </header>

      {/* Main UI */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        
        {/* Intro Banner with Tagline and Description */}
        <div className="no-print col-span-1 lg:col-span-12 bg-gradient-to-r from-emerald-900 via-[#064e3b] to-emerald-950 text-white p-6 md:p-8 rounded-3xl border border-emerald-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10 max-w-4xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/40 border border-emerald-700/60 text-[10px] md:text-xs font-bold uppercase tracking-wider text-emerald-300 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cddc39] animate-pulse"></span>
              Digital Agriculture Platform
            </div>
            <h2 className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight">
              Agri Record Card Generator Pro
            </h2>
            <p className="text-xs md:text-sm font-bold text-[#cddc39] border-l-2 border-[#cddc39] pl-3 leading-relaxed">
              "किसानों के डिजिटल रिकॉर्ड का भरोसेमंद समाधान – Fast, Secure & Professional." 🚜📱
            </p>
            <p className="text-emerald-100/95 text-xs md:text-sm leading-relaxed max-w-3xl font-medium">
              🌾 Agri Record Card Generator Pro एक भरोसेमंद Digital Tool है, जहाँ Farmer Record Card और Agriculture ID Card कुछ ही मिनटों में तैयार किए जा सकते हैं। Fast, Secure और User-Friendly Platform।
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="inline-flex items-center gap-2 bg-[#cddc39] hover:bg-[#b8c634] text-emerald-950 font-black px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(205,220,57,0.3)] active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  Install App (PWA)
                </button>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  alert('APK version abhi uplabdh nahi hai. Kripya "Install App (PWA)" button ka upyog karein.');
                }}
                className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white font-black px-5 py-2.5 rounded-xl transition-all active:scale-95 border border-emerald-600 shadow-sm"
              >
                <Download className="w-5 h-5" />
                Download APK
              </button>
            </div>
          </div>
          <div className="hidden lg:flex flex-col items-center justify-center shrink-0 w-32 h-32 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
            <Leaf className="w-12 h-12 text-[#cddc39] mb-2" />
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Verified</span>
          </div>
        </div>
        
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
            
            <div id="preview-area" className={`flex-1 w-full min-h-0 ${isPrintBlocked ? 'print:hidden' : ''}`}>
                <CardPreview data={farmerData} />
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
                    <h4 className="font-bold text-sm mb-1">Founder</h4>
                    <p className="text-xs leading-relaxed opacity-80">
                        This Page Crated By ⪼ Raj Kumar Urf Rajesh Yadav, Supaul, Bihar. Company - "Ajnabi Creation"
                    </p>
                </div>
            </div>

            <div className="glass-card rounded-3xl shadow-xl overflow-hidden border-2 border-emerald-50/50">
                <FarmerForm data={farmerData} onChange={setFarmerData} />
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER SECTION - RESTORED CREDITS PER REQUEST */}
      <footer className="no-print bg-white border-t py-12 md:py-20 mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <div className="flex flex-col items-center gap-10">
              <div className="space-y-4">
                <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-[0.5em] leading-relaxed">
                    © 2026 Agri Record Management System <span className="hidden md:inline mx-3 text-slate-200">|</span> Digital India
                </p>
                <p className="text-xs md:text-sm text-slate-500 font-medium max-w-2xl mx-auto px-4">
                    Note: This website is a private service platform and is not affiliated with any government authority.
                </p>
              </div>

              <div className="flex flex-col items-center">
                  <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8 text-xs md:text-sm font-semibold text-slate-500">
                      <Link to="/about" className="hover:text-emerald-600 transition-colors">About Us</Link>
                      <Link to="/contact" className="hover:text-emerald-600 transition-colors">Contact Us</Link>
                      <Link to="/privacy-policy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link>
                      <Link to="/terms" className="hover:text-emerald-600 transition-colors">Terms & Conditions</Link>
                      <Link to="/refund-policy" className="hover:text-emerald-600 transition-colors">Refund Policy</Link>
                  </div>

                  <div className="flex items-center justify-center gap-3 mb-6">
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-400">Created</span>
                    <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-400">BY</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <a 
                      href="https://instagram.com/ajnabicreation" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-6 py-3 bg-emerald-50 hover:bg-[#064e3b] rounded-2xl border border-emerald-100 transition-all duration-300 shadow-sm active:scale-95"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:bg-[#cddc39]"></div>
                      <span className="text-sm font-black text-[#064e3b] group-hover:text-white">Ajnabi Creation</span>
                    </a>
                    
                    <a 
                      href="https://instagram.com/ajnabirajesh" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-6 py-3 bg-slate-50 hover:bg-slate-900 rounded-2xl border border-slate-100 transition-all duration-300 shadow-sm active:scale-95"
                    >
                      <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-[#cddc39]"></div>
                      <span className="text-sm font-black text-slate-700 group-hover:text-white">Rajesh Yadav</span>
                    </a>
                  </div>
                  
                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    {deferredPrompt && (
                      <button
                        onClick={handleInstallClick}
                        className="group flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-[#064e3b] to-emerald-800 hover:from-emerald-800 hover:to-[#064e3b] text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 border border-emerald-700/50"
                      >
                        <div className="bg-white/20 p-1.5 rounded-lg">
                          <Download className="w-5 h-5 text-[#cddc39]" />
                        </div>
                        <div className="flex flex-col items-start leading-none gap-1">
                          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Download</span>
                          <span className="text-sm font-black tracking-wide">Install App (PWA)</span>
                        </div>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        alert('APK version abhi uplabdh nahi hai. Kripya "Install App (PWA)" button ka upyog karein.');
                      }}
                      className="group flex items-center gap-3 px-8 py-3.5 bg-white hover:bg-emerald-50 text-emerald-950 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 border border-slate-200"
                    >
                      <div className="bg-emerald-100 p-1.5 rounded-lg group-hover:bg-emerald-200 transition-colors">
                        <Download className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div className="flex flex-col items-start leading-none gap-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Direct</span>
                        <span className="text-sm font-black tracking-wide">Download APK</span>
                      </div>
                    </button>
                  </div>
              </div>
           </div>
           <div className="mt-12 pt-8 border-t border-slate-200/20 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
             <p>© {new Date().getFullYear()} Agri Record. All rights reserved.</p>
             <Link to="/admin" className="text-slate-500 hover:text-emerald-400 transition-colors font-medium">Admin Access</Link>
           </div>
        </div>
      </footer>

      {/* Print Confirmation Modal */}
      {showPrintConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-amber-50 p-6 flex flex-col items-center text-center border-b border-amber-100">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Confirm Print</h3>
              <p className="text-slate-600 text-sm">
                Are you sure you want to print or save the ID card now? Please ensure all details are correct.
              </p>
            </div>
            <div className="p-6 flex gap-3">
              <button
                onClick={() => setShowPrintConfirm(false)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPrint}
                className="flex-1 py-3 px-4 bg-[#064e3b] hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Yes, Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
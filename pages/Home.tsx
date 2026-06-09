
import React, { useState } from 'react';
import { FarmerData, INITIAL_FARMER_DATA } from '../types';
import FarmerForm from '../components/FarmerForm';
import CardPreview from '../components/CardPreview';
import { Printer, Download, Leaf, FileText, Info, Loader2, CheckCircle2, Youtube, Heart, Lock, AlertCircle, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';

const Home: React.FC = () => {
  const [farmerData, setFarmerData] = useState<FarmerData>(INITIAL_FARMER_DATA);
  const [hasPaid, setHasPaid] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [showNoCreditsAlert, setShowNoCreditsAlert] = useState(false);
  const [showUseCreditAlert, setShowUseCreditAlert] = useState(false);
  const [showSiteAlert, setShowSiteAlert] = useState(true);
  
  const { user, isAdmin, freeCredits, signIn, signOut } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        if (!hasPaid && !isAdmin) {
          e.preventDefault();
          setShowUseCreditAlert(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPaid, isAdmin]);

  const handlePayment = async (onSuccess: () => void, method: 'credit' | 'pay' = 'credit') => {
    let currentUser = auth.currentUser;
    
    if (hasPaid) {
      onSuccess();
      return;
    }

    if (!currentUser && !isAdmin) {
      alert("Please log in first to generate and save your card.");
      try {
        await signIn();
      } catch (e) {}
      return;
    }

    const updateCounters = async (uid: string, isPaid: boolean) => {
      try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { cardCount: increment(1) });
        
        const statsRef = doc(db, 'stats', 'global');
        const statsDoc = await getDoc(statsRef);
        if (!statsDoc.exists()) {
           await setDoc(statsRef, { totalCards: 1, totalPaidCards: isPaid ? 1 : 0, totalRevenue: isPaid ? 15 : 0 });
        } else {
           await updateDoc(statsRef, { 
             totalCards: increment(1),
             totalPaidCards: isPaid ? increment(1) : increment(0),
             totalRevenue: isPaid ? increment(15) : increment(0)
           });
        }
      } catch (err) {}
    };

    if (isAdmin) {
      try {
        await addDoc(collection(db, 'cards'), {
          userId: currentUser?.uid || 'admin',
          userEmail: currentUser?.email || 'admin',
          farmerData: JSON.stringify(farmerData),
          farmerId: farmerData.farmerId,
          mobileNumber: farmerData.mobile,
          aadhaarNumber: farmerData.aadhaar,
          transactionId: `admin_bypass_${Date.now()}`,
          createdAt: serverTimestamp(),
          expireAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          isDeleted: false
        });
        if (currentUser) {
           await updateCounters(currentUser.uid, false);
        }
        setHasPaid(true);
        onSuccess();
      } catch (err) {
        console.error("Error saving card as admin:", err);
        alert("Admin save failed.");
      }
      return;
    }

    if (method === 'credit') {
      if (currentUser) {
        if (freeCredits > 0) {
          if (window.confirm(`You have ${freeCredits} credit(s) available. Do you want to use 1 credit to generate this card?`)) {
            setIsProcessingPayment(true);
            try {
              // Decrement by exactly 1 as required by security rules
              const userRef = doc(db, 'users', currentUser.uid);
              await updateDoc(userRef, { freeCredits: freeCredits - 1 });
              
              await addDoc(collection(db, 'cards'), {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                farmerData: JSON.stringify(farmerData),
                farmerId: farmerData.farmerId,
                mobileNumber: farmerData.mobile,
                aadhaarNumber: farmerData.aadhaar,
                transactionId: `credit_txn_${Date.now()}`,
                createdAt: serverTimestamp(),
                expireAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                isDeleted: false
              });
              await updateCounters(currentUser.uid, true); // Count credit usage as revenue/paid card
              setHasPaid(true);
              onSuccess();
            } catch (err) {
              console.error("Error using credit:", err);
              alert("Failed to use credit. Please try again.");
            } finally {
              setIsProcessingPayment(false);
            }
          }
        } else {
          setShowNoCreditsAlert(true);
        }
      }
      return;
    }

    if (method === 'pay') {
      setShowUseCreditAlert(true);
      return;
    }
  };

  const handlePrintAction = (method: 'credit' | 'pay' = 'credit') => {
    handlePayment(() => {
      setShowPrintConfirm(true);
    }, method);
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
            You must use a credit to generate the card before printing.
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

             <div className="flex items-center gap-2">
               {hasPaid || isAdmin ? (
                 <>
                   <button 
                     onClick={() => handlePrintAction('credit')}
                     title="Print"
                     disabled={isProcessingPayment}
                     className="group flex items-center justify-center bg-emerald-700/50 hover:bg-emerald-700 text-white font-bold px-3 py-2 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all border border-emerald-600 active:scale-95 disabled:opacity-50"
                   >
                     <Printer className="w-4 h-4 md:w-5 md:h-5" />
                     <span className="hidden md:inline ml-2 text-xs uppercase tracking-wider">Print</span>
                   </button>

                   <button 
                     onClick={() => handlePrintAction('credit')}
                     disabled={isProcessingPayment}
                     className="group flex items-center justify-center bg-[#cddc39] hover:bg-[#dce775] text-[#064e3b] font-extrabold px-3 py-2 md:px-6 md:py-2 rounded-lg md:rounded-xl transition-all shadow-xl shadow-emerald-950/20 active:scale-95 disabled:opacity-50"
                   >
                     <Download className="w-4 h-4 md:w-5 md:h-5" />
                     <span className="ml-2 text-[10px] md:text-base uppercase tracking-tight md:tracking-normal font-black">SAVE</span>
                   </button>
                 </>
               ) : (
                 <>
                   <button 
                     onClick={() => freeCredits > 0 ? handlePrintAction('credit') : setShowNoCreditsAlert(true)}
                     disabled={isProcessingPayment}
                     className="group flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all border border-blue-500 active:scale-95 disabled:opacity-50"
                   >
                     <div className="flex items-center gap-1.5 md:gap-2">
                       {isProcessingPayment ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : <Lock className="w-3 h-3 md:w-4 md:h-4" />}
                       <span className="hidden md:inline text-xs uppercase tracking-wider">{freeCredits > 0 ? 'Use Credit' : 'Get Credits'}</span>
                     </div>
                     <span className="text-[8px] md:text-[10px] text-blue-200 mt-0.5">{freeCredits > 0 ? `${freeCredits} Available` : 'WhatsApp'}</span>
                   </button>

                   <button 
                     onClick={() => handlePrintAction('pay')}
                     disabled={isProcessingPayment}
                     className="group flex flex-col items-center justify-center bg-[#cddc39] hover:bg-[#dce775] text-[#064e3b] font-black px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all shadow-xl active:scale-95 disabled:opacity-50"
                   >
                     <div className="flex items-center gap-1.5 md:gap-2">
                       {isProcessingPayment ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : <Lock className="w-3 h-3 md:w-4 md:h-4" />}
                       <span className="text-[9px] md:text-xs uppercase tracking-wider">Pay ₹15</span>
                     </div>
                     <span className="text-[8px] md:text-[10px] text-[#064e3b]/70 mt-0.5">Test Mode</span>
                   </button>
                 </>
               )}
             </div>
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
              </div>

              <div className="flex flex-col items-center">
                  <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8 text-xs md:text-sm font-semibold text-slate-500">
                      <Link to="/about" className="hover:text-emerald-600 transition-colors">About Us</Link>
                      <Link to="/contact" className="hover:text-emerald-600 transition-colors">Contact Us</Link>
                      <Link to="/disclaimer" className="hover:text-emerald-600 transition-colors">Disclaimer</Link>
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
              </div>
           </div>
           
           <div className="mt-8 mb-4 p-4 md:p-6 bg-slate-50 border border-slate-100 rounded-2xl max-w-4xl mx-auto text-center">
             <p className="text-slate-600 text-xs md:text-sm font-medium leading-relaxed">
               <strong>महत्वपूर्ण सूचना:</strong> यह एक निजी (Private) प्लेटफॉर्म है। इसका किसी भी सरकारी विभाग, संस्था या सरकारी योजना से कोई संबंध नहीं है। इस वेबसाइट द्वारा कोई सरकारी प्रमाणपत्र, पहचान पत्र या आधिकारिक दस्तावेज जारी नहीं किया जाता।
             </p>
           </div>
           
           <div className="mt-8 pt-8 border-t border-slate-200/20 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
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

      {/* No Credits Alert Modal */}
      {showNoCreditsAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Insufficient Credits</h3>
              <p className="text-slate-700 text-sm font-semibold mb-3">
                आपके पास कार्ड जनरेट करने के लिए पर्याप्त क्रेडिट नहीं हैं। कृपया व्हाट्सएप पर हमसे संपर्क करें ताकि आप क्रेडिट प्राप्त कर सकें।
              </p>
              <p className="text-slate-600 text-sm mb-4">
                You don't have enough credits to generate a card. Please contact us on WhatsApp to recharge your credits.
              </p>
              
              <div className="mt-2 p-3 bg-white rounded-xl border border-red-100 w-full flex items-center justify-center gap-3 shadow-sm">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-slate-800">+91 70702 00199</span>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-3">
              <a
                href="https://wa.me/917070200199?text=I%20want%20to%20buy%20credits%20for%20Agri%20Record%20Card%20Generator"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold rounded-xl transition-colors shadow-sm"
              >
                Contact via WhatsApp
              </a>
              <button
                onClick={() => setShowNoCreditsAlert(false)}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Use Credit Alert Modal */}
      {showUseCreditAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-50 p-6 flex flex-col items-center text-center border-b border-blue-100">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Notice</h3>
              <p className="text-slate-700 text-sm font-semibold mb-3">
                पेमेंट गेटवे अभी बंद है। कृपया कार्ड जनरेट करने के लिए 'Use Credit' बटन का उपयोग करें।
              </p>
              <p className="text-slate-600 text-sm">
                The payment gateway is currently disabled in test mode. Please use the 'Use Credit' option to generate your card.
              </p>
            </div>
            <div className="p-6">
              <button
                onClick={() => setShowUseCreditAlert(false)}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Site Alert Modal */}
      {showSiteAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Important Notice</h3>
              <p className="text-slate-700 text-sm font-semibold mb-3">
                इस वेबसाइट पर पेमेंट सिस्टम काम नहीं कर रहा है, कृपया कार्ड जनरेट करने के लिए हमारी नई वेबसाइट का उपयोग करें।
              </p>
              <p className="text-slate-600 text-sm">
                The payment system is not working on this website. Please visit our new website to generate your cards.
              </p>
            </div>
            <div className="p-6 flex flex-col gap-3">
              <a
                href="https://agri-record.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold rounded-xl transition-colors shadow-sm cursor-pointer block"
              >
                Go to New Website
              </a>
              <button
                onClick={() => setShowSiteAlert(false)}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
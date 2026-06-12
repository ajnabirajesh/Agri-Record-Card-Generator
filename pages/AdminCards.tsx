import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db, signInWithEmail } from '../firebase';
import { collection, query, getDocs, orderBy, updateDoc, doc, deleteDoc, limit, getCountFromServer, where, getDoc } from 'firebase/firestore';
import { FarmerData } from '../types';
import CardPreview from '../components/CardPreview';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Printer, Trash, Trash2, Search, Lock, Download, TrendingUp, CalendarDays, CreditCard, Users, Eye, X, Edit3, Archive, RefreshCcw } from 'lucide-react';
import EditCardModal from '../components/EditCardModal';

interface SavedCard {
  id: string;
  userId: string;
  userEmail?: string;
  farmerData: FarmerData;
  createdAt: Date;
  transactionId: string;
  isDeleted?: boolean;
}

const AdminCards: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [printingCardId, setPrintingCardId] = useState<string | null>(null);
  const [viewingCard, setViewingCard] = useState<SavedCard | null>(null);
  const [editingCard, setEditingCard] = useState<SavedCard | null>(null);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stateFilter, startDate, endDate, showDeleted]);

  useEffect(() => {
    if (authLoading) return;
    if (isAdmin) {
      fetchCards();
    } else {
      setLoading(false);
    }
  }, [isAdmin, authLoading]);

  const handleSaveEdit = async (id: string, newFarmerData: FarmerData) => {
    try {
      await updateDoc(doc(db, 'cards', id), {
        farmerData: JSON.stringify(newFarmerData)
      });
      setCards(cards.map(card => card.id === id ? { ...card, farmerData: newFarmerData } : card));
      setEditingCard(null);
    } catch (err) {
      console.error("Error saving card:", err);
      alert("Failed to save changes. Please try again.");
    }
  };

  const fetchCards = async () => {
    setLoading(true);
    try {
      // Export or full search requires all documents to be loaded on client given the current architecture
      const q = query(
        collection(db, 'cards'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedCards: SavedCard[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        let parsedFarmerData = {};
        try {
          parsedFarmerData = typeof data.farmerData === 'string' ? JSON.parse(data.farmerData || '{}') : (data.farmerData || {});
        } catch (e) {
           console.error('Error parsing card data', e);
        }
        
        fetchedCards.push({
          id: doc.id,
          userId: data.userId,
          userEmail: data.userEmail,
          farmerData: parsedFarmerData,
          createdAt: data.createdAt?.toDate() || new Date(),
          transactionId: data.transactionId,
          isDeleted: data.isDeleted || false
        });
      });
      
      setCards(fetchedCards);
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setLoginError('Invalid User ID or Password. Please check your credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setLoginError('This email is already registered with a different login method (e.g., Google). Please use the correct password or login method.');
      } else if (err.code === 'auth/weak-password') {
        setLoginError('Password is too weak. It must be at least 6 characters long.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setLoginError('Email/Password login is not enabled in Firebase Console. Please enable it first.');
      } else {
        setLoginError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDelete = async (cardId: string) => {
    if (window.confirm("Are you sure you want to delete this card? It will be removed from view but payment logic will be retained.")) {
      try {
        await updateDoc(doc(db, 'cards', cardId), { isDeleted: true });
        setCards(cards.map(c => c.id === cardId ? { ...c, isDeleted: true } : c));
        if (viewingCard?.id === cardId) setViewingCard(null);
      } catch (error) {
        console.error("Error deleting card:", error);
        alert("Failed to delete card.");
      }
    }
  };

  const handlePermanentDelete = async (cardId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this card data? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'cards', cardId));
        setCards(cards.filter(c => c.id !== cardId));
        if (viewingCard?.id === cardId) setViewingCard(null);
      } catch (error) {
        console.error("Error deleting card:", error);
        alert("Failed to delete card.");
      }
    }
  };

  const handleRestore = async (cardId: string) => {
    if (window.confirm("Are you sure you want to restore this card?")) {
      try {
        await updateDoc(doc(db, 'cards', cardId), { isDeleted: false });
        setCards(cards.map(c => c.id === cardId ? { ...c, isDeleted: false } : c));
      } catch (error) {
        console.error("Error restoring card:", error);
        alert("Failed to restore card.");
      }
    }
  };

  const handlePrint = (cardId: string) => {
    setPrintingCardId(cardId);
    setTimeout(() => {
      window.print();
      setPrintingCardId(null);
    }, 100);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-black text-purple-900">Admin Login</h1>
            <p className="text-slate-500 mt-2 text-sm">Enter your Admin ID and Password to access the dashboard.</p>
          </div>
          
          {user && !isAdmin && (
            <div className="bg-amber-50 text-amber-700 p-3 rounded-lg text-sm mb-6 border border-amber-100 text-center">
              You are currently logged in as <strong>{user.email}</strong>, but this account does not have admin privileges. Please log in with an admin account.
            </div>
          )}

          {loginError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Admin ID (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                placeholder="admin@agrirecord.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center mt-2"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login to Dashboard'}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-purple-600 hover:text-purple-800 font-medium">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (printingCardId) {
    const cardToPrint = cards.find(c => c.id === printingCardId);
    if (cardToPrint) {
      return (
        <div className="bg-white min-h-screen flex items-center justify-center p-8">
          <CardPreview data={cardToPrint.farmerData} />
        </div>
      );
    }
  }

  const filteredCards = cards.filter(c => showDeleted ? c.isDeleted : !c.isDeleted).filter(card => {
    // Search Term match
    const filterTerm = searchTerm.toLowerCase();
    const matchesSearch = 
      (card.farmerData?.nameEnglish || '').toLowerCase().includes(filterTerm) ||
      (card.farmerData?.nameHindi || '').includes(searchTerm) ||
      (card.farmerData?.mobile || '').includes(searchTerm) ||
      (card.farmerData?.phone || '').includes(searchTerm) ||
      (card.farmerData?.aadhaar || '').includes(searchTerm) ||
      (card.userEmail || '').toLowerCase().includes(filterTerm);
      
    // State Match
    const cardState = card.farmerData?.state || 'Bihar';
    const matchesState = stateFilter === 'All' || cardState === stateFilter;
    
    // Date Match
    let matchesDate = true;
    const cardDate = new Date(card.createdAt);
    cardDate.setHours(0, 0, 0, 0);
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (cardDate < start) matchesDate = false;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      if (cardDate > end) matchesDate = false;
    }

    return matchesSearch && matchesState && matchesDate;
  });

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Generated Date,User Email,Farmer Name (Eng),Farmer Name (Hi),Phone,Aadhaar,DOB,State,Transaction ID\n";

    filteredCards.forEach(card => {
      const date = card.createdAt.toLocaleString().replace(/,/g, '');
      const email = card.userEmail || card.userId;
      const nameEng = card.farmerData?.nameEnglish || '';
      const nameHi = card.farmerData?.nameHindi || '';
      const phone = card.farmerData?.mobile || card.farmerData?.phone || '';
      const aadhaar = card.farmerData?.aadhaar || '';
      const dob = card.farmerData?.dob || '';
      const state = card.farmerData?.state || 'Bihar';
      const txnInfo = card.transactionId || '';
      
      const row = `"${date}","${email}","${nameEng}","${nameHi}","${phone}","${aadhaar}","${dob}","${state}","${txnInfo}"`;
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `agri_record_cards_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeCards = cards.filter(c => !c.isDeleted);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const cardsToday = activeCards.filter(c => c.createdAt >= todayDate).length;
  // Total Credit Cards tracks cards generated by non-admins
  const totalCreditCards = cards.filter(c => !c.transactionId || !c.transactionId.startsWith('admin_bypass')).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <header className="no-print sticky top-0 z-50 bg-purple-800 text-white shadow-xl border-b border-purple-900">
        <div className="max-w-7xl mx-auto px-4 h-14 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-purple-700 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg md:text-xl font-black tracking-tight">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <Link to="/admin/users" className="text-sm font-medium bg-purple-700 hover:bg-purple-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 md:px-4 md:py-2">
              <span className="hidden sm:inline">Users</span>
              <span className="sm:hidden">Users</span>
            </Link>
            <div className="hidden sm:block text-sm font-medium bg-purple-900 px-3 py-1 rounded-full">
              Total Cards: {activeCards.length}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 relative">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 no-print">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Cards</div>
              <div className="text-xl font-black text-slate-800">{activeCards.length}</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Generated Today</div>
              <div className="text-xl font-black text-slate-800">{cardsToday}</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Credits Used</div>
              <div className="text-xl font-black text-slate-800">{totalCreditCards}</div>
              <div className="text-[10px] text-slate-400 font-medium">By Users</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
             <button 
                onClick={exportToCSV}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
             >
                <Download className="w-4 h-4" /> Export CSV
             </button>
          </div>
        </div>

        <div className="mb-6 space-y-4 no-print relative w-full mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, phone, aadhaar or user email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm shadow-sm"
              />
            </div>
            
            <div className="flex bg-white border border-slate-200 rounded-xl items-center overflow-hidden shadow-sm">
               <span className="px-3 text-sm text-slate-500 font-medium border-r border-slate-200 bg-slate-50 self-stretch flex items-center">State</span>
               <select
                 value={stateFilter}
                 onChange={(e) => setStateFilter(e.target.value)}
                 className="flex-1 py-3 px-3 bg-transparent outline-none text-sm text-slate-700 font-medium min-w-[120px] cursor-pointer"
               >
                 <option value="All">All States</option>
                 <option value="Bihar">Bihar</option>
                 <option value="Uttar Pradesh">Uttar Pradesh</option>
                 <option value="Jharkhand">Jharkhand</option>
                 <option value="Rajasthan">Rajasthan</option>
                 <option value="Madhya Pradesh">Madhya Pradesh</option>
                 <option value="West Bengal">West Bengal</option>
                 <option value="Odisha">Odisha</option>
                 <option value="Chhattisgarh">Chhattisgarh</option>
               </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-2">
               <span className="text-sm font-medium text-slate-600">From:</span>
               <input 
                 type="date" 
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
               />
             </div>
             <div className="flex items-center gap-2">
               <span className="text-sm font-medium text-slate-600">To:</span>
               <input 
                 type="date" 
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
               />
             </div>
             <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-2">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={showDeleted}
                   onChange={(e) => setShowDeleted(e.target.checked)}
                   className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                 />
                 <span className="text-sm font-medium text-slate-600">Show Deleted Info</span>
               </label>
             </div>
             {(startDate || endDate || stateFilter !== 'All' || searchTerm || showDeleted) && (
               <button 
                 onClick={() => {
                   setStartDate('');
                   setEndDate('');
                   setStateFilter('All');
                   setSearchTerm('');
                   setShowDeleted(false);
                 }}
                 className="ml-auto flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
               >
                 <X className="w-4 h-4" /> Clear Filters
               </button>
             )}
          </div>
        </div>

        {/* Card Viewing Modal */}
        {viewingCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm no-print">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-600" /> Card Preview
                  </h2>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handlePrint(viewingCard.id)}
                      className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-bold transition-colors text-sm"
                    >
                      <Printer className="w-4 h-4" /> Print
                    </button>
                    <button 
                      onClick={() => setViewingCard(null)}
                      className="p-2 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-6 flex justify-center items-start bg-slate-50">
                 <div className="scale-[0.95] md:scale-100 origin-top">
                    <CardPreview data={viewingCard.farmerData} />
                 </div>
               </div>
            </div>
          </div>
        )}

        {editingCard && (
          <EditCardModal
            cardId={editingCard.id}
            initialData={editingCard.farmerData}
            onClose={() => setEditingCard(null)}
            onSave={handleSaveEdit}
          />
        )}

        {filteredCards.length === 0 ? (
          <div className="bg-white text-center py-20 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-600 mb-2">No cards found</h2>
            <p className="text-slate-400">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden no-print">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 font-semibold text-slate-600 text-sm">Date</th>
                    <th className="p-4 font-semibold text-slate-600 text-sm">Farmer Name</th>
                    <th className="p-4 font-semibold text-slate-600 text-sm">Mobile</th>
                    <th className="p-4 font-semibold text-slate-600 text-sm">State</th>
                    <th className="p-4 font-semibold text-slate-600 text-sm">Generated By</th>
                    <th className="p-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentCards.map((card) => (
                    <tr key={card.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-sm text-slate-600">
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-700">{card.createdAt.toLocaleDateString()}</span>
                           <span className="text-[10px] text-slate-400">{card.createdAt.toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-bold text-slate-900">
                         {card.farmerData?.nameEnglish || 'N/A'}
                         <span className="block text-xs font-normal text-slate-500">{card.farmerData?.nameHindi || ''}</span>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-700">
                         {card.farmerData?.mobile || card.farmerData?.phone || 'N/A'}
                      </td>
                      <td className="p-4">
                         <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
                           card.farmerData?.state === 'Uttar Pradesh' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                         }`}>
                           {card.farmerData?.state || 'Bihar'}
                         </span>
                      </td>
                      <td className="p-4 text-sm">
                         <span className="truncate max-w-[150px] block text-slate-600">{card.userEmail || card.userId}</span>
                         <span className="text-[10px] text-slate-400 font-mono" title={card.transactionId}>
                            Txn: {(card.transactionId || '').substring(0, 10)}...
                         </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setViewingCard(card)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Card"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setEditingCard(card)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Card"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handlePrint(card.id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Print Card"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                        {card.isDeleted ? (
                          <button 
                            onClick={() => handleRestore(card.id)}
                            className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                            title="Restore Record"
                          >
                            <RefreshCcw className="w-5 h-5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleDelete(card.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete (Hide from view)"
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handlePermanentDelete(card.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-transparent hover:border-red-200"
                          title="Permanently Delete Record"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="bg-slate-50 border-t border-slate-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-600 font-medium">
                  Showing {indexOfFirstCard + 1} to {Math.min(indexOfLastCard, filteredCards.length)} of {filteredCards.length} entries
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-slate-700 mx-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCards;

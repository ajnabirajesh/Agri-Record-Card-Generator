import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db, signInWithEmail } from '../firebase';
import { collection, query, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { FarmerData } from '../types';
import CardPreview from '../components/CardPreview';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Printer, Trash2, Search, Lock } from 'lucide-react';

interface SavedCard {
  id: string;
  userId: string;
  userEmail?: string;
  farmerData: FarmerData;
  createdAt: Date;
  transactionId: string;
}

const AdminCards: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [printingCardId, setPrintingCardId] = useState<string | null>(null);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (isAdmin) {
      fetchCards();
    } else {
      setLoading(false);
    }
  }, [isAdmin, authLoading]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'cards'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedCards: SavedCard[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedCards.push({
          id: doc.id,
          userId: data.userId,
          userEmail: data.userEmail,
          farmerData: JSON.parse(data.farmerData),
          createdAt: data.createdAt?.toDate() || new Date(),
          transactionId: data.transactionId
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
    if (window.confirm("Are you sure you want to delete this card?")) {
      try {
        await deleteDoc(doc(db, 'cards', cardId));
        setCards(cards.filter(c => c.id !== cardId));
      } catch (error) {
        console.error("Error deleting card:", error);
        alert("Failed to delete card.");
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

  const filteredCards = cards.filter(card => 
    card.farmerData.nameEnglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.farmerData.nameHindi.includes(searchTerm) ||
    card.farmerData.phone.includes(searchTerm) ||
    (card.userEmail && card.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
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
              <span className="hidden sm:inline">Manage Users</span>
              <span className="sm:hidden">Users</span>
            </Link>
            <div className="hidden sm:block text-sm font-medium bg-purple-900 px-3 py-1 rounded-full">
              Cards: {cards.length}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="mb-8 no-print relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, phone, or user email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm shadow-sm"
          />
        </div>

        {filteredCards.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-600 mb-4">No cards found</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {filteredCards.map((card) => (
              <div key={card.id} id={`card-container-${card.id}`} className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex flex-col card-wrapper">
                <div className="flex flex-col gap-2 mb-4 no-print border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-slate-500 font-medium">
                        Generated: {card.createdAt.toLocaleString()}
                      </div>
                      <div className="text-xs text-purple-600 font-bold mt-1">
                        By: {card.userEmail || card.userId}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Txn: {card.transactionId}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDelete(card.id)}
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors"
                        title="Delete Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handlePrint(card.id)}
                        className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200 transition-colors"
                      >
                        <Printer className="w-4 h-4" /> Print
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center bg-slate-50 p-4 rounded-2xl">
                  <CardPreview data={card.farmerData} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCards;

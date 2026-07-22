import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Wallet as WalletIcon, Clock, ArrowDownCircle, AlertCircle, PlusCircle, X, CheckCircle, ArrowUpCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface WalletTransaction {
  id: string;
  amount: number;
  description: string;
  createdAt: Date;
  type: 'credit' | 'debit';
  status?: 'pending' | 'approved' | 'rejected';
}

const Wallet: React.FC = () => {
  const { user, loading: authLoading, freeCredits } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Recharge Modal State
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeCredits, setRechargeCredits] = useState<number>(10);
  const [utrNumber, setUtrNumber] = useState('');
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [rechargeError, setRechargeError] = useState('');
  
  const navigate = useNavigate();

  const PRICE_PER_CREDIT = 15; // Assume 15 Rs per credit

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/');
      return;
    }

    const fetchTransactions = async () => {
      try {
        // Fetch generated cards as debit transactions
        const qCards = query(
          collection(db, 'cards'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        
        const qRequests = query(
          collection(db, 'wallet_requests'),
          where('userId', '==', user.uid),
          limit(50)
        );
        
        const [cardsSnapshot, requestsSnapshot] = await Promise.all([
          getDocs(qCards),
          getDocs(qRequests)
        ]);

        const fetchedTransactions: WalletTransaction[] = [];
        
        cardsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.isDeleted) {
            fetchedTransactions.push({
              id: doc.id,
              amount: -1,
              description: data.transactionId?.startsWith('free_credit_') ? 'Card Generated (Credit used)' : 'Card Generated',
              createdAt: data.createdAt?.toDate() || new Date(),
              type: 'debit',
              status: 'approved' // cards are final
            });
          }
        });
        
        requestsSnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedTransactions.push({
            id: doc.id,
            amount: data.credits,
            description: `Recharge Request (${data.amount} INR)`,
            createdAt: data.createdAt?.toDate() || new Date(),
            type: 'credit',
            status: data.status
          });
        });
        
        // Sorting them by date descending
        fetchedTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, authLoading, navigate]);

  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!utrNumber.trim()) {
      setRechargeError('Please enter the UTR / Reference No.');
      return;
    }
    if (rechargeCredits < 5) {
      setRechargeError('Minimum recharge is 5 credits.');
      return;
    }

    setRechargeLoading(true);
    setRechargeError('');

    try {
      await addDoc(collection(db, 'wallet_requests'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Unknown User',
        credits: rechargeCredits,
        amount: rechargeCredits * PRICE_PER_CREDIT,
        utr: utrNumber.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      setRechargeSuccess(true);
      setUtrNumber('');
      
      // Update local state to show pending request immediately
      setTransactions(prev => [{
        id: Math.random().toString(),
        amount: rechargeCredits,
        description: `Recharge Request (${rechargeCredits * PRICE_PER_CREDIT} INR)`,
        createdAt: new Date(),
        type: 'credit',
        status: 'pending'
      }, ...prev]);
      
      setTimeout(() => {
        setShowRechargeModal(false);
        setRechargeSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setRechargeError(err.message || 'Failed to submit request.');
    } finally {
      setRechargeLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <header className="no-print sticky top-0 z-50 bg-[#064e3b] text-white shadow-xl border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 h-14 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-emerald-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg md:text-xl font-black tracking-tight">My Wallet</h1>
          </div>
          {user && (
            <div className="flex items-center gap-2 md:gap-3 bg-emerald-800/50 py-1.5 md:py-2 px-3 md:px-4 rounded-full border border-emerald-700/50 max-w-[50%] md:max-w-none">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-emerald-500 shrink-0" />
              ) : (
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white border border-emerald-500 text-xs md:text-sm shrink-0">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs md:text-sm font-bold leading-tight truncate">{user.displayName || 'User'}</span>
                <span className="text-[10px] md:text-xs text-emerald-200/80 leading-tight truncate">{user.email}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 md:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-400 opacity-20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-emerald-100 font-medium mb-1">Available Balance</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl md:text-6xl font-black">{freeCredits || 0}</span>
                <span className="text-xl md:text-2xl font-semibold mb-1 md:mb-2 text-emerald-200">Credits</span>
              </div>
              <p className="text-sm text-emerald-100 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> 1 Credit = 1 Card Generation
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setShowRechargeModal(true)}
                className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" /> Recharge Wallet
              </button>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" /> Recent Activity
        </h2>
        
        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <WalletIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No transactions yet</h3>
            <p className="text-slate-500">Your wallet activity will appear here once you generate cards or recharge your wallet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {transactions.map((tx, index) => (
              <div 
                key={tx.id} 
                className={`flex items-center justify-between p-4 md:p-6 hover:bg-slate-50 transition-colors ${
                  index !== transactions.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {tx.type === 'credit' ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6 rotate-180" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                      {tx.description}
                      {tx.status === 'pending' && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Pending</span>}
                      {tx.status === 'rejected' && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Rejected</span>}
                    </h4>
                    <p className="text-xs md:text-sm text-slate-500">{tx.createdAt.toLocaleString()}</p>
                  </div>
                </div>
                <div className={`font-bold text-lg ${
                  tx.type === 'credit' && tx.status !== 'rejected' ? 'text-emerald-600' : 'text-slate-800'
                }`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
              <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
                <WalletIcon className="w-5 h-5 text-emerald-600" /> Recharge Wallet
              </h2>
              <button 
                onClick={() => setShowRechargeModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 md:p-6 overflow-y-auto">
              {rechargeSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Request Submitted!</h3>
                  <p className="text-slate-600">Your recharge request has been sent to the admin. Your wallet will be updated once approved.</p>
                </div>
              ) : (
                <form onSubmit={handleRechargeSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">How many credits do you want?</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="5"
                        value={rechargeCredits}
                        onChange={(e) => setRechargeCredits(parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg"
                      />
                      <span className="font-semibold text-slate-500">Credits</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">
                      Total Amount to Pay: <span className="font-bold text-emerald-700">₹{rechargeCredits * PRICE_PER_CREDIT}</span>
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <p className="text-sm font-medium text-slate-600 mb-3">Scan QR Code to Pay</p>
                    <div className="bg-white p-4 rounded-xl inline-block shadow-sm border border-slate-100 mb-3">
                      <QRCodeSVG 
                        value={`upi://pay?pa=ajnabiippb@ybl&pn=Admin&am=${rechargeCredits * PRICE_PER_CREDIT}&cu=INR`} 
                        size={150} 
                      />
                    </div>
                    <p className="text-xs text-slate-500">UPI ID: <strong className="text-slate-700">ajnabiippb@ybl</strong></p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Enter UTR / Reference No. *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 31234567890"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {rechargeError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {rechargeError}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={rechargeLoading}
                    className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {rechargeLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;

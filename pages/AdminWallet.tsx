import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, query, orderBy, getDoc, writeBatch } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface WalletRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  credits: number;
  amount: number;
  utr: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const AdminWallet: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<WalletRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }

    fetchRequests();
  }, [user, isAdmin, authLoading, navigate]);

  const fetchRequests = async () => {
    try {
      const q = query(collection(db, 'wallet_requests'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetchedRequests: WalletRequest[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        fetchedRequests.push({
          id: doc.id,
          userId: data.userId,
          userEmail: data.userEmail,
          userName: data.userName,
          credits: data.credits,
          amount: data.amount,
          utr: data.utr,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching wallet requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: WalletRequest) => {
    if (!window.confirm(`Are you sure you want to approve this request and add ${request.credits} credits to ${request.userEmail}?`)) return;
    
    setActionLoading(request.id);
    try {
      const userRef = doc(db, 'users', request.userId);
      const requestRef = doc(db, 'wallet_requests', request.id);
      
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        throw new Error("User not found in database.");
      }
      
      const currentCredits = userSnap.data().freeCredits || 0;
      
      const batch = writeBatch(db);
      batch.update(userRef, { freeCredits: currentCredits + request.credits });
      batch.update(requestRef, { status: 'approved' });
      
      await batch.commit();
      
      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'approved' } : r));
    } catch (error: any) {
      console.error("Error approving request:", error);
      alert("Failed to approve: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (request: WalletRequest) => {
    if (!window.confirm(`Are you sure you want to reject this request from ${request.userEmail}?`)) return;
    
    setActionLoading(request.id);
    try {
      const requestRef = doc(db, 'wallet_requests', request.id);
      await updateDoc(requestRef, { status: 'rejected' });
      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'rejected' } : r));
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Wallet Requests</h1>
              <p className="text-slate-500 font-medium">Manage user wallet recharges</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-600">User</th>
                  <th className="p-4 font-semibold text-slate-600">Credits</th>
                  <th className="p-4 font-semibold text-slate-600">Amount</th>
                  <th className="p-4 font-semibold text-slate-600">UTR / Ref</th>
                  <th className="p-4 font-semibold text-slate-600">Date</th>
                  <th className="p-4 font-semibold text-slate-600">Status</th>
                  <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No wallet requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{r.userName}</div>
                        <div className="text-sm text-slate-500">{r.userEmail}</div>
                      </td>
                      <td className="p-4 font-bold text-emerald-600">{r.credits}</td>
                      <td className="p-4 font-semibold text-slate-700">₹{r.amount}</td>
                      <td className="p-4">
                        <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">{r.utr}</span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">{r.createdAt.toLocaleString()}</td>
                      <td className="p-4">
                        {r.status === 'pending' && <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase"><Clock className="w-3 h-3"/> Pending</span>}
                        {r.status === 'approved' && <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase"><CheckCircle className="w-3 h-3"/> Approved</span>}
                        {r.status === 'rejected' && <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase"><XCircle className="w-3 h-3"/> Rejected</span>}
                      </td>
                      <td className="p-4 text-right">
                        {r.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleApprove(r)}
                              disabled={actionLoading === r.id}
                              className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition"
                            >
                              {actionLoading === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(r)}
                              disabled={actionLoading === r.id}
                              className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-100 disabled:opacity-50 transition"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWallet;
import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, getDocs, orderBy, Timestamp, onSnapshot } from 'firebase/firestore';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface PaymentLog {
  id: string;
  event: string;
  payload: any;
  createdAt: Date;
}

const AdminPaymentLogs: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (isAdmin) {
      setLoading(true);
      setErrorMsg(null);
      const q = query(collection(db, 'payment_logs'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedLogs: PaymentLog[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          let parsedPayload = {};
          try {
            parsedPayload = typeof data.payload === 'string' ? JSON.parse(data.payload || '{}') : (data.payload || {});
          } catch (e) {
            console.error("Error parsing payload", e);
          }

          fetchedLogs.push({
            id: doc.id,
            event: data.event,
            payload: parsedPayload,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          });
        });
        
        // Sort in descending order on the client to avoid Firestore index requirement
        fetchedLogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        setLogs(fetchedLogs);
        setLoading(false);
        setErrorMsg(null);
      }, (error) => {
        console.error("Error real-time fetching logs:", error);
        setErrorMsg(error.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [isAdmin, authLoading]);

  // fetchLogs is no longer strictly needed but keeping it for the refresh button if desired.
  // Although the refresh button might be unnecessary now.
  const fetchLogs = () => {
    // Already handled by onSnapshot
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  const renderStatusBadge = (event: string) => {
    switch(event) {
      case 'payment.captured':
      case 'payment.authorized':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3"/> Success</span>;
      case 'payment.failed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3"/> Failed</span>;
      case 'order.paid':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><CheckCircle2 className="w-3 h-3"/> Order Paid</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><AlertCircle className="w-3 h-3"/> {event}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-purple-800 text-white shadow-xl border-b border-purple-900">
        <div className="max-w-7xl mx-auto px-4 h-14 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-purple-700 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg md:text-xl font-black tracking-tight">Payment Logs</h1>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
             <Link to="/admin" className="text-sm font-medium bg-purple-700 hover:bg-purple-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 md:px-4 md:py-2">
               Cards
             </Link>
             <Link to="/admin/users" className="text-sm font-medium bg-purple-700 hover:bg-purple-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 md:px-4 md:py-2">
               Users
             </Link>
             <Link to="/admin/payment-analytics" className="text-sm font-medium bg-purple-700 hover:bg-purple-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 md:px-4 md:py-2">
               Analytics
             </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
             <h2 className="text-lg font-bold text-slate-800">Webhook Events</h2>
             <button onClick={fetchLogs} className="text-sm font-medium text-purple-600 hover:text-purple-700">Refresh</button>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : errorMsg ? (
              <div className="p-12 text-center text-red-500">
                <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
                <p>Error: {errorMsg}</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>No payment logs found.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="p-4 pl-6">Date</th>
                    <th className="p-4">Event</th>
                    <th className="p-4">Payment ID</th>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Email / Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => {
                    const payment = log.payload?.payment?.entity || {};
                    const order = log.payload?.order?.entity || {};
                    const amount = payment.amount ? (payment.amount / 100).toFixed(2) : '-';
                    
                    return (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{log.createdAt.toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500">{log.createdAt.toLocaleTimeString()}</div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {renderStatusBadge(log.event)}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{payment.id || '-'}</code>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{payment.order_id || order.id || '-'}</code>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-slate-700">{amount !== '-' ? `₹${amount}` : '-'}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-slate-800">{payment.email || '-'}</div>
                          <div className="text-xs text-slate-500">{payment.contact || '-'}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPaymentLogs;

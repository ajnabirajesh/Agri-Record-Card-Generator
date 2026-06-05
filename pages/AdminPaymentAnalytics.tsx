import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Link, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, Loader2, DollarSign, TrendingUp, TrendingDown, 
  CreditCard, CheckCircle2, XCircle, AlertCircle, Calendar, 
  MapPin, Users, Activity, BarChart3, Download, Eye, PieChart
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell 
} from 'recharts';
import { 
  format, subDays, startOfMonth, startOfDay, endOfDay, 
  isWithinInterval, isSameMonth, subMonths, parseISO, isSameDay
} from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Data Interfaces
interface PaymentLog {
  id: string;
  event: string;
  payload: any;
  createdAt: Date;
}

interface SavedCard {
  id: string;
  userId: string;
  userEmail?: string;
  farmerData: any;
  createdAt: Date;
  transactionId: string;
  isDeleted?: boolean;
}

type DateFilterType = 'today' | 'yesterday' | '7days' | '30days' | '90days' | 'thisMonth' | 'lastMonth' | 'custom';

const AdminPaymentAnalytics: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  
  // State
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dateFilter, setDateFilter] = useState<DateFilterType>('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Fetch Data Realtime
  useEffect(() => {
    if (authLoading || !isAdmin) return;

    let totalFetched = 0;
    const checkLoading = () => {
      totalFetched++;
      if (totalFetched >= 2) setLoading(false);
    };

    // Listen to Payment Logs
    const qLogs = query(collection(db, 'payment_logs'));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      const fetchedLogs: PaymentLog[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        let payload = {};
        try {
          payload = typeof data.payload === 'string' ? JSON.parse(data.payload) : (data.payload || {});
        } catch(e) {}
        
        let validDate = new Date();
        try {
          if (data.createdAt?.toDate) validDate = data.createdAt.toDate();
          else if (data.createdAt) validDate = new Date(data.createdAt);
          if (isNaN(validDate.getTime())) validDate = new Date();
        } catch(e) {}

        fetchedLogs.push({
          id: doc.id,
          event: data.event,
          payload,
          createdAt: validDate,
        });
      });
      setLogs(fetchedLogs);
      checkLoading();
    });

    // Listen to Cards
    const qCards = query(collection(db, 'cards'));
    const unsubCards = onSnapshot(qCards, (snapshot) => {
      const fetchedCards: SavedCard[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        let farmerData = {};
        try {
          farmerData = typeof data.farmerData === 'string' ? JSON.parse(data.farmerData) : (data.farmerData || {});
        } catch(e) {}
        
        let validDate = new Date();
        try {
          if (data.createdAt?.toDate) validDate = data.createdAt.toDate();
          else if (data.createdAt) validDate = new Date(data.createdAt);
          if (isNaN(validDate.getTime())) validDate = new Date();
        } catch(e) {}

        fetchedCards.push({
          id: doc.id,
          userId: data.userId || 'unknown',
          userEmail: data.userEmail || '',
          farmerData,
          createdAt: validDate,
          transactionId: typeof data.transactionId === 'string' ? data.transactionId : '',
          isDeleted: data.isDeleted || false
        });
      });
      setCards(fetchedCards);
      checkLoading();
    });

    return () => {
      unsubLogs();
      unsubCards();
    };
  }, [isAdmin, authLoading]);

  // Utility to determine date range
  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    switch (dateFilter) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'yesterday':
        const yest = subDays(now, 1);
        return { start: startOfDay(yest), end: endOfDay(yest) };
      case '7days':
        return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
      case '30days':
        return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
      case '90days':
        return { start: startOfDay(subDays(now, 89)), end: endOfDay(now) };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfDay(now) };
      case 'lastMonth':
        const lstMonth = subMonths(now, 1);
        return { start: startOfMonth(lstMonth), end: endOfDay(new Date(lstMonth.getFullYear(), lstMonth.getMonth() + 1, 0)) };
      case 'custom':
        if (customStartDate && customEndDate) {
           return { start: startOfDay(new Date(customStartDate)), end: endOfDay(new Date(customEndDate)) };
        }
        return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
      default:
        return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
    }
  };

  const { start: filterStart, end: filterEnd } = getDateRange();

  // Derived Data
  const { filteredLogs, filteredCards, allPaidCards } = useMemo(() => {
    const flogs = logs.filter(log => isWithinInterval(log.createdAt, { start: filterStart, end: filterEnd }));
    const fcards = cards.filter(card => isWithinInterval(card.createdAt, { start: filterStart, end: filterEnd }));
    const paidCards = cards.filter(c => !c.transactionId.startsWith('admin_bypass'));
    return { filteredLogs: flogs, filteredCards: fcards, allPaidCards: paidCards };
  }, [logs, cards, filterStart, filterEnd]);

  // Statistics
  const stats = useMemo(() => {
    // Basic stats over filtered period
    const totalPayments = filteredLogs.length;
    const successful = filteredLogs.filter(l => l.event === 'payment.captured' || l.event === 'order.paid').length;
    const failed = filteredLogs.filter(l => l.event === 'payment.failed').length;
    const pending = totalPayments - successful - failed;

    // Total revenue from cards over time
    const totalRev = allPaidCards.length * 11;
    
    // Revenue in period
    const paidCardsInPeriod = filteredCards.filter(c => !c.transactionId.startsWith('admin_bypass')).length;
    const thisPeriodRev = paidCardsInPeriod * 11;

    // Today's Rev
    const todayCards = paidCardsInPeriod.filter(c => isSameDay(c.createdAt || new Date(), new Date()));
    
    return {
      totalRev,
      periodRev: thisPeriodRev,
      successful,
      failed,
      pending,
      totalPayments,
      successRate: totalPayments > 0 ? ((successful / totalPayments) * 100).toFixed(1) : '0',
      failedRate: totalPayments > 0 ? ((failed / totalPayments) * 100).toFixed(1) : '0',
      paidCardsCount: allPaidCards.length,
      periodCardsCount: paidCardsInPeriod,
    };
  }, [filteredLogs, filteredCards, allPaidCards]);

  // Today & This Month exactly
  const exactStats = useMemo(() => {
    const now = new Date();
    const todayRev = allPaidCards.filter(c => isSameDay(c.createdAt, now)).length * 11;
    const monthRev = allPaidCards.filter(c => isSameMonth(c.createdAt, now)).length * 11;
    const sortedPaidCards = [...allPaidCards].sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime());
    const oldestDate = sortedPaidCards.length > 0 ? sortedPaidCards[0].createdAt.getTime() : now.getTime();
    const diffDays = Math.max(1, Math.ceil((now.getTime() - oldestDate) / (1000 * 60 * 60 * 24)));
    const avgDaily = (allPaidCards.length * 11) / diffDays;

    return { todayRev, monthRev, avgDaily: avgDaily.toFixed(2) };
  }, [allPaidCards]);

  // Charts Data
  const chartsData = useMemo(() => {
      const dailyMap = new Map<string, number>();
      filteredCards.forEach(card => {
         if (!card.transactionId.startsWith('admin_bypass')) {
            const dateStr = format(card.createdAt, 'MMM dd');
            dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 11);
         }
      });
      // Sort daily Map
      const dailyChart = Array.from(dailyMap.entries())
        .sort((a,b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
        .map(([date, revenue]) => ({ date, revenue }));

      const methodMap = new Map<string, number>();
      filteredLogs.forEach(log => {
         if(log.event === 'payment.captured' || log.event === 'payment.authorized') {
            const method = log.payload?.payment?.entity?.method || 'Other';
            let label = method.toUpperCase();
            if (method === 'upi') label = 'UPI';
            if (method === 'card') label = 'Card';
            if (method === 'netbanking') label = 'Net Banking';
            if (method === 'wallet') label = 'Wallet';
            methodMap.set(label, (methodMap.get(label) || 0) + 1);
         }
      });
      const methodChart = Array.from(methodMap.entries()).map(([name, value]) => ({ name, value }));

      return { dailyChart, methodChart };
  }, [filteredCards, filteredLogs]);

  const COLORS = ['#8b5cf6', '#0ea5e9', '#f59e0b', '#ec4899', '#10b981'];

  // Top States
  const stateStats = useMemo(() => {
    const map = new Map<string, { cards: number, revenue: number, users: Set<string> }>();
    allPaidCards.forEach(card => {
       const state = card.farmerData?.state || 'Bihar';
       const entry = map.get(state) || { cards: 0, revenue: 0, users: new Set() };
       entry.cards += 1;
       entry.revenue += 11;
       if (card.userEmail) entry.users.add(card.userEmail);
       map.set(state, entry);
    });
    return Array.from(map.entries())
      .map(([state, data]) => ({ state, cards: data.cards, revenue: data.revenue, users: data.users.size }))
      .sort((a,b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [allPaidCards]);

  // Top Users
  const userStats = useMemo(() => {
    const map = new Map<string, { cards: number, revenue: number, lastActivity: Date }>();
    allPaidCards.forEach(card => {
       const user = card.userEmail || card.userId;
       const entry = map.get(user) || { cards: 0, revenue: 0, lastActivity: new Date(0) };
       entry.cards += 1;
       entry.revenue += 11;
       if (card.createdAt > entry.lastActivity) entry.lastActivity = card.createdAt;
       map.set(user, entry);
    });
    return Array.from(map.entries())
      .map(([user, data]) => ({ user, cards: data.cards, revenue: data.revenue, lastActivity: data.lastActivity }))
      .sort((a,b) => b.revenue - a.revenue)
      .slice(0, 20);
  }, [allPaidCards]);

  // Recent Payments Table Data
  const recentPayments = useMemo(() => {
     return logs
       .filter(l => l.event !== 'payment.authorized') // skip duplicates if captured exists
       .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())
       .slice(0, 50);
  }, [logs]);

  const failedPayments = useMemo(() => {
     return logs
       .filter(l => l.event === 'payment.failed')
       .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())
       .slice(0, 50);
  }, [logs]);

  // Exports
  const handleExportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(recentPayments.map(p => ({
       Date: p.createdAt.toLocaleString(),
       Event: p.event,
       PaymentID: p.payload?.payment?.entity?.id || '-',
       OrderID: p.payload?.payment?.entity?.order_id || p.payload?.order?.entity?.id || '-',
       Amount: (p.payload?.payment?.entity?.amount || 0) / 100,
       Email: p.payload?.payment?.entity?.email || '-',
       Contact: p.payload?.payment?.entity?.contact || '-',
       Method: p.payload?.payment?.entity?.method || '-',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, `Payment_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleExportPDF = () => {
    const docContext = new jsPDF();
    docContext.text("Admin Payment Analytics Report", 14, 15);
    autoTable(docContext, {
      head: [['Date', 'Event', 'Payment ID', 'Amount (INR)', 'Email']],
      body: recentPayments.map(p => [
        p.createdAt.toLocaleDateString(),
        p.event,
        p.payload?.payment?.entity?.id || '-',
        ((p.payload?.payment?.entity?.amount || 0) / 100).toFixed(2),
        p.payload?.payment?.entity?.email || '-',
      ]),
      startY: 25,
    });
    docContext.save(`Payment_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };


  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">Analytics <span className="text-purple-400 font-medium">Dashboard</span></h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/payment-logs" className="hidden md:flex text-sm font-medium bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors items-center gap-2">
              <Activity className="w-4 h-4"/> View Logs
            </Link>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-400 tracking-wide">LIVE</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-8 space-y-8">
        
        {/* Date Filter Bar */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex overflow-x-auto w-full md:w-auto hide-scrollbar gap-1 p-1 items-center">
              {[
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: '7days', label: '7 Days' },
                { id: '30days', label: '30 Days' },
                { id: 'thisMonth', label: 'This Month' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setDateFilter(f.id as any)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                    dateFilter === f.id ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {f.label}
                </button>
              ))}
           </div>
           
           <div className="flex items-center gap-2 px-2 w-full md:w-auto">
             <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
               <Calendar className="w-4 h-4 text-slate-400" />
               <input 
                 type="date" 
                 value={customStartDate} 
                 onChange={e => {setCustomStartDate(e.target.value); setDateFilter('custom')}}
                 className="bg-transparent text-sm font-medium outline-none text-slate-700 w-28" 
               />
               <span className="text-slate-300">-</span>
               <input 
                 type="date" 
                 value={customEndDate} 
                 onChange={e => {setCustomEndDate(e.target.value); setDateFilter('custom')}}
                 className="bg-transparent text-sm font-medium outline-none text-slate-700 w-28" 
               />
             </div>
             <button onClick={handleExportPDF} title="Export PDF" className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-700">
                <Download className="w-5 h-5"/>
             </button>
           </div>
        </div>

        {/* Top 4 VIP Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue (All Time)" 
            value={`₹${stats.totalRev.toLocaleString()}`} 
            icon={<DollarSign />} 
            subtitle={`${stats.paidCardsCount} Paid Cards`}
            gradient="from-emerald-500 to-teal-600" 
          />
          <StatCard 
            title="Today's Revenue" 
            value={`₹${exactStats.todayRev.toLocaleString()}`} 
            icon={<TrendingUp />} 
            subtitle="from midnight"
            gradient="from-blue-500 to-indigo-600" 
          />
          <StatCard 
            title="This Month Revenue" 
            value={`₹${exactStats.monthRev.toLocaleString()}`} 
            icon={<Calendar />} 
            gradient="from-purple-500 to-fuchsia-600" 
          />
          <StatCard 
            title="Paid Cards (Period)" 
            value={stats.periodCardsCount.toLocaleString()} 
            icon={<CreditCard />} 
            subtitle={`₹${stats.periodRev.toLocaleString()} generated`}
            gradient="from-rose-500 to-orange-500" 
          />
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {/* Success Rate */}
           <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
             <div className="flex items-center gap-2 mb-2">
               <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-600"/></span>
               <h3 className="text-sm font-bold text-slate-600">Success Rate</h3>
             </div>
             <div className="text-2xl font-black text-slate-800">{stats.successRate}%</div>
             <div className="text-xs text-slate-500 mt-1 font-medium">{stats.successful} Successful Payments</div>
           </div>
           
           {/* Failure Rate */}
           <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
             <div className="flex items-center gap-2 mb-2">
               <span className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center"><XCircle className="w-4 h-4 text-rose-600"/></span>
               <h3 className="text-sm font-bold text-slate-600">Failed Rate</h3>
             </div>
             <div className="text-2xl font-black text-slate-800">{stats.failedRate}%</div>
             <div className="text-xs text-slate-500 mt-1 font-medium">{stats.failed} Failed Payments</div>
           </div>
           
           {/* Pending/Other */}
           <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
             <div className="flex items-center gap-2 mb-2">
               <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center"><AlertCircle className="w-4 h-4 text-amber-600"/></span>
               <h3 className="text-sm font-bold text-slate-600">Pending Events</h3>
             </div>
             <div className="text-2xl font-black text-slate-800">{stats.pending}</div>
             <div className="text-xs text-slate-500 mt-1 font-medium">Out of {stats.totalPayments} total</div>
           </div>

           {/* Average Daily Revenue */}
           <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center bg-gradient-to-br from-slate-900 to-slate-800 border-none sm:text-white">
             <div className="flex items-center gap-2 mb-2">
               <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Activity className="w-4 h-4 text-purple-300"/></span>
               <h3 className="text-sm font-bold text-slate-300">Avg. Daily Revenue</h3>
             </div>
             <div className="text-2xl font-black text-white">₹{exactStats.avgDaily}</div>
             <div className="text-xs text-slate-400 mt-1 font-medium">Overall lifetime average</div>
           </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-bold text-slate-800">Revenue Timeline</h2>
               <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{dateFilter.toUpperCase()}</span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartsData.dailyChart}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Payment Methods</h2>
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartsData.methodChart.length > 0 ? chartsData.methodChart : [{name: 'No Data', value: 1}]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(chartsData.methodChart.length > 0 ? chartsData.methodChart : [{name: 'No Data', value: 1}]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: 500 }}/>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Lower Row: States & Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           
           {/* Top States */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
             <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                 <MapPin className="w-5 h-5 text-indigo-500" /> Top Performing States
               </h2>
               <button onClick={handleExportCSV} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Export</button>
             </div>
             <div className="p-0 flex-1 overflow-auto max-h-[400px]">
               <table className="w-full text-left text-sm">
                 <thead className="bg-white sticky top-0 border-b border-slate-100">
                   <tr>
                     <th className="p-4 font-semibold text-slate-500">State</th>
                     <th className="p-4 font-semibold text-slate-500 text-right">Cards</th>
                     <th className="p-4 font-semibold text-slate-500 text-right">Revenue</th>
                     <th className="p-4 font-semibold text-slate-500 text-right">Users</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {stateStats.map((st, i) => (
                     <tr key={st.state} className="hover:bg-slate-50 transition-colors">
                       <td className="p-4 font-bold text-slate-700 flex items-center gap-3">
                         <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", i===0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500')}>{i+1}</span>
                         {st.state}
                       </td>
                       <td className="p-4 text-right font-medium text-slate-600">{st.cards}</td>
                       <td className="p-4 text-right font-bold text-emerald-600">₹{st.revenue}</td>
                       <td className="p-4 text-right font-medium text-slate-600">{st.users}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>

           {/* Top Users */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
             <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                 <Users className="w-5 h-5 text-fuchsia-500" /> Top Affiliates / Users
               </h2>
             </div>
             <div className="p-0 flex-1 overflow-auto max-h-[400px]">
               <table className="w-full text-left text-sm">
                 <thead className="bg-white sticky top-0 border-b border-slate-100">
                   <tr>
                     <th className="p-4 font-semibold text-slate-500">User Email</th>
                     <th className="p-4 font-semibold text-slate-500 text-right">Cards</th>
                     <th className="p-4 font-semibold text-slate-500 text-right">Revenue Generation</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {userStats.map((u, i) => {
                     let badge = null;
                     if(i===0) badge = '🥇';
                     else if(i===1) badge = '🥈';
                     else if(i===2) badge = '🥉';

                     return (
                       <tr key={u.user} className="hover:bg-slate-50 transition-colors">
                         <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                           <span className="w-6 text-center text-lg">{badge}</span>
                           <span className="truncate max-w-[200px]" title={u.user}>{u.user}</span>
                         </td>
                         <td className="p-4 text-right font-bold text-slate-700">{u.cards}</td>
                         <td className="p-4 text-right font-black text-emerald-600">₹{u.revenue}</td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           </div>

        </div>

        {/* Failed Payments Monitor */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100">
          <div className="flex items-center gap-2 mb-4 text-rose-600">
             <AlertCircle className="w-6 h-6" />
             <h2 className="text-lg font-bold">Failed Payment Monitor</h2>
             <span className="ml-auto bg-rose-100 text-rose-700 px-3 py-1 font-bold rounded-full text-xs shrink-0">
               {failedPayments.length} Issues Detected
             </span>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm whitespace-nowrap">
               <thead>
                 <tr className="border-b border-rose-100">
                   <th className="pb-3 pt-2 px-2 font-bold text-slate-500">Date & Time</th>
                   <th className="pb-3 pt-2 px-2 font-bold text-slate-500">Payment ID</th>
                   <th className="pb-3 pt-2 px-2 font-bold text-slate-500">Error Description</th>
                   <th className="pb-3 pt-2 px-2 font-bold text-slate-500">User Contact</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {failedPayments.length === 0 ? (
                   <tr>
                     <td colSpan={4} className="text-center py-6 text-slate-400 font-medium">No failed payments recorded in this period. Great!</td>
                   </tr>
                 ) : failedPayments.map(fp => {
                   const entity = fp.payload?.payment?.entity || {};
                   return (
                     <tr key={fp.id} className="hover:bg-rose-50/50">
                       <td className="p-3 text-slate-600">{fp.createdAt.toLocaleString()}</td>
                       <td className="p-3 font-mono text-xs text-slate-500 bg-slate-50 rounded px-2">{entity.id || '-'}</td>
                       <td className="p-3 text-rose-600 font-medium truncate max-w-[200px]" title={entity.error_description}>
                          {entity.error_description || 'Unknown Error'}
                       </td>
                       <td className="p-3 text-slate-700 font-medium">
                          {entity.email || entity.contact || 'No Info'}
                       </td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminPaymentAnalytics;

// ----------------------
// Sub Components
// ----------------------

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, trend, trendUp, gradient }) => {
  return (
    <div className={cn("rounded-2xl p-6 text-white shadow-lg overflow-hidden relative border", `bg-gradient-to-br ${gradient} border-white/10`)}>
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 -mx-4 -my-4 w-24 h-24 bg-white/10 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white/80 font-semibold text-sm">{title}</div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
             {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5 text-white' })}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-black">{value}</h2>
          {trend && (
             <span className={cn("text-xs font-bold px-2 py-1 rounded-full", trendUp ? "bg-emerald-400/20 text-emerald-100" : "bg-rose-400/20 text-rose-100")}>
               {trend}
             </span>
          )}
        </div>
        {subtitle && (
          <div className="mt-2 text-xs font-medium text-white/60 uppercase tracking-wider">{subtitle}</div>
        )}
      </div>
    </div>
  );
};

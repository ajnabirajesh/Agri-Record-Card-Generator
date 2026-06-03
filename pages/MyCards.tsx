import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { FarmerData } from '../types';
import CardPreview from '../components/CardPreview';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Printer, Download, CreditCard, IndianRupee, Gift, Clock } from 'lucide-react';

interface SavedCard {
  id: string;
  farmerData: FarmerData;
  createdAt: Date;
  transactionId: string;
}

const MyCards: React.FC = () => {
  const { user, loading: authLoading, freeCredits } = useAuth();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/');
      return;
    }

    const fetchCards = async () => {
      try {
        const q = query(
          collection(db, 'cards'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedCards: SavedCard[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.isDeleted) {
            fetchedCards.push({
              id: doc.id,
              farmerData: JSON.parse(data.farmerData),
              createdAt: data.createdAt?.toDate() || new Date(),
              transactionId: data.transactionId
            });
          }
        });
        
        setCards(fetchedCards);
      } catch (error) {
        console.error("Error fetching cards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [user, authLoading, navigate]);

  const [printingCardId, setPrintingCardId] = useState<string | null>(null);

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
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
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

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <header className="no-print sticky top-0 z-50 bg-[#064e3b] text-white shadow-xl border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 h-14 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-emerald-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg md:text-xl font-black tracking-tight">My Saved Cards</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50/50 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500 ease-out"></div>
              <CreditCard className="w-8 h-8 text-blue-500 mb-3 relative z-10" strokeWidth={1.5} />
              <span className="text-3xl font-black text-slate-800 relative z-10">{cards.length}</span>
              <span className="text-slate-500 text-sm font-medium mt-1 relative z-10">Total Cards</span>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-50/50 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500 ease-out"></div>
              <IndianRupee className="w-8 h-8 text-emerald-500 mb-3 relative z-10" strokeWidth={1.5} />
              <span className="text-3xl font-black text-slate-800 relative z-10">
                {cards.filter(c => !c.transactionId?.startsWith('free_credit_') && !c.transactionId?.startsWith('admin_bypass_')).length}
              </span>
              <span className="text-slate-500 text-sm font-medium mt-1 relative z-10">Paid Cards</span>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-50/50 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500 ease-out"></div>
              <Gift className="w-8 h-8 text-purple-500 mb-3 relative z-10" strokeWidth={1.5} />
              <span className="text-3xl font-black text-slate-800 relative z-10">{freeCredits || 0}</span>
              <span className="text-slate-500 text-sm font-medium mt-1 relative z-10">Free Credits</span>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-50/50 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500 ease-out"></div>
              <Clock className="w-8 h-8 text-amber-500 mb-3 relative z-10" strokeWidth={1.5} />
              <span className="text-xl md:text-2xl font-black text-slate-800 relative z-10">
                {cards.length > 0 
                  ? (new Date(cards[0].createdAt).toDateString() === new Date().toDateString() ? 'Today' : cards[0].createdAt.toLocaleDateString())
                  : 'N/A'}
              </span>
              <span className="text-slate-500 text-sm font-medium mt-1 relative z-10">Last Generated</span>
            </div>
          </div>
        )}

        {cards.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-600 mb-4">No cards found</h2>
            <p className="text-slate-500 mb-8">You haven't generated any cards yet.</p>
            <Link to="/" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
              Generate a Card
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {cards.map((card) => (
              <div key={card.id} id={`card-container-${card.id}`} className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex flex-col card-wrapper">
                <div className="flex justify-between items-center mb-6 no-print">
                  <div className="text-xs text-slate-500 font-medium">
                    Generated: {card.createdAt.toLocaleDateString()}
                  </div>
                  <button 
                    onClick={() => handlePrint(card.id)}
                    className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-bold hover:bg-emerald-200 transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                </div>
                
                <div id={`card-${card.id}`} className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 p-4 md:p-8 rounded-2xl border border-slate-100 overflow-x-auto w-full">
                  <div className="w-full max-w-[450px] mx-auto scale-95 md:scale-100 origin-top">
                    <CardPreview data={card.farmerData} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyCards;

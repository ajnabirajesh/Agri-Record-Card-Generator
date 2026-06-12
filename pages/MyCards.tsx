import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { FarmerData } from '../types';
import CardPreview from '../components/CardPreview';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Printer, Download, CreditCard, IndianRupee, Gift, Clock, User, Search } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
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
          orderBy('createdAt', 'desc'),
          limit(100)
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedCards: SavedCard[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          if (!data.isDeleted) {
            let parsedFarmerData = {};
            try {
              parsedFarmerData = typeof data.farmerData === 'string' ? JSON.parse(data.farmerData || '{}') : (data.farmerData || {});
            } catch (err) {}
            
            fetchedCards.push({
              id: doc.id,
              farmerData: parsedFarmerData,
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

  const filteredCards = cards.filter(card => {
    const searchLower = searchQuery.toLowerCase();
    const nameEngMatch = card.farmerData?.nameEnglish?.toLowerCase().includes(searchLower) || false;
    const nameHinMatch = card.farmerData?.nameHindi?.toLowerCase().includes(searchLower) || false;
    const idMatch = card.farmerData?.farmerId?.toLowerCase().includes(searchLower) || false;
    return nameEngMatch || nameHinMatch || idMatch;
  });

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
          <>
            <div className="mb-6 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by farmer name or registration ID..."
                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm text-slate-800 placeholder-slate-400"
              />
            </div>
            
            {filteredCards.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 border-dashed">
                <p className="text-slate-500">No cards match your search query.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredCards.map((card) => (
                  <div key={card.id} id={`card-container-${card.id}`} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-md card-wrapper">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0">
                        {card.farmerData?.photoUrl ? (
                          <img src={card.farmerData.photoUrl} alt="Farmer" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <User className="w-8 h-8 md:w-10 md:h-10" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-bold text-lg md:text-xl text-slate-800 line-clamp-1">{card.farmerData?.nameEnglish} {card.farmerData?.nameHindi && <span className="text-slate-500 font-normal text-sm md:text-base">({card.farmerData?.nameHindi})</span>}</h3>
                        <p className="text-slate-500 text-sm md:text-base font-medium">ID: {card.farmerData?.farmerId}</p>
                        <p className="text-slate-500 text-xs md:text-sm">Mobile: {card.farmerData?.mobile || 'N/A'}</p>
                        <p className="text-xs text-slate-400 mt-1 md:mt-2">Generated: {card.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 pb-1">
                      <button 
                        onClick={() => handlePrint(card.id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        <Printer className="w-5 h-5" /> Print Card
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default MyCards;

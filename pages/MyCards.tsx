import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { FarmerData } from '../types';
import CardPreview from '../components/CardPreview';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Printer, Download } from 'lucide-react';

interface SavedCard {
  id: string;
  farmerData: FarmerData;
  createdAt: Date;
  transactionId: string;
}

const MyCards: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
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
                
                <div id={`card-${card.id}`} className="flex-1 flex items-center justify-center bg-slate-50 p-4 rounded-2xl">
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

export default MyCards;

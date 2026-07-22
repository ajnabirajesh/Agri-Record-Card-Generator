import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star } from 'lucide-react';

const VersionSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  // Close when clicking escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&q=80&w=2000")' }}>
      
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            {/* Modal Container */}
            <div 
              className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[20px] w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              <div className="p-8 sm:p-10">
                {/* Header */}
                <div className="text-center mb-10">
                  <h1 id="modal-title" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                    <span className="mr-2">🌾</span> AgriRecord में आपका स्वागत है
                  </h1>
                  <p className="text-gray-600 text-lg">
                    अपनी सुविधा के अनुसार AgriRecord का संस्करण चुनें।<br />
                    AgriRecord को बेहतर अनुभव और नए फीचर्स के साथ अलग-अलग संस्करणों में उपलब्ध कराया गया है। कृपया नीचे दिए गए किसी एक संस्करण का चयन करें।
                  </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Card 1 */}
                  <div className="bg-white rounded-[16px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(34,197,94,0.2)] transition-all duration-300 transform hover:-translate-y-1 border border-green-100 flex flex-col h-full relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
                    
                    <div className="mb-4">
                      <div className="flex items-start justify-between">
                        <h2 className="text-xl font-bold text-gray-900">AgriRecord</h2>
                      </div>
                      <div className="inline-flex items-center mt-2 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                        <Star className="w-3.5 h-3.5 mr-1 fill-current" /> Recommended
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-8 flex-grow leading-relaxed">
                      Latest official version with the newest features, better performance and regular updates.
                    </p>
                    
                    <a
                      href="https://agri-record.vercel.app/"
                      className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-[12px] shadow-sm text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors group-hover:shadow-md"
                    >
                      Open AgriRecord
                    </a>
                  </div>

                  {/* Card 2 (V1.0) */}
                  <div className="bg-white rounded-[16px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(107,114,128,0.2)] transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col h-full relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-400" />
                    
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-gray-900 mt-1">AgriRecord V1.0</h2>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-8 flex-grow leading-relaxed">
                      Legacy version for users who prefer the previous interface.
                    </p>
                    
                    <a
                      href="https://agri-generator-pro.vercel.app/"
                      className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-200 rounded-[12px] shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors group-hover:shadow-md"
                    >
                      Open V1.0
                    </a>
                  </div>

                  {/* Card 3 (V2.0) */}
                  <div className="bg-white rounded-[16px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.2)] transition-all duration-300 transform hover:-translate-y-1 border border-blue-50 flex flex-col h-full relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
                    
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-gray-900 mt-1">AgriRecord V2.0</h2>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-8 flex-grow leading-relaxed">
                      Improved version with enhanced features and optimized performance.
                    </p>
                    
                    <a
                      href="https://agrirecordv2.vercel.app/"
                      className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-[12px] shadow-sm text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors group-hover:shadow-md"
                    >
                      Open V2.0
                    </a>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VersionSelector;

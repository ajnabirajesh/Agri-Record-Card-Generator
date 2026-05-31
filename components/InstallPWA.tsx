import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 w-max max-w-[90vw] border-2 border-emerald-400/30">
        <div className="flex flex-col">
          <span className="font-bold text-sm">Install AgriRecord App</span>
          <span className="text-xs text-emerald-100">For a faster, easier experience.</span>
        </div>
        <button
          onClick={handleInstallClick}
          className="bg-white text-emerald-700 px-4 py-1.5 rounded-xl font-bold text-sm shadow-sm hover:bg-emerald-50 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-4 h-4" />
          Install
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="p-1.5 hover:bg-emerald-500 rounded-full transition-colors ml-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;

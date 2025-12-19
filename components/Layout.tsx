import React from 'react';
import { MonitorPlay, Volume2, VolumeX } from 'lucide-react';
import { AppActions } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  actions?: AppActions;
}

const Layout: React.FC<LayoutProps> = ({ children, showNav = true, actions }) => {
  return (
    <div className="min-h-screen bg-netflix-black text-white font-sans selection:bg-netflix-red selection:text-white flex flex-col overflow-x-hidden">
      {showNav && (
        <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/90 to-transparent px-6 py-4 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-2 group cursor-pointer">
            <MonitorPlay className="w-8 h-8 text-netflix-red transition-transform group-hover:scale-110" />
            <span className="text-2xl font-black tracking-tighter text-netflix-red uppercase drop-shadow-lg">EduFlix</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:block text-xs font-bold tracking-widest text-gray-400 uppercase">Édition Ultimate</span>
            {actions && (
              <button 
                onClick={actions.toggleMute}
                className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                title={actions.isMuted ? "Activer le son" : "Couper le son"}
              >
                {actions.isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
            )}
            <div className="w-8 h-8 rounded bg-netflix-red flex items-center justify-center font-bold text-sm shadow-lg">
                EF
            </div>
          </div>
        </nav>
      )}
      <main className="flex-grow relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        {children}
      </main>
      
      <footer className="w-full py-8 text-center text-zinc-600 text-xs mt-auto">
        <p>Propulsé par Gemini 2.5 • Développé pour l'Éducation</p>
      </footer>
    </div>
  );
};

export default Layout;

import React, { useState } from 'react';
import { PunishmentWheel } from './components/RouletteWheel';
import { AdminPanel } from './components/AdminPanel';
import { Settings, RefreshCw, Skull, Crown } from 'lucide-react';
import { WheelConfig, Punishment, SpinResult } from './types';
import { DEFAULT_PUNISHMENTS } from './constants';

const DEFAULT_CONFIG: WheelConfig = {
  spinDuration: 3,
  slowdownDuration: 4,
  forceResultId: null,
  isRigged: false,
};

function App() {
  const [mustSpin, setMustSpin] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [config, setConfig] = useState<WheelConfig>(DEFAULT_CONFIG);
  const [punishments, setPunishments] = useState<Punishment[]>(DEFAULT_PUNISHMENTS);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  const [currentResult, setCurrentResult] = useState<SpinResult | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const handleSpinClick = () => {
    if (isSpinning) return;
    
    setShowResultModal(false);
    let selectedId: string;

    if (config.isRigged && config.forceResultId) {
       const exists = punishments.find(p => p.id === config.forceResultId);
       if (exists) {
           selectedId = config.forceResultId;
       } else {
           selectedId = punishments[Math.floor(Math.random() * punishments.length)].id;
       }
    } else {
       selectedId = punishments[Math.floor(Math.random() * punishments.length)].id;
    }

    setTargetId(selectedId);
    setMustSpin(true);
    setIsSpinning(true);
    setCurrentResult(null);
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setIsSpinning(false);
    
    if (targetId) {
      const resultPunishment = punishments.find(p => p.id === targetId);
      if (resultPunishment) {
          const result: SpinResult = {
            punishment: resultPunishment,
            timestamp: new Date().toISOString()
          };
          setCurrentResult(result);
          setTimeout(() => setShowResultModal(true), 600);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans overflow-x-hidden selection:bg-red-500 selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-black"></div>
         <div className="absolute top-0 left-0 right-0 h-[500px] bg-red-600/5 blur-[100px] rounded-full transform -translate-y-1/2"></div>
         {/* Grid texture overlay */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 relative z-40 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4 group cursor-default">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] border border-red-500/30 transform group-hover:rotate-12 transition-transform duration-300">
                <Skull className="w-7 h-7" />
            </div>
            <div>
                <h1 className="text-3xl font-russo tracking-wide text-white italic drop-shadow-lg">
                    WHEEL OF SHAME
                </h1>
            </div>
        </div>
        <button 
          onClick={() => setIsAdminOpen(true)}
          className="p-3 rounded-full bg-slate-900/50 hover:bg-slate-800 transition-all border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white shadow-lg backdrop-blur-sm"
          aria-label="Admin Settings"
        >
          <Settings className="w-6 h-6" />
        </button>
      </nav>

      <AdminPanel 
        config={config} 
        setConfig={setConfig} 
        punishments={punishments}
        setPunishments={setPunishments}
        isOpen={isAdminOpen} 
        toggleOpen={() => setIsAdminOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 gap-12 relative z-10 w-full">
        
        {/* The Wheel */}
        <div className="relative group">
            {/* Spotlight behind wheel */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse"></div>
            
            <div className="transform transition-transform duration-700 hover:scale-[1.02] drop-shadow-2xl">
                <PunishmentWheel
                    mustSpin={mustSpin}
                    punishments={punishments}
                    targetId={targetId}
                    spinDuration={config.spinDuration}
                    slowdownDuration={config.slowdownDuration}
                    onStopSpinning={handleStopSpinning}
                />
            </div>
        </div>

        {/* 3D Spin Button */}
        <div className="relative z-20 w-full max-w-sm mx-auto">
            <button
                onClick={handleSpinClick}
                disabled={isSpinning}
                className={`w-full relative group outline-none transform transition-all duration-150 ${isSpinning ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:-translate-y-1 active:translate-y-1 active:scale-95'}`}
            >
               {/* Button Shadow/Depth Layer */}
               <div className={`absolute inset-0 rounded-2xl bg-red-900 translate-y-3 transition-transform ${isSpinning ? 'translate-y-1' : ''}`}></div>
               
               {/* Button Face */}
               <div className={`relative bg-gradient-to-b from-red-500 to-red-700 rounded-2xl p-6 border-t border-red-400 border-b-4 border-red-900 shadow-[0_10px_40px_rgba(220,38,38,0.5)] flex items-center justify-center gap-4 overflow-hidden`}>
                  
                  {/* Stripes Texture */}
                  <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,black_10px,black_20px)]"></div>
                  
                  {isSpinning ? (
                      <>
                        <RefreshCw className="animate-spin w-8 h-8 text-red-200" />
                        <span className="text-2xl font-russo uppercase tracking-widest text-red-100">Deciding...</span>
                      </>
                  ) : (
                      <span className="text-4xl font-russo italic uppercase tracking-widest text-white drop-shadow-md z-10">
                          SPIN IT
                      </span>
                  )}
               </div>
            </button>
            
            <p className="text-center text-slate-500 text-xs mt-8 font-mono tracking-widest uppercase">
                {isSpinning ? "CALCULATING SHAME VECTOR..." : "NO REFUNDS • NO APPEALS • NO MERCY"}
            </p>
        </div>

        {/* Result Modal Overlay */}
        {showResultModal && currentResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowResultModal(false)}></div>
                
                <div className="relative w-full max-w-2xl transform animate-in zoom-in-90 slide-in-from-bottom-10 duration-500">
                    
                    {/* Glowing border container */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 rounded-3xl blur opacity-75 animate-pulse"></div>
                    
                    <div className="relative bg-slate-900 rounded-3xl p-1 overflow-hidden shadow-2xl">
                         {/* Card Content */}
                         <div className="bg-[#0B1120] rounded-[22px] px-8 py-12 flex flex-col items-center text-center relative overflow-hidden">
                            
                            {/* Background decoration */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-600/10 to-transparent"></div>

                            {/* Icon */}
                            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(234,179,8,0.4)] relative z-10 border-4 border-slate-900">
                                <Crown className="w-12 h-12 text-yellow-950" />
                            </div>

                            <h2 className="text-red-500 font-russo uppercase tracking-[0.2em] text-sm mb-4 animate-pulse">Official Verdict</h2>

                            <h1 className="text-5xl sm:text-6xl font-russo text-white mb-6 uppercase leading-none tracking-tight drop-shadow-2xl">
                                {currentResult.punishment.title}
                            </h1>
                            
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8"></div>
                            
                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 w-full backdrop-blur-sm">
                                <p className="text-slate-200 text-xl font-medium leading-relaxed font-sans">
                                    "{currentResult.punishment.description}"
                                </p>
                            </div>

                            <div className="mt-10 w-full">
                                <button 
                                    onClick={() => setShowResultModal(false)}
                                    className="w-full bg-white hover:bg-slate-200 text-slate-900 font-russo text-xl uppercase py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-0.5"
                                >
                                    I Accept My Fate
                                </button>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

export default App;

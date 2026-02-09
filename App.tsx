import React, { useState, useCallback } from "react";
import { PunishmentWheel } from "./components/RouletteWheel";
import { AdminPanel } from "./components/AdminPanel";
import { Settings, RefreshCw, Skull, Crown, X } from "lucide-react";
import { WheelConfig, Punishment, SpinResult } from "./types";
import { DEFAULT_PUNISHMENTS } from "./constants";

const DEFAULT_CONFIG: WheelConfig = {
  spinDuration: 3,
  slowdownDuration: 4,
  forceResultId: null,
  isRigged: false,
};

export default function App() {
  const [mustSpin, setMustSpin] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [config, setConfig] = useState<WheelConfig>(DEFAULT_CONFIG);
  const [punishments, setPunishments] =
    useState<Punishment[]>(DEFAULT_PUNISHMENTS);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [currentResult, setCurrentResult] = useState<SpinResult | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const handleSpinClick = useCallback(() => {
    if (isSpinning) return;

    setShowResultModal(false);
    let selectedId: string;

    if (config.isRigged && config.forceResultId) {
      const exists = punishments.find((p) => p.id === config.forceResultId);
      selectedId = exists
        ? config.forceResultId
        : punishments[Math.floor(Math.random() * punishments.length)].id;
    } else {
      selectedId =
        punishments[Math.floor(Math.random() * punishments.length)].id;
    }

    setTargetId(selectedId);
    setMustSpin(true);
    setIsSpinning(true);
    setCurrentResult(null);
  }, [isSpinning, config, punishments]);

  const handleStopSpinning = useCallback(() => {
    setMustSpin(false);
    setIsSpinning(false);

    if (targetId) {
      const resultPunishment = punishments.find((p) => p.id === targetId);
      if (resultPunishment) {
        const result: SpinResult = {
          punishment: resultPunishment,
          timestamp: new Date().toISOString(),
        };
        setCurrentResult(result);
        setTimeout(() => setShowResultModal(true), 500);
      }
    }
  }, [targetId, punishments]);

  return (
    <div className="min-h-safe-screen bg-[#0a0a0f] text-white flex flex-col overflow-x-hidden pt-safe pb-safe pl-safe pr-safe">
      {/* Background atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-[#0a0a0f] to-black" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-red-600/[0.04] blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="flex justify-between items-center px-4 py-3 sm:px-6 sm:py-5 relative z-40 w-full max-w-5xl mx-auto flex-shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-red-600 to-red-800 rounded-lg sm:rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-red-500/20">
            <Skull className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h1 className="text-lg sm:text-2xl font-[Russo_One] tracking-wide text-white italic leading-tight">
            WHEEL OF SHAME
          </h1>
        </div>
        <button
          onClick={() => setIsAdminOpen(true)}
          className="p-2.5 rounded-full bg-white/5 active:bg-white/10 sm:hover:bg-white/10 transition-colors border border-white/10 text-slate-400 active:text-white sm:hover:text-white"
          aria-label="Admin Settings"
        >
          <Settings className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
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
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-8 gap-6 sm:gap-10 relative z-10 w-full">
        {/* Wheel */}
        <div className="relative flex justify-center">
          {/* Glow behind wheel */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-500/[0.06] rounded-full blur-[60px] pointer-events-none animate-pulse-glow" />

          <PunishmentWheel
            mustSpin={mustSpin}
            punishments={punishments}
            targetId={targetId}
            spinDuration={config.spinDuration}
            slowdownDuration={config.slowdownDuration}
            onStopSpinning={handleStopSpinning}
          />
        </div>

        {/* Spin Button */}
        <div className="relative z-20 w-full max-w-[260px] sm:max-w-xs mx-auto">
          <button
            onClick={handleSpinClick}
            disabled={isSpinning}
            className={`w-full relative group outline-none transform transition-all duration-150 touch-manipulation ${
              isSpinning
                ? "opacity-50 cursor-not-allowed scale-95"
                : "active:translate-y-1 active:scale-[0.97] sm:hover:-translate-y-0.5"
            }`}
          >
            {/* Depth shadow */}
            <div
              className={`absolute inset-0 rounded-2xl bg-red-950 translate-y-2 transition-transform ${
                isSpinning ? "translate-y-1" : ""
              }`}
            />

            {/* Button face */}
            <div className="relative bg-gradient-to-b from-red-500 to-red-700 rounded-2xl px-6 py-3.5 sm:py-4.5 border-t border-red-400/50 border-b-2 border-b-red-900 shadow-[0_6px_24px_rgba(220,38,38,0.4)] flex items-center justify-center gap-3 overflow-hidden">
              {/* Stripe texture */}
              <div className="absolute inset-0 opacity-[0.06] bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,black_10px,black_20px)]" />

              {isSpinning ? (
                <>
                  <RefreshCw className="animate-spin w-5 h-5 sm:w-6 sm:h-6 text-red-200" />
                  <span className="text-base sm:text-xl font-[Russo_One] uppercase tracking-widest text-red-100">
                    Deciding...
                  </span>
                </>
              ) : (
                <span className="text-xl sm:text-3xl font-[Russo_One] italic uppercase tracking-widest text-white drop-shadow-sm z-10">
                  SPIN IT
                </span>
              )}
            </div>
          </button>

          <p className="text-center text-slate-600 text-[10px] sm:text-xs mt-4 sm:mt-6 font-mono tracking-[0.15em] uppercase">
            {isSpinning
              ? "CALCULATING SHAME VECTOR..."
              : "NO REFUNDS \u00b7 NO APPEALS \u00b7 NO MERCY"}
          </p>
        </div>
      </main>

      {/* Result Modal */}
      {showResultModal && currentResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowResultModal(false)}
          />

          <div className="relative w-full max-w-lg animate-scale-in">
            {/* Glowing edge */}
            <div className="absolute -inset-px bg-gradient-to-r from-red-600 via-amber-500 to-red-600 rounded-2xl blur-sm opacity-60 animate-pulse" />

            <div className="relative bg-[#0c1222] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/50">
              {/* Close button */}
              <button
                onClick={() => setShowResultModal(false)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/5 active:bg-white/10 sm:hover:bg-white/10 text-slate-500 active:text-white sm:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header glow */}
              <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-red-600/10 to-transparent" />

              <div className="px-6 py-8 sm:px-8 sm:py-10 flex flex-col items-center text-center relative">
                {/* Icon */}
                <div className="w-14 h-14 sm:w-18 sm:h-18 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-5 sm:mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)] border-2 border-[#0c1222]">
                  <Crown className="w-7 h-7 sm:w-9 sm:h-9 text-amber-950" />
                </div>

                <p className="text-red-500 font-[Russo_One] uppercase tracking-[0.2em] text-[11px] sm:text-xs mb-2 animate-pulse">
                  Official Verdict
                </p>

                <h2 className="text-2xl sm:text-4xl font-[Russo_One] text-white mb-4 uppercase leading-none tracking-tight">
                  {currentResult.punishment.title}
                </h2>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-5" />

                <div className="bg-slate-800/40 rounded-xl p-4 sm:p-5 border border-slate-700/50 w-full">
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                    &ldquo;{currentResult.punishment.description}&rdquo;
                  </p>
                </div>

                <button
                  onClick={() => setShowResultModal(false)}
                  className="mt-6 sm:mt-8 w-full bg-white active:bg-slate-200 sm:hover:bg-slate-100 text-slate-900 font-[Russo_One] text-sm sm:text-base uppercase py-3 rounded-xl transition-colors shadow-[0_0_12px_rgba(255,255,255,0.15)] touch-manipulation"
                >
                  I Accept My Fate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

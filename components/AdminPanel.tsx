import React, { useState } from 'react';
import { Settings, Lock, Hash, Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import { WheelConfig, Punishment } from '../types';
import { COLORS } from '../constants';

interface AdminPanelProps {
  config: WheelConfig;
  setConfig: React.Dispatch<React.SetStateAction<WheelConfig>>;
  punishments: Punishment[];
  setPunishments: React.Dispatch<React.SetStateAction<Punishment[]>>;
  isOpen: boolean;
  toggleOpen: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  config,
  setConfig,
  punishments,
  setPunishments,
  isOpen,
  toggleOpen,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Punishment>>({});

  const handleChange = <K extends keyof WheelConfig>(key: K, value: WheelConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddPunishment = () => {
    if (punishments.length >= 12) return;
    const newColor = COLORS[punishments.length % COLORS.length];
    const newP: Punishment = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'NEW PENALTY',
      description: 'Enter description...',
      color: newColor,
    };
    setPunishments([...punishments, newP]);
    setEditingId(newP.id);
    setEditForm(newP);
  };

  const handleRemovePunishment = (id: string) => {
    if (punishments.length <= 2) return;
    setPunishments(punishments.filter(p => p.id !== id));
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    setPunishments(punishments.map(p =>
      p.id === editingId ? { ...p, ...editForm } as Punishment : p
    ));
    setEditingId(null);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={toggleOpen}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[440px] bg-[#0c1222]/98 backdrop-blur-xl border-l border-slate-800/50 shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] z-50 overflow-y-auto overscroll-contain ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 sm:p-6 space-y-6 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div className="flex items-center gap-2.5">
              <Settings className="w-5 h-5 text-amber-500 animate-[spin_10s_linear_infinite]" />
              <h2 className="text-lg font-[Russo_One] uppercase tracking-wider text-white">
                Commissioner Mode
              </h2>
            </div>
            <button
              onClick={toggleOpen}
              className="p-2.5 rounded-full active:bg-slate-800 sm:hover:bg-slate-800 text-slate-400 active:text-white sm:hover:text-white transition-colors touch-manipulation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rigging Toggle */}
          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/40">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Lock className={`w-4 h-4 ${config.isRigged ? 'text-red-500' : 'text-slate-500'}`} />
                <span className="text-white font-bold font-[Russo_One] tracking-wide text-sm">
                  RIGGING MODULE
                </span>
              </div>
              <button
                onClick={() => handleChange('isRigged', !config.isRigged)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors touch-manipulation ${
                  config.isRigged
                    ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                    : 'bg-slate-600'
                }`}
              >
                <span
                  className={`${
                    config.isRigged ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm`}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              {config.isRigged ? 'ACTIVE: Outcome will be forced.' : 'INACTIVE: Random RNG logic.'}
            </p>
          </div>

          {/* Punishment List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-[Russo_One]">
                Active Penalties ({punishments.length}/12)
              </h3>
              <button
                onClick={handleAddPunishment}
                disabled={punishments.length >= 12}
                className="text-[11px] bg-slate-800 active:bg-slate-700 sm:hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-40 flex items-center gap-1 font-bold transition-colors touch-manipulation"
              >
                <Plus className="w-3 h-3" /> ADD
              </button>
            </div>

            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto overscroll-contain pr-1">
              {punishments.map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50 group"
                >
                  {editingId === p.id ? (
                    <div className="space-y-2.5">
                      <input
                        className="w-full bg-black/30 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none font-bold touch-manipulation"
                        value={editForm.title || ''}
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder="PENALTY TITLE"
                        autoFocus
                      />
                      <textarea
                        className="w-full bg-black/30 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-300 h-20 focus:border-blue-500 focus:outline-none resize-none touch-manipulation"
                        value={editForm.description || ''}
                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="Description of shame..."
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2.5 active:bg-slate-700 sm:hover:bg-slate-700 rounded-lg text-slate-400 active:text-white sm:hover:text-white touch-manipulation"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2.5 bg-blue-600 active:bg-blue-500 sm:hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1 touch-manipulation"
                        >
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="font-mono text-slate-600 text-[11px] w-4 text-right font-bold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_0_6px_currentColor]"
                          style={{ backgroundColor: p.color, color: p.color }}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-[Russo_One] tracking-wide truncate text-white">
                            {p.title}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate font-mono">
                            {p.description}
                          </div>
                        </div>
                      </div>
                      {/* Always visible on mobile, hover on desktop */}
                      <div className="flex items-center gap-0.5 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingId(p.id); setEditForm(p); }}
                          className="p-2.5 text-slate-400 active:text-white sm:hover:text-white active:bg-slate-700/50 sm:hover:bg-slate-700/50 rounded-lg touch-manipulation"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemovePunishment(p.id)}
                          disabled={punishments.length <= 2}
                          className="p-2.5 text-slate-400 active:text-red-400 sm:hover:text-red-400 active:bg-red-900/20 sm:hover:bg-red-900/20 rounded-lg disabled:opacity-30 touch-manipulation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Forced Outcome Selector */}
          <div
            className={`space-y-3 transition-all duration-300 ${
              config.isRigged
                ? 'opacity-100'
                : 'opacity-30 pointer-events-none grayscale'
            }`}
          >
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-[Russo_One] flex items-center gap-2">
              <Hash className="w-3.5 h-3.5" /> Pre-Spin Determination
            </h3>

            <div className="relative">
            <select
              value={config.forceResultId ?? ''}
              onChange={(e) => handleChange('forceResultId', e.target.value || null)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 pr-10 text-white focus:ring-2 focus:ring-blue-500 outline-none font-[Russo_One] text-sm tracking-wide appearance-none cursor-pointer active:bg-slate-700 sm:hover:bg-slate-700 transition-colors touch-manipulation"
            >
              <option value="">-- RNG MODE (RANDOM) --</option>
              {punishments.map((p, idx) => (
                <option key={p.id} value={p.id}>
                  {idx + 1}. {p.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

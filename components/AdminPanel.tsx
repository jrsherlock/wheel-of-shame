
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
  
  // Punishment Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Punishment>>({});

  const handleChange = <K extends keyof WheelConfig>(key: K, value: WheelConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddPunishment = () => {
      // Updated limit to 12
      if (punishments.length >= 12) return;
      const newColor = COLORS[punishments.length % COLORS.length];
      const newP: Punishment = {
          id: Math.random().toString(36).substr(2, 9),
          title: 'NEW PENALTY',
          description: 'Enter description...',
          color: newColor
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
      setPunishments(punishments.map(p => p.id === editingId ? { ...p, ...editForm } as Punishment : p));
      setEditingId(null);
  };

  return (
    <>
        {/* Backdrop for mobile */}
        {isOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={toggleOpen} />
        )}
        
        <div className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] z-50 overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 space-y-8 pb-20">
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-6">
            <div className="flex items-center gap-3 text-yellow-500">
                <Settings className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
                <h2 className="text-xl font-russo uppercase tracking-wider text-white">Commissioner Mode</h2>
            </div>
            <button 
                onClick={toggleOpen}
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
            >
                <X className="w-6 h-6" />
            </button>
            </div>

            {/* Master Switch */}
            <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Lock className={`w-4 h-4 ${config.isRigged ? 'text-red-500' : 'text-slate-500'}`} />
                    <span className="text-white font-bold font-russo tracking-wide">RIGGING MODULE</span>
                </div>
                <button
                onClick={() => handleChange('isRigged', !config.isRigged)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500/50 ${
                    config.isRigged ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-600'
                }`}
                >
                <span
                    className={`${
                    config.isRigged ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm`}
                />
                </button>
            </div>
            <p className="text-xs text-slate-400 font-mono">
                {config.isRigged ? 'SYSTEM ACTIVE: Outcome will be forced.' : 'SYSTEM INACTIVE: Random RNG logic.'}
            </p>
            </div>
            
            {/* Punishment Management */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-russo">
                        Active Penalties ({punishments.length}/12)
                    </h3>
                    <button 
                        onClick={handleAddPunishment}
                        disabled={punishments.length >= 12}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-600 disabled:opacity-50 flex items-center gap-1 font-bold transition-colors"
                    >
                        <Plus className="w-3 h-3" /> ADD SLOT
                    </button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {punishments.map((p, idx) => (
                        <div key={p.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 hover:border-slate-600 transition-colors group">
                            {editingId === p.id ? (
                                <div className="space-y-3 animate-in fade-in duration-200">
                                    <input 
                                        className="w-full bg-black/30 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none font-bold"
                                        value={editForm.title || ''}
                                        onChange={e => setEditForm({...editForm, title: e.target.value})}
                                        placeholder="PENALTY TITLE"
                                        autoFocus
                                    />
                                    <textarea 
                                        className="w-full bg-black/30 border border-slate-600 rounded px-3 py-2 text-sm text-slate-300 h-20 focus:border-blue-500 focus:outline-none resize-none"
                                        value={editForm.description || ''}
                                        onChange={e => setEditForm({...editForm, description: e.target.value})}
                                        placeholder="Description of shame..."
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => setEditingId(null)} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                                        <button onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase"><Check className="w-4 h-4 inline mr-1" /> Save</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <span className="font-mono text-slate-600 text-xs w-5 text-right font-bold">{idx + 1}</span>
                                        <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: p.color, color: p.color }}></div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-russo tracking-wide truncate text-white group-hover:text-blue-200 transition-colors">{p.title}</div>
                                            <div className="text-xs text-slate-500 truncate font-mono">{p.description}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingId(p.id); setEditForm(p); }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                                        <button 
                                            onClick={() => handleRemovePunishment(p.id)} 
                                            disabled={punishments.length <= 2}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded disabled:opacity-30"
                                        ><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Outcome Controls */}
            <div className={`space-y-4 transition-all duration-300 ${config.isRigged ? 'opacity-100 scale-100' : 'opacity-40 scale-95 pointer-events-none grayscale'}`}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-russo flex items-center gap-2">
                <Hash className="w-4 h-4" /> Pre-Spin Determination
            </h3>
            
                <div className="space-y-2">
                    <select
                        value={config.forceResultId ?? ''}
                        onChange={(e) => handleChange('forceResultId', e.target.value || null)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-russo tracking-wide appearance-none cursor-pointer hover:bg-slate-700 transition-colors"
                    >
                        <option value="">-- RNG MODE (RANDOM) --</option>
                        {punishments.map((p, idx) => (
                            <option key={p.id} value={p.id}>{idx + 1}. {p.title}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
        </div>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  LayoutDashboard, 
  Settings as SettingsIcon,
  Zap,
  Box,
  Wifi,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  OcppVersion, 
  ChargerConfig 
} from './types';
import { ChargerItem } from './ChargerItem';

export default function App() {
  const [chargers, setChargers] = useState<ChargerConfig[]>([
    {
      id: crypto.randomUUID(),
      cmsUrl: 'ws://localhost:8080/ocpp',
      chargePointId: 'EVSE-ALPHA-01',
      ocppVersion: OcppVersion.V201,
      reconnectInterval: 5000,
      meterValueInterval: 5,
    }
  ]);
  const [activeChargerId, setActiveChargerId] = useState<string>(chargers[0].id);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');

  const addCharger = () => {
    const newId = crypto.randomUUID();
    const newCharger: ChargerConfig = {
      id: newId,
      cmsUrl: 'ws://localhost:8080/ocpp',
      chargePointId: `EVSE-NEW-${Math.floor(Math.random() * 1000)}`,
      ocppVersion: OcppVersion.V201,
      reconnectInterval: 5000,
      meterValueInterval: 5,
    };
    setChargers(prev => [...prev, newCharger]);
    setActiveChargerId(newId);
    setActiveTab('dashboard');
  };

  const removeCharger = (id: string) => {
    if (chargers.length <= 1) return;
    setChargers(prev => prev.filter(c => c.id !== id));
    if (activeChargerId === id) {
      setActiveChargerId(chargers.find(c => c.id !== id)?.id || '');
    }
  };

  const updateChargerConfig = (id: string, updates: Partial<ChargerConfig>) => {
    setChargers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const activeCharger = chargers.find(c => c.id === activeChargerId) || chargers[0];

  return (
    <div className="flex h-screen bg-white text-[#333333] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-20 md:w-72 border-r border-[#E5E5E5] flex flex-col items-center py-8 gap-10 bg-black shadow-2xl z-20">
        <div className="flex flex-col items-center gap-4 px-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl shadow-[#FF8C00]/20 border-2 border-[#FF8C00]/20 bg-black p-0.5">
            <img 
              src="https://app.charglee.com/assets/charglee-logo.jpg" 
              alt="Charglee Logo" 
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="hidden md:flex flex-col items-center">
            <span className="font-black text-xl tracking-tighter text-white">CHARG<span className="text-[#FF8C00]">LEE</span></span>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40 text-white">Fleet Terminal</span>
          </div>
        </div>

        <div className="w-full px-4 flex-1 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-white/50">Active Fleet</span>
              <button onClick={addCharger} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-[#FF8C00]">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {chargers.map(charger => (
                <div 
                  key={charger.id}
                  onClick={() => setActiveChargerId(charger.id)}
                  className={`group relative flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer ${
                    activeChargerId === charger.id 
                      ? 'bg-[#FF8C00] text-black shadow-lg shadow-[#FF8C00]/20' 
                      : 'hover:bg-white/5 opacity-60 hover:opacity-100 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Box className={`w-4 h-4 shrink-0 ${activeChargerId === charger.id ? 'text-black' : 'text-[#FF8C00]'}`} />
                    <span className="text-xs font-bold truncate">{charger.chargePointId}</span>
                  </div>
                  {chargers.length > 1 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeCharger(charger.id); }}
                      className={`p-1.5 opacity-0 group-hover:opacity-60 hover:opacity-100 transition-all rounded-lg ${activeChargerId === charger.id ? 'hover:bg-black/10' : 'hover:bg-white/10 text-red-400'}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <nav className="w-full px-4 pt-6 border-t border-white/10 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-[#FF8C00] text-black shadow-lg' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden md:block text-sm font-bold">Monitor</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-[#FF8C00] text-black shadow-lg' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="hidden md:block text-sm font-bold">Configure</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#FAFAFA]">
        <header className="h-24 border-b border-[#E5E5E5] px-12 flex items-center justify-between bg-white z-10 shadow-sm">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-black tracking-tight">{activeCharger.chargePointId}</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${activeTab === 'dashboard' ? 'bg-[#FF8C00]/10 text-[#FF8C00]' : 'bg-[#000000]/10 text-[#000000]'}`}>
                OCPP {activeCharger.ocppVersion}
              </span>
            </div>
            <p className="text-xs font-bold opacity-30 mt-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-md">Target Endpoint: {activeCharger.cmsUrl}</p>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 pr-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Active Units</span>
              <span className="text-xl font-black text-black">{chargers.length}</span>
            </div>
            <div className="w-px h-10 bg-[#E5E5E5]" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30">System Status</span>
              <div className="flex items-center gap-2 text-[#FF8C00]">
                <Wifi className="w-4 h-4" />
                <span className="text-xs font-black uppercase">Fleet Ready</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-12 bg-[#F9F9F9]">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div
                key={`dash-${activeCharger.id}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <ChargerItem 
                  key={activeCharger.id}
                  config={activeCharger} 
                  isActive={true} 
                  onRemove={() => removeCharger(activeCharger.id)}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`settings-${activeCharger.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl mx-auto"
              >
                <div className="bg-white rounded-[40px] border border-[#E5E5E5] p-12 shadow-xl space-y-10">
                  <div className="flex items-center gap-5 border-b border-[#E5E5E5] pb-8">
                    <div className="p-4 bg-[#F9F9F9] rounded-3xl">
                      <SettingsIcon className="w-8 h-8 text-[#FF8C00]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-black">Simulation Parameters</h3>
                      <p className="text-sm font-bold opacity-40">Define identity and protocol endpoints for this unit</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Charge Point Identity</label>
                      <input 
                        type="text" 
                        value={activeCharger.chargePointId}
                        onChange={(e) => updateChargerConfig(activeCharger.id, { chargePointId: e.target.value })}
                        className="w-full bg-[#F9F9F9] border-2 border-[#E5E5E5] rounded-2xl px-6 py-5 text-sm font-black focus:outline-none focus:border-[#FF8C00] transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">WebSocket Backbone</label>
                      <input 
                        type="text" 
                        value={activeCharger.cmsUrl}
                        onChange={(e) => updateChargerConfig(activeCharger.id, { cmsUrl: e.target.value })}
                        className="w-full bg-[#F9F9F9] border-2 border-[#E5E5E5] rounded-2xl px-6 py-5 text-sm font-black focus:outline-none focus:border-[#FF8C00] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Protocol Selection</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[OcppVersion.V16, OcppVersion.V201].map(ver => (
                        <button
                          key={ver}
                          onClick={() => updateChargerConfig(activeCharger.id, { ocppVersion: ver })}
                          className={`py-5 rounded-2xl border-2 font-black transition-all ${activeCharger.ocppVersion === ver ? 'bg-black text-white border-black' : 'bg-transparent border-[#E5E5E5] hover:border-[#FF8C00]/30'}`}
                        >
                          OCPP {ver === OcppVersion.V16 ? '1.6 J' : '2.0.1'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">OCPP Telemetry Frequency (MeterValues)</label>
                    <div className="grid grid-cols-4 gap-4">
                      {[1, 5, 10, 30].map(sec => (
                        <button
                          key={sec}
                          onClick={() => updateChargerConfig(activeCharger.id, { meterValueInterval: sec })}
                          className={`py-4 rounded-2xl border-2 font-black text-xs transition-all ${(activeCharger.meterValueInterval || 5) === sec ? 'bg-[#FF8C00] text-black border-[#FF8C00]' : 'bg-transparent border-[#E5E5E5] hover:border-[#FF8C00]/30'}`}
                        >
                          Every {sec}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={() => setActiveTab('dashboard')}
                      className="w-full py-6 rounded-3xl bg-[#FF8C00] text-black font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#FF8C00]/20"
                    >
                      Commit Unit Hardware Params
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
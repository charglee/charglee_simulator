import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Zap, 
  Activity, 
  Terminal, 
  Play, 
  Square, 
  RotateCcw, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  CreditCard,
  History,
  CheckCircle2,
  Cpu,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  OcppVersion, 
  MessageType, 
  ConnectorStatus, 
  OcppLogEntry, 
  ChargerConfig, 
  ChargerState 
} from './types';

const createOcppCall = (action: string, payload: any) => {
  const messageId = crypto.randomUUID();
  return [MessageType.CALL, messageId, action, payload];
};

interface Props {
  config: ChargerConfig;
  isActive: boolean;
  onRemove: () => void;
}

export const ChargerItem: React.FC<Props> = ({ config, isActive, onRemove }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<OcppLogEntry[]>([]);
  const [chargerState, setChargerState] = useState<ChargerState>({
    isConnected: false,
    status: 'Available',
    isAuthorized: false,
    authorizedIdTag: null,
    transactionId: null,
    meterValue: 0,
    power: 0,
    lastHeartbeat: null,
    logs: []
  });

  const wsRef = useRef<WebSocket | null>(null);
  const meterIntervalRef = useRef<number | null>(null);
  const stateRef = useRef(chargerState);

  useEffect(() => {
    stateRef.current = chargerState;
  }, [chargerState]);

  const addLog = useCallback((type: OcppLogEntry['type'], payload: any, action?: string, messageId?: string) => {
    const newEntry: OcppLogEntry = {
      id: crypto.randomUUID(),
      chargerId: config.chargePointId,
      timestamp: new Date(),
      type,
      payload,
      action,
      messageId
    };
    setLogs(prev => [newEntry, ...prev].slice(0, 50));
  }, [config.chargePointId]);

  const sendOcppMessage = useCallback((action: string, payload: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      addLog('error', 'Cannot send message: WebSocket is not open');
      return;
    }
    const message = createOcppCall(action, payload);
    wsRef.current.send(JSON.stringify(message));
    addLog('sent', payload, action, message[1] as string);
  }, [addLog]);

  // Simulation Actions
  const sendBootNotification = () => {
    const payload = config.ocppVersion === OcppVersion.V201 
      ? { reason: 'PowerUp', chargingStation: { model: 'Sim-X', vendorName: 'Charglee' } }
      : { chargePointModel: 'Sim-X', chargePointVendor: 'Charglee', firmwareVersion: '1.0' };
    sendOcppMessage('BootNotification', payload);
  };

  const sendStatusNotification = (status: ConnectorStatus) => {
    const payload = config.ocppVersion === OcppVersion.V201
      ? { timestamp: new Date().toISOString(), connectorStatus: status, evseId: 1, connectorId: 1 }
      : { connectorId: 1, errorCode: 'NoError', status, timestamp: new Date().toISOString() };
    setChargerState(prev => ({ ...prev, status }));
    sendOcppMessage('StatusNotification', payload);
  };

  const [rfidInput, setRfidInput] = useState('DE-AD-BE-EF');

  const authorize = useCallback(() => {
    const payload = config.ocppVersion === OcppVersion.V201
      ? { idToken: { idToken: rfidInput, type: 'ISO14443' } }
      : { idTag: rfidInput };
    sendOcppMessage('Authorize', payload);
    setChargerState(prev => ({ ...prev, isAuthorized: true, authorizedIdTag: rfidInput }));
  }, [config.ocppVersion, rfidInput, sendOcppMessage]);

  const startTransaction = useCallback((idTag?: string) => {
    const transactionId = crypto.randomUUID();
    const tag = idTag || stateRef.current.authorizedIdTag || 'DEMO';
    
    const payload = config.ocppVersion === OcppVersion.V201
      ? { 
          timestamp: new Date().toISOString(), 
          triggerReason: 'Authorized', 
          transactionInfo: { transactionId }, 
          evseId: 1, 
          connectorId: 1, 
          eventType: 'Started',
          idToken: { idToken: tag, type: 'ISO14443' }
        }
      : { 
          connectorId: 1, 
          idTag: tag, 
          meterStart: Math.floor(stateRef.current.meterValue), 
          timestamp: new Date().toISOString() 
        };
    
    setChargerState(prev => ({ 
      ...prev, 
      status: 'Charging', 
      transactionId, 
      power: 11000,
      isAuthorized: true,
      authorizedIdTag: tag
    }));
    
    sendOcppMessage(config.ocppVersion === OcppVersion.V201 ? 'TransactionEvent' : 'StartTransaction', payload);
    sendStatusNotification('Charging');
  }, [config.ocppVersion, sendOcppMessage]);

  const stopTransaction = useCallback(() => {
    const payload = config.ocppVersion === OcppVersion.V201
      ? { 
          timestamp: new Date().toISOString(), 
          triggerReason: 'RemoteStop', 
          transactionInfo: { 
            transactionId: stateRef.current.transactionId, 
            stoppedReason: 'StoppedByEV' 
          }, 
          evseId: 1, 
          connectorId: 1, 
          eventType: 'Ended' 
        }
      : { 
          idTag: stateRef.current.authorizedIdTag, 
          meterStop: Math.floor(stateRef.current.meterValue), 
          timestamp: new Date().toISOString(), 
          transactionId: 100 
        };
    
    setChargerState(prev => ({ ...prev, status: 'Available', transactionId: null, isAuthorized: false, power: 0 }));
    sendOcppMessage(config.ocppVersion === OcppVersion.V201 ? 'TransactionEvent' : 'StopTransaction', payload);
    sendStatusNotification('Available');
  }, [config.ocppVersion, sendOcppMessage]);

  const disconnect = () => wsRef.current?.close();

  const connect = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    addLog('info', `Connecting to ${config.cmsUrl}/${config.chargePointId}...`);
    try {
      const url = `${config.cmsUrl.replace(/\/$/, '')}/${config.chargePointId}`;
      const protocol = config.ocppVersion === OcppVersion.V201 ? 'ocpp2.0.1' : 'ocpp1.6';
      const ws = new WebSocket(url, protocol);
      wsRef.current = ws;
      
      ws.onopen = () => { 
        setIsConnected(true); 
        addLog('info', 'Connected to CMS'); 
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const [type, messageId, action, payload] = data;
          
          if (type === MessageType.CALL) {
            addLog('received', payload, action, messageId);
            
            // Handle specific incoming commands
            if (action === 'RemoteStartTransaction' || action === 'RequestStartTransaction') {
              const idTag = config.ocppVersion === OcppVersion.V201 
                ? payload.idToken?.idToken 
                : payload.idTag;
              
              // Respond immediately
              ws.send(JSON.stringify([MessageType.CALL_RESULT, messageId, { status: 'Accepted' }]));
              addLog('sent', { status: 'Accepted' }, `Result (${action})`, messageId);
              
              // Trigger start sequence
              if (stateRef.current.status !== 'Charging') {
                setTimeout(() => startTransaction(idTag), 500);
              }
            } 
            else if (action === 'RemoteStopTransaction' || action === 'RequestStopTransaction') {
              // Respond immediately
              ws.send(JSON.stringify([MessageType.CALL_RESULT, messageId, { status: 'Accepted' }]));
              addLog('sent', { status: 'Accepted' }, `Result (${action})`, messageId);
              
              // Trigger stop sequence
              if (stateRef.current.status === 'Charging') {
                setTimeout(() => stopTransaction(), 500);
              }
            }
            else {
              // Generic fallback response for other commands
              setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify([MessageType.CALL_RESULT, messageId, { status: 'Accepted' }]));
                  addLog('sent', { status: 'Accepted' }, `Result (${action})`, messageId);
                }
              }, 200);
            }
          } else if (type === MessageType.CALL_RESULT) {
            addLog('received', action, 'Result', messageId);
          } else if (type === MessageType.CALL_ERROR) {
            addLog('error', action, 'Error', messageId);
          }
        } catch (e) { 
          addLog('error', 'Failed to parse incoming message'); 
        }
      };
      
      ws.onclose = () => { 
        setIsConnected(false); 
        addLog('info', 'Disconnected from CMS'); 
      };
      
      ws.onerror = () => addLog('error', 'WebSocket Error');
    } catch (e) { 
      addLog('error', `Connection error: ${e}`); 
    }
  }, [config, addLog, startTransaction, stopTransaction]);

  useEffect(() => {
    if (chargerState.status === 'Charging') {
      meterIntervalRef.current = window.setInterval(() => {
        setChargerState(prev => ({ ...prev, meterValue: prev.meterValue + (prev.power / 3600) }));
      }, 1000);
    } else { if (meterIntervalRef.current) clearInterval(meterIntervalRef.current); }
    return () => { if (meterIntervalRef.current) clearInterval(meterIntervalRef.current); };
  }, [chargerState.status, chargerState.power]);

  if (!isActive) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
      <div className="xl:col-span-2 space-y-8">
        <section className="bg-white rounded-[40px] border border-[#E5E5E5] p-10 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#FF8C00]/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="relative group">
            <div className="w-56 h-80 bg-gradient-to-b from-[#E5E5E5]/20 to-[#F9F9F9] rounded-[3rem] border border-[#E5E5E5] shadow-2xl flex flex-col items-center p-6">
              <div className="w-full h-28 bg-white rounded-3xl border border-[#E5E5E5] flex flex-col items-center justify-center gap-2 mb-10 shadow-inner">
                 <div className={`w-10 h-1.5 rounded-full ${isConnected ? 'bg-[#FF8C00] animate-pulse' : 'bg-red-500'}`} />
                 <span className="text-[10px] text-[#333333]/50 font-bold uppercase tracking-widest">EVSE Hardware</span>
              </div>
              <div className={`w-24 h-24 rounded-full border-[6px] flex items-center justify-center transition-all duration-700 ${
                chargerState.status === 'Charging' ? 'border-[#FF8C00] shadow-[0_0_30px_rgba(255,140,0,0.2)] animate-pulse' :
                chargerState.status === 'Available' ? 'border-[#E5E5E5]' : 'border-[#FF4500] shadow-[0_0_30px_rgba(255,69,0,0.1)]'
              }`}>
                <Zap className={`w-10 h-10 ${chargerState.status === 'Charging' ? 'text-[#FF8C00]' : 'text-[#E5E5E5]'}`} />
              </div>
              <div className="mt-12 flex flex-col items-center">
                 <div className="px-4 py-1.5 rounded-full bg-black border border-black text-[9px] text-[#FF8C00] font-black tracking-widest uppercase shadow-lg">
                   ID: {config.chargePointId}
                 </div>
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-6 w-full">
            <StatBlock label="Status" value={chargerState.status} icon={<CheckCircle2 className="w-5 h-5 text-[#FF8C00]" />} />
            <StatBlock label="Power" value={`${chargerState.power} W`} icon={<Cpu className="w-5 h-5 text-[#FF8C00]" />} />
            <StatBlock label="Energy" value={`${(chargerState.meterValue / 1000).toFixed(3)} kWh`} icon={<RotateCcw className="w-5 h-5 text-[#FF4500]" />} />
            <StatBlock label="RFID" value={chargerState.isAuthorized ? chargerState.authorizedIdTag || 'AUTH' : 'WAITING'} icon={<ShieldCheck className={`w-5 h-5 ${chargerState.isAuthorized ? 'text-[#FF8C00]' : 'text-[#333333]/30'}`} />} />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-[#333333]/40 uppercase tracking-[0.2em] flex items-center gap-3">
               <Play className="w-3 h-3 fill-current" /> Simulator Interface
            </h3>
            <div className="flex gap-2">
              {!isConnected ? (
                <button onClick={connect} className="px-4 py-1.5 bg-[#FF8C00] text-black text-[10px] font-black rounded-full uppercase tracking-widest hover:scale-105 transition-all shadow-md">Connect</button>
              ) : (
                <button onClick={disconnect} className="px-4 py-1.5 bg-[#F9F9F9] border border-[#E5E5E5] text-[#333333] text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-white transition-all">Exit Connection</button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionButton label="Boot Station" onClick={sendBootNotification} disabled={!isConnected} icon={<RotateCcw className="w-5 h-5" />} />
            <ActionButton label="Heartbeat" onClick={() => sendOcppMessage('Heartbeat', {})} disabled={!isConnected} icon={<Activity className="w-5 h-5" />} />
            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                className="w-full bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none focus:border-[#FF8C00]"
                placeholder="RFID Tag"
              />
              <ActionButton label="Scan RFID" onClick={authorize} disabled={!isConnected || chargerState.isAuthorized} icon={<CreditCard className="w-5 h-5" />} />
            </div>
            <ActionButton label="Available" onClick={() => sendStatusNotification('Available')} disabled={!isConnected} icon={<CheckCircle2 className="w-5 h-5 text-[#FF8C00]" />} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
             <div className="p-8 rounded-[32px] bg-white border border-[#E5E5E5] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-sm font-bold text-black">Charge Session</h4>
                  {chargerState.status === 'Charging' && <span className="flex h-2.5 w-2.5 rounded-full bg-[#FF8C00] shadow-[0_0_10px_rgba(255,140,0,0.5)] animate-pulse" />}
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <button onClick={() => startTransaction()} disabled={!isConnected || !chargerState.isAuthorized || chargerState.status === 'Charging'} className="flex-1 py-4 px-6 rounded-2xl bg-black text-[#FF8C00] border border-black font-black flex items-center justify-center gap-2 disabled:opacity-20 transition-all text-xs tracking-widest uppercase hover:bg-[#FF8C00] hover:text-black">START</button>
                    <button onClick={stopTransaction} disabled={!isConnected || chargerState.status !== 'Charging'} className="flex-1 py-4 px-6 rounded-2xl bg-[#F9F9F9] text-[#333333] border border-[#E5E5E5] font-black flex items-center justify-center gap-2 disabled:opacity-20 transition-all text-xs tracking-widest uppercase">STOP</button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E5E5E5]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase opacity-30 px-1">Remote CMS Mock</span>
                      <button 
                        onClick={() => {
                          const action = config.ocppVersion === OcppVersion.V201 ? 'RequestStartTransaction' : 'RemoteStartTransaction';
                          const payload = config.ocppVersion === OcppVersion.V201 
                            ? { idToken: { idToken: rfidInput, type: 'ISO14443' }, evseId: 1 } 
                            : { idTag: rfidInput, connectorId: 1 };
                          // Simulate incoming call
                          wsRef.current?.dispatchEvent(new MessageEvent('message', {
                            data: JSON.stringify([MessageType.CALL, crypto.randomUUID(), action, payload])
                          }));
                        }}
                        disabled={!isConnected || chargerState.status === 'Charging'}
                        className="py-2 px-3 rounded-xl bg-[#FF8C00]/10 text-[#FF8C00] text-[9px] font-black uppercase hover:bg-[#FF8C00] hover:text-black transition-all disabled:opacity-20"
                      >
                        Remote Start
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase opacity-30 px-1 invisible">.</span>
                      <button 
                        onClick={() => {
                          const action = config.ocppVersion === OcppVersion.V201 ? 'RequestStopTransaction' : 'RemoteStopTransaction';
                          const payload = { transactionId: chargerState.transactionId || '100' };
                          // Simulate incoming call
                          wsRef.current?.dispatchEvent(new MessageEvent('message', {
                            data: JSON.stringify([MessageType.CALL, crypto.randomUUID(), action, payload])
                          }));
                        }}
                        disabled={!isConnected || chargerState.status !== 'Charging'}
                        className="py-2 px-3 rounded-xl bg-red-500/10 text-red-500 text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all disabled:opacity-20"
                      >
                        Remote Stop
                      </button>
                    </div>
                  </div>
                </div>
             </div>
             <div className="p-8 rounded-[32px] bg-white border border-[#E5E5E5] shadow-sm">
                <h4 className="text-sm font-bold text-black mb-6">Fault Simulation</h4>
                <div className="grid grid-cols-2 gap-3">
                  <SmallButton label="Internal Error" onClick={() => sendStatusNotification('Faulted')} color="text-red-600 bg-red-500/5" />
                  <SmallButton label="Unavailable" onClick={() => sendStatusNotification('Unavailable')} color="text-[#333333]/60 bg-[#F9F9F9]" />
                </div>
             </div>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="bg-white rounded-[32px] border border-[#E5E5E5] p-8 shadow-sm h-full flex flex-col">
          <h3 className="text-[10px] font-black text-[#333333]/40 uppercase tracking-[0.2em] mb-6">Real-time Terminal</h3>
          <div className="flex-1 space-y-4 overflow-auto custom-scrollbar pr-3 font-mono text-[10px]">
            {logs.map(log => (
              <div key={log.id} className="p-3 rounded-xl bg-[#F9F9F9]/50 border border-[#E5E5E5]/30">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-black uppercase tracking-tighter ${log.type === 'sent' ? 'text-blue-500' : log.type === 'received' ? 'text-[#FF8C00]' : 'text-red-500'}`}>{log.type}</span>
                  <span className="opacity-30">{log.timestamp.toLocaleTimeString()}</span>
                </div>
                <div className="font-bold text-black mb-1">{log.action}</div>
                <div className="opacity-60 truncate">{JSON.stringify(log.payload)}</div>
              </div>
            ))}
            {logs.length === 0 && <div className="text-center py-20 opacity-20 italic">No packet history</div>}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatBlock({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-[#F9F9F9]/30 p-6 rounded-[24px] border border-[#E5E5E5] flex flex-col gap-3 group hover:border-[#FF8C00]/30 transition-all shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-[#333333]/40 uppercase tracking-[0.15em]">{label}</span>
        <div className="p-1.5 bg-white rounded-lg shadow-sm">{icon}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-black text-black">{value.split(' ')[0]}</span>
        <span className="text-[10px] font-medium opacity-40">{value.split(' ')[1] || ''}</span>
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, disabled, icon }: { label: string, onClick: () => void, disabled: boolean, icon: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} className="p-6 rounded-[28px] bg-white border border-[#E5E5E5] flex flex-col items-center gap-4 transition-all hover:bg-[#F9F9F9] hover:scale-105 active:scale-95 disabled:opacity-20 shadow-sm group">
      <div className="p-3 bg-[#F9F9F9] rounded-2xl text-[#FF8C00] group-hover:bg-[#FF8C00] group-hover:text-black transition-all duration-300">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#333333]/50">{label}</span>
    </button>
  );
}

function SmallButton({ label, onClick, color }: { label: string, onClick: () => void, color: string }) {
  return (
    <button onClick={onClick} className={`py-3 px-4 rounded-[14px] border border-[#E5E5E5] text-[9px] font-black uppercase tracking-widest transition-all ${color}`}>{label}</button>
  );
}

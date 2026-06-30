export enum OcppVersion {
  V16 = '1.6',
  V201 = '2.0.1'
}

export enum MessageType {
  CALL = 2,
  CALL_RESULT = 3,
  CALL_ERROR = 4
}

export type ConnectorStatus = 
  | 'Available' 
  | 'Preparing' 
  | 'Charging' 
  | 'SuspendedEV' 
  | 'SuspendedEVSE' 
  | 'Finishing' 
  | 'Reserved' 
  | 'Unavailable' 
  | 'Faulted';

export interface OcppLogEntry {
  id: string;
  chargerId: string;
  timestamp: Date;
  type: 'sent' | 'received' | 'error' | 'info';
  action?: string;
  payload: any;
  messageId?: string;
}

export interface ChargerConfig {
  id: string;
  cmsUrl: string;
  chargePointId: string;
  ocppVersion: OcppVersion;
  reconnectInterval: number;
  meterValueInterval?: number;
}

export interface ChargerState {
  isConnected: boolean;
  status: ConnectorStatus;
  isAuthorized: boolean;
  authorizedIdTag: string | null;
  transactionId: string | number | null;
  meterValue: number; // in Wh
  power: number; // in W
  voltage: number; // in V
  current: number; // in A
  soc: number; // in %
  sessionDuration: number; // in seconds
  seqNo: number;
  lastHeartbeat: Date | null;
  logs: OcppLogEntry[];
}

export interface MultiChargerStore {
  [chargerId: string]: ChargerState;
}

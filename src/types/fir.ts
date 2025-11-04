export type IncidentType = 
  | 'theft'
  | 'assault'
  | 'fraud'
  | 'cybercrime'
  | 'missing_person'
  | 'accident'
  | 'other';

export type FIRStatus = 'pending' | 'under_investigation' | 'closed';

export type UserRole = 'civilian' | 'police';

export interface Witness {
  name: string;
  contact: string;
}

export interface FIRData {
  id?: string;
  victimName: string;
  contactEmail: string;
  contactPhone: string;
  incidentType: IncidentType;
  incidentDescription: string;
  incidentDate: string;
  incidentTime: string;
  location: string;
  witnesses: Witness[];
  evidenceFiles?: File[];
  status?: FIRStatus;
  ipfsCID?: string;
  blockchainTxHash?: string;
  createdAt?: string;
  updatedAt?: string;
  submittedBy?: string;
  walletAddress?: string;
}

export interface BlockchainFIR {
  firId: string;
  dataCID: string;
  txHash: string;
  timestamp: number;
  status: FIRStatus;
  submitter: string;
}

export interface AuditLog {
  id?: string;
  user_id: string;
  wallet_address?: string;
  action: string;
  fir_id: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

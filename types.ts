export enum IncidentStatus {
  OPEN = 'Abierto',
  IN_PROGRESS = 'En Revisión',
  RESOLVED = 'Resuelto'
}

export enum IncidentPriority {
  LOW = 'Baja',
  MEDIUM = 'Media',
  HIGH = 'Alta',
  CRITICAL = 'Crítica'
}

export enum IncidentCategory {
  BULB_OUT = 'Foco Fundido',
  FLICKERING = 'Intermitente',
  POLE_DAMAGED = 'Poste Dañado',
  WIRING = 'Cableado Expuesto',
  OTHER = 'Otro'
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: number;
}

export interface Incident {
  id: string;
  poleId?: string;
  description: string;
  userEmail: string; // New field for notifications
  location: GeoLocation;
  status: IncidentStatus;
  createdAt: number;
  updatedAt: number;
  
  aiAnalysis?: {
    category: IncidentCategory;
    priority: IncidentPriority;
    summary: string;
    technicianNotes: string;
  };
}

export type ViewMode = 'USER' | 'TECHNICIAN' | 'LOGIN';
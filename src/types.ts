export interface HumanitarianPoint {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  municipality: string;
  communityOrVereda?: string;
  year: number; // 1986 to present
  endYear?: number; // if it was a multi-year project/program
  executionPeriod?: string; // Fecha de ejecución exacta (ej: '01 de junio de 1988 al 30 de septiembre del 1992')
  fundingAgency?: string; // Agencia o entidad financiadora (ej: 'MISEREOR', 'ADVENIAT', 'OIM', etc.)
  targetPopulation?: string; // Población objetivo detallada
  objectives?: string; // Objetivos del proyecto
  resultsOrAchievements?: string; // Resultados o logros destacados
  categoryId: string; // references Category (Línea de acción de Pastoral Social)
  populationTypes: string[]; // tags categorizadas
  beneficiariesApprox?: number;
  status: 'active' | 'historical' | 'consolidated';
  keyActions?: string[]; // highlights of humanitarian actions
  contactOrLeader?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface PointCategory {
  id: string;
  name: string;
  color: string; // hex code
  iconName: string; // lucide icon identifier
  description?: string;
  isPermanent?: boolean; // Las 5 líneas actuales son permanentes (no editables ni eliminables)
}

export type EcclesiasticalJurisdiction =
  | 'Arquidiócesis de Florencia'
  | 'Diócesis de San Vicente del Caguán'
  | 'Vicariato Apostólico de Puerto Leguízamo – Solano';

export interface CaquetaMunicipality {
  name: string;
  lat: number;
  lng: number;
  jurisdiction: EcclesiasticalJurisdiction;
}

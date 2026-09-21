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
  categoryId: string; // references Category
  populationTypes: string[]; // e.g. "Campesinos", "Comunidades Indígenas", "Víctimas del conflicto / Desplazados", "Mujeres y Familias", "Jóvenes y Niñez", "Migrantes", "Productores Agroecológicos"
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

export interface CaquetaMunicipality {
  name: string;
  lat: number;
  lng: number;
  subregion: 'Norte' | 'Centro' | 'Sur';
}

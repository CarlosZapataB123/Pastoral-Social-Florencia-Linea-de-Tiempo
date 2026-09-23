import { CaquetaMunicipality, PointCategory, HumanitarianPoint, EcclesiasticalJurisdiction } from './types';

export const ECCLESIASTICAL_JURISDICTIONS: {
  id: string;
  name: EcclesiasticalJurisdiction;
  shortName: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  municipalityCount: number;
  description: string;
}[] = [
  {
    id: 'arquidiocesis_florencia',
    name: 'Arquidiócesis de Florencia',
    shortName: 'Arquidiócesis de Florencia',
    color: '#059669', // Emerald
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-800',
    municipalityCount: 14,
    description: 'Florencia (sede episcopal) y 13 municipios del Caquetá',
  },
  {
    id: 'diocesis_san_vicente',
    name: 'Diócesis de San Vicente del Caguán',
    shortName: 'Diócesis de San Vicente del Caguán',
    color: '#0284C7', // Sky Blue
    badgeBg: 'bg-sky-50 border-sky-200',
    badgeText: 'text-sky-800',
    municipalityCount: 1,
    description: 'San Vicente del Caguán (cuenca del Río Caguán y Sabanas del Yarí)',
  },
  {
    id: 'vicariato_leguizamo_solano',
    name: 'Vicariato Apostólico de Puerto Leguízamo – Solano',
    shortName: 'Vicariato Ap. Puerto Leguízamo – Solano',
    color: '#7C3AED', // Violet / Purple
    badgeBg: 'bg-purple-50 border-purple-200',
    badgeText: 'text-purple-800',
    municipalityCount: 1,
    description: 'Municipio de Solano (ríos Consaya, Orteguaza y Caquetá)',
  },
];

export function getEcclesiasticalJurisdiction(municipalityName?: string): EcclesiasticalJurisdiction {
  if (!municipalityName) return 'Arquidiócesis de Florencia';
  const norm = municipalityName.trim().toLowerCase();
  if (norm.includes('solano')) {
    return 'Vicariato Apostólico de Puerto Leguízamo – Solano';
  }
  if (norm.includes('caguán') || norm.includes('caguan') || norm.includes('san vicente')) {
    return 'Diócesis de San Vicente del Caguán';
  }
  return 'Arquidiócesis de Florencia';
}

export function getJurisdictionColor(jurisdictionName: string): string {
  if (jurisdictionName.includes('Solano') || jurisdictionName.includes('Leguízamo') || jurisdictionName.includes('Leguizamo')) {
    return '#7C3AED'; // Purple
  }
  if (jurisdictionName.includes('Vicente') || jurisdictionName.includes('Caguán') || jurisdictionName.includes('Caguan')) {
    return '#0284C7'; // Sky Blue
  }
  return '#059669'; // Emerald
}

export const CAQUETA_MUNICIPALITIES: CaquetaMunicipality[] = [
  { name: 'Florencia', lat: 1.6144, lng: -75.6062, jurisdiction: 'Arquidiócesis de Florencia' },
  { name: 'Morelia', lat: 1.4883, lng: -75.7275, jurisdiction: 'Arquidiócesis de Florencia' },
  { name: 'Belén de los Andaquíes', lat: 1.4172, lng: -75.8756, jurisdiction: 'Arquidiócesis de Florencia' },
  { name: 'San José del Fragua', lat: 1.3283, lng: -75.9722, jurisdiction: 'Arquidiócesis de Florencia' },
  { name: 'Curillo', lat: 1.0333, lng: -75.9183, jurisdiction: 'Arquidiócesis de Florencia' },
  { name: 'Albania', lat: 1.3286, lng: -75.8778, jurisdiction: 'Arquidiócesis de Florencia' },
  { name: 'Valparaíso', lat: 1.1961, lng: -75.7061, jurisdiction: 'Arquidiócesis de Florencia' },
  { name: 'Solita', lat: 0.9419, lng: -75.6314, jurisdiction: 'Arquidiócesis de Florencia' },
  { name: 'Milán', lat: 1.2917, lng: -75.5122, jurisdiction: 'Arquidiócesis de Florencia' },
  { name: 'La Montañita', lat: 1.4828, lng: -75.4389, jurisdiction: 'Arquidiócesis de Florencia' },
  { name: 'El Paujil', lat: 1.5647, lng: -75.3325, jurisdiction: 'Arquidiócesis de Florencia' },
  { name: 'El Doncello', lat: 1.6775, lng: -75.2831, jurisdiction: 'Arquidiócesis de Florencia' },
  { name: 'Puerto Rico', lat: 1.9142, lng: -75.1472, jurisdiction: 'Arquidiócesis de Florencia' },
  { name: 'San Vicente del Caguán', lat: 2.1136, lng: -74.7694, jurisdiction: 'Diócesis de San Vicente del Caguán' },
  { name: 'Cartagena del Chairá', lat: 1.3347, lng: -74.8428, jurisdiction: 'Arquidiócesis de Florencia' },
  { name: 'Solano', lat: 0.7069, lng: -75.2536, jurisdiction: 'Vicariato Apostólico de Puerto Leguízamo – Solano' },
];

export const POPULATION_TYPES = [
  'Víctimas del conflicto y Desplazados',
  'Comunidades Campesinas y Colonos',
  'Pueblos Indígenas (Koreguaje, Embera, Uitoto, Inga)',
  'Mujeres lideresas y Madres cabeza de hogar',
  'Niñez, Infancia y Juventudes',
  'Migrantes y Población en tránsito',
  'Productores Agroecológicos y Cacaoteros/Caucheros',
  'Firmantes de Paz y Comunidades Receptoras',
  'Adultos Mayores y Personas con Discapacidad'
];

export const CORE_PERMANENT_CATEGORIES: PointCategory[] = [
  {
    id: 'linea_pastoral_rural_tierra',
    name: 'Pastoral rural y de la tierra',
    color: '#059669', // Emerald Amazon
    iconName: 'Trees',
    description:
      'Cuidado de la Amazonía. Eje ambiental-territorial: defensa del bosque, prácticas productivas sostenibles, vínculo con la tierra como bien común.',
    isPermanent: true,
  },
  {
    id: 'linea_seguridad_soberania_alimentaria',
    name: 'Seguridad y soberanía alimentaria',
    color: '#10B981', // Vibrant Green
    iconName: 'Sprout',
    description:
      'Diagnóstico: en Caquetá, jóvenes y niños campesinos quieren salir pronto del territorio. Objetivo: generar arraigo territorial y relevo generacional. Vías: juntas de acción comunal, fincas y escuelas rurales; creación de oportunidades reales en el territorio.',
    isPermanent: true,
  },
  {
    id: 'linea_cuidado_justicia',
    name: 'Cuidado y justicia',
    color: '#2563EB', // Blue
    iconName: 'Shield',
    description:
      'Acompañamiento y protección a líderes y lideresas sociales. Salvar vidas. Atención al desplazamiento forzado, incluido el urbano (sector urbano copado por actores armados).',
    isPermanent: true,
  },
  {
    id: 'linea_mujer',
    name: 'Mujer',
    color: '#8B5CF6', // Violet
    iconName: 'Sparkles',
    description: 'Promoción de la mujer rural y procesos de formación.',
    isPermanent: true,
  },
  {
    id: 'linea_comites_parroquiales',
    name: 'Comités parroquiales de Pastoral Social',
    color: '#D97706', // Amber / Golden
    iconName: 'HeartHandshake',
    description:
      'Red de apoyo en las parroquias para asistencia a población vulnerable y activación de rutas de atención.',
    isPermanent: true,
  },
];

export const DEFAULT_CATEGORIES: PointCategory[] = CORE_PERMANENT_CATEGORIES;

export const INITIAL_HISTORICAL_POINTS: HumanitarianPoint[] = [];


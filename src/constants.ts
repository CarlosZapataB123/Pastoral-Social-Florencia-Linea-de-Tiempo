import { CaquetaMunicipality, PointCategory, HumanitarianPoint } from './types';

export const CAQUETA_MUNICIPALITIES: CaquetaMunicipality[] = [
  { name: 'Florencia', lat: 1.6144, lng: -75.6062, subregion: 'Centro' },
  { name: 'Morelia', lat: 1.4883, lng: -75.7275, subregion: 'Sur' },
  { name: 'Belén de los Andaquíes', lat: 1.4172, lng: -75.8756, subregion: 'Sur' },
  { name: 'San José del Fragua', lat: 1.3283, lng: -75.9722, subregion: 'Sur' },
  { name: 'Curillo', lat: 1.0333, lng: -75.9183, subregion: 'Sur' },
  { name: 'Albania', lat: 1.3286, lng: -75.8778, subregion: 'Sur' },
  { name: 'Valparaíso', lat: 1.1961, lng: -75.7061, subregion: 'Sur' },
  { name: 'Solita', lat: 0.9419, lng: -75.6314, subregion: 'Sur' },
  { name: 'Milán', lat: 1.2917, lng: -75.5122, subregion: 'Sur' },
  { name: 'La Montañita', lat: 1.4828, lng: -75.4389, subregion: 'Centro' },
  { name: 'El Paujil', lat: 1.5647, lng: -75.3325, subregion: 'Norte' },
  { name: 'El Doncello', lat: 1.6775, lng: -75.2831, subregion: 'Norte' },
  { name: 'Puerto Rico', lat: 1.9142, lng: -75.1472, subregion: 'Norte' },
  { name: 'San Vicente del Caguán', lat: 2.1136, lng: -74.7694, subregion: 'Norte' },
  { name: 'Cartagena del Chairá', lat: 1.3347, lng: -74.8428, subregion: 'Centro' },
  { name: 'Solano', lat: 0.7069, lng: -75.2536, subregion: 'Sur' },
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


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

export const DEFAULT_CATEGORIES: PointCategory[] = [
  {
    id: 'derechos_humanos_paz',
    name: 'Derechos Humanos y Paz',
    color: '#3B82F6', // Blue
    iconName: 'Shield',
    description: 'Atención humanitaria a víctimas, mediación, acompañamiento en el conflicto armado y memoria histórica.'
  },
  {
    id: 'seguridad_alimentaria',
    name: 'Seguridad Alimentaria y Agroecología',
    color: '#10B981', // Emerald
    iconName: 'Sprout',
    description: 'Fincas agroecológicas, bancos de semillas criollas, soberanía alimentaria y comercialización campesina.'
  },
  {
    id: 'infancia_juventud',
    name: 'Infancia, Juventud y Educación',
    color: '#F59E0B', // Amber
    iconName: 'Users',
    description: 'Espacios protectores, ludotecas rurales, refuerzo escolar y prevención del reclutamiento forzado.'
  },
  {
    id: 'emergencia_migracion',
    name: 'Emergencia y Ayuda Humanitaria Inmediata',
    color: '#EF4444', // Red
    iconName: 'HeartHandshake',
    description: 'Kits alimentarios, albergues temporales, atención ante inundaciones por ríos Caguán, Orteguaza y Caquetá.'
  },
  {
    id: 'empoderamiento_femenino',
    name: 'Mujeres y Tejido Comunitario',
    color: '#8B5CF6', // Purple
    iconName: 'Sparkles',
    description: 'Talleres productivos de mujeres, escuelas de liderazgo de paz y comités de convivencia.'
  },
  {
    id: 'cuidado_casa_comun',
    name: 'Cuidado de la Casa Común y Amazonía',
    color: '#059669', // Deep green
    iconName: 'Trees',
    description: 'Conservación de cuencas hidrográficas, reforestación amazónica y monitoreo socioambiental.'
  }
];

export const INITIAL_HISTORICAL_POINTS: HumanitarianPoint[] = [
  {
    id: 'hist-1986-fundacion-florencia',
    title: 'Sede Central y Fundación Pastoral Social',
    description: 'Fundación oficial de la Vicaría de Pastoral Social de la Diócesis de Florencia (Monseñor José Luis Serna Alzate). Centro neurálgico de articulación humanitaria y defensa de los derechos de colonos y comunidades rurales.',
    lat: 1.6144,
    lng: -75.6062,
    municipality: 'Florencia',
    communityOrVereda: 'Barrio Centro / Curia Episcopal',
    year: 1986,
    categoryId: 'derechos_humanos_paz',
    populationTypes: ['Víctimas del conflicto y Desplazados', 'Comunidades Campesinas y Colonos'],
    beneficiariesApprox: 15000,
    status: 'consolidated',
    keyActions: ['Coordinación departamental', 'Acompañamiento a marchas campesinas de los 80', 'Documentación de DDHH']
  },
  {
    id: 'hist-1996-marchas-sanvicente',
    title: 'Acompañamiento Humanitario en Marchas Cocaleras y Diálogos',
    description: 'Presencia de mediación pastoral y corredor humanitario durante las multitudinarias movilizaciones campesinas del Caguán para garantizar la vida y víveres.',
    lat: 2.1136,
    lng: -74.7694,
    municipality: 'San Vicente del Caguán',
    communityOrVereda: 'Casco urbano y veredas del Río Caguán',
    year: 1996,
    endYear: 2002,
    categoryId: 'derechos_humanos_paz',
    populationTypes: ['Comunidades Campesinas y Colonos', 'Víctimas del conflicto y Desplazados'],
    beneficiariesApprox: 8000,
    status: 'historical',
    keyActions: ['Comisión de facilitación humanitaria', 'Entrega de paquetes alimentarios de urgencia', 'Monitoreo de derechos humanos']
  },
  {
    id: 'hist-2004-resguardo-san-jose',
    title: 'Acompañamiento a Pueblos Indígenas del Fragua',
    description: 'Programa integral de protección cultural, agua potable comunitaria y soberanía alimentaria con familias indígenas Inga y Embera Chami.',
    lat: 1.3283,
    lng: -75.9722,
    municipality: 'San José del Fragua',
    communityOrVereda: 'Resguardos indígenas cuenca río Fragua',
    year: 2004,
    categoryId: 'cuidado_casa_comun',
    populationTypes: ['Pueblos Indígenas (Koreguaje, Embera, Uitoto, Inga)', 'Niñez, Infancia y Juventudes'],
    beneficiariesApprox: 650,
    status: 'active',
    keyActions: ['Huertos medicinales ancestrales', 'Protección del piedemonte amazónico', 'Sistemas de captación de agua']
  },
  {
    id: 'hist-2010-paujil-fincas',
    title: 'Red de Fincas Agroecológicas y Seguridad Alimentaria',
    description: 'Implementación del modelo de fincas autosostenibles para sustitución voluntaria, producción de panela ecológica y cacao bajo sombra.',
    lat: 1.5647,
    lng: -75.3325,
    municipality: 'El Paujil',
    communityOrVereda: 'Veredas La Unión y Galicia',
    year: 2010,
    endYear: 2018,
    categoryId: 'seguridad_alimentaria',
    populationTypes: ['Comunidades Campesinas y Colonos', 'Productores Agroecológicos y Cacaoteros/Caucheros'],
    beneficiariesApprox: 1200,
    status: 'consolidated',
    keyActions: ['Banco de semillas nativas', 'Capacitación en abonos orgánicos', 'Asociatividad campesina']
  },
  {
    id: 'hist-2015-puertorico-mujeres',
    title: 'Escuela de Liderazgo de Mujeres y Reconstrucción del Tejido',
    description: 'Iniciativa para mujeres víctimas de la violencia sociopolítica en el norte del Caquetá con enfoque de sanación, costura y emprendimientos avícolas.',
    lat: 1.9142,
    lng: -75.1472,
    municipality: 'Puerto Rico',
    communityOrVereda: 'Veredas Río Guayas',
    year: 2015,
    categoryId: 'empoderamiento_femenino',
    populationTypes: ['Mujeres lideresas y Madres cabeza de hogar', 'Víctimas del conflicto y Desplazados'],
    beneficiariesApprox: 420,
    status: 'active',
    keyActions: ['Círculos de la palabra', 'Proyectos productivos de gallinas ponedoras', 'Memoria y sanación psicosocial']
  },
  {
    id: 'hist-2019-cartagena-chaira',
    title: 'Atención a Inundaciones y Cuenca del Río Caguán',
    description: 'Respuesta ante emergencias climáticas y desbordamiento del río Caguán, entregando albergues temporales y kits sanitarios a comunidades ribereñas.',
    lat: 1.3347,
    lng: -74.8428,
    municipality: 'Cartagena del Chairá',
    communityOrVereda: 'Ribera del Río Caguán',
    year: 2019,
    categoryId: 'emergencia_migracion',
    populationTypes: ['Comunidades Campesinas y Colonos', 'Niñez, Infancia y Juventudes'],
    beneficiariesApprox: 2400,
    status: 'historical',
    keyActions: ['Filtros potabilizadores comunitarios', 'Distribución de kits de supervivencia', 'Prevención epidemiológica']
  },
  {
    id: 'hist-2022-belen-andaquies',
    title: 'Custodios del Agua y la Biodiversidad del Sarabando',
    description: 'Acompañamiento a jóvenes y campesinos en la declaración de microcuencas protegidas y fomento del ecoturismo comunitario de paz.',
    lat: 1.4172,
    lng: -75.8756,
    municipality: 'Belen de los Andaquíes',
    communityOrVereda: 'Parque Natural Municipal Termales y Sarabando',
    year: 2022,
    categoryId: 'cuidado_casa_comun',
    populationTypes: ['Niñez, Infancia y Juventudes', 'Comunidades Campesinas y Colonos'],
    beneficiariesApprox: 850,
    status: 'active',
    keyActions: ['Monitoreo comunitario de fuentes hídricas', 'Senderos de memoria natural', 'Formación de vigías ambientales']
  },
  {
    id: 'hist-2024-migrantes-florencia',
    title: 'Centro de Atención al Migrante y Desplazado (CAMI)',
    description: 'Espacio de acogida integral, orientación jurídica y salud básica para personas en tránsito y familias desplazadas recientes que arriban a la capital de Caquetá.',
    lat: 1.6210,
    lng: -75.6120,
    municipality: 'Florencia',
    communityOrVereda: 'Terminal y Barrio Juan XXIII',
    year: 2024,
    categoryId: 'emergencia_migracion',
    populationTypes: ['Migrantes y Población en tránsito', 'Víctimas del conflicto y Desplazados', 'Mujeres lideresas y Madres cabeza de hogar'],
    beneficiariesApprox: 3100,
    status: 'active',
    keyActions: ['Raciones calientes diarias', 'Asesoría legal y migratoria', 'Acompañamiento psicosocial']
  }
];

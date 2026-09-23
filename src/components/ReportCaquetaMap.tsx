import React, { useState, useMemo } from 'react';
import { HumanitarianPoint, PointCategory } from '../types';
import {
  CAQUETA_MUNICIPALITIES,
  getEcclesiasticalJurisdiction,
  getJurisdictionColor,
  POPULATION_TYPES,
  CORE_PERMANENT_CATEGORIES,
} from '../constants';
import {
  CAQUETA_DEPARTAMENTO_GEOJSON,
  CAQUETA_MUNICIPIOS_GEOJSON,
} from '../data/caquetaBoundaries';
import {
  Compass,
  MapPin,
  Church,
  Users,
  Download,
  Filter,
  RotateCcw,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  BarChart3,
  Sparkles,
} from 'lucide-react';

interface ReportCaquetaMapProps {
  points: HumanitarianPoint[];
  allAvailablePoints?: HumanitarianPoint[];
  categories?: PointCategory[];
  globalSelectedJurisdiction?: string;
  onSelectMunicipality?: (muniName: string) => void;
}

export type ZoomPreset = 'full' | 'piedemonte' | 'caguan' | 'solano';

export const ReportCaquetaMap: React.FC<ReportCaquetaMapProps> = ({
  points,
  allAvailablePoints,
  categories = CORE_PERMANENT_CATEGORIES,
  globalSelectedJurisdiction = 'all',
  onSelectMunicipality,
}) => {
  // Map View Zoom Preset
  const [zoomPreset, setZoomPreset] = useState<ZoomPreset>('full');
  const [hoveredMuni, setHoveredMuni] = useState<string | null>(null);

  // Map-Specific Dedicated Filters (Only affects Caquetá Map, its stats & its CSV export)
  const [mapFilterPopulation, setMapFilterPopulation] = useState<string>('all');
  const [mapFilterJurisdiction, setMapFilterJurisdiction] = useState<string>('all');
  const [mapFilterCategoryId, setMapFilterCategoryId] = useState<string>('all');
  const [mapFilterStatus, setMapFilterStatus] = useState<string>('all');
  const [mapFilterPeriod, setMapFilterPeriod] = useState<string>('all');
  const [mapSearch, setMapSearch] = useState<string>('');

  // Table Preview Toggle
  const [showMatrixTable, setShowMatrixTable] = useState<boolean>(false);

  // Categories lookup map
  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Extract all unique population tags from current dataset and merge with POPULATION_TYPES
  const availablePopulationOptions = useMemo(() => {
    const set = new Set<string>(POPULATION_TYPES);
    points.forEach((p) => {
      if (Array.isArray(p.populationTypes)) {
        p.populationTypes.forEach((tag) => {
          if (tag && tag.trim()) set.add(tag.trim());
        });
      }
    });
    return Array.from(set).sort();
  }, [points]);

  // Check if any map-specific filter is currently active
  const isMapFiltered =
    mapFilterPopulation !== 'all' ||
    mapFilterJurisdiction !== 'all' ||
    mapFilterCategoryId !== 'all' ||
    mapFilterStatus !== 'all' ||
    mapFilterPeriod !== 'all' ||
    mapSearch.trim() !== '';

  // Filtered Points strictly for the Caquetá Cartographic Map
  const filteredMapPoints = useMemo(() => {
    return points.filter((p) => {
      // 1. Population Filter
      if (mapFilterPopulation !== 'all') {
        const matchesTag = p.populationTypes?.some(
          (t) => t.toLowerCase() === mapFilterPopulation.toLowerCase()
        );
        const matchesText = p.targetPopulation
          ?.toLowerCase()
          .includes(mapFilterPopulation.toLowerCase());
        if (!matchesTag && !matchesText) return false;
      }

      // 2. Ecclesiastical Jurisdiction Filter
      if (mapFilterJurisdiction !== 'all') {
        const jur = getEcclesiasticalJurisdiction(p.municipality);
        if (jur !== mapFilterJurisdiction) return false;
      }

      // 3. Category / Eje Pastoral Filter
      if (mapFilterCategoryId !== 'all') {
        if (p.categoryId !== mapFilterCategoryId) return false;
      }

      // 4. Status Filter
      if (mapFilterStatus !== 'all') {
        if (p.status !== mapFilterStatus) return false;
      }

      // 5. Period Filter
      if (mapFilterPeriod !== 'all') {
        if (mapFilterPeriod === '2020-2026' && p.year < 2020) return false;
        if (mapFilterPeriod === '2016-2019' && (p.year < 2016 || p.year > 2019)) return false;
        if (mapFilterPeriod === '2000-2015' && (p.year < 2000 || p.year > 2015)) return false;
        if (mapFilterPeriod === '1986-1999' && p.year > 1999) return false;
      }

      // 6. Search query
      if (mapSearch.trim() !== '') {
        const q = mapSearch.toLowerCase();
        const inTitle = p.title.toLowerCase().includes(q);
        const inDesc = p.description.toLowerCase().includes(q);
        const inMuni = p.municipality.toLowerCase().includes(q);
        const inVereda = p.communityOrVereda?.toLowerCase().includes(q) || false;
        const inFunder = p.fundingAgency?.toLowerCase().includes(q) || false;
        const inPop = p.targetPopulation?.toLowerCase().includes(q) || false;
        if (!inTitle && !inDesc && !inMuni && !inVereda && !inFunder && !inPop) return false;
      }

      return true;
    });
  }, [
    points,
    mapFilterPopulation,
    mapFilterJurisdiction,
    mapFilterCategoryId,
    mapFilterStatus,
    mapFilterPeriod,
    mapSearch,
  ]);

  // Count points strictly per municipality for the current filtered map set
  const muniProjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CAQUETA_MUNICIPALITIES.forEach((m) => {
      counts[m.name] = 0;
    });

    filteredMapPoints.forEach((p) => {
      const raw = (p.municipality || '').trim();
      if (!raw) return;
      let matched = CAQUETA_MUNICIPALITIES.find(
        (m) => m.name.toLowerCase() === raw.toLowerCase()
      );
      if (!matched && raw.toLowerCase().includes('monta')) {
        matched = CAQUETA_MUNICIPALITIES.find((m) => m.name.includes('Montañita'));
      }
      if (matched) {
        counts[matched.name] = (counts[matched.name] || 0) + 1;
      }
    });

    return counts;
  }, [filteredMapPoints]);

  // Overall and variable statistics
  const totalMapProjects = filteredMapPoints.length;
  const baseProjectsCount = points.length || 1;
  const percentageOfTotal = ((totalMapProjects / baseProjectsCount) * 100).toFixed(1);

  const activeMunicipalitiesCount = useMemo(() => {
    return Object.values(muniProjectCounts).filter((c) => c > 0).length;
  }, [muniProjectCounts]);

  const totalBeneficiaries = useMemo(() => {
    return filteredMapPoints.reduce((acc, p) => acc + (p.beneficiariesApprox || 0), 0);
  }, [filteredMapPoints]);

  // Breakdown by Ecclesiastical Jurisdiction
  const jurisdictionStats = useMemo(() => {
    const counts: Record<string, { projects: number; beneficiaries: number }> = {
      'Arquidiócesis de Florencia': { projects: 0, beneficiaries: 0 },
      'Diócesis de San Vicente del Caguán': { projects: 0, beneficiaries: 0 },
      'Vicariato Apostólico de Puerto Leguízamo – Solano': { projects: 0, beneficiaries: 0 },
    };

    filteredMapPoints.forEach((p) => {
      const jur = getEcclesiasticalJurisdiction(p.municipality);
      if (counts[jur]) {
        counts[jur].projects++;
        counts[jur].beneficiaries += p.beneficiariesApprox || 0;
      }
    });

    return counts;
  }, [filteredMapPoints]);

  // Top municipalities with project presence for this variable
  const topMunicipalities = useMemo(() => {
    return Object.entries(muniProjectCounts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [muniProjectCounts]);

  // Top pastoral axes involved
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredMapPoints.forEach((p) => {
      map[p.categoryId] = (map[p.categoryId] || 0) + 1;
    });
    return Object.entries(map)
      .map(([catId, count]) => ({
        category: categoryMap.get(catId),
        count,
        percentage: totalMapProjects > 0 ? Math.round((count / totalMapProjects) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredMapPoints, categoryMap, totalMapProjects]);

  // Top funding agencies involved
  const fundingAgencies = useMemo(() => {
    const agencies = new Set<string>();
    filteredMapPoints.forEach((p) => {
      if (p.fundingAgency && p.fundingAgency.trim()) {
        agencies.add(p.fundingAgency.trim());
      }
    });
    return Array.from(agencies).slice(0, 6);
  }, [filteredMapPoints]);

  // Active variable title description
  const activeVariableLabel = useMemo(() => {
    const parts: string[] = [];
    if (mapFilterPopulation !== 'all') {
      parts.push(`Población: "${mapFilterPopulation}"`);
    }
    if (mapFilterCategoryId !== 'all') {
      const catName = categoryMap.get(mapFilterCategoryId)?.name || mapFilterCategoryId;
      parts.push(`Línea Pastoral: "${catName}"`);
    }
    if (mapFilterJurisdiction !== 'all') {
      parts.push(`Jurisdicción: "${mapFilterJurisdiction}"`);
    }
    if (mapFilterStatus !== 'all') {
      const statusNames = {
        active: 'Activos',
        consolidated: 'Consolidados',
        historical: 'Memoria Histórica',
      };
      parts.push(`Estado: ${statusNames[mapFilterStatus as keyof typeof statusNames] || mapFilterStatus}`);
    }
    if (mapFilterPeriod !== 'all') {
      parts.push(`Periodo: ${mapFilterPeriod}`);
    }
    if (mapSearch.trim() !== '') {
      parts.push(`Búsqueda: "${mapSearch}"`);
    }

    if (parts.length === 0) {
      return 'Portafolio Cartográfico General de Caquetá (Sin filtros aplicados)';
    }
    return parts.join(' | ');
  }, [
    mapFilterPopulation,
    mapFilterCategoryId,
    mapFilterJurisdiction,
    mapFilterStatus,
    mapFilterPeriod,
    mapSearch,
    categoryMap,
  ]);

  // Reset map-specific filters
  const handleResetMapFilters = () => {
    setMapFilterPopulation('all');
    setMapFilterJurisdiction('all');
    setMapFilterCategoryId('all');
    setMapFilterStatus('all');
    setMapFilterPeriod('all');
    setMapSearch('');
  };

  // Download Projects Matrix (CSV / Excel formatted with BOM UTF-8)
  const handleDownloadMatrix = () => {
    if (filteredMapPoints.length === 0) {
      alert('No hay proyectos que coincidan con los filtros seleccionados para descargar.');
      return;
    }

    const headers = [
      'ID Proyecto',
      'Título del Proyecto / Hito',
      'Municipio',
      'Jurisdicción Eclesiástica',
      'Comunidad / Vereda / Barrio',
      'Eje Pastoral / Categoría',
      'Año Inicio',
      'Año Fin',
      'Periodo de Ejecución',
      'Estado',
      'Población Objetivo (Detallada)',
      'Tipos de Población',
      'Beneficiarios Estimados',
      'Entidad Financiadora / Cooperante',
      'Líder o Persona de Contacto',
      'Acciones Clave',
      'Descripción / Síntesis',
      'Latitud',
      'Longitud',
    ];

    const escapeCSV = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredMapPoints.map((p) => {
      const catName = categoryMap.get(p.categoryId)?.name || 'General';
      const jur = getEcclesiasticalJurisdiction(p.municipality);
      const popTypes = Array.isArray(p.populationTypes) ? p.populationTypes.join('; ') : '';
      const keyActions = Array.isArray(p.keyActions) ? p.keyActions.join('; ') : '';

      return [
        escapeCSV(p.id),
        escapeCSV(p.title),
        escapeCSV(p.municipality),
        escapeCSV(jur),
        escapeCSV(p.communityOrVereda || ''),
        escapeCSV(catName),
        escapeCSV(p.year),
        escapeCSV(p.endYear || ''),
        escapeCSV(p.executionPeriod || ''),
        escapeCSV(p.status),
        escapeCSV(p.targetPopulation || ''),
        escapeCSV(popTypes),
        escapeCSV(p.beneficiariesApprox || 0),
        escapeCSV(p.fundingAgency || ''),
        escapeCSV(p.contactOrLeader || ''),
        escapeCSV(keyActions),
        escapeCSV(p.description),
        escapeCSV(p.lat),
        escapeCSV(p.lng),
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const safeVar = mapFilterPopulation !== 'all'
      ? `_poblacion_${mapFilterPopulation.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 24)}`
      : isMapFiltered
      ? '_filtrada'
      : '_general';
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `matriz_proyectos_caqueta${safeVar}_${dateStr}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Coordinates system bounds for SVG:
  const SVG_WIDTH = 900;
  const SVG_HEIGHT = 660;

  // Presets definition
  const viewBounds = useMemo(() => {
    switch (zoomPreset) {
      case 'piedemonte': // Zoom onto Florencia, Paujil, Doncello, Belén, Curillo, etc.
        return { minLng: -76.4, maxLng: -74.65, minLat: 0.75, maxLat: 2.35 };
      case 'caguan': // Zoom onto San Vicente del Caguán and Cartagena del Chairá
        return { minLng: -75.45, maxLng: -73.1, minLat: 0.45, maxLat: 3.05 };
      case 'solano': // Zoom onto Solano (southern Caquetá)
        return { minLng: -75.6, maxLng: -71.2, minLat: -0.75, maxLat: 1.25 };
      case 'full':
      default: // Entire department
        return { minLng: -76.4, maxLng: -71.2, minLat: -0.75, maxLat: 3.05 };
    }
  }, [zoomPreset]);

  // Projection helper: (lng, lat) -> (svgX, svgY)
  const project = (lng: number, lat: number): [number, number] => {
    const { minLng, maxLng, minLat, maxLat } = viewBounds;
    const x = ((lng - minLng) / (maxLng - minLng)) * SVG_WIDTH;
    const y = ((maxLat - lat) / (maxLat - minLat)) * SVG_HEIGHT;
    return [x, y];
  };

  // Convert GeoJSON polygon coordinates to SVG path `d`
  const geoCoordinatesToPath = (coordinates: any, type: string): string => {
    if (type === 'Polygon') {
      return coordinates
        .map((ring: number[][]) => {
          return ring
            .map((coord, i) => {
              const [x, y] = project(coord[0], coord[1]);
              return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
            })
            .join(' ') + ' Z';
        })
        .join(' ');
    } else if (type === 'MultiPolygon') {
      return coordinates
        .map((poly: number[][][]) => {
          return poly
            .map((ring: number[][]) => {
              return ring
                .map((coord, i) => {
                  const [x, y] = project(coord[0], coord[1]);
                  return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                })
                .join(' ') + ' Z';
            })
            .join(' ');
        })
        .join(' ');
    }
    return '';
  };

  // Municipality centroid coordinates tuned for clear badge readability
  const labelAnchorOverrides: Record<string, { lat: number; lng: number; offset?: [number, number] }> = {
    Florencia: { lat: 1.63, lng: -75.58, offset: [0, -10] },
    Morelia: { lat: 1.38, lng: -75.68, offset: [-15, 0] },
    'Belén de los Andaquíes': { lat: 1.48, lng: -75.86, offset: [-15, 0] },
    'San José del Fragua': { lat: 1.32, lng: -76.08, offset: [-10, 5] },
    Curillo: { lat: 1.05, lng: -75.95, offset: [-10, 10] },
    Albania: { lat: 1.22, lng: -75.87, offset: [0, 0] },
    Valparaíso: { lat: 1.10, lng: -75.65, offset: [0, 5] },
    Solita: { lat: 0.88, lng: -75.62, offset: [0, 10] },
    Milán: { lat: 1.16, lng: -75.36, offset: [0, 0] },
    'La Montañita': { lat: 1.42, lng: -75.28, offset: [10, -5] },
    'El Paujil': { lat: 1.68, lng: -75.30, offset: [15, 0] },
    'El Doncello': { lat: 1.82, lng: -75.20, offset: [15, -5] },
    'Puerto Rico': { lat: 1.98, lng: -75.05, offset: [15, 0] },
    'San Vicente del Caguán': { lat: 2.15, lng: -74.45, offset: [0, 0] },
    'Cartagena del Chairá': { lat: 0.95, lng: -74.35, offset: [0, 0] },
    Solano: { lat: 0.15, lng: -73.65, offset: [0, 0] },
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden my-6 report-map-container break-inside-avoid print:break-inside-avoid print:border-stone-300 print:shadow-none">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR: TITLE, ACTIONS & MATRIX DOWNLOAD                       */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/80 flex flex-wrap items-center justify-between gap-3 print:bg-white print:pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-600 text-white shrink-0">
              <Compass className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-black text-stone-900 tracking-tight">
              Mapa Cartográfico del Caquetá • Densidad de Proyectos por Municipio
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Georreferenciación territorial con conteo de proyectos por municipio, filtros especializados y descarga de matriz
          </p>
        </div>

        {/* Action Buttons: Matrix Download & Table Preview */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {/* Download CSV Matrix Button */}
          <button
            type="button"
            onClick={handleDownloadMatrix}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
            title="Descargar matriz en Excel/CSV de los proyectos filtrados en el mapa"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Matriz ({totalMapProjects})</span>
          </button>

          {/* Toggle Matrix Table Preview */}
          <button
            type="button"
            onClick={() => setShowMatrixTable(!showMatrixTable)}
            className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs font-semibold rounded-xl shadow-2xs transition flex items-center gap-1.5"
            title="Ver / Ocultar tabla de datos de la matriz"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-stone-600" />
            <span>{showMatrixTable ? 'Ocultar Matriz' : 'Ver Matriz'}</span>
            {showMatrixTable ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DEDICATED MAP & PRINT FILTERS TOOLBAR (Interactive, hidden on print)    */}
      {/* ========================================================================= */}
      <div className="p-3.5 bg-amber-50/50 border-b border-amber-200/70 text-xs print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold">
            <Filter className="w-3.5 h-3.5 text-amber-700" />
            <span>Filtros de Cartografía e Impresión del Mapa</span>
            {isMapFiltered && (
              <span className="bg-amber-600 text-white text-[10px] px-2 py-0.2 rounded-full font-extrabold ml-1">
                Filtro Activo
              </span>
            )}
          </div>

          {/* Zoom Presets Selector */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-stone-200 shadow-2xs">
            <span className="text-[10px] font-bold text-stone-400 uppercase px-1.5">Zoom:</span>
            <button
              type="button"
              onClick={() => setZoomPreset('full')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                zoomPreset === 'full' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Caquetá
            </button>
            <button
              type="button"
              onClick={() => setZoomPreset('piedemonte')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                zoomPreset === 'piedemonte' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Piedemonte
            </button>
            <button
              type="button"
              onClick={() => setZoomPreset('caguan')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                zoomPreset === 'caguan' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Caguán
            </button>
            <button
              type="button"
              onClick={() => setZoomPreset('solano')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                zoomPreset === 'solano' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Solano
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* Population Filter */}
          <div>
            <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
              Tipo de Población:
            </label>
            <select
              value={mapFilterPopulation}
              onChange={(e) => setMapFilterPopulation(e.target.value)}
              className="w-full text-xs bg-white border border-stone-300 rounded-lg py-1 px-2 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
            >
              <option value="all">Todas las Poblaciones</option>
              {availablePopulationOptions.map((pop) => (
                <option key={pop} value={pop}>
                  {pop}
                </option>
              ))}
            </select>
          </div>

          {/* Ecclesiastical Jurisdiction Filter */}
          <div>
            <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
              Jurisdicción Eclesial:
            </label>
            <select
              value={mapFilterJurisdiction}
              onChange={(e) => setMapFilterJurisdiction(e.target.value)}
              className="w-full text-xs bg-white border border-stone-300 rounded-lg py-1 px-2 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
            >
              <option value="all">Todas las Jurisdicciones</option>
              <option value="Arquidiócesis de Florencia">Arquidiócesis de Florencia</option>
              <option value="Diócesis de San Vicente del Caguán">Diócesis de San Vicente</option>
              <option value="Vicariato Apostólico de Puerto Leguízamo – Solano">
                Vicariato Ap. Puerto Leguízamo – Solano
              </option>
            </select>
          </div>

          {/* Category / Eje Pastoral Filter */}
          <div>
            <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
              Eje / Línea Pastoral:
            </label>
            <select
              value={mapFilterCategoryId}
              onChange={(e) => setMapFilterCategoryId(e.target.value)}
              className="w-full text-xs bg-white border border-stone-300 rounded-lg py-1 px-2 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
            >
              <option value="all">Todos los Ejes Pastorales</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Project Status */}
          <div>
            <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
              Estado de Intervención:
            </label>
            <select
              value={mapFilterStatus}
              onChange={(e) => setMapFilterStatus(e.target.value)}
              className="w-full text-xs bg-white border border-stone-300 rounded-lg py-1 px-2 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
            >
              <option value="all">Todos los Estados</option>
              <option value="active">Activo en Territorio</option>
              <option value="consolidated">Consolidado</option>
              <option value="historical">Memoria Histórica</option>
            </select>
          </div>

          {/* Period Filter */}
          <div>
            <label className="text-[10px] font-bold text-stone-600 block mb-0.5">
              Periodo Histórico:
            </label>
            <select
              value={mapFilterPeriod}
              onChange={(e) => setMapFilterPeriod(e.target.value)}
              className="w-full text-xs bg-white border border-stone-300 rounded-lg py-1 px-2 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
            >
              <option value="all">Todo el Periodo (1986 - 2026)</option>
              <option value="2020-2026">2020 a la fecha (Reciente)</option>
              <option value="2016-2019">2016 - 2019 (Post-acuerdo)</option>
              <option value="2000-2015">2000 - 2015 (Conflicto y Paz)</option>
              <option value="1986-1999">1986 - 1999 (Inicios Pastoral)</option>
            </select>
          </div>

          {/* Reset Filters / Text Search */}
          <div className="flex items-end gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={mapSearch}
                onChange={(e) => setMapSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full text-xs bg-white border border-stone-300 rounded-lg py-1 pl-6 pr-2 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
              />
              <Search className="w-3 h-3 text-stone-400 absolute left-2 top-1.5" />
            </div>

            {isMapFiltered && (
              <button
                type="button"
                onClick={handleResetMapFilters}
                className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1"
                title="Restablecer todos los filtros del mapa"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FICHA TÉCNICA Y RESUMEN ESTADÍSTICO DE LA VARIABLE (Visible & Printable) */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-50 via-amber-50/20 to-stone-50 border-b border-stone-200/90 text-stone-800 break-inside-avoid print:bg-white print:border-stone-400 print:p-3">
        {/* Header of the Statistical Variable */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-stone-200 print:pb-1 print:mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-stone-900 text-amber-400 print:bg-stone-800">
              <BarChart3 className="w-3.5 h-3.5" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                Ficha Técnica Cartográfica & Resumen Estadístico
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">
                {activeVariableLabel}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/80">
              {totalMapProjects} {totalMapProjects === 1 ? 'Proyecto Encontrado' : 'Proyectos Encontrados'} ({percentageOfTotal}%)
            </span>
          </div>
        </div>

        {/* 4 Key Performance Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3 print:gap-1.5 print:mb-2">
          {/* Projects Count */}
          <div className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-2xs print:border-stone-300 print:p-2">
            <span className="text-[10px] font-bold text-stone-500 uppercase block">Proyectos con esta variable</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-stone-900">{totalMapProjects}</span>
              <span className="text-[10px] text-stone-500 font-semibold">de {points.length} totales</span>
            </div>
            <span className="text-[9.5px] text-emerald-700 font-medium block mt-0.5">
              Representa el {percentageOfTotal}% del portafolio
            </span>
          </div>

          {/* Estimated Beneficiaries */}
          <div className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-2xs print:border-stone-300 print:p-2">
            <span className="text-[10px] font-bold text-stone-500 uppercase block">Población Beneficiaria</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-amber-700">~{totalBeneficiaries.toLocaleString('es-CO')}</span>
            </div>
            <span className="text-[9.5px] text-stone-600 font-medium block mt-0.5">
              Personas y familias alcanzadas
            </span>
          </div>

          {/* Territorial Coverage */}
          <div className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-2xs print:border-stone-300 print:p-2">
            <span className="text-[10px] font-bold text-stone-500 uppercase block">Cobertura Municipal</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-sky-800">{activeMunicipalitiesCount}</span>
              <span className="text-[10px] text-stone-500 font-semibold">de 16 municipios</span>
            </div>
            <span className="text-[9.5px] text-sky-700 font-medium block mt-0.5">
              {((activeMunicipalitiesCount / 16) * 100).toFixed(0)}% del territorio caqueteño
            </span>
          </div>

          {/* Jurisdictions distribution summary */}
          <div className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-2xs print:border-stone-300 print:p-2">
            <span className="text-[10px] font-bold text-stone-500 uppercase block">Desglose Eclesial</span>
            <div className="text-[10.5px] space-y-0.5 mt-0.5 font-medium">
              <div className="flex justify-between items-center text-emerald-800">
                <span className="truncate">Florencia:</span>
                <span className="font-bold">{jurisdictionStats['Arquidiócesis de Florencia'].projects}</span>
              </div>
              <div className="flex justify-between items-center text-sky-800">
                <span className="truncate">San Vicente:</span>
                <span className="font-bold">{jurisdictionStats['Diócesis de San Vicente del Caguán'].projects}</span>
              </div>
              <div className="flex justify-between items-center text-purple-800">
                <span className="truncate">Solano:</span>
                <span className="font-bold">{jurisdictionStats['Vicariato Apostólico de Puerto Leguízamo – Solano'].projects}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytical Insights Row: Top Municipalities & Main Axes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white/70 p-2.5 rounded-xl border border-stone-200/80 print:bg-white print:border-stone-300 print:p-2">
          {/* Top Municipalities with presence */}
          <div>
            <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-600" />
              Municipios con Mayor Concentración para esta Variable:
            </span>
            {topMunicipalities.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {topMunicipalities.slice(0, 6).map(([muniName, count]) => (
                  <span
                    key={muniName}
                    onClick={() => onSelectMunicipality && onSelectMunicipality(muniName)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-300/80 rounded-md font-semibold text-stone-800 cursor-pointer text-[11px]"
                  >
                    <span>{muniName}</span>
                    <strong className="text-amber-800 font-black">({count})</strong>
                  </span>
                ))}
                {topMunicipalities.length > 6 && (
                  <span className="text-[10px] text-stone-500 self-center">
                    +{topMunicipalities.length - 6} más
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[11px] text-stone-400 italic">No hay municipios con intervenciones registradas para este filtro.</span>
            )}
          </div>

          {/* Main Pastoral Lines or Cooperating Agencies */}
          <div>
            <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <Church className="w-3 h-3 text-amber-600" />
              Líneas Pastorales de Incidencia:
            </span>
            {categoryBreakdown.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {categoryBreakdown.slice(0, 4).map((item) => (
                  <span
                    key={item.category?.id || 'gen'}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium"
                    style={{
                      backgroundColor: `${item.category?.color || '#666'}15`,
                      borderColor: `${item.category?.color || '#666'}40`,
                      color: item.category?.color || '#333',
                    }}
                  >
                    <span>{item.category?.name || 'Labor Pastoral'}</span>
                    <strong>({item.count})</strong>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-stone-400 italic">Sin categorías registradas.</span>
            )}

            {fundingAgencies.length > 0 && (
              <div className="mt-2 text-[10.5px] text-stone-600 flex items-center gap-1 truncate">
                <span className="font-bold text-stone-700">Cooperantes:</span>
                <span className="truncate">{fundingAgencies.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. HIGH-RESOLUTION SVG CARTOGRAPHIC MAP                                   */}
      {/* ========================================================================= */}
      <div className="relative w-full bg-gradient-to-b from-stone-50 to-stone-100/70 p-2 sm:p-4 print:p-1 print:bg-white flex items-center justify-center">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-auto max-h-[580px] select-none filter drop-shadow-xs print:filter-none print:max-h-[500px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Background grid */}
            <pattern id="carto-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e7e5e4" strokeWidth="0.5" strokeDasharray="2,2" />
            </pattern>

            {/* Hover Glow */}
            <filter id="muni-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#b45309" floodOpacity="0.35" />
            </filter>
            <filter id="badge-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Canvas Background */}
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="#fbfbfa" rx="12" />
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#carto-grid)" opacity="0.6" rx="12" />

          {/* Department Boundary Outer Silhouette */}
          {CAQUETA_DEPARTAMENTO_GEOJSON.features.map((feat: any, idx: number) => {
            const d = geoCoordinatesToPath(feat.geometry.coordinates, feat.geometry.type);
            return (
              <path
                key={`dept-shadow-${idx}`}
                d={d}
                fill="#f5f5f4"
                stroke="#d6d3d1"
                strokeWidth="6"
                strokeLinejoin="round"
                className="print:fill-white"
              />
            );
          })}

          {/* Department Boundary Main Stroke */}
          {CAQUETA_DEPARTAMENTO_GEOJSON.features.map((feat: any, idx: number) => {
            const d = geoCoordinatesToPath(feat.geometry.coordinates, feat.geometry.type);
            return (
              <path
                key={`dept-${idx}`}
                d={d}
                fill="none"
                stroke="#065f46"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeOpacity="0.8"
              />
            );
          })}

          {/* Municipalities Polygons with Density Shading */}
          <g id="municipalities-layer">
            {CAQUETA_MUNICIPIOS_GEOJSON.features.map((feat: any, idx: number) => {
              const muniName: string = feat.properties.nombre || feat.properties.name;
              const jur: string = feat.properties.jurisdiction || getEcclesiasticalJurisdiction(muniName);
              const count = muniProjectCounts[muniName] || 0;
              const isHovered = hoveredMuni === muniName;
              const d = geoCoordinatesToPath(feat.geometry.coordinates, feat.geometry.type);

              const jurColor = getJurisdictionColor(jur);

              // Tint fill based on presence of projects
              let fillHex = '#f8fafc';
              let fillOp = 0.12;

              if (jur.includes('Florencia')) {
                fillHex = count > 0 ? '#d1fae5' : '#ecfdf5';
                fillOp = count > 0 ? Math.min(0.25 + count * 0.05, 0.65) : 0.16;
              } else if (jur.includes('Vicente')) {
                fillHex = count > 0 ? '#bae6fd' : '#f0f9ff';
                fillOp = count > 0 ? Math.min(0.25 + count * 0.05, 0.65) : 0.16;
              } else {
                fillHex = count > 0 ? '#e9d5ff' : '#faf5ff';
                fillOp = count > 0 ? Math.min(0.25 + count * 0.05, 0.65) : 0.16;
              }

              if (isHovered) {
                fillOp = 0.75;
                fillHex = '#fef3c7'; // warm amber on hover
              }

              return (
                <path
                  key={`muni-poly-${muniName}-${idx}`}
                  d={d}
                  fill={fillHex}
                  fillOpacity={fillOp}
                  stroke={isHovered ? '#b45309' : jurColor}
                  strokeWidth={isHovered ? 2.5 : count > 0 ? 1.4 : 0.9}
                  strokeDasharray={count > 0 ? undefined : '3,2'}
                  strokeLinejoin="round"
                  filter={isHovered ? 'url(#muni-glow)' : undefined}
                  className="transition-all duration-150 cursor-pointer"
                  onMouseEnter={() => setHoveredMuni(muniName)}
                  onMouseLeave={() => setHoveredMuni(null)}
                  onClick={() => onSelectMunicipality && onSelectMunicipality(muniName)}
                >
                  <title>{`${muniName} (${jur}): ${count} proyectos registrados`}</title>
                </path>
              );
            })}
          </g>

          {/* Centered Badges and Labels: Municipality Name + Project Count */}
          <g id="municipalities-labels-layer">
            {CAQUETA_MUNICIPALITIES.map((muni) => {
              const count = muniProjectCounts[muni.name] || 0;
              const override = labelAnchorOverrides[muni.name];
              const lat = override?.lat || muni.lat;
              const lng = override?.lng || muni.lng;
              const [x, y] = project(lng, lat);

              const finalX = x + (override?.offset ? override.offset[0] : 0);
              const finalY = y + (override?.offset ? override.offset[1] : 0);

              if (finalX < -30 || finalX > SVG_WIDTH + 30 || finalY < -30 || finalY > SVG_HEIGHT + 30) {
                return null;
              }

              const isHovered = hoveredMuni === muni.name;
              const jurColor = getJurisdictionColor(muni.jurisdiction);
              const hasProjects = count > 0;

              return (
                <g
                  key={`muni-label-group-${muni.name}`}
                  transform={`translate(${finalX.toFixed(1)}, ${finalY.toFixed(1)})`}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredMuni(muni.name)}
                  onMouseLeave={() => setHoveredMuni(null)}
                  onClick={() => onSelectMunicipality && onSelectMunicipality(muni.name)}
                >
                  {/* Badge Background Card */}
                  <rect
                    x={-56}
                    y={-14}
                    width={112}
                    height={hasProjects ? 28 : 22}
                    rx={6}
                    fill={isHovered ? '#78350f' : hasProjects ? '#ffffff' : '#f5f5f4'}
                    stroke={isHovered ? '#f59e0b' : hasProjects ? jurColor : '#d6d3d1'}
                    strokeWidth={isHovered ? 2 : hasProjects ? 1.4 : 0.8}
                    filter="url(#badge-shadow)"
                  />

                  {/* Colored Jurisdiction Indicator Dot */}
                  <circle
                    cx={-46}
                    cy={hasProjects ? 0 : -3}
                    r={hasProjects ? 3.5 : 2.5}
                    fill={isHovered ? '#fbbf24' : jurColor}
                  />

                  {/* Municipality Name */}
                  <text
                    x={-38}
                    y={hasProjects ? -2 : 0}
                    fontSize={muni.name.length > 15 ? '9' : '10'}
                    fontWeight="700"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                    fill={isHovered ? '#ffffff' : '#1c1917'}
                    dominantBaseline="middle"
                  >
                    {muni.name.length > 18 ? `${muni.name.slice(0, 16)}…` : muni.name}
                  </text>

                  {/* Number of Projects Highlight Pill */}
                  {hasProjects ? (
                    <g transform="translate(-38, 5)">
                      <rect
                        x={0}
                        y={0}
                        width={82}
                        height={12}
                        rx={3}
                        fill={isHovered ? '#92400e' : '#ecfdf5'}
                        stroke={isHovered ? '#fde68a' : '#a7f3d0'}
                        strokeWidth="0.5"
                      />
                      <text
                        x={41}
                        y={6}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="8.5"
                        fontWeight="800"
                        fontFamily="ui-sans-serif, system-ui, sans-serif"
                        fill={isHovered ? '#fef3c7' : '#047857'}
                      >
                        {count === 1 ? '1 PROYECTO' : `${count} PROYECTOS`}
                      </text>
                    </g>
                  ) : (
                    <text
                      x={0}
                      y={8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="7.5"
                      fontStyle="italic"
                      fill={isHovered ? '#fef3c7' : '#a8a29e'}
                    >
                      Sin proyectos
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Compass Rose */}
          <g transform={`translate(${SVG_WIDTH - 65}, 65)`} opacity="0.85">
            <circle cx="0" cy="0" r="22" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1" filter="url(#badge-shadow)" />
            <polygon points="0,-18 5,-3 0,0" fill="#dc2626" />
            <polygon points="0,-18 -5,-3 0,0" fill="#ef4444" />
            <polygon points="0,18 5,3 0,0" fill="#78716c" />
            <polygon points="0,18 -5,3 0,0" fill="#a8a29e" />
            <polygon points="18,0 3,5 0,0" fill="#a8a29e" />
            <polygon points="-18,0 -3,5 0,0" fill="#a8a29e" />
            <text x="0" y="-23" textAnchor="middle" fontSize="10" fontWeight="900" fill="#dc2626">N</text>
          </g>

          {/* Map Scale Bar */}
          <g transform={`translate(24, ${SVG_HEIGHT - 32})`} opacity="0.9">
            <rect x="0" y="-12" width="160" height="26" rx="4" fill="#ffffff" stroke="#d6d3d1" strokeWidth="0.8" />
            <line x1="12" y1="2" x2="148" y2="2" stroke="#1c1917" strokeWidth="2.5" />
            <line x1="12" y1="-3" x2="12" y2="7" stroke="#1c1917" strokeWidth="1.5" />
            <line x1="80" y1="-1" x2="80" y2="5" stroke="#1c1917" strokeWidth="1" />
            <line x1="148" y1="-3" x2="148" y2="7" stroke="#1c1917" strokeWidth="1.5" />
            <text x="12" y="-5" fontSize="8" fontWeight="600" fill="#44403c">0</text>
            <text x="80" y="-5" textAnchor="middle" fontSize="8" fontWeight="600" fill="#44403c">
              {zoomPreset === 'full' ? '50 km' : '25 km'}
            </text>
            <text x="148" y="-5" textAnchor="end" fontSize="8" fontWeight="600" fill="#44403c">
              {zoomPreset === 'full' ? '100 km' : '50 km'}
            </text>
          </g>

          {/* Cartographic Legend */}
          <g transform={`translate(${SVG_WIDTH - 240}, ${SVG_HEIGHT - 95})`}>
            <rect x="0" y="0" width="220" height="80" rx="8" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1" filter="url(#badge-shadow)" />
            <text x="12" y="16" fontSize="9.5" fontWeight="800" fill="#1c1917">
              JURISDICCIONES ECLESIÁSTICAS
            </text>
            
            <circle cx="18" cy="32" r="4.5" fill="#059669" />
            <text x="28" y="35" fontSize="8.5" fontWeight="600" fill="#334155">
              Arquidiócesis de Florencia (14 mun.)
            </text>

            <circle cx="18" cy="48" r="4.5" fill="#0284C7" />
            <text x="28" y="51" fontSize="8.5" fontWeight="600" fill="#334155">
              Diócesis de San Vicente del Caguán
            </text>

            <circle cx="18" cy="64" r="4.5" fill="#7C3AED" />
            <text x="28" y="67" fontSize="8.5" fontWeight="600" fill="#334155">
              Vicariato Ap. Puerto Leguízamo – Solano
            </text>
          </g>
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 5. MUNICIPALITY BREAKDOWN QUICK GRID                                      */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/50 print:bg-white print:p-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            Conteo de Proyectos por Municipio (16 Municipios del Caquetá)
          </span>
          <span className="text-[11px] text-stone-500 font-medium">
            Intervenciones contabilizadas según la variable y filtros activos
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {CAQUETA_MUNICIPALITIES.map((muni) => {
            const count = muniProjectCounts[muni.name] || 0;
            const jurColor = getJurisdictionColor(muni.jurisdiction);
            const isHovered = hoveredMuni === muni.name;

            return (
              <div
                key={muni.name}
                onMouseEnter={() => setHoveredMuni(muni.name)}
                onMouseLeave={() => setHoveredMuni(null)}
                onClick={() => onSelectMunicipality && onSelectMunicipality(muni.name)}
                className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                  isHovered
                    ? 'bg-amber-100 border-amber-400 shadow-2xs scale-102'
                    : count > 0
                    ? 'bg-white border-emerald-300 shadow-2xs'
                    : 'bg-stone-100/60 border-stone-200 text-stone-400'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: jurColor }}
                  />
                  <span className="text-[10px] font-bold text-stone-800 truncate block" title={muni.name}>
                    {muni.name}
                  </span>
                </div>
                <div className="mt-0.5">
                  <span
                    className={`text-base font-black ${
                      count > 0 ? 'text-emerald-700' : 'text-stone-400'
                    }`}
                  >
                    {count}
                  </span>
                  <span className="text-[9px] text-stone-500 block leading-none font-semibold">
                    {count === 1 ? 'proyecto' : 'proyectos'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. EXPANDABLE MATRIX TABLE PREVIEW (When toggled on)                      */}
      {/* ========================================================================= */}
      {showMatrixTable && (
        <div className="border-t border-stone-200 p-4 sm:p-5 bg-stone-50 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Matriz de Proyectos Filtrados ({totalMapProjects} registros)
              </h4>
              <p className="text-xs text-stone-500">
                Listado tabular de intervenciones que corresponden a los filtros seleccionados
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadMatrix}
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel/CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto border border-stone-200 rounded-xl bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-bold sticky top-0 border-b border-stone-200">
                <tr>
                  <th className="py-2 px-3 whitespace-nowrap">Año</th>
                  <th className="py-2 px-3">Proyecto / Hito</th>
                  <th className="py-2 px-3 whitespace-nowrap">Municipio</th>
                  <th className="py-2 px-3">Jurisdicción</th>
                  <th className="py-2 px-3">Eje Pastoral</th>
                  <th className="py-2 px-3">Población</th>
                  <th className="py-2 px-3">Beneficiarios</th>
                  <th className="py-2 px-3">Financiador</th>
                  <th className="py-2 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredMapPoints.map((p) => {
                  const cat = categoryMap.get(p.categoryId);
                  return (
                    <tr key={p.id} className="hover:bg-amber-50/40 transition">
                      <td className="py-2 px-3 font-bold text-amber-800 whitespace-nowrap">
                        {p.year}
                        {p.endYear ? ` - ${p.endYear}` : ''}
                      </td>
                      <td className="py-2 px-3 font-semibold text-stone-900 max-w-xs">{p.title}</td>
                      <td className="py-2 px-3 whitespace-nowrap font-medium text-stone-700">
                        {p.municipality}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-stone-600">
                        {getEcclesiasticalJurisdiction(p.municipality)}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${cat?.color || '#666'}15`,
                            color: cat?.color || '#333',
                          }}
                        >
                          {cat?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[11px] text-stone-600 max-w-xs truncate">
                        {p.targetPopulation || p.populationTypes?.join(', ') || 'Comunidad'}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap font-semibold text-stone-800">
                        {p.beneficiariesApprox ? `~${p.beneficiariesApprox.toLocaleString('es-CO')}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-stone-600 whitespace-nowrap">
                        {p.fundingAgency || '—'}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'consolidated'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

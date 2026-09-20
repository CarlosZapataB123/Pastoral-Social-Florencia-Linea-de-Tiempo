import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { HumanitarianPoint, PointCategory } from '../types';
import { CAQUETA_MUNICIPALITIES } from '../constants';
import {
  CAQUETA_DEPARTAMENTO_GEOJSON,
  CAQUETA_MUNICIPIOS_GEOJSON,
} from '../data/caquetaBoundaries';
import { Layers, MapPin, Eye, EyeOff, Maximize2, ShieldCheck, Map as MapIcon, Compass } from 'lucide-react';

// Fix Leaflet's default icon URLs when bundled with Vite
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewProps {
  points: HumanitarianPoint[];
  categories: PointCategory[];
  selectedPointId: string | null;
  onSelectPoint: (point: HumanitarianPoint) => void;
  onMapClickToCreate: (lat: number, lng: number) => void;
  isAddingPoint: boolean;
  activeLayer: 'standard' | 'satellite' | 'topo';
  selectedMunicipality?: string | 'all';
  onSelectMunicipality?: (name: string | 'all') => void;
  onChangeActiveLayer?: (layer: 'standard' | 'satellite' | 'topo') => void;
}

export const MapView: React.FC<MapViewProps> = ({
  points,
  categories,
  selectedPointId,
  onSelectPoint,
  onMapClickToCreate,
  isAddingPoint,
  activeLayer,
  selectedMunicipality = 'all',
  onSelectMunicipality,
  onChangeActiveLayer,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const deptGeoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const mpiosGeoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const muniLabelsLayerRef = useRef<L.LayerGroup | null>(null);

  // Layer visibility toggles
  const [showMunicipalities, setShowMunicipalities] = useState(true);
  const [showDepartmentBorder, setShowDepartmentBorder] = useState(true);
  const [showMuniLabels, setShowMuniLabels] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // Count points per municipality for display
  const pointsCountByMuni = useMemo(() => {
    const counts: Record<string, number> = {};
    points.forEach((p) => {
      const name = (p.municipality || '').trim();
      counts[name] = (counts[name] || 0) + 1;
      // Handle alias for Montañita
      if (name.toLowerCase().includes('monta')) {
        counts['La Montañita'] = (counts['La Montañita'] || 0) + 1;
        counts['Montañita'] = (counts['Montañita'] || 0) + 1;
      }
    });
    return counts;
  }, [points]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered on Caquetá, Colombia
    const map = L.map(mapContainerRef.current, {
      center: [1.35, -75.15],
      zoom: 8,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial tile layer: OpenStreetMap Standard
    const standardTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Límites: DANE',
    }).addTo(map);
    tileLayerRef.current = standardTiles;

    // Groups for ordering (boundaries at bottom, markers on top)
    const deptGroup = L.geoJSON(CAQUETA_DEPARTAMENTO_GEOJSON, {
      style: {
        color: '#065F46',
        weight: 3.5,
        opacity: 0.95,
        fill: false,
        dashArray: '8, 6',
      },
      interactive: false,
    }).addTo(map);
    deptGeoJsonLayerRef.current = deptGroup;

    // Municipalities layer placeholder
    const mpiosGroup = L.geoJSON(undefined).addTo(map);
    mpiosGeoJsonLayerRef.current = mpiosGroup;

    // Labels layer
    const labelsGroup = L.layerGroup().addTo(map);
    muniLabelsLayerRef.current = labelsGroup;

    // Markers layer (top)
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    // Initial fit to Caquetá bounds with comfortable padding
    const bounds = deptGroup.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClickToCreate(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle Tile Layer switch
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; OpenStreetMap | DANE';

    if (activeLayer === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri, Earthstar Geographics | Límites: DANE';
    } else if (activeLayer === 'topo') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = 'Map data: &copy; OpenStreetMap, SRTM | OpenTopoMap | DANE';
    }

    const newLayer = L.tileLayer(url, { attribution, maxZoom: 18 });
    newLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;

    // Update department border style for satellite contrast
    if (deptGeoJsonLayerRef.current) {
      deptGeoJsonLayerRef.current.setStyle({
        color: activeLayer === 'satellite' ? '#FBBF24' : '#047857',
        weight: activeLayer === 'satellite' ? 3.5 : 3.2,
        opacity: 0.95,
        dashArray: '8, 6',
      });
    }
  }, [activeLayer]);

  // 3. Update Municipalities GeoJSON Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !mpiosGeoJsonLayerRef.current) return;

    mpiosGeoJsonLayerRef.current.clearLayers();

    if (!showMunicipalities) return;

    // Helper for subregion color
    const getSubregionColor = (subregion: string) => {
      switch (subregion) {
        case 'Norte':
          return '#0284C7'; // Blue
        case 'Centro':
          return '#10B981'; // Emerald
        case 'Sur':
          return '#F59E0B'; // Amber
        default:
          return '#059669';
      }
    };

    const isSatellite = activeLayer === 'satellite';

    const geoJsonLayer = L.geoJSON(CAQUETA_MUNICIPIOS_GEOJSON, {
      style: (feature) => {
        const muniName = feature?.properties?.nombre || feature?.properties?.name || '';
        const subregion = feature?.properties?.subregion || 'Centro';
        const isSelected =
          selectedMunicipality !== 'all' &&
          (muniName.toLowerCase() === selectedMunicipality.toLowerCase() ||
            (selectedMunicipality.includes('Monta') && muniName.includes('Monta')));

        if (isSelected) {
          return {
            color: '#E11D48', // Vibrant Rose/Red
            weight: 3.5,
            opacity: 1,
            fillColor: '#FB7185',
            fillOpacity: 0.28,
            dashArray: undefined,
          };
        }

        return {
          color: isSatellite ? '#38BDF8' : '#047857',
          weight: isSatellite ? 2 : 1.6,
          opacity: isSatellite ? 0.9 : 0.85,
          dashArray: '4, 4',
          fillColor: getSubregionColor(subregion),
          fillOpacity: isSatellite ? 0.1 : 0.05,
        };
      },
      onEachFeature: (feature, layer) => {
        const muniName = feature.properties.nombre || feature.properties.name;
        const subregion = feature.properties.subregion;
        const isCapital = feature.properties.isCapital;
        const count = pointsCountByMuni[muniName] || 0;

        // Custom Tooltip
        const tooltipContent = `
          <div class="py-1 px-1.5 text-xs font-sans">
            <div class="flex items-center gap-1.5 font-bold text-stone-900 text-sm">
              <span>${muniName}</span>
              ${isCapital ? '<span class="bg-amber-100 text-amber-800 text-[10px] px-1 py-0.2 rounded font-semibold">Capital</span>' : ''}
            </div>
            <div class="text-[11px] text-stone-500 font-medium mt-0.5">
              Subregión ${subregion} &bull; <strong class="text-emerald-700">${count} ${count === 1 ? 'labor' : 'labores'}</strong>
            </div>
          </div>
        `;

        layer.bindTooltip(tooltipContent, {
          sticky: true,
          direction: 'auto',
          className: 'caqueta-tooltip',
        });

        // Hover effect
        layer.on({
          mouseover: (e) => {
            const target = e.target;
            const isSelected =
              selectedMunicipality !== 'all' &&
              muniName.toLowerCase() === selectedMunicipality.toLowerCase();

            if (!isSelected) {
              target.setStyle({
                weight: 3,
                color: isSatellite ? '#FCD34D' : '#0F172A',
                fillOpacity: isSatellite ? 0.22 : 0.16,
              });
            }
          },
          mouseout: (e) => {
            const isSelected =
              selectedMunicipality !== 'all' &&
              muniName.toLowerCase() === selectedMunicipality.toLowerCase();

            if (!isSelected) {
              mpiosGeoJsonLayerRef.current?.resetStyle(e.target);
            }
          },
          click: (e) => {
            // Zoom to municipality bounds
            if (mapInstanceRef.current) {
              mapInstanceRef.current.fitBounds(e.target.getBounds(), {
                padding: [40, 40],
                maxZoom: 12,
              });
            }
            // If handler exists, filter by this municipality
            if (onSelectMunicipality) {
              onSelectMunicipality(muniName);
            }
          },
        });
      },
    });

    mpiosGeoJsonLayerRef.current.addLayer(geoJsonLayer);
  }, [showMunicipalities, activeLayer, selectedMunicipality, pointsCountByMuni, onSelectMunicipality]);

  // 4. Update Department Boundary Layer visibility
  useEffect(() => {
    if (!mapInstanceRef.current || !deptGeoJsonLayerRef.current) return;
    if (showDepartmentBorder) {
      if (!mapInstanceRef.current.hasLayer(deptGeoJsonLayerRef.current)) {
        deptGeoJsonLayerRef.current.addTo(mapInstanceRef.current);
      }
    } else {
      if (mapInstanceRef.current.hasLayer(deptGeoJsonLayerRef.current)) {
        mapInstanceRef.current.removeLayer(deptGeoJsonLayerRef.current);
      }
    }
  }, [showDepartmentBorder]);

  // 5. Update Centered Municipality Badges / Labels
  useEffect(() => {
    if (!mapInstanceRef.current || !muniLabelsLayerRef.current) return;

    muniLabelsLayerRef.current.clearLayers();

    if (!showMuniLabels) return;

    CAQUETA_MUNICIPALITIES.forEach((muni) => {
      const count = pointsCountByMuni[muni.name] || 0;
      const isSelected =
        selectedMunicipality !== 'all' &&
        (muni.name.toLowerCase() === selectedMunicipality.toLowerCase() ||
          (selectedMunicipality.includes('Monta') && muni.name.includes('Monta')));

      const labelHtml = `
        <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md shadow-sm text-[11px] font-medium transition-all duration-150 cursor-pointer ${
          isSelected
            ? 'bg-rose-600 text-white font-bold ring-2 ring-rose-300 scale-110 shadow-md'
            : activeLayer === 'satellite'
            ? 'bg-stone-900/90 text-stone-100 border border-stone-700/80 hover:bg-stone-800'
            : 'bg-white/95 text-stone-800 border border-stone-300 hover:border-emerald-500 hover:text-emerald-700'
        }">
          <span class="w-1.5 h-1.5 rounded-full ${
            isSelected
              ? 'bg-white animate-pulse'
              : muni.subregion === 'Norte'
              ? 'bg-sky-500'
              : muni.subregion === 'Centro'
              ? 'bg-emerald-500'
              : 'bg-amber-500'
          }"></span>
          <span class="whitespace-nowrap">${muni.name}</span>
          ${
            count > 0
              ? `<span class="ml-0.5 px-1 rounded-full text-[9px] font-bold ${
                  isSelected ? 'bg-white text-rose-700' : 'bg-emerald-100 text-emerald-800'
                }">${count}</span>`
              : ''
          }
        </div>
      `;

      const customDivIcon = L.divIcon({
        html: labelHtml,
        className: 'custom-muni-label',
        iconSize: [120, 24],
        iconAnchor: [60, 12],
      });

      const marker = L.marker([muni.lat, muni.lng], {
        icon: customDivIcon,
        interactive: true,
      });

      marker.on('click', () => {
        if (onSelectMunicipality) {
          onSelectMunicipality(muni.name);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([muni.lat, muni.lng], 11, { animate: true });
        }
      });

      muniLabelsLayerRef.current?.addLayer(marker);
    });
  }, [showMuniLabels, activeLayer, selectedMunicipality, pointsCountByMuni, onSelectMunicipality]);

  // 6. Update Humanitarian Points Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    points.forEach((point) => {
      const category = categoryMap.get(point.categoryId);
      const color = category ? category.color : '#2563EB';
      const isSelected = point.id === selectedPointId;

      // Custom SVG divIcon
      const iconHtml = `
        <div class="relative group cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-110'
        }">
          <div style="background-color: ${color};" 
               class="w-8 h-8 rounded-full border-2 ${
                 isSelected ? 'border-amber-400 ring-4 ring-amber-300/50 shadow-xl' : 'border-white shadow-md'
               } flex items-center justify-center text-white font-bold text-xs">
            ${point.year >= 2000 ? `'${String(point.year).slice(2)}` : String(point.year).slice(2)}
          </div>
          <div class="w-2 h-2 bg-stone-800 rotate-45 mx-auto -mt-1 opacity-70"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-point-marker',
        iconSize: [32, 36],
        iconAnchor: [16, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([point.lat, point.lng], { icon: customIcon });

      const popupContent = `
        <div class="p-1 font-sans text-stone-900 max-w-xs">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="inline-block w-2.5 h-2.5 rounded-full" style="background-color: ${color}"></span>
            <span class="text-xs font-semibold uppercase tracking-wider text-stone-500">${category?.name || 'Labor Humanitaria'}</span>
          </div>
          <h4 class="font-bold text-sm text-stone-900 leading-tight mb-1">${point.title}</h4>
          <p class="text-xs text-stone-600 mb-2">${point.municipality} ${point.communityOrVereda ? `&bull; ${point.communityOrVereda}` : ''}</p>
          <div class="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
            <span class="font-medium text-stone-800">Año: ${point.year}${point.endYear ? ` - ${point.endYear}` : ''}</span>
            <span class="bg-stone-100 px-1.5 py-0.5 rounded text-[11px] font-medium text-stone-700">${point.status === 'active' ? 'En Curso' : 'Histórico'}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280 });

      marker.on('click', () => {
        onSelectPoint(point);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [points, categories, selectedPointId, onSelectPoint]);

  // 7. Center on selected point if changed
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPointId) return;
    const target = points.find((p) => p.id === selectedPointId);
    if (target) {
      mapInstanceRef.current.setView([target.lat, target.lng], 12, { animate: true });
    }
  }, [selectedPointId, points]);

  // 8. Focus on selected municipality boundary if filtered
  useEffect(() => {
    if (!mapInstanceRef.current || selectedMunicipality === 'all') return;

    // Find center from CAQUETA_MUNICIPALITIES
    const muni = CAQUETA_MUNICIPALITIES.find(
      (m) =>
        m.name.toLowerCase() === selectedMunicipality.toLowerCase() ||
        (selectedMunicipality.includes('Monta') && m.name.includes('Monta'))
    );

    if (muni) {
      mapInstanceRef.current.setView([muni.lat, muni.lng], 10, { animate: true });
    }
  }, [selectedMunicipality]);

  // Reset to entire Caquetá bounds
  const handleResetToCaqueta = () => {
    if (!mapInstanceRef.current || !deptGeoJsonLayerRef.current) return;
    const bounds = deptGeoJsonLayerRef.current.getBounds();
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
    }
    if (onSelectMunicipality) {
      onSelectMunicipality('all');
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full ${isAddingPoint ? 'cursor-crosshair' : 'cursor-grab'}`}
        style={{ zIndex: 1 }}
      />

      {/* Floating Instructions when adding points */}
      {isAddingPoint && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 animate-bounce pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
          Toca cualquier lugar en el mapa de Caquetá para ubicar el nuevo punto
        </div>
      )}

      {/* Floating Map Controls & Delimitation Panel */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
        {/* Toggle Panel Button */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-stone-200/80 p-1.5 flex items-center gap-1">
          <button
            type="button"
            id="btn-toggle-boundaries-legend"
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isLegendOpen
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
            }`}
            title="Ver controles de límites territoriales de Caquetá"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Límites y Capas</span>
          </button>

          <button
            type="button"
            id="btn-fit-caqueta"
            onClick={handleResetToCaqueta}
            className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-lg text-xs font-medium flex items-center gap-1"
            title="Enfocar todo el Departamento del Caquetá"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Collapsible Delimitation & Legend Popover */}
        {isLegendOpen && (
          <div className="w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200 p-3.5 text-xs text-stone-700 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>División Política Caquetá</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                16 Mpios
              </span>
            </div>

            {/* Boundary Layer Toggles */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Visibilidad en el Mapa
              </div>

              {/* Toggle Municipalities */}
              <label className="flex items-center justify-between p-1.5 hover:bg-stone-50 rounded-lg cursor-pointer">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs border-2 border-emerald-600 bg-emerald-100"></span>
                  <span className="font-medium text-stone-800">Límites Municipales (16)</span>
                </span>
                <input
                  type="checkbox"
                  checked={showMunicipalities}
                  onChange={(e) => setShowMunicipalities(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>

              {/* Toggle Department Border */}
              <label className="flex items-center justify-between p-1.5 hover:bg-stone-50 rounded-lg cursor-pointer">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-1 border-t-2 border-dashed border-stone-800"></span>
                  <span className="font-medium text-stone-800">Límite Departamental</span>
                </span>
                <input
                  type="checkbox"
                  checked={showDepartmentBorder}
                  onChange={(e) => setShowDepartmentBorder(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>

              {/* Toggle Municipality Center Labels */}
              <label className="flex items-center justify-between p-1.5 hover:bg-stone-50 rounded-lg cursor-pointer">
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  <span className="font-medium text-stone-800">Rótulos de Municipios</span>
                </span>
                <input
                  type="checkbox"
                  checked={showMuniLabels}
                  onChange={(e) => setShowMuniLabels(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
              </label>
            </div>

            {/* Subregions Legend */}
            <div className="pt-2 border-t border-stone-100">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                Subregiones
              </div>
              <div className="grid grid-cols-1 gap-1 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  <span className="text-stone-700">
                    <strong>Norte:</strong> San Vicente, Pto. Rico, Doncello, Paujil
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-stone-700">
                    <strong>Centro:</strong> Florencia, Montañita, Cartagena
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-stone-700">
                    <strong>Sur:</strong> Belén, Morelia, Fragua, Curillo, Solano...
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Layer Switcher if provided */}
            {onChangeActiveLayer && (
              <div className="pt-2 border-t border-stone-100">
                <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                  Tipo de Mapa Base
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['standard', 'satellite', 'topo'] as const).map((layer) => (
                    <button
                      key={layer}
                      type="button"
                      onClick={() => onChangeActiveLayer(layer)}
                      className={`py-1 px-1.5 rounded text-[11px] font-medium transition-all ${
                        activeLayer === layer
                          ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {layer === 'standard' ? 'Estándar' : layer === 'satellite' ? 'Satélite' : 'Relieve'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footnote */}
            <div className="pt-2 border-t border-stone-100 text-[10px] text-stone-400 flex items-center justify-between">
              <span>Cartografía DANE WGS84</span>
              <button
                type="button"
                onClick={handleResetToCaqueta}
                className="text-emerald-700 hover:underline font-semibold"
              >
                Centrar mapa
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Municipality Banner Indicator */}
      {selectedMunicipality !== 'all' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-rose-200 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
            <span className="text-stone-600">Mostrando municipio:</span>
            <strong className="text-rose-700 text-sm">{selectedMunicipality}</strong>
            <span className="bg-rose-50 text-rose-800 text-[11px] px-2 py-0.5 rounded-full font-semibold">
              {pointsCountByMuni[selectedMunicipality] || 0} labores
            </span>
          </div>
          {onSelectMunicipality && (
            <button
              type="button"
              id="btn-clear-muni-filter"
              onClick={() => onSelectMunicipality('all')}
              className="text-stone-400 hover:text-stone-700 font-bold px-1.5 py-0.5 rounded hover:bg-stone-100 transition-colors"
              title="Quitar filtro de municipio"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
};

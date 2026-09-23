import React, { useState, useMemo } from 'react';
import { HumanitarianPoint, PointCategory } from '../types';
import {
  CAQUETA_MUNICIPALITIES,
  getEcclesiasticalJurisdiction,
  getJurisdictionColor,
  ECCLESIASTICAL_JURISDICTIONS,
} from '../constants';
import { ReportCaquetaMap } from './ReportCaquetaMap';
import {
  FileText,
  Calendar,
  MapPin,
  Users,
  Printer,
  Download,
  Copy,
  Check,
  X,
  Layers,
  ArrowUpDown,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  HeartHandshake,
  Landmark,
  Target,
  ListOrdered,
  ChevronRight,
  Church,
  Map as MapIcon,
} from 'lucide-react';

interface TimelineReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  allPoints: HumanitarianPoint[];
  filteredPoints: HumanitarianPoint[];
  categories: PointCategory[];
  currentYearRange: [number, number];
  onSelectPoint?: (point: HumanitarianPoint) => void;
}

type GroupingMode = 'chronological' | 'decades' | 'byMunicipality';
type SortOrder = 'asc' | 'desc';

export const TimelineReportModal: React.FC<TimelineReportModalProps> = ({
  isOpen,
  onClose,
  allPoints,
  filteredPoints,
  categories,
  currentYearRange,
  onSelectPoint,
}) => {
  const [scope, setScope] = useState<'filtered' | 'all'>('filtered');
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('chronological');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [reportSearch, setReportSearch] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('all');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  const municipalityMap = useMemo(() => {
    return new Map(CAQUETA_MUNICIPALITIES.map((m) => [m.name, m]));
  }, []);

  // Base list of points according to scope
  const basePoints = scope === 'filtered' ? filteredPoints : allPoints;

  // Filter by search & ecclesiastical jurisdiction within report
  const activeReportPoints = useMemo(() => {
    return basePoints.filter((pt) => {
      // Ecclesiastical jurisdiction filter
      if (selectedJurisdiction !== 'all') {
        const pointJurisdiction = getEcclesiasticalJurisdiction(pt.municipality);
        if (pointJurisdiction !== selectedJurisdiction) return false;
      }
      // Report search query
      if (reportSearch.trim() !== '') {
        const q = reportSearch.toLowerCase();
        const inTitle = pt.title.toLowerCase().includes(q);
        const inDesc = pt.description.toLowerCase().includes(q);
        const inMuni = pt.municipality.toLowerCase().includes(q);
        const inVereda = pt.communityOrVereda?.toLowerCase().includes(q) || false;
        const inActions = pt.keyActions?.some((a) => a.toLowerCase().includes(q)) || false;
        const inAgency = pt.fundingAgency?.toLowerCase().includes(q) || false;
        const inTarget = pt.targetPopulation?.toLowerCase().includes(q) || false;
        const inObj = pt.objectives?.toLowerCase().includes(q) || false;
        if (!inTitle && !inDesc && !inMuni && !inVereda && !inActions && !inAgency && !inTarget && !inObj) {
          return false;
        }
      }
      return true;
    });
  }, [basePoints, selectedJurisdiction, reportSearch]);

  // Sorted points
  const sortedPoints = useMemo(() => {
    return [...activeReportPoints].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.year - b.year;
      } else {
        return b.year - a.year;
      }
    });
  }, [activeReportPoints, sortOrder]);

  // Metrics computation
  const metrics = useMemo(() => {
    const totalCount = activeReportPoints.length;
    if (totalCount === 0) {
      return {
        totalCount: 0,
        minYear: currentYearRange[0],
        maxYear: currentYearRange[1],
        distinctMunicipalities: 0,
        totalBeneficiaries: 0,
        categoryCounts: [] as { category: PointCategory | undefined; count: number; percentage: number }[],
        statusCounts: { active: 0, historical: 0, consolidated: 0 },
        jurisdictionCounts: {
          'Arquidiócesis de Florencia': 0,
          'Diócesis de San Vicente del Caguán': 0,
          'Vicariato Apostólico de Puerto Leguízamo – Solano': 0,
        },
      };
    }

    const years = activeReportPoints.map((p) => p.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    const munis = new Set(activeReportPoints.map((p) => p.municipality));
    const totalBeneficiaries = activeReportPoints.reduce(
      (sum, p) => sum + (p.beneficiariesApprox || 0),
      0
    );

    // Status counts
    const statusCounts = { active: 0, historical: 0, consolidated: 0 };
    activeReportPoints.forEach((p) => {
      if (p.status in statusCounts) {
        statusCounts[p.status]++;
      }
    });

    // Category distribution
    const catCountMap = new Map<string, number>();
    activeReportPoints.forEach((p) => {
      catCountMap.set(p.categoryId, (catCountMap.get(p.categoryId) || 0) + 1);
    });
    const categoryCounts = Array.from(catCountMap.entries())
      .map(([catId, count]) => ({
        category: categoryMap.get(catId),
        count,
        percentage: Math.round((count / totalCount) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // Ecclesiastical Jurisdictions distribution
    const jurisdictionCounts: Record<string, number> = {
      'Arquidiócesis de Florencia': 0,
      'Diócesis de San Vicente del Caguán': 0,
      'Vicariato Apostólico de Puerto Leguízamo – Solano': 0,
    };
    activeReportPoints.forEach((p) => {
      const jur = getEcclesiasticalJurisdiction(p.municipality);
      if (jur in jurisdictionCounts) {
        jurisdictionCounts[jur]++;
      }
    });

    return {
      totalCount,
      minYear,
      maxYear,
      distinctMunicipalities: munis.size,
      totalBeneficiaries,
      categoryCounts,
      statusCounts,
      jurisdictionCounts,
    };
  }, [activeReportPoints, categoryMap, currentYearRange]);

  // Grouping by Decades / Historical Eras
  const decadeGroups = useMemo(() => {
    const groups: {
      id: string;
      title: string;
      subtitle: string;
      yearsText: string;
      points: HumanitarianPoint[];
    }[] = [
      {
        id: 'era-1980s-90s',
        title: 'Primeros Acompañamientos y Emergencia Humanitaria',
        subtitle: 'Inicios de la pastoral social, apoyo ante desastres naturales y primeros desplazamientos forzados',
        yearsText: '1986 — 1999',
        points: [],
      },
      {
        id: 'era-2000s',
        title: 'Atención a la Crisis del Conflicto y Desplazamiento',
        subtitle: 'Acompañamiento humanitario urgente a víctimas, comunidades campesinas e indígenas en zona de distensión y post-distensión',
        yearsText: '2000 — 2009',
        points: [],
      },
      {
        id: 'era-2010s',
        title: 'Construcción de Paz, Reconciliación y DDHH',
        subtitle: 'Proyectos de seguridad alimentaria, comités de paz veredales y pedagogía para la reconciliación',
        yearsText: '2010 — 2019',
        points: [],
      },
      {
        id: 'era-2020s',
        title: 'Desarrollo Integral, Resiliencia y Amazonía',
        subtitle: 'Cuidado de la Casa Común, soberanía alimentaria, liderazgo juvenil y fortalecimiento del tejido comunitario',
        yearsText: '2020 — Actualidad',
        points: [],
      },
    ];

    sortedPoints.forEach((pt) => {
      if (pt.year < 2000) {
        groups[0].points.push(pt);
      } else if (pt.year < 2010) {
        groups[1].points.push(pt);
      } else if (pt.year < 2020) {
        groups[2].points.push(pt);
      } else {
        groups[3].points.push(pt);
      }
    });

    return groups.filter((g) => g.points.length > 0);
  }, [sortedPoints]);

  // Grouping by Municipality
  const municipalityGroups = useMemo(() => {
    const map = new Map<string, HumanitarianPoint[]>();
    sortedPoints.forEach((pt) => {
      if (!map.has(pt.municipality)) {
        map.set(pt.municipality, []);
      }
      map.get(pt.municipality)!.push(pt);
    });

    return Array.from(map.entries())
      .map(([muniName, pts]) => ({
        municipality: muniName,
        jurisdiction: getEcclesiasticalJurisdiction(muniName),
        points: pts,
      }))
      .sort((a, b) => b.points.length - a.points.length);
  }, [sortedPoints]);

  if (!isOpen) return null;

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Copy plain text / markdown executive summary
  const handleCopySummary = () => {
    const summaryText = `
# INFORME DE LABOR HUMANITARIA Y LÍNEA DE TIEMPO HISTÓRICA
Pastoral Social Diócesis de Florencia — Caquetá
Fecha de Emisión: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}

## RESUMEN EJECUTIVO
- Total de Intervenciones Documentadas: ${metrics.totalCount}
- Periodo Comprendido: ${metrics.minYear} — ${metrics.maxYear} (${metrics.maxYear - metrics.minYear + 1} años de memoria institucional)
- Cobertura Geográfica: ${metrics.distinctMunicipalities} de 16 municipios del Caquetá
- Población Beneficiaria Estimada: ~${metrics.totalBeneficiaries.toLocaleString('es-CO')} personas/familias
- Distribución por Jurisdicciones Eclesiásticas:
  * Arquidiócesis de Florencia: ${metrics.jurisdictionCounts['Arquidiócesis de Florencia']} hitos
  * Diócesis de San Vicente del Caguán: ${metrics.jurisdictionCounts['Diócesis de San Vicente del Caguán']} hitos
  * Vicariato Apostólico de Puerto Leguízamo – Solano: ${metrics.jurisdictionCounts['Vicariato Apostólico de Puerto Leguízamo – Solano']} hitos

## LÍNEA DE TIEMPO DE HITOS HUMANITARIOS:
${sortedPoints
  .map(
    (p, i) =>
      `${i + 1}. [${p.year}${p.endYear ? ` - ${p.endYear}` : ''}] ${p.title}
   - Municipio: ${p.municipality}${p.communityOrVereda ? ` (${p.communityOrVereda})` : ''} | Jurisdicción: ${getEcclesiasticalJurisdiction(p.municipality)}
   - Categoría: ${categoryMap.get(p.categoryId)?.name || 'General'} | Estado: ${p.status}
   - Población: ${p.populationTypes?.join(', ') || 'Comunidad en general'}
   - Acciones Clave: ${p.keyActions?.join('; ') || p.description}`
  )
  .join('\n\n')}

---
Generado desde el Sistema Cartográfico y de Memoria Pastoral - Caquetá
    `.trim();

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    });
  };

  // Download standalone standalone HTML Report
  const handleDownloadHTML = () => {
    const reportHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe Histórico Pastoral Social Florencia - Caquetá</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 32px; background: #fafaf9; color: #1c1917; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #e7e5e4; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { border-bottom: 2px solid #d97706; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title-area h1 { margin: 0 0 6px; font-size: 24px; color: #1c1917; }
    .title-area h2 { margin: 0 0 8px; font-size: 15px; color: #b45309; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .title-area p { margin: 0; font-size: 13px; color: #78716c; }
    .badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 36px; }
    .metric-card { background: #f5f5f4; border-radius: 8px; padding: 16px; text-align: center; border: 1px solid #e7e5e4; }
    .metric-val { font-size: 26px; font-weight: 800; color: #b45309; margin-bottom: 4px; }
    .metric-label { font-size: 12px; color: #57534e; text-transform: uppercase; font-weight: 600; }
    .section-title { font-size: 18px; font-weight: bold; border-left: 4px solid #b45309; padding-left: 12px; margin: 32px 0 16px; color: #1c1917; }
    .timeline { position: relative; padding-left: 32px; border-left: 2px solid #e7e5e4; margin-left: 16px; }
    .timeline-item { position: relative; margin-bottom: 28px; }
    .timeline-node { position: absolute; left: -39px; top: 4px; width: 14px; height: 14px; border-radius: 50%; background: #b45309; border: 3px solid #ffffff; box-shadow: 0 0 0 1px #d6d3d1; }
    .item-card { background: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px; padding: 18px; }
    .item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .item-year { font-weight: bold; color: #b45309; font-size: 14px; }
    .item-title { font-size: 16px; font-weight: bold; margin: 0 0 4px; color: #1c1917; }
    .item-meta { font-size: 12px; color: #78716c; margin-bottom: 8px; }
    .item-desc { font-size: 13px; color: #44403c; margin-bottom: 12px; }
    .item-actions { margin: 0; padding-left: 20px; font-size: 12px; color: #44403c; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e7e5e4; font-size: 12px; color: #78716c; text-align: center; }
    @media print { body { background: white; padding: 0; } .container { box-shadow: none; border: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title-area">
        <h2>Diócesis de Florencia • Pastoral Social</h2>
        <h1>Informe de Labor Humanitaria y Línea de Tiempo</h1>
        <p>Departamento del Caquetá • Amazonía Colombiana | Generado el ${new Date().toLocaleDateString('es-CO')}</p>
      </div>
      <div class="badge">Período ${metrics.minYear} - ${metrics.maxYear}</div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-val">${metrics.totalCount}</div>
        <div class="metric-label">Hitos Documentados</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">${metrics.distinctMunicipalities} / 16</div>
        <div class="metric-label">Municipios con Labor</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">${metrics.totalBeneficiaries > 0 ? '~' + metrics.totalBeneficiaries.toLocaleString('es-CO') : 'Comunitario'}</div>
        <div class="metric-label">Beneficiarios Est.</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">${metrics.maxYear - metrics.minYear + 1}</div>
        <div class="metric-label">Años de Memoria</div>
      </div>
    </div>

    <div class="section-title">Línea del Tiempo Histórica de Intervenciones</div>
    <div class="timeline">
      ${sortedPoints
        .map((p) => {
          const cat = categoryMap.get(p.categoryId);
          return `
        <div class="timeline-item">
          <div class="timeline-node" style="background-color: ${cat?.color || '#b45309'};"></div>
          <div class="item-card">
            <div class="item-header">
              <div>
                <span class="item-year">${p.year}${p.endYear ? ' — ' + p.endYear : ''}</span>
                <h3 class="item-title">${p.title}</h3>
                <div class="item-meta">
                  📍 ${p.municipality}${p.communityOrVereda ? ' • ' + p.communityOrVereda : ''} | 
                  ⛪ ${getEcclesiasticalJurisdiction(p.municipality)} | 
                  🏷️ ${cat?.name || 'Labor Pastoral'} | 
                  ${p.fundingAgency ? `🏦 Financiador: <strong>${p.fundingAgency}</strong> | ` : ''}
                  ${p.targetPopulation ? `🎯 Población: <strong>${p.targetPopulation}</strong> | ` : ''}
                  👥 ${p.populationTypes?.join(', ') || 'Población General'}
                </div>
                ${p.executionPeriod ? `<div style="font-size: 11px; color: #b45309; font-weight: 600; margin-top: 2px;">Período: ${p.executionPeriod}</div>` : ''}
              </div>
            </div>
            <div class="item-desc">${p.description}</div>
            ${
              p.keyActions && p.keyActions.length > 0
                ? `<ul class="item-actions">
                  ${p.keyActions.map((a) => `<li>${a}</li>`).join('')}
                 </ul>`
                : ''
            }
          </div>
        </div>
        `;
        })
        .join('')}
    </div>

    <div class="footer">
      Pastoral Social Diócesis de Florencia • Promoviendo la Dignidad Humana, la Reconciliación y la Paz en el Caquetá
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `informe-linea-tiempo-pastoral-caqueta-${new Date().toISOString().slice(0, 10)}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="timeline-report-modal-overlay"
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="timeline-report-container"
        className="bg-stone-50 text-stone-900 w-full max-w-5xl max-h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-300 print:shadow-none print:border-none print:max-h-none print:h-auto print:rounded-none"
      >
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-stone-900 text-white px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Informe & Línea de Tiempo
                <span className="text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  Formato Editorial
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Sistematización institucional de la labor humanitaria en Caquetá
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Print / PDF Button */}
            <button
              id="print-report-btn"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-stone-700"
              title="Imprimir o Guardar en PDF"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Imprimir / PDF</span>
            </button>

            {/* Standalone Download */}
            <button
              id="download-html-report-btn"
              onClick={handleDownloadHTML}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-stone-700"
              title="Descargar archivo HTML autónomo"
            >
              <Download className="w-3.5 h-3.5 text-stone-300" />
              <span className="hidden sm:inline">Descargar HTML</span>
            </button>

            {/* Copy Summary */}
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-stone-700"
              title="Copiar texto del resumen ejecutivo"
            >
              {copiedNotification ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-stone-300" />
              )}
              <span className="hidden sm:inline">{copiedNotification ? 'Copiado' : 'Copiar'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
              title="Cerrar informe"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Options Ribbon (Hidden on Print) */}
        <div className="bg-white px-4 py-2.5 sm:px-6 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            {/* Scope selector */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
              <button
                onClick={() => setScope('filtered')}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  scope === 'filtered'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Filtros Actuales ({filteredPoints.length})
              </button>
              <button
                onClick={() => setScope('all')}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  scope === 'all'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Todos los Puntos ({allPoints.length})
              </button>
            </div>

            {/* Grouping Mode */}
            <div className="flex items-center gap-1.5 text-stone-600">
              <span className="font-semibold text-stone-700">Ver por:</span>
              <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                <button
                  onClick={() => setGroupingMode('chronological')}
                  className={`px-2.5 py-1 rounded-md transition font-medium ${
                    groupingMode === 'chronological'
                      ? 'bg-stone-800 text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Cronológico
                </button>
                <button
                  onClick={() => setGroupingMode('decades')}
                  className={`px-2.5 py-1 rounded-md transition font-medium ${
                    groupingMode === 'decades'
                      ? 'bg-stone-800 text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Por Épocas
                </button>
                <button
                  onClick={() => setGroupingMode('byMunicipality')}
                  className={`px-2.5 py-1 rounded-md transition font-medium ${
                    groupingMode === 'byMunicipality'
                      ? 'bg-stone-800 text-white'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Por Municipio
                </button>
              </div>
            </div>

            {/* Sort order toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg text-stone-700 font-medium flex items-center gap-1 transition"
              title="Cambiar orden cronológico"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-600" />
              <span>{sortOrder === 'asc' ? '1986 → Hoy' : 'Hoy → 1986'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick search input in report */}
            <div className="relative">
              <input
                type="text"
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                placeholder="Filtrar en informe..."
                className="pl-7 pr-2.5 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 w-44"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2 top-1.5" />
            </div>

            {/* Ecclesiastical Jurisdiction filter */}
            <select
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg py-1 px-2 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-700 max-w-[200px]"
              title="Filtrar por Jurisdicción Eclesiástica"
            >
              <option value="all">Todas las Jurisdicciones</option>
              <option value="Arquidiócesis de Florencia">Arquidiócesis de Florencia</option>
              <option value="Diócesis de San Vicente del Caguán">Diócesis de San Vicente del Caguán</option>
              <option value="Vicariato Apostólico de Puerto Leguízamo – Solano">Vicariato Ap. Puerto Leguízamo – Solano</option>
            </select>
          </div>
        </div>

        {/* Main Printable Document Scroll Area */}
        <div
          id="printable-report-content"
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-stone-50 print:p-0 print:overflow-visible print:bg-white"
        >
          {/* Document Header (Formal & Editorial) */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs print:border-none print:shadow-none print:p-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-700 flex items-center justify-center text-white shadow-xs font-bold text-lg shrink-0">
                  <HeartHandshake className="w-7 h-7 text-amber-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-800 tracking-wider uppercase">
                      Diócesis de Florencia
                    </span>
                    <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.2 rounded-full font-semibold border border-stone-200">
                      Vicaría de Pastoral Social
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                    Informe Integral & Línea de Tiempo Histórica
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-500 font-medium">
                    Cartografía de la Acción Humanitaria, Construcción de Paz y Acompañamiento Comunitario
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-stone-500 space-y-0.5 shrink-0 bg-stone-50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                <p>
                  <strong className="text-stone-700">Departamento:</strong> Caquetá, Colombia
                </p>
                <p>
                  <strong className="text-stone-700">Emisión:</strong>{' '}
                  {new Date().toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p>
                  <strong className="text-stone-700">Horizonte Temporal:</strong> {metrics.minYear} — {metrics.maxYear}
                </p>
              </div>
            </div>

            {/* Executive Metrics Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
              <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Hitos e Intervenciones
                </span>
                <span className="text-2xl font-black text-amber-800 mt-1 block">
                  {metrics.totalCount}
                </span>
                <span className="text-[11px] text-stone-500">acciones documentadas</span>
              </div>

              <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Cobertura Territorial
                </span>
                <span className="text-2xl font-black text-amber-800 mt-1 block">
                  {metrics.distinctMunicipalities}{' '}
                  <span className="text-sm font-semibold text-stone-400">/ 16</span>
                </span>
                <span className="text-[11px] text-stone-500">municipios atendidos</span>
              </div>

              <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Población Estimada
                </span>
                <span className="text-2xl font-black text-amber-800 mt-1 block">
                  {metrics.totalBeneficiaries > 0
                    ? `~${metrics.totalBeneficiaries.toLocaleString('es-CO')}`
                    : 'Comunidades'}
                </span>
                <span className="text-[11px] text-stone-500">beneficiarios alcanzados</span>
              </div>

              <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Trayectoria Pastoral
                </span>
                <span className="text-2xl font-black text-amber-800 mt-1 block">
                  {metrics.totalCount > 0 ? metrics.maxYear - metrics.minYear + 1 : 0}{' '}
                  <span className="text-sm font-semibold text-stone-400">años</span>
                </span>
                <span className="text-[11px] text-stone-500">
                  {metrics.minYear} — {metrics.maxYear}
                </span>
              </div>
            </div>

            {/* Strategic Distribution breakdown (Jurisdictions & Categories) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-200">
              {/* By Category */}
              <div>
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  Ejes Temáticos y Líneas Pastorales
                </h3>
                {metrics.categoryCounts.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">Sin categorías registradas</p>
                ) : (
                  <div className="space-y-2">
                    {metrics.categoryCounts.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-stone-700 flex items-center gap-1.5 truncate">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: item.category?.color || '#b45309' }}
                            />
                            {item.category?.name || 'General'}
                          </span>
                          <span className="text-stone-500 font-semibold shrink-0">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: item.category?.color || '#b45309',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* By Ecclesiastical Jurisdictions & Status */}
              <div>
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Church className="w-3.5 h-3.5 text-amber-600" />
                  Presencia por Jurisdicciones Eclesiásticas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block line-clamp-1" title="Arquidiócesis de Florencia">
                      Florencia
                    </span>
                    <span className="text-lg font-extrabold text-emerald-900 block mt-0.5">
                      {metrics.jurisdictionCounts['Arquidiócesis de Florencia']}
                    </span>
                    <span className="text-[10px] text-emerald-700 block font-medium">Arquidiócesis (14 mun.)</span>
                  </div>

                  <div className="p-2.5 bg-sky-50/80 border border-sky-200/80 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-sky-800 uppercase block line-clamp-1" title="Diócesis de San Vicente del Caguán">
                      San Vicente
                    </span>
                    <span className="text-lg font-extrabold text-sky-900 block mt-0.5">
                      {metrics.jurisdictionCounts['Diócesis de San Vicente del Caguán']}
                    </span>
                    <span className="text-[10px] text-sky-700 block font-medium">Diócesis (Caguán)</span>
                  </div>

                  <div className="p-2.5 bg-purple-50/80 border border-purple-200/80 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-purple-800 uppercase block line-clamp-1" title="Vicariato Apostólico de Puerto Leguízamo – Solano">
                      Solano
                    </span>
                    <span className="text-lg font-extrabold text-purple-900 block mt-0.5">
                      {metrics.jurisdictionCounts['Vicariato Apostólico de Puerto Leguízamo – Solano']}
                    </span>
                    <span className="text-[10px] text-purple-700 block font-medium">Vicariato Apostólico</span>
                  </div>
                </div>

                {/* Status breakdown pills */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    En ejecución: {metrics.statusCounts.active}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    Consolidados: {metrics.statusCounts.consolidated}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-200 text-stone-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                    Memoria histórica: {metrics.statusCounts.historical}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Caquetá Map with Project Counts per Municipality (Zoomable, Filterable & Printable) */}
          <ReportCaquetaMap
            points={activeReportPoints}
            allAvailablePoints={allPoints}
            categories={categories}
            globalSelectedJurisdiction={selectedJurisdiction}
            onSelectMunicipality={(muni) => {
              setReportSearch(muni);
            }}
          />

          {/* Section: Timeline ("La Línea del Tiempo") */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs print:border-none print:shadow-none print:p-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-stone-200">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Línea del Tiempo de la Labor Humanitaria
                </h2>
                <p className="text-xs text-stone-500">
                  {groupingMode === 'chronological' &&
                    `Recorrido secuencial de intervenciones (${sortOrder === 'asc' ? 'orden ascendente' : 'orden descendente'})`}
                  {groupingMode === 'decades' &&
                    'Agrupación por etapas y momentos históricos del Caquetá'}
                  {groupingMode === 'byMunicipality' &&
                    'Distribución territorial por municipio de impacto'}
                </p>
              </div>

              <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full self-start sm:self-auto">
                {activeReportPoints.length} hitos presentados
              </span>
            </div>

            {/* Empty State */}
            {activeReportPoints.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-stone-800">
                  No hay hitos que coincidan con la selección
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Ajusta los filtros de búsqueda o cambia la opción a "Todos los Puntos" para visualizar la línea de tiempo completa.
                </p>
              </div>
            ) : null}

            {/* VIEW MODE 1: CHRONOLOGICAL TIMELINE */}
            {groupingMode === 'chronological' && activeReportPoints.length > 0 && (
              <div className="relative pl-6 sm:pl-8 border-l-2 border-amber-500/40 ml-2 sm:ml-4 space-y-6">
                {sortedPoints.map((point, index) => {
                  const category = categoryMap.get(point.categoryId);
                  const municipality = municipalityMap.get(point.municipality);

                  return (
                    <div
                      key={point.id}
                      className="relative group transition-all timeline-item break-inside-avoid print:break-inside-avoid"
                    >
                      {/* Timeline Node Icon */}
                      <div
                        className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: category?.color || '#b45309' }}
                      >
                        <span className="w-2 h-2 rounded-full bg-white" />
                      </div>

                      {/* Milestone Card */}
                      <div
                        onClick={() => onSelectPoint && onSelectPoint(point)}
                        className="p-4 sm:p-5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer print:bg-white print:border-stone-300 item-card break-inside-avoid print:break-inside-avoid"
                      >
                        {/* Milestone Top Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm sm:text-base font-extrabold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-700" />
                              {point.year}
                              {point.endYear && ` — ${point.endYear}`}
                            </span>

                            <span
                              className="text-[11px] font-semibold text-white px-2.5 py-0.5 rounded-full"
                              style={{ backgroundColor: category?.color || '#b45309' }}
                            >
                              {category?.name || 'Labor Pastoral'}
                            </span>

                            <span className="text-[11px] font-medium text-stone-600 bg-white border border-stone-200 px-2 py-0.5 rounded-full">
                              📍 {point.municipality}
                              {point.communityOrVereda && ` • ${point.communityOrVereda}`}
                            </span>

                            <span className="text-[10px] font-semibold text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Church className="w-3 h-3 text-amber-600" />
                              {getEcclesiasticalJurisdiction(point.municipality)}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              point.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : point.status === 'consolidated'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {point.status === 'active'
                              ? 'En Curso'
                              : point.status === 'consolidated'
                              ? 'Consolidado'
                              : 'Histórico'}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-sm sm:text-base font-bold text-stone-900 mb-1">
                          {point.title}
                        </h3>

                        {/* Funding Agency, Execution Dates & Target Population Highlights */}
                        {(point.fundingAgency || point.targetPopulation || point.executionPeriod) && (
                          <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-xs">
                            {point.fundingAgency && (
                              <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                                <Landmark className="w-3 h-3 text-amber-700" />
                                Financiador: {point.fundingAgency}
                              </span>
                            )}
                            {point.executionPeriod && (
                              <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md text-[11px] font-medium">
                                <Calendar className="w-3 h-3 text-stone-500" />
                                {point.executionPeriod}
                              </span>
                            )}
                            {point.targetPopulation && (
                              <span className="inline-flex items-center gap-1 bg-stone-50 border border-stone-200 text-stone-700 px-2 py-0.5 rounded-md text-[11px]">
                                <Target className="w-3 h-3 text-rose-500" />
                                <span className="font-medium">{point.targetPopulation}</span>
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-3">
                          {point.description}
                        </p>

                        {/* Key Actions and Achievements */}
                        {point.keyActions && point.keyActions.length > 0 && (
                          <div className="bg-white p-3 rounded-lg border border-stone-200/80 mb-3 print:border-stone-300">
                            <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Acciones Clave y Logros
                            </span>
                            <ul className="space-y-1">
                              {point.keyActions.map((action, aIdx) => (
                                <li
                                  key={aIdx}
                                  className="text-xs text-stone-700 flex items-start gap-1.5"
                                >
                                  <span className="text-amber-600 font-bold text-xs leading-none mt-1">
                                    •
                                  </span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Populations & Beneficiaries Chips */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/60 text-xs text-stone-500">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                              <Users className="w-3 h-3 text-stone-400" />
                              Población:
                            </span>
                            {point.populationTypes && point.populationTypes.length > 0 ? (
                              point.populationTypes.map((pop, pIdx) => (
                                <span
                                  key={pIdx}
                                  className="text-[10px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200"
                                >
                                  {pop}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-stone-400 italic">
                                General
                              </span>
                            )}
                          </div>

                          {point.beneficiariesApprox ? (
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              ~{point.beneficiariesApprox.toLocaleString('es-CO')} beneficiarios
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW MODE 2: DECADES / HISTORICAL ERAS */}
            {groupingMode === 'decades' && activeReportPoints.length > 0 && (
              <div className="space-y-8">
                {decadeGroups.map((era) => (
                  <div
                    key={era.id}
                    className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50/40 print:border-stone-300 timeline-item break-inside-avoid print:break-inside-avoid"
                  >
                    {/* Era Header */}
                    <div className="bg-stone-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-2 print:bg-stone-800">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 block">
                          {era.yearsText}
                        </span>
                        <h3 className="text-base font-bold text-white mt-0.5">{era.title}</h3>
                        <p className="text-xs text-stone-300 mt-1 max-w-2xl">{era.subtitle}</p>
                      </div>
                      <span className="text-xs font-bold bg-amber-600 text-white px-3 py-1 rounded-full">
                        {era.points.length} {era.points.length === 1 ? 'hito' : 'hitos'}
                      </span>
                    </div>

                    {/* Era Points List */}
                    <div className="p-4 sm:p-6 space-y-4">
                      {era.points.map((pt) => {
                        const cat = categoryMap.get(pt.categoryId);
                        return (
                          <div
                            key={pt.id}
                            className="bg-white p-4 rounded-xl border border-stone-200 hover:border-amber-400 transition item-card break-inside-avoid print:break-inside-avoid"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                                  {pt.year}
                                </span>
                                <h4 className="text-sm font-bold text-stone-900">{pt.title}</h4>
                              </div>
                              <span
                                className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: cat?.color || '#b45309' }}
                              >
                                {cat?.name || 'General'}
                              </span>
                            </div>
                            <p className="text-xs text-stone-600 mb-2">{pt.description}</p>
                            <div className="text-[11px] text-stone-500 flex flex-wrap gap-2 items-center">
                              <span>📍 {pt.municipality}</span>
                              <span className="text-stone-400">•</span>
                              <span className="flex items-center gap-1 font-medium text-stone-600">
                                <Church className="w-3 h-3 text-amber-600" />
                                {getEcclesiasticalJurisdiction(pt.municipality)}
                              </span>
                              {pt.beneficiariesApprox ? (
                                <>
                                  <span className="text-stone-400">•</span>
                                  <span>Beneficiarios: ~{pt.beneficiariesApprox}</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW MODE 3: BY MUNICIPALITY */}
            {groupingMode === 'byMunicipality' && activeReportPoints.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {municipalityGroups.map((group) => (
                  <div
                    key={group.municipality}
                    className="bg-stone-50/70 border border-stone-200 rounded-xl p-4 sm:p-5 timeline-item break-inside-avoid print:break-inside-avoid"
                  >
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200">
                      <div>
                        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-amber-600" />
                          {group.municipality}
                        </h3>
                        <span className="text-[11px] font-semibold text-stone-600 flex items-center gap-1 mt-0.5">
                          <Church className="w-3 h-3 text-amber-600" />
                          {group.jurisdiction}
                        </span>
                      </div>
                      <span className="text-xs font-bold bg-stone-200 text-stone-800 px-2.5 py-0.5 rounded-full">
                        {group.points.length} {group.points.length === 1 ? 'hito' : 'hitos'}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {group.points.map((pt) => {
                        const cat = categoryMap.get(pt.categoryId);
                        return (
                          <div
                            key={pt.id}
                            className="bg-white p-3 rounded-lg border border-stone-200/80 text-xs item-card break-inside-avoid print:break-inside-avoid"
                          >
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <span className="font-bold text-stone-800">{pt.title}</span>
                              <span className="font-extrabold text-amber-800 shrink-0">
                                {pt.year}
                              </span>
                            </div>
                            <p className="text-stone-600 text-[11px] line-clamp-2">
                              {pt.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Synthesis Matrix / Synoptic Table */}
          {activeReportPoints.length > 0 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs print:border-none print:shadow-none print:p-0">
              <h2 className="text-base font-bold text-stone-900 mb-1 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-amber-600" />
                Matriz Resumen de Intervenciones
              </h2>
              <p className="text-xs text-stone-500 mb-4">
                Consolidado estructurado para seguimiento institucional y rendición de cuentas
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                      <th className="py-2.5 px-3">Año</th>
                      <th className="py-2.5 px-3">Hito / Intervención</th>
                      <th className="py-2.5 px-3">Municipio / Jurisdicción</th>
                      <th className="py-2.5 px-3">Eje Pastoral</th>
                      <th className="py-2.5 px-3">Población</th>
                      <th className="py-2.5 px-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {sortedPoints.map((pt) => {
                      const cat = categoryMap.get(pt.categoryId);
                      return (
                        <tr key={pt.id} className="hover:bg-stone-50 transition print:break-inside-avoid break-inside-avoid">
                          <td className="py-2 px-3 font-bold text-amber-800 whitespace-nowrap">
                            {pt.year}
                            {pt.endYear ? ` - ${pt.endYear}` : ''}
                          </td>
                          <td className="py-2 px-3 font-semibold text-stone-900 max-w-xs truncate">
                            {pt.title}
                          </td>
                          <td className="py-2 px-3 text-stone-600 whitespace-nowrap">
                            <span className="font-medium text-stone-800">{pt.municipality}</span>
                            <span className="text-[10px] text-stone-500 block">
                              {getEcclesiasticalJurisdiction(pt.municipality)}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className="inline-block text-[10px] font-semibold text-white px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: cat?.color || '#b45309' }}
                            >
                              {cat?.name || 'General'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-stone-500">
                            {pt.populationTypes?.slice(0, 2).join(', ') || 'General'}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                pt.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : pt.status === 'consolidated'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {pt.status}
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

          {/* Institutional Sign-off and Footer */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 text-center space-y-4 print:border-none print:shadow-none">
            <div className="max-w-md mx-auto pt-6 border-t border-dashed border-stone-300">
              <p className="text-xs font-bold text-stone-800">
                Vicaría de Pastoral Social & Caritas Florencia
              </p>
              <p className="text-[11px] text-stone-500">
                Diócesis de Florencia — Caquetá, Colombia
              </p>
              <p className="text-[10px] text-stone-400 mt-2 italic">
                "La caridad de Cristo nos urge a acompañar el caminar de nuestras comunidades
                amazónicas en la verdad, la justicia y la paz."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

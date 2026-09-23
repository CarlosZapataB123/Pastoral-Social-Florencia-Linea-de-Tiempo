import React, { useState } from 'react';
import { HumanitarianPoint, PointCategory } from '../types';
import { CAQUETA_MUNICIPALITIES } from '../constants';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Landmark,
  Target,
  Calendar,
  Layers,
  MapPin,
  Trash2,
  Plus,
} from 'lucide-react';

interface ProjectImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: PointCategory[];
  onImportPoints: (points: Omit<HumanitarianPoint, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;
}

interface ParsedProjectRow {
  title: string;
  year: number;
  endYear?: number;
  executionPeriod?: string;
  fundingAgency?: string;
  targetPopulation?: string;
  municipality: string;
  communityOrVereda?: string;
  categoryId: string;
  description?: string;
  status: 'active' | 'historical' | 'consolidated';
}

export const ProjectImportModal: React.FC<ProjectImportModalProps> = ({
  isOpen,
  onClose,
  categories,
  onImportPoints,
}) => {
  if (!isOpen) return null;

  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedProjectRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to map category names or keywords to one of the 5 permanent lines
  const matchCategory = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('tierra') || lower.includes('rural') || lower.includes('bosque') || lower.includes('ambiental') || lower.includes('amazonia')) {
      return 'linea_pastoral_rural_tierra';
    }
    if (lower.includes('aliment') || lower.includes('soberan') || lower.includes('seguridad alimentaria') || lower.includes('arraigo') || lower.includes('finca')) {
      return 'linea_seguridad_soberania_alimentaria';
    }
    if (lower.includes('cuidado') || lower.includes('justicia') || lower.includes('derechos') || lower.includes('reclutamiento') || lower.includes('desplazamiento') || lower.includes('lider')) {
      return 'linea_cuidado_justicia';
    }
    if (lower.includes('mujer') || lower.includes('genero') || lower.includes('femenin')) {
      return 'linea_mujer';
    }
    if (lower.includes('comite') || lower.includes('parroqu') || lower.includes('parroquia')) {
      return 'linea_comites_parroquiales';
    }
    // Default fallback to first permanent category
    return categories[0]?.id || 'linea_cuidado_justicia';
  };

  // Helper to match municipality
  const matchMunicipality = (text: string): string => {
    const lower = text.toLowerCase();
    for (const m of CAQUETA_MUNICIPALITIES) {
      if (lower.includes(m.name.toLowerCase())) {
        return m.name;
      }
    }
    return 'Florencia';
  };

  // Parse raw text (supports TSV pasted from Excel, CSV, or structured lines)
  const handleParse = () => {
    if (!rawText.trim()) {
      setError('Por favor pega o escribe el texto con los datos de los proyectos.');
      return;
    }

    try {
      const lines = rawText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const rows: ParsedProjectRow[] = [];

      for (const line of lines) {
        // Skip header lines
        if (
          line.toLowerCase().includes('nombre') &&
          line.toLowerCase().includes('proyecto') &&
          line.toLowerCase().includes('financiador')
        ) {
          continue;
        }

        // Check if tab-separated or pipe-separated or semicolon or comma
        let parts: string[] = [];
        if (line.includes('\t')) {
          parts = line.split('\t').map((p) => p.trim());
        } else if (line.includes('|')) {
          parts = line.split('|').map((p) => p.trim());
        } else if (line.includes(';')) {
          parts = line.split(';').map((p) => p.trim());
        } else {
          // Plain sentence or line
          parts = [line];
        }

        if (parts.length >= 3) {
          // Heuristic extraction
          const title = parts[0] || 'Proyecto Pastoral';
          
          // Year parsing
          let year = new Date().getFullYear();
          let endYear: number | undefined = undefined;
          let executionPeriod = '';
          
          const yearMatch = parts.find((p) => /(19|20)\d{2}/.test(p));
          if (yearMatch) {
            const matches = yearMatch.match(/(19|20)\d{2}/g);
            if (matches && matches.length > 0) {
              year = parseInt(matches[0], 10);
              if (matches.length > 1) {
                endYear = parseInt(matches[1], 10);
              }
            }
            executionPeriod = yearMatch;
          }

          // Funding agency: looking for parts or known entities
          let fundingAgency = parts[2] || '';
          let targetPopulation = parts[3] || '';
          let categoryId = categories[0]?.id || 'linea_cuidado_justicia';

          if (parts.length >= 5) {
            categoryId = matchCategory(parts[4]);
          } else {
            categoryId = matchCategory(title + ' ' + targetPopulation);
          }

          const municipality = matchMunicipality(line);

          rows.push({
            title,
            year,
            endYear,
            executionPeriod: executionPeriod || `${year}${endYear ? ' - ' + endYear : ''}`,
            fundingAgency,
            targetPopulation,
            municipality,
            categoryId,
            description: `Proyecto institucional de la Pastoral Social Florencia: ${title}`,
            status: year >= 2025 ? 'active' : 'historical',
          });
        } else if (parts.length === 1 && line.length > 5) {
          // Simple single line project entry
          const yearMatch = line.match(/(19|20)\d{2}/);
          const year = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();
          const categoryId = matchCategory(line);
          const municipality = matchMunicipality(line);

          rows.push({
            title: line,
            year,
            executionPeriod: year.toString(),
            fundingAgency: '',
            targetPopulation: 'Comunidades vulnerables de Caquetá',
            municipality,
            categoryId,
            description: line,
            status: year >= 2025 ? 'active' : 'historical',
          });
        }
      }

      if (rows.length === 0) {
        setError('No se pudieron detectar proyectos estructurados. Revisa el formato.');
      } else {
        setParsedRows(rows);
        setError(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar el texto');
    }
  };

  const handleUpdateRow = (index: number, field: keyof ParsedProjectRow, value: any) => {
    setParsedRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddManualRow = () => {
    setParsedRows((prev) => [
      ...prev,
      {
        title: '',
        year: new Date().getFullYear(),
        fundingAgency: '',
        targetPopulation: '',
        municipality: 'Florencia',
        categoryId: categories[0]?.id || 'linea_cuidado_justicia',
        status: 'active',
      },
    ]);
  };

  const handleSaveAll = async () => {
    if (parsedRows.length === 0) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Convert to HumanitarianPoint array with coordinates from municipality
      const pointsToSave: Omit<HumanitarianPoint, 'id' | 'createdAt' | 'updatedAt'>[] = parsedRows.map(
        (r) => {
          const muniData = CAQUETA_MUNICIPALITIES.find((m) => m.name === r.municipality) || CAQUETA_MUNICIPALITIES[0];
          // Slight jitter so markers in same municipality don't perfectly stack
          const jitterLat = (Math.random() - 0.5) * 0.04;
          const jitterLng = (Math.random() - 0.5) * 0.04;

          return {
            title: r.title.trim() || 'Proyecto Pastoral',
            description: r.description || `Labor de la Pastoral Social Florencia: ${r.title}`,
            municipality: r.municipality,
            communityOrVereda: r.communityOrVereda || '',
            lat: Number((muniData.lat + jitterLat).toFixed(5)),
            lng: Number((muniData.lng + jitterLng).toFixed(5)),
            year: Number(r.year) || new Date().getFullYear(),
            endYear: r.endYear ? Number(r.endYear) : undefined,
            executionPeriod: r.executionPeriod || `${r.year}`,
            fundingAgency: r.fundingAgency || '',
            targetPopulation: r.targetPopulation || '',
            categoryId: r.categoryId,
            populationTypes: r.targetPopulation ? [r.targetPopulation] : ['Población en Territorio'],
            status: r.status,
            keyActions: [],
          };
        }
      );

      await onImportPoints(pointsToSave);
      setImportSuccess(pointsToSave.length);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar los proyectos en Firestore');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:hidden">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-600" />
              Incorporar Proyectos de la Pastoral Social
            </h3>
            <p className="text-xs text-stone-500">
              Registra Nombre del Proyecto, Años, Agencia Financiadora y Población Objetivo vinculados a las 5 Líneas Pastorales.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {importSuccess !== null && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">¡Proyectos incorporados con éxito!</p>
                <p className="text-xs text-emerald-800">
                  Se agregaron {importSuccess} proyectos al mapa y a la base de datos de la Pastoral Social de Florencia.
                </p>
              </div>
            </div>
          )}

          {parsedRows.length === 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs space-y-2 text-stone-700">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-amber-700" />
                  Instrucciones de incorporación masiva o individual
                </div>
                <p>
                  Pega directamente las filas de tus proyectos (desde Excel, Word o texto plano). El sistema detectará automáticamente:
                </p>
                <ul className="list-disc list-inside space-y-1 text-stone-600 pl-2">
                  <li><strong>Nombre del Proyecto</strong></li>
                  <li><strong>Fecha o Período de Ejecución por Año</strong> (ej: 1988, 2013-2015, 2024-2026)</li>
                  <li><strong>Agencia Financiadora</strong> (ej: MISEREOR, ADVENIAT, OIM, ACNUR, GIZ, SNPS)</li>
                  <li><strong>Población Objetivo</strong> (ej: NNAJ, Mujeres rurales, Familias campesinas, Indígenas)</li>
                  <li><strong>Línea de Acción Pastoral</strong> (Se vinculará a una de las 5 líneas de Florencia)</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Pega aquí los datos de tus proyectos (o escribe fila por fila):
                </label>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Ejemplo de formato tabulado o separado por columnas:
Proyecto Somos Paz | 2024-2026 | ACNUR / OIM | Niñez y adolescencia indígena | Cuidado y justicia | Solano
Fortalecimiento Agroecológico | 2018-2021 | MISEREOR | Familias campesinas | Pastoral rural y de la tierra | Belén de los Andaquíes
Comedores Parroquiales de Solidaridad | 2020-2023 | Diócesis Florencia | Adultos mayores y migrantes | Comités parroquiales de Pastoral Social | Florencia`}
                  className="w-full p-3 text-xs font-mono border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddManualRow}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar manualmente fila por fila
                </button>

                <button
                  type="button"
                  onClick={handleParse}
                  className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Procesar y Revisar Proyectos
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">
                  {parsedRows.length} {parsedRows.length === 1 ? 'proyecto listo' : 'proyectos listos'} para incorporar
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddManualRow}
                    className="px-2.5 py-1 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" />
                    Añadir otro
                  </button>
                  <button
                    type="button"
                    onClick={() => setParsedRows([])}
                    className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-700 underline"
                  >
                    Volver a pegar texto
                  </button>
                </div>
              </div>

              {/* Table of Parsed Projects */}
              <div className="border border-stone-200 rounded-xl overflow-x-auto max-h-96">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-100 text-stone-700 uppercase font-semibold text-[10px] border-b border-stone-200 sticky top-0">
                    <tr>
                      <th className="p-2.5">Nombre del Proyecto</th>
                      <th className="p-2.5 w-24">Año / Período</th>
                      <th className="p-2.5">Agencia Financiadora</th>
                      <th className="p-2.5">Población Objetivo</th>
                      <th className="p-2.5">Línea Pastoral (5 Permanentes)</th>
                      <th className="p-2.5 w-28">Municipio</th>
                      <th className="p-2.5 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/20">
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.title}
                            onChange={(e) => handleUpdateRow(idx, 'title', e.target.value)}
                            placeholder="Nombre del proyecto..."
                            className="w-full px-2 py-1 border border-stone-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-stone-900"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.executionPeriod || row.year}
                            onChange={(e) => {
                              const val = e.target.value;
                              const yr = parseInt(val.match(/(19|20)\d{2}/)?.[0] || '2024', 10);
                              handleUpdateRow(idx, 'year', yr);
                              handleUpdateRow(idx, 'executionPeriod', val);
                            }}
                            placeholder="2024"
                            className="w-full px-2 py-1 border border-stone-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.fundingAgency || ''}
                            onChange={(e) => handleUpdateRow(idx, 'fundingAgency', e.target.value)}
                            placeholder="Ej: MISEREOR, OIM, ACNUR..."
                            className="w-full px-2 py-1 border border-stone-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium text-amber-900 bg-amber-50/40"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.targetPopulation || ''}
                            onChange={(e) => handleUpdateRow(idx, 'targetPopulation', e.target.value)}
                            placeholder="Población objetivo..."
                            className="w-full px-2 py-1 border border-stone-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={row.categoryId}
                            onChange={(e) => handleUpdateRow(idx, 'categoryId', e.target.value)}
                            className="w-full px-2 py-1 border border-stone-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <select
                            value={row.municipality}
                            onChange={(e) => handleUpdateRow(idx, 'municipality', e.target.value)}
                            className="w-full px-2 py-1 border border-stone-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            {CAQUETA_MUNICIPALITIES.map((m) => (
                              <option key={m.name} value={m.name}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded transition"
                            title="Eliminar fila"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={isProcessing || parsedRows.length === 0}
                  className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isProcessing ? 'Guardando en Base de Datos...' : `Guardar ${parsedRows.length} Proyectos en el Mapa`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

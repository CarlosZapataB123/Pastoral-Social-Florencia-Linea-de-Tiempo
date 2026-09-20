import React from 'react';
import { HumanitarianPoint, PointCategory } from '../types';
import { MapPin, Calendar, Users, ChevronRight, Bookmark, FileText } from 'lucide-react';

interface PointsListViewProps {
  points: HumanitarianPoint[];
  categories: PointCategory[];
  selectedPointId: string | null;
  onSelectPoint: (point: HumanitarianPoint) => void;
  onAddNewPoint: () => void;
  onOpenReport?: () => void;
}

export const PointsListView: React.FC<PointsListViewProps> = ({
  points,
  categories,
  selectedPointId,
  onSelectPoint,
  onAddNewPoint,
  onOpenReport,
}) => {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  if (points.length === 0) {
    return (
      <div className="p-8 text-center text-stone-500 bg-white rounded-2xl border border-stone-200 m-4">
        <p className="text-sm font-semibold text-stone-800">No se encontraron puntos</p>
        <p className="text-xs text-stone-500 mt-1">
          Prueba cambiando los filtros de año o categoría, o crea un nuevo punto en el mapa.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={onAddNewPoint}
            className="px-4 py-2 text-xs font-semibold bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition"
          >
            Agregar Punto de Labor
          </button>
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="px-4 py-2 text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300 rounded-xl hover:bg-stone-200 transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Ver Informe</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Sort by year descending
  const sortedPoints = [...points].sort((a, b) => b.year - a.year);

  return (
    <div className="p-3 sm:p-4 space-y-2.5 max-w-4xl mx-auto">
      {/* List Header with Report CTA */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-stone-200 text-xs">
        <div>
          <span className="font-bold text-stone-800">
            Registro Histórico de Intervenciones
          </span>
          <span className="text-stone-500 ml-1.5 font-medium">
            ({points.length} {points.length === 1 ? 'hito documentado' : 'hitos documentados'})
          </span>
        </div>

        {onOpenReport && (
          <button
            onClick={onOpenReport}
            className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300/80 rounded-lg flex items-center gap-1.5 transition shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            <span>Generar Informe & Línea de Tiempo</span>
          </button>
        )}
      </div>

      {sortedPoints.map((point) => {
        const category = categoryMap.get(point.categoryId);
        const isSelected = point.id === selectedPointId;

        return (
          <div
            key={point.id}
            id={`point-card-${point.id}`}
            onClick={() => onSelectPoint(point)}
            className={`p-3.5 sm:p-4 bg-white rounded-2xl border cursor-pointer transition-all ${
              isSelected
                ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-md bg-amber-50/20'
                : 'border-stone-200 hover:border-stone-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: category?.color || '#2563EB' }}
                  >
                    {category?.name || 'Labor Pastoral'}
                  </span>
                  <span className="text-[11px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-500" />
                    {point.year}
                    {point.endYear ? ` - ${point.endYear}` : ''}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    {point.municipality}
                    {point.communityOrVereda ? ` (${point.communityOrVereda})` : ''}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-stone-900 leading-snug">{point.title}</h3>
                <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                  {point.description}
                </p>

                {point.populationTypes && point.populationTypes.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mt-2.5">
                    <Users className="w-3 h-3 text-amber-600 shrink-0" />
                    {point.populationTypes.map((pop, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium"
                      >
                        {pop}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <ChevronRight className="w-5 h-5 text-stone-400 shrink-0 mt-2" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

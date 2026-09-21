import React, { useState } from 'react';
import { HumanitarianPoint, PointCategory } from '../types';
import { MapPin, Calendar, Users, ChevronRight, FileText, Edit2, Trash2 } from 'lucide-react';

interface PointsListViewProps {
  points: HumanitarianPoint[];
  categories: PointCategory[];
  selectedPointId: string | null;
  onSelectPoint: (point: HumanitarianPoint) => void;
  onEditPoint?: (point: HumanitarianPoint) => void;
  onDeletePoint?: (pointId: string) => Promise<void>;
  onAddNewPoint: () => void;
  onOpenReport?: () => void;
}

export const PointsListView: React.FC<PointsListViewProps> = ({
  points,
  categories,
  selectedPointId,
  onSelectPoint,
  onEditPoint,
  onDeletePoint,
  onAddNewPoint,
  onOpenReport,
}) => {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const [deletingPointId, setDeletingPointId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleConfirmDelete = async (e: React.MouseEvent, pointId: string) => {
    e.stopPropagation();
    if (!onDeletePoint) return;
    try {
      setIsDeleting(true);
      await onDeletePoint(pointId);
      setDeletingPointId(null);
    } catch (err) {
      console.error('Error al eliminar punto:', err);
    } finally {
      setIsDeleting(false);
    }
  };

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
        const isConfirmingThis = deletingPointId === point.id;

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

              {/* Action Buttons on Card */}
              <div className="flex items-center gap-1 shrink-0 pt-1">
                {isConfirmingThis ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 p-1.5 bg-rose-50 border border-rose-200 rounded-xl"
                  >
                    <span className="text-[11px] font-semibold text-rose-800">¿Eliminar?</span>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={(e) => handleConfirmDelete(e, point.id)}
                      className="px-2 py-0.5 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded shadow-xs disabled:opacity-50"
                    >
                      {isDeleting ? '...' : 'Sí'}
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingPointId(null);
                      }}
                      className="px-1.5 py-0.5 text-[11px] text-stone-600 hover:text-stone-800"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <>
                    {onEditPoint && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPoint(point);
                        }}
                        className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition"
                        title="Editar punto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDeletePoint && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingPointId(point.id);
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Eliminar punto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <ChevronRight className="w-5 h-5 text-stone-300 ml-1" />
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

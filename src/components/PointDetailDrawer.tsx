import React, { useState } from 'react';
import { HumanitarianPoint, PointCategory } from '../types';
import {
  X,
  MapPin,
  Calendar,
  Users,
  Edit2,
  Trash2,
  Share2,
  Award,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface PointDetailDrawerProps {
  point: HumanitarianPoint | null;
  category?: PointCategory;
  onClose: () => void;
  onEdit: (point: HumanitarianPoint) => void;
  onDelete: (pointId: string) => Promise<void>;
}

export const PointDetailDrawer: React.FC<PointDetailDrawerProps> = ({
  point,
  category,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!point) return null;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const color = category?.color || '#2563EB';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${point.title} - Pastoral Social Florencia`,
        text: `${point.title} (${point.municipality}, Caquetá - ${point.year}). Labor humanitaria en defensa de la vida y el territorio.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `${point.title} (${point.municipality}, Caquetá - ${point.year})\n${point.description}`
      );
      alert('Información del punto copiada al portapapeles');
    }
  };

  return (
    <div
      id="point-detail-drawer"
      className="absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-30 border-l border-stone-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
    >
      {/* Header bar */}
      <div
        className="p-4 text-white relative flex flex-col justify-end"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, #1c1917 100%)`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider font-bold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full">
            {category?.name || 'Labor Pastoral'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
              title="Compartir punto"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
              title="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <h2 className="text-lg font-bold text-white leading-snug">{point.title}</h2>
        <div className="flex items-center gap-1.5 text-xs text-white/85 mt-1">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>
            {point.municipality}
            {point.communityOrVereda ? `, ${point.communityOrVereda}` : ''}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto space-y-4 flex-1 text-stone-800">
        {/* Category / Line Information */}
        {category && (
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span>{category.name}</span>
              </div>
              {category.isPermanent && (
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full shrink-0">
                  Línea Pastoral Actual
                </span>
              )}
            </div>
            {category.description && (
              <p className="text-[11px] text-stone-600 leading-relaxed pt-0.5">
                {category.description}
              </p>
            )}
          </div>
        )}

        {/* Quick Facts Grid */}
        <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs">
          <div>
            <span className="text-stone-400 block font-medium">Período / Año</span>
            <div className="flex items-center gap-1 font-bold text-stone-900 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {point.year} {point.endYear ? `- ${point.endYear}` : '(Presente)'}
              </span>
            </div>
          </div>
          <div>
            <span className="text-stone-400 block font-medium">Estado</span>
            <span
              className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
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
                ? 'Consolidada'
                : 'Histórica'}
            </span>
          </div>

          {point.beneficiariesApprox && (
            <div className="col-span-2 pt-1 border-t border-stone-200/60 mt-1">
              <span className="text-stone-400 block font-medium">Población Aprox. Impactada</span>
              <span className="font-bold text-stone-900">
                ~{point.beneficiariesApprox.toLocaleString()} personas / familias
              </span>
            </div>
          )}
        </div>

        {/* Population Types */}
        {point.populationTypes && point.populationTypes.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-stone-500" />
              Población Acompañada
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {point.populationTypes.map((pop, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-full font-medium"
                >
                  {pop}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
            Reseña de la Misión Humanitaria
          </h4>
          <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line bg-white p-3 rounded-xl border border-stone-100 shadow-xs">
            {point.description || 'Sin descripción detallada registrada aún.'}
          </p>
        </div>

        {/* Key Actions */}
        {point.keyActions && point.keyActions.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Hitos y Acciones Principales
            </h4>
            <ul className="space-y-1.5">
              {point.keyActions.map((action, i) => (
                <li
                  key={i}
                  className="text-xs text-stone-700 bg-stone-50 p-2 rounded-lg border border-stone-100 flex items-start gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Geographic location info */}
        <div className="text-[11px] text-stone-400 pt-2 border-t border-stone-100 space-y-0.5">
          <p>
            Coordenadas GPS: {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
          </p>
          <p>Vicaría de Pastoral Social &bull; Diócesis de Florencia (Caquetá)</p>
        </div>
      </div>

      {/* Footer controls for editing & deleting */}
      <div className="p-3 border-t border-stone-200 bg-stone-50">
        {showDeleteConfirm ? (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>¿Eliminar este punto pastoral de la base de datos?</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-800 rounded-lg hover:bg-rose-100 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  try {
                    setIsDeleting(true);
                    await onDelete(point.id);
                    onClose();
                  } catch (e) {
                    console.error(e);
                    setIsDeleting(false);
                  }
                }}
                className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => onEdit(point)}
              className="flex-1 px-3 py-2.5 text-xs font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Editar Información
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2.5 text-rose-600 hover:bg-rose-100 rounded-xl transition border border-rose-200 flex items-center justify-center"
              title="Eliminar este punto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

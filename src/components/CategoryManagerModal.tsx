import React, { useState } from 'react';
import { PointCategory } from '../types';
import { X, Plus, Trash2, Tag, Users, Bookmark, Sparkles, CheckCircle2 } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: PointCategory[];
  onAddCategory: (category: Omit<PointCategory, 'id'>) => Promise<PointCategory | void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  populationTypes: string[];
  onAddPopulationType: (typeName: string) => Promise<void>;
  onDeletePopulationType: (typeName: string) => Promise<void>;
}

const PRESET_COLORS = [
  '#2563EB', // Blue
  '#059669', // Emerald
  '#D97706', // Amber / Ochre
  '#DC2626', // Red
  '#7C3AED', // Purple
  '#DB2777', // Pink
  '#0891B2', // Cyan
  '#475569', // Slate
  '#15803D', // Forest Green
  '#B45309', // Warm Bronze
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
  populationTypes,
  onAddPopulationType,
  onDeletePopulationType,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'categories' | 'populations'>('categories');

  // Category state
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catColor, setCatColor] = useState('#2563EB');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  // Population state
  const [newPopName, setNewPopName] = useState('');
  const [isSubmittingPop, setIsSubmittingPop] = useState(false);
  const [popError, setPopError] = useState<string | null>(null);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCatError('El nombre de la línea o categoría es requerido');
      return;
    }

    try {
      setIsSubmittingCat(true);
      setCatError(null);
      await onAddCategory({
        name: catName.trim(),
        description: catDescription.trim() || undefined,
        color: catColor,
        iconName: 'Bookmark',
      });
      setCatName('');
      setCatDescription('');
    } catch (err: unknown) {
      setCatError(err instanceof Error ? err.message : 'Error creando la categoría');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleCreatePopulation = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPopName.trim();
    if (!trimmed) {
      setPopError('Escribe el nombre del tipo de población');
      return;
    }

    if (populationTypes.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      setPopError('Este tipo de población ya está registrado');
      return;
    }

    try {
      setIsSubmittingPop(true);
      setPopError(null);
      await onAddPopulationType(trimmed);
      setNewPopName('');
    } catch (err: unknown) {
      setPopError(err instanceof Error ? err.message : 'Error registrando el tipo de población');
    } finally {
      setIsSubmittingPop(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="category-manager-modal"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Líneas Pastorales y Población Beneficiaria
            </h3>
            <p className="text-xs text-stone-500">
              Configuración y creación personalizada desde cero
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-100/70 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'categories'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-amber-600" />
            <span>Líneas Pastorales</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              categories.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-600'
            }`}>
              {categories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('populations')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'populations'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Población Beneficiaria</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              populationTypes.length > 0 ? 'bg-blue-100 text-blue-800' : 'bg-stone-200 text-stone-600'
            }`}>
              {populationTypes.length}
            </span>
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: CATEGORIAS / LINEAS PASTORALES */}
          {activeTab === 'categories' && (
            <div className="space-y-5">
              {/* Form Nueva Categoría */}
              <form
                onSubmit={handleCreateCategory}
                className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3"
              >
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-amber-600" />
                  Nueva Línea o Categoría Pastoral
                </h4>

                {catError && (
                  <div className="p-2 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                    {catError}
                  </div>
                )}

                <div>
                  <label className="block text-xs text-stone-600 font-medium mb-1">
                    Nombre de la Línea *
                  </label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="Ej: Derechos Humanos y Paz, Agroecología, Infancia..."
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-600 font-medium mb-1">
                    Color representativo en el mapa
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCatColor(c)}
                          className={`w-6 h-6 rounded-full transition-transform ${
                            catColor === c ? 'scale-125 ring-2 ring-stone-900' : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={catColor}
                      onChange={(e) => setCatColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white"
                      title="Elegir color personalizado"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-stone-600 font-medium mb-1">
                    Descripción o alcance (opcional)
                  </label>
                  <input
                    type="text"
                    value={catDescription}
                    onChange={(e) => setCatDescription(e.target.value)}
                    placeholder="Objetivo o enfoque humanitario"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSubmittingCat || !catName.trim()}
                    className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isSubmittingCat ? 'Creando...' : 'Crear Línea Pastoral'}
                  </button>
                </div>
              </form>

              {/* Lista de Categorías Creadas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Líneas Registradas ({categories.length})
                  </h4>
                  {categories.length === 0 && (
                    <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      En blanco (0)
                    </span>
                  )}
                </div>

                {categories.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                    <Bookmark className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-stone-700">
                      No hay líneas pastorales creadas todavía
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto">
                      Tu lista está en blanco para que definas desde cero las líneas de acción pastoral de la Diócesis.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="p-3 flex items-center justify-between gap-3 hover:bg-stone-50 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: cat.color }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-stone-800 truncate">
                              {cat.name}
                            </p>
                            {cat.description && (
                              <p className="text-[11px] text-stone-500 truncate">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `¿Eliminar la línea pastoral "${cat.name}"?`
                              )
                            ) {
                              onDeleteCategory(cat.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TIPOS DE POBLACION BENEFICIARIA */}
          {activeTab === 'populations' && (
            <div className="space-y-5">
              {/* Form Nuevo Tipo de Población */}
              <form
                onSubmit={handleCreatePopulation}
                className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3"
              >
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  Nuevo Tipo de Población Beneficiaria
                </h4>

                {popError && (
                  <div className="p-2 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                    {popError}
                  </div>
                )}

                <div>
                  <label className="block text-xs text-stone-600 font-medium mb-1">
                    Nombre del grupo o población *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPopName}
                      onChange={(e) => setNewPopName(e.target.value)}
                      placeholder="Ej: Comunidades Campesinas, Niñez Rural, Víctimas..."
                      className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingPop || !newPopName.trim()}
                      className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition disabled:opacity-50 flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isSubmittingPop ? 'Agregando...' : 'Agregar'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Lista de Poblaciones Creadas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Poblaciones Registradas ({populationTypes.length})
                  </h4>
                  {populationTypes.length === 0 && (
                    <span className="text-[11px] text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      En blanco (0)
                    </span>
                  )}
                </div>

                {populationTypes.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                    <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-stone-700">
                      No hay tipos de población creados todavía
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto">
                      Tu catálogo está en blanco. Agrega los grupos prioritarios de la pastoral social (campesinos, indígenas, mujeres, etc.) desde cero.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                    {populationTypes.map((pop) => (
                      <div
                        key={pop}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs font-medium text-stone-800 shadow-xs group hover:border-stone-300 transition"
                      >
                        <span>{pop}</span>
                        <button
                          type="button"
                          onClick={() => onDeletePopulationType(pop)}
                          className="text-stone-400 hover:text-rose-600 p-0.5 transition"
                          title={`Eliminar "${pop}"`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg transition shadow-xs"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

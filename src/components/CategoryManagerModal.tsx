import React, { useState } from 'react';
import { PointCategory } from '../types';
import {
  X,
  Plus,
  Trash2,
  Tag,
  Users,
  Lock,
  Pencil,
  Check,
  Shield,
  Sprout,
  Trees,
  Sparkles,
  HeartHandshake,
  AlertCircle,
  Bookmark,
  Info,
} from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: PointCategory[];
  onAddCategory: (category: Omit<PointCategory, 'id'>) => Promise<PointCategory | void>;
  onUpdateCategory: (
    categoryId: string,
    category: Partial<Omit<PointCategory, 'id' | 'isPermanent'>>
  ) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  populationTypes: string[];
  onAddPopulationType: (typeName: string) => Promise<void>;
  onDeletePopulationType: (typeName: string) => Promise<void>;
}

const PRESET_COLORS = [
  '#059669', // Emerald Amazon
  '#10B981', // Vibrant Green
  '#2563EB', // Blue
  '#8B5CF6', // Purple / Violet
  '#D97706', // Amber / Bronze
  '#DC2626', // Red
  '#0891B2', // Cyan
  '#DB2777', // Pink
  '#475569', // Slate
  '#15803D', // Deep Forest
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  populationTypes,
  onAddPopulationType,
  onDeletePopulationType,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'categories' | 'populations'>('categories');

  // Category creation state
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catColor, setCatColor] = useState('#2563EB');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  // Category edit state (for custom categories)
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('#2563EB');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  // Population state
  const [newPopName, setNewPopName] = useState('');
  const [isSubmittingPop, setIsSubmittingPop] = useState(false);
  const [popError, setPopError] = useState<string | null>(null);

  // Core permanent categories vs Custom/historical categories
  const coreCategories = categories.filter(
    (c) => c.isPermanent || c.id.startsWith('linea_')
  );
  const customCategories = categories.filter(
    (c) => !c.isPermanent && !c.id.startsWith('linea_')
  );

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCatError('El nombre de la línea de trabajo es requerido');
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
      setCatError(err instanceof Error ? err.message : 'Error creando la línea');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const startEditingCategory = (cat: PointCategory) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description || '');
    setEditColor(cat.color);
    setEditError(null);
  };

  const handleSaveEdit = async (catId: string) => {
    if (!editName.trim()) {
      setEditError('El nombre no puede estar vacío');
      return;
    }

    try {
      setIsSavingEdit(true);
      setEditError(null);
      await onUpdateCategory(catId, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        color: editColor,
      });
      setEditingCatId(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Error al guardar los cambios');
    } finally {
      setIsSavingEdit(false);
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

  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trees':
        return <Trees className="w-4 h-4 text-emerald-700 shrink-0" />;
      case 'Sprout':
        return <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'Shield':
        return <Shield className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />;
      default:
        return <Tag className="w-4 h-4 text-stone-600 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:hidden">
      <div
        id="category-manager-modal"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Líneas de Trabajo y Población Beneficiaria
            </h3>
            <p className="text-xs text-stone-500">
              Ejes pastorales de la Diócesis de Florencia y categorización de acciones
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
            <span>Líneas de Trabajo Pastoral</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                categories.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-600'
              }`}
            >
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
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                populationTypes.length > 0 ? 'bg-blue-100 text-blue-800' : 'bg-stone-200 text-stone-600'
              }`}
            >
              {populationTypes.length}
            </span>
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: CATEGORIAS / LINEAS DE TRABAJO */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Sección 1: 5 Líneas Actuales Institucionales (Permanentes) */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      Líneas de Trabajo Actuales de la Pastoral Social (5 Permanentes)
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Ejes de acción institucionales vigentes. Están configuradas por defecto y no se
                      pueden modificar ni eliminar.
                    </p>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Lock className="w-3 h-3" />
                    Protegidas (5)
                  </span>
                </div>

                <div className="space-y-2.5">
                  {coreCategories.map((cat, idx) => (
                    <div
                      key={cat.id}
                      className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="flex flex-col items-center shrink-0 mt-0.5">
                          <span
                            className="w-4 h-4 rounded-full shadow-xs mb-1"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-[10px] font-extrabold text-stone-500">
                            #{idx + 1}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-stone-900">
                              {cat.name}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-amber-100/70 text-amber-900 border border-amber-300">
                              <Lock className="w-2.5 h-2.5" />
                              Línea Actual Permanente
                            </span>
                          </div>
                          {cat.description && (
                            <p className="text-xs text-stone-600 leading-relaxed">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 self-start sm:self-center">
                        <span
                          className="text-[11px] font-medium text-stone-400 bg-stone-100 px-2 py-1 rounded-lg flex items-center gap-1 cursor-default"
                          title="Línea institucional fija. No modificable ni eliminable."
                        >
                          <Lock className="w-3 h-3 text-stone-400" />
                          Fija
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divisor */}
              <hr className="border-stone-200" />

              {/* Sección 2: Otras Líneas de Trabajo (Históricas / Nuevas) */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    Otras Líneas de Trabajo (Históricas / Años Anteriores)
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Puedes crear líneas adicionales para proyectos de otros períodos. Estas líneas
                    sí se pueden editar, modificar y eliminar en cualquier momento.
                  </p>
                </div>

                {/* Form Nueva Línea */}
                <form
                  onSubmit={handleCreateCategory}
                  className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3"
                >
                  <h5 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    Registrar nueva línea de trabajo
                  </h5>

                  {catError && (
                    <div className="p-2 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{catError}</span>
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
                      placeholder="Ej: Reconciliación y Diálogos de Paz (1998), Pastoral Penitenciaria..."
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      Descripción o alcance temporal (opcional)
                    </label>
                    <input
                      type="text"
                      value={catDescription}
                      onChange={(e) => setCatDescription(e.target.value)}
                      placeholder="Ej: Acompañamiento humanitario y facilitación durante movilizaciones"
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isSubmittingCat || !catName.trim()}
                      className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isSubmittingCat ? 'Creando...' : 'Crear Línea de Trabajo'}
                    </button>
                  </div>
                </form>

                {/* Lista de Líneas Creadas por el Usuario */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Otras Líneas Registradas ({customCategories.length})
                    </h5>
                  </div>

                  {editError && (
                    <div className="p-2 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{editError}</span>
                    </div>
                  )}

                  {customCategories.length === 0 ? (
                    <div className="p-5 text-center border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                      <Bookmark className="w-6 h-6 text-stone-300 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-stone-700">
                        No hay otras líneas de trabajo adicionales
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5 max-w-sm mx-auto">
                        Actualmente están activas las 5 líneas institucionales permanentes. Si necesitas
                        registrar ejes históricos de años pasados, puedes crearlos con el formulario superior.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white shadow-xs">
                      {customCategories.map((cat) => {
                        const isEditing = editingCatId === cat.id;

                        if (isEditing) {
                          return (
                            <div key={cat.id} className="p-3.5 bg-amber-50/40 space-y-2.5">
                              <p className="text-xs font-bold text-stone-800">
                                Editar línea de trabajo
                              </p>
                              <div>
                                <label className="block text-[11px] text-stone-600 font-medium mb-0.5">
                                  Nombre:
                                </label>
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-stone-600 font-medium mb-0.5">
                                  Color representativo:
                                </label>
                                <div className="flex items-center gap-2">
                                  <div className="flex flex-wrap gap-1 flex-1">
                                    {PRESET_COLORS.map((c) => (
                                      <button
                                        key={c}
                                        type="button"
                                        onClick={() => setEditColor(c)}
                                        className={`w-5 h-5 rounded-full transition-transform ${
                                          editColor === c
                                            ? 'scale-125 ring-2 ring-stone-900'
                                            : 'hover:scale-110'
                                        }`}
                                        style={{ backgroundColor: c }}
                                      />
                                    ))}
                                  </div>
                                  <input
                                    type="color"
                                    value={editColor}
                                    onChange={(e) => setEditColor(e.target.value)}
                                    className="w-7 h-7 rounded border border-stone-300 cursor-pointer p-0 bg-white"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[11px] text-stone-600 font-medium mb-0.5">
                                  Descripción:
                                </label>
                                <input
                                  type="text"
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  placeholder="Descripción de la línea"
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingCatId(null)}
                                  className="px-3 py-1 text-xs text-stone-600 hover:text-stone-800 bg-white border border-stone-300 rounded-lg"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  disabled={isSavingEdit || !editName.trim()}
                                  onClick={() => handleSaveEdit(cat.id)}
                                  className="px-3 py-1 text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 rounded-lg disabled:opacity-50 flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  {isSavingEdit ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={cat.id}
                            className="p-3 flex items-center justify-between gap-3 hover:bg-stone-50 transition"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span
                                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                                style={{ backgroundColor: cat.color }}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-semibold text-stone-800 truncate">
                                    {cat.name}
                                  </p>
                                  <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                                    Personalizada
                                  </span>
                                </div>
                                {cat.description && (
                                  <p className="text-[11px] text-stone-500 truncate">
                                    {cat.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {deletingCatId === cat.id ? (
                                <div className="flex items-center gap-1.5 p-1 bg-rose-50 border border-rose-200 rounded-lg">
                                  <span className="text-[11px] font-semibold text-rose-800 px-1">¿Eliminar?</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDeleteCategory(cat.id);
                                      setDeletingCatId(null);
                                    }}
                                    className="px-2 py-0.5 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded shadow-xs"
                                  >
                                    Sí
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingCatId(null)}
                                    className="px-1.5 py-0.5 text-[11px] text-stone-600 hover:text-stone-800"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEditingCategory(cat)}
                                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
                                    title="Editar línea de trabajo"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingCatId(cat.id)}
                                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                    title="Eliminar línea de trabajo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
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
                      Agrega los grupos prioritarios de la pastoral social (campesinos, indígenas, mujeres, etc.) cuando lo requieras.
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

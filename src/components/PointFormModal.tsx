import React, { useState, useEffect } from 'react';
import { HumanitarianPoint, PointCategory } from '../types';
import { CAQUETA_MUNICIPALITIES } from '../constants';
import {
  X,
  MapPin,
  Calendar,
  Users,
  Bookmark,
  Check,
  Trash2,
  Plus,
  Tag,
  AlertCircle,
  Landmark,
  Target,
  FileText,
  CheckCircle2,
} from 'lucide-react';

interface PointFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  pointToEdit: HumanitarianPoint | null;
  categories: PointCategory[];
  populationTypes: string[];
  newCoordinates: { lat: number; lng: number } | null;
  onSave: (pointData: Omit<HumanitarianPoint, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onDelete?: (pointId: string) => Promise<void>;
  onAddCategory?: (category: Omit<PointCategory, 'id'>) => Promise<PointCategory | void>;
  onAddPopulationType?: (typeName: string) => Promise<void>;
}

export const PointFormModal: React.FC<PointFormModalProps> = ({
  isOpen,
  onClose,
  pointToEdit,
  categories,
  populationTypes,
  newCoordinates,
  onSave,
  onDelete,
  onAddCategory,
  onAddPopulationType,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(pointToEdit?.title || '');
  const [description, setDescription] = useState(pointToEdit?.description || '');
  const [municipality, setMunicipality] = useState(pointToEdit?.municipality || 'Florencia');
  const [communityOrVereda, setCommunityOrVereda] = useState(pointToEdit?.communityOrVereda || '');
  const [year, setYear] = useState<number>(pointToEdit?.year || new Date().getFullYear());
  const [endYear, setEndYear] = useState<number | undefined>(pointToEdit?.endYear || undefined);
  const [categoryId, setCategoryId] = useState(pointToEdit?.categoryId || categories[0]?.id || '');
  const [selectedPopulations, setSelectedPopulations] = useState<string[]>(
    pointToEdit?.populationTypes || []
  );
  const [beneficiariesApprox, setBeneficiariesApprox] = useState<number | undefined>(
    pointToEdit?.beneficiariesApprox || undefined
  );
  const [status, setStatus] = useState<'active' | 'historical' | 'consolidated'>(
    pointToEdit?.status || 'active'
  );
  const [fundingAgency, setFundingAgency] = useState(pointToEdit?.fundingAgency || '');
  const [targetPopulation, setTargetPopulation] = useState(pointToEdit?.targetPopulation || '');
  const [executionPeriod, setExecutionPeriod] = useState(pointToEdit?.executionPeriod || '');
  const [objectives, setObjectives] = useState(pointToEdit?.objectives || '');
  const [resultsOrAchievements, setResultsOrAchievements] = useState(pointToEdit?.resultsOrAchievements || '');

  const [keyActionInput, setKeyActionInput] = useState('');
  const [keyActions, setKeyActions] = useState<string[]>(pointToEdit?.keyActions || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar los campos cada vez que se abre el modal o cambia pointToEdit
  useEffect(() => {
    if (isOpen) {
      if (pointToEdit) {
        setTitle(pointToEdit.title || '');
        setDescription(pointToEdit.description || '');
        setMunicipality(pointToEdit.municipality || 'Florencia');
        setCommunityOrVereda(pointToEdit.communityOrVereda || '');
        setYear(pointToEdit.year || new Date().getFullYear());
        setEndYear(pointToEdit.endYear);
        setFundingAgency(pointToEdit.fundingAgency || '');
        setTargetPopulation(pointToEdit.targetPopulation || '');
        setExecutionPeriod(pointToEdit.executionPeriod || '');
        setObjectives(pointToEdit.objectives || '');
        setResultsOrAchievements(pointToEdit.resultsOrAchievements || '');
        setCategoryId(pointToEdit.categoryId || categories[0]?.id || '');
        setSelectedPopulations(pointToEdit.populationTypes || []);
        setBeneficiariesApprox(pointToEdit.beneficiariesApprox);
        setStatus(pointToEdit.status || 'active');
        setKeyActions(pointToEdit.keyActions || []);
      } else {
        setTitle('');
        setDescription('');
        setMunicipality('Florencia');
        setCommunityOrVereda('');
        setYear(new Date().getFullYear());
        setEndYear(undefined);
        setFundingAgency('');
        setTargetPopulation('');
        setExecutionPeriod('');
        setObjectives('');
        setResultsOrAchievements('');
        setCategoryId(categories[0]?.id || '');
        setSelectedPopulations([]);
        setBeneficiariesApprox(undefined);
        setStatus('active');
        setKeyActions([]);
      }
      setError(null);
      setShowDeleteConfirm(false);
      setIsSaving(false);
      setIsDeleting(false);
    }
  }, [isOpen, pointToEdit, categories]);

  // Quick inline add category
  const [isAddingInlineCategory, setIsAddingInlineCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#2563EB');
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  // Quick inline add population
  const [newPopInput, setNewPopInput] = useState('');
  const [isCreatingPop, setIsCreatingPop] = useState(false);

  // Synchronize categoryId if not set and categories arrive
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  // Derive coordinates
  const lat = pointToEdit?.lat ?? newCoordinates?.lat ?? 1.6144;
  const lng = pointToEdit?.lng ?? newCoordinates?.lng ?? -75.6062;

  const handleTogglePopulation = (type: string) => {
    if (selectedPopulations.includes(type)) {
      setSelectedPopulations(selectedPopulations.filter((p) => p !== type));
    } else {
      setSelectedPopulations([...selectedPopulations, type]);
    }
  };

  const handleAddKeyAction = () => {
    if (!keyActionInput.trim()) return;
    setKeyActions([...keyActions, keyActionInput.trim()]);
    setKeyActionInput('');
  };

  const handleRemoveKeyAction = (index: number) => {
    setKeyActions(keyActions.filter((_, i) => i !== index));
  };

  const handleQuickAddCategory = async () => {
    if (!newCatName.trim() || !onAddCategory) return;
    try {
      setIsCreatingCat(true);
      setError(null);
      const created = await onAddCategory({
        name: newCatName.trim(),
        color: newCatColor,
        iconName: 'Bookmark',
      });
      if (created && 'id' in created && created.id) {
        setCategoryId(created.id);
      }
      setNewCatName('');
      setIsAddingInlineCategory(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creando la categoría');
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleQuickAddPopulation = async () => {
    const trimmed = newPopInput.trim();
    if (!trimmed) return;
    try {
      setIsCreatingPop(true);
      setError(null);
      if (onAddPopulationType && !populationTypes.includes(trimmed)) {
        await onAddPopulationType(trimmed);
      }
      if (!selectedPopulations.includes(trimmed)) {
        setSelectedPopulations([...selectedPopulations, trimmed]);
      }
      setNewPopInput('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error agregando tipo de población');
    } finally {
      setIsCreatingPop(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pointToEdit || !onDelete) return;
    try {
      setIsDeleting(true);
      setError(null);
      await onDelete(pointToEdit.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el punto');
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título de la intervención o punto es requerido');
      return;
    }
    if (categories.length === 0) {
      setError('Debes crear al menos una línea o categoría pastoral antes de guardar el punto.');
      return;
    }
    if (!categoryId) {
      setError('Por favor selecciona una línea pastoral para este punto.');
      return;
    }
    if (year < 1986 || year > 2050) {
      setError('El año debe ser entre 1986 y el presente.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave({
        title: title.trim(),
        description: description.trim(),
        municipality,
        communityOrVereda: communityOrVereda.trim() || undefined,
        lat: Number(lat.toFixed(5)),
        lng: Number(lng.toFixed(5)),
        year: Number(year),
        endYear: endYear ? Number(endYear) : undefined,
        fundingAgency: fundingAgency.trim() || undefined,
        targetPopulation: targetPopulation.trim() || undefined,
        executionPeriod: executionPeriod.trim() || undefined,
        objectives: objectives.trim() || undefined,
        resultsOrAchievements: resultsOrAchievements.trim() || undefined,
        categoryId,
        populationTypes: selectedPopulations,
        beneficiariesApprox: beneficiariesApprox ? Number(beneficiariesApprox) : undefined,
        status,
        keyActions,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el punto');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:hidden">
      <div
        id="point-form-modal-card"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              {pointToEdit ? 'Editar Punto Pastoral' : 'Nuevo Punto de Labor Pastoral'}
            </h3>
            <p className="text-xs text-stone-500">
              Coordenadas: {lat.toFixed(4)}, {lng.toFixed(4)} &bull; Diócesis de Florencia, Caquetá
            </p>
          </div>
          <button
            id="close-point-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4 flex-1">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Título de la labor pastoral o intervención *
            </label>
            <input
              id="point-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Acompañamiento a Comunidades Campesinas, Centro de Escucha..."
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Municipality and Vereda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Municipio de Caquetá *
              </label>
              <select
                id="point-municipality-select"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {CAQUETA_MUNICIPALITIES.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.jurisdiction})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Vereda, Barrio o Cuenca (opcional)
              </label>
              <input
                id="point-community-input"
                type="text"
                value={communityOrVereda}
                onChange={(e) => setCommunityOrVereda(e.target.value)}
                placeholder="Ej: Vereda El Venado, Parroquia Guadalupe..."
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Year and Time Span */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Año de Inicio * (desde 1986)
              </label>
              <div className="relative">
                <input
                  id="point-year-input"
                  type="number"
                  min={1986}
                  max={2050}
                  required
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Año Culminación (opcional)
              </label>
              <input
                id="point-endyear-input"
                type="number"
                min={1986}
                max={2050}
                value={endYear || ''}
                onChange={(e) => setEndYear(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ej: 2024"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Estado de la labor
              </label>
              <select
                id="point-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'historical' | 'consolidated')}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="active">En Curso / Activa</option>
                <option value="consolidated">Comunitaria Consolidada</option>
                <option value="historical">Histórica (Concluida)</option>
              </select>
            </div>
          </div>

          {/* Funding Agency & Execution Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/80">
            <div>
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-amber-700" />
                Agencia o Entidad Financiadora
              </label>
              <input
                id="point-funding-agency-input"
                type="text"
                value={fundingAgency}
                onChange={(e) => setFundingAgency(e.target.value)}
                placeholder="Ej: MISEREOR, ADVENIAT, OIM, GIZ, SNPS..."
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                Período / Fechas de Ejecución
              </label>
              <input
                id="point-execution-period-input"
                type="text"
                value={executionPeriod}
                onChange={(e) => setExecutionPeriod(e.target.value)}
                placeholder="Ej: 01 de junio de 1988 al 30 de septiembre del 1992"
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                Línea o Categoría Pastoral *
              </label>
              {onAddCategory && !isAddingInlineCategory && (
                <button
                  type="button"
                  onClick={() => setIsAddingInlineCategory(true)}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" />
                  Nueva Línea
                </button>
              )}
            </div>

            {/* Inline Quick Add Category Form */}
            {isAddingInlineCategory && (
              <div className="mb-3 p-3 bg-white rounded-lg border border-amber-300 shadow-xs space-y-2">
                <p className="text-xs font-semibold text-stone-800">Crear nueva línea pastoral:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Nombre (ej: Agroecología y Soberanía)"
                    className="flex-1 px-2.5 py-1.5 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-8 h-8 rounded border border-stone-300 cursor-pointer p-0"
                    title="Color de la línea"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingInlineCategory(false);
                      setNewCatName('');
                    }}
                    className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickAddCategory}
                    disabled={isCreatingCat || !newCatName.trim()}
                    className="px-3 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-md transition disabled:opacity-50"
                  >
                    {isCreatingCat ? 'Guardando...' : 'Crear y Seleccionar'}
                  </button>
                </div>
              </div>
            )}

            {categories.length === 0 ? (
              <div className="p-4 text-center border-2 border-dashed border-stone-300 rounded-lg bg-white">
                <Bookmark className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-stone-800">
                  Las categorías están en blanco (0 creadas)
                </p>
                <p className="text-[11px] text-stone-500 mb-2">
                  Crea tu primera línea pastoral para poder clasificar este punto en el mapa.
                </p>
                {!isAddingInlineCategory && (
                  <button
                    type="button"
                    onClick={() => setIsAddingInlineCategory(true)}
                    className="px-3 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Crear primera línea pastoral
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      categoryId === cat.id
                        ? 'border-stone-800 bg-white ring-2 ring-stone-800 shadow-xs'
                        : 'border-stone-200 bg-white hover:bg-stone-100/70'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={categoryId === cat.id}
                      onChange={() => setCategoryId(cat.id)}
                      className="sr-only"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    ></span>
                    <span className="text-xs font-medium text-stone-800 truncate">{cat.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Population Types (multi-select + quick create) */}
          {/* Target Population specific */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-rose-600" />
              Población Objetivo (Texto descriptivo)
            </label>
            <input
              id="point-target-population-input"
              type="text"
              value={targetPopulation}
              onChange={(e) => setTargetPopulation(e.target.value)}
              placeholder="Ej: 300 familias campesinas colonas, mujeres víctimas del conflicto..."
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3"
            />

            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Categorías de Población Acompañada
              </label>
              <span className="text-[11px] text-stone-500">
                {selectedPopulations.length} seleccionados
              </span>
            </div>

            {/* Quick add new population group */}
            <div className="flex gap-2 mb-2.5">
              <input
                type="text"
                value={newPopInput}
                onChange={(e) => setNewPopInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleQuickAddPopulation();
                  }
                }}
                placeholder="Escribe nuevo grupo (ej: Comunidades Campesinas, Niñez Rural)..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleQuickAddPopulation}
                disabled={isCreatingPop || !newPopInput.trim()}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3 h-3" />
                {isCreatingPop ? 'Creando...' : 'Crear Grupo'}
              </button>
            </div>

            {/* Available Population Chips */}
            {populationTypes.length === 0 && selectedPopulations.length === 0 ? (
              <div className="p-3 text-center border border-dashed border-stone-200 rounded-lg bg-white">
                <p className="text-xs text-stone-500">
                  El catálogo de poblaciones está en blanco. Escribe arriba para crear el primer tipo de población.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                {/* Show combined unique list */}
                {Array.from(new Set([...populationTypes, ...selectedPopulations])).map((pop) => {
                  const isSelected = selectedPopulations.includes(pop);
                  return (
                    <button
                      key={pop}
                      type="button"
                      onClick={() => handleTogglePopulation(pop)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
                      {pop}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Objectives */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-600" />
              Objetivos del Proyecto
            </label>
            <textarea
              id="point-objectives-input"
              rows={2}
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="Objetivo general y específicos del proyecto..."
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Descripción o Reseña de la Labor Humanitaria
            </label>
            <textarea
              id="point-description-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalla las acciones realizadas, logros, impacto y cómo se desarrolló la misión en este territorio..."
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Results / Achievements */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Resultados y Logros Alcanzados
            </label>
            <textarea
              id="point-results-input"
              rows={2}
              value={resultsOrAchievements}
              onChange={(e) => setResultsOrAchievements(e.target.value)}
              placeholder="Resultados cuantitativos y cualitativos alcanzados (ej: 400 has reforestadas, 35 comités capacitados)..."
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Key Actions Highlights */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Hitos o Acciones Clave Desarrolladas
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keyActionInput}
                onChange={(e) => setKeyActionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyAction();
                  }
                }}
                placeholder="Ej: Entrega de filtros de agua, banco de semillas..."
                className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleAddKeyAction}
                className="px-3 py-1.5 text-xs bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition"
              >
                Agregar
              </button>
            </div>
            {keyActions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {keyActions.map((action, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-lg"
                  >
                    {action}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyAction(idx)}
                      className="text-amber-600 hover:text-amber-900 ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Approximate Beneficiaries */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Personas o Familias Beneficiadas Aprox. (opcional)
            </label>
            <input
              id="point-beneficiaries-input"
              type="number"
              min={0}
              value={beneficiariesApprox || ''}
              onChange={(e) =>
                setBeneficiariesApprox(e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="Ej: 500"
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
            {pointToEdit && onDelete ? (
              showDeleteConfirm ? (
                <div className="flex items-center gap-2 p-1.5 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-xs text-rose-800 font-semibold px-1">¿Eliminar este punto?</span>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleConfirmDelete}
                    className="px-2.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition disabled:opacity-50"
                  >
                    {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-1 text-xs text-stone-600 hover:text-stone-800 rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  id="delete-point-btn"
                  type="button"
                  disabled={isSaving || isDeleting}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-rose-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar punto
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving || isDeleting}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 rounded-xl hover:bg-stone-100 transition"
              >
                Cancelar
              </button>
              <button
                id="save-point-submit-btn"
                type="submit"
                disabled={isSaving || isDeleting}
                className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving
                  ? 'Guardando...'
                  : pointToEdit
                  ? 'Guardar Cambios'
                  : 'Guardar Punto en Mapa'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

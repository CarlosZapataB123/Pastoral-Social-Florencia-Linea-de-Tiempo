import React, { useState } from 'react';
import { PointCategory } from '../types';
import { CAQUETA_MUNICIPALITIES } from '../constants';
import {
  Filter,
  RotateCcw,
  Search,
  Calendar,
  Layers,
  Users,
  ChevronDown,
  ChevronUp,
  Tag,
  FileText,
} from 'lucide-react';

interface FiltersProps {
  categories: PointCategory[];
  populationTypes?: string[];
  selectedCategoryId: string | 'all';
  onSelectCategory: (id: string | 'all') => void;
  selectedMunicipality: string | 'all';
  onSelectMunicipality: (name: string | 'all') => void;
  selectedPopulation: string | 'all';
  onSelectPopulation: (pop: string | 'all') => void;
  selectedStatus: 'all' | 'active' | 'historical' | 'consolidated';
  onSelectStatus: (status: 'all' | 'active' | 'historical' | 'consolidated') => void;
  yearRange: [number, number];
  onChangeYearRange: (range: [number, number]) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onResetFilters: () => void;
  totalFiltered: number;
  totalPoints: number;
  onOpenReport?: () => void;
  onOpenCategoryManager?: () => void;
}

export const FilterBar: React.FC<FiltersProps> = ({
  categories,
  populationTypes = [],
  selectedCategoryId,
  onSelectCategory,
  selectedMunicipality,
  onSelectMunicipality,
  selectedPopulation,
  onSelectPopulation,
  selectedStatus,
  onSelectStatus,
  yearRange,
  onChangeYearRange,
  searchQuery,
  onChangeSearchQuery,
  onResetFilters,
  totalFiltered,
  totalPoints,
  onOpenReport,
  onOpenCategoryManager,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentYear = new Date().getFullYear();

  const isFiltered =
    selectedCategoryId !== 'all' ||
    selectedMunicipality !== 'all' ||
    selectedPopulation !== 'all' ||
    selectedStatus !== 'all' ||
    yearRange[0] !== 1986 ||
    yearRange[1] !== currentYear ||
    searchQuery.trim() !== '';

  return (
    <div
      id="filters-container"
      className="bg-white border-b border-stone-200 p-3 sm:px-4 sm:py-2.5 shadow-xs transition-all"
    >
      {/* Search & Quick Filters Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <input
            id="search-points-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            placeholder="Buscar por vereda, tema, acción..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
        </div>

        {/* Municipality selector */}
        <select
          id="filter-municipality-select"
          value={selectedMunicipality}
          onChange={(e) => onSelectMunicipality(e.target.value)}
          className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="all">Todos los Municipios ({CAQUETA_MUNICIPALITIES.length})</option>
          {CAQUETA_MUNICIPALITIES.map((m) => (
            <option key={m.name} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>

        {/* Category selector */}
        <div className="flex items-center gap-1">
          <select
            id="filter-category-select"
            value={selectedCategoryId}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">
              {categories.length > 0
                ? `Todas las Líneas (${categories.length})`
                : 'Líneas pastorales (0 creadas)'}
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {onOpenCategoryManager && (
            <button
              type="button"
              onClick={onOpenCategoryManager}
              className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-stone-100 rounded-xl transition border border-stone-200 bg-stone-50 shrink-0"
              title="Administrar o eliminar líneas de trabajo"
            >
              <Tag className="w-3.5 h-3.5 text-amber-600" />
            </button>
          )}
        </div>

        {/* Expand Advanced Filters */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`text-xs px-2.5 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition ${
            isExpanded
              ? 'bg-stone-800 text-white'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filtros avanzados</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Reset */}
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 px-2 py-1 font-medium transition"
            title="Restablecer todos los filtros"
          >
            <RotateCcw className="w-3 h-3" />
            Limpiar
          </button>
        )}

        <div className="ml-auto flex items-center gap-2.5 text-xs text-stone-500 font-medium">
          <span>
            Mostrando <span className="font-bold text-stone-900">{totalFiltered}</span> de{' '}
            <span className="font-bold text-stone-900">{totalPoints}</span> labores
          </span>

          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-1.5 transition shadow-2xs"
              title="Generar informe formal y línea de tiempo"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Informe & Línea de Tiempo</span>
              <span className="sm:hidden">Informe</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Collapsible Filters */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Year Range Slider */}
          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                Línea de Tiempo Pastoral
              </span>
              <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded">
                {yearRange[0]} — {yearRange[1]}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-500">1986</span>
                <input
                  type="range"
                  min={1986}
                  max={currentYear}
                  value={yearRange[0]}
                  onChange={(e) => {
                    const newMin = Number(e.target.value);
                    if (newMin <= yearRange[1]) {
                      onChangeYearRange([newMin, yearRange[1]]);
                    }
                  }}
                  className="w-full accent-amber-600 h-1 bg-stone-300 rounded cursor-pointer"
                />
                <span className="text-[11px] text-stone-500">{yearRange[0]}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-500">{yearRange[1]}</span>
                <input
                  type="range"
                  min={1986}
                  max={currentYear}
                  value={yearRange[1]}
                  onChange={(e) => {
                    const newMax = Number(e.target.value);
                    if (newMax >= yearRange[0]) {
                      onChangeYearRange([yearRange[0], newMax]);
                    }
                  }}
                  className="w-full accent-amber-600 h-1 bg-stone-300 rounded cursor-pointer"
                />
                <span className="text-[11px] text-stone-500">{currentYear}</span>
              </div>
            </div>
          </div>

          {/* Population Type Selector */}
          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Tipo de Población
            </label>
            <select
              value={selectedPopulation}
              onChange={(e) => onSelectPopulation(e.target.value)}
              className="w-full text-xs bg-white border border-stone-300 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">
                {populationTypes.length > 0
                  ? `Todos los grupos (${populationTypes.length})`
                  : 'Grupos de población (0 creados)'}
              </option>
              {populationTypes.map((pop) => (
                <option key={pop} value={pop}>
                  {pop}
                </option>
              ))}
            </select>
          </div>

          {/* Project Status */}
          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              Estado de la Intervención
            </label>
            <div className="flex gap-1.5">
              {(['all', 'active', 'consolidated', 'historical'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onSelectStatus(st)}
                  className={`text-[11px] flex-1 py-1 rounded-lg font-medium transition ${
                    selectedStatus === st
                      ? 'bg-amber-600 text-white font-semibold shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {st === 'all'
                    ? 'Todos'
                    : st === 'active'
                    ? 'En Curso'
                    : st === 'consolidated'
                    ? 'Consolidada'
                    : 'Histórica'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

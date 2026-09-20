import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { HumanitarianPoint, PointCategory } from './types';
import {
  DEFAULT_CATEGORIES,
  INITIAL_HISTORICAL_POINTS,
  CAQUETA_MUNICIPALITIES,
} from './constants';
import { MapView } from './components/MapView';
import { PointFormModal } from './components/PointFormModal';
import { PointDetailDrawer } from './components/PointDetailDrawer';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { GitHubGuideModal } from './components/GitHubGuideModal';
import { FilterBar } from './components/FilterBar';
import { PointsListView } from './components/PointsListView';
import { TimelineReportModal } from './components/TimelineReportModal';
import {
  Plus,
  Map as MapIcon,
  List,
  Tags,
  Github,
  Layers,
  Download,
  Info,
  HeartHandshake,
  Smartphone,
  Sparkles,
  FileText,
} from 'lucide-react';

export default function App() {
  // State
  const [points, setPoints] = useState<HumanitarianPoint[]>([]);
  const [categories, setCategories] = useState<PointCategory[]>(DEFAULT_CATEGORIES);
  const [populationTypes, setPopulationTypes] = useState<string[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite' | 'topo'>('standard');

  // Modal states
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [pointToEdit, setPointToEdit] = useState<HumanitarianPoint | null>(null);
  const [newCoordinates, setNewCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isAddingPointMode, setIsAddingPointMode] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Filters State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | 'all'>('all');
  const [selectedMunicipalityFilter, setSelectedMunicipalityFilter] = useState<string | 'all'>('all');
  const [selectedPopulationFilter, setSelectedPopulationFilter] = useState<string | 'all'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'historical' | 'consolidated'>('all');
  const [yearRange, setYearRange] = useState<[number, number]>([1986, new Date().getFullYear()]);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Listen to Realtime Firestore collections (Points & Categories)
  useEffect(() => {
    // Points listener
    const pointsCollection = collection(db, 'points');
    const unsubscribePoints = onSnapshot(
      pointsCollection,
      (snapshot) => {
        if (snapshot.empty) {
          setPoints([]);
        } else {
          const loadedPoints: HumanitarianPoint[] = [];
          snapshot.forEach((docSnap) => {
            loadedPoints.push({ id: docSnap.id, ...docSnap.data() } as HumanitarianPoint);
          });
          setPoints(loadedPoints);
        }
      },
      (error) => {
        console.warn('Firestore points listener error:', error);
        setPoints([]);
      }
    );

    // Categories listener
    const categoriesCollection = collection(db, 'categories');
    const unsubscribeCategories = onSnapshot(
      categoriesCollection,
      (snapshot) => {
        if (snapshot.empty) {
          setCategories([]);
        } else {
          const loadedCats: PointCategory[] = [];
          snapshot.forEach((docSnap) => {
            loadedCats.push({ id: docSnap.id, ...docSnap.data() } as PointCategory);
          });
          setCategories(loadedCats);
        }
      },
      (error) => {
        console.warn('Firestore categories listener error:', error);
        setCategories([]);
      }
    );

    // Population types listener
    const popTypesDoc = doc(db, 'settings', 'population_types');
    const unsubscribePopTypes = onSnapshot(
      popTypesDoc,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && Array.isArray(data.items)) {
            setPopulationTypes(data.items);
          }
        }
      },
      () => {
        // Fallback silently if offline
      }
    );

    return () => {
      unsubscribePoints();
      unsubscribeCategories();
      unsubscribePopTypes();
    };
  }, []);

  // Filter logic
  const filteredPoints = useMemo(() => {
    return points.filter((pt) => {
      // Category filter
      if (selectedCategoryFilter !== 'all' && pt.categoryId !== selectedCategoryFilter) {
        return false;
      }
      // Municipality filter
      if (selectedMunicipalityFilter !== 'all' && pt.municipality !== selectedMunicipalityFilter) {
        return false;
      }
      // Population filter
      if (
        selectedPopulationFilter !== 'all' &&
        (!pt.populationTypes || !pt.populationTypes.includes(selectedPopulationFilter))
      ) {
        return false;
      }
      // Status filter
      if (selectedStatusFilter !== 'all' && pt.status !== selectedStatusFilter) {
        return false;
      }
      // Year range filter
      if (pt.year < yearRange[0] || pt.year > yearRange[1]) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const inTitle = pt.title.toLowerCase().includes(query);
        const inDesc = pt.description.toLowerCase().includes(query);
        const inMuni = pt.municipality.toLowerCase().includes(query);
        const inVereda = pt.communityOrVereda?.toLowerCase().includes(query) || false;
        const inActions = pt.keyActions?.some((a) => a.toLowerCase().includes(query)) || false;
        if (!inTitle && !inDesc && !inMuni && !inVereda && !inActions) {
          return false;
        }
      }
      return true;
    });
  }, [
    points,
    selectedCategoryFilter,
    selectedMunicipalityFilter,
    selectedPopulationFilter,
    selectedStatusFilter,
    yearRange,
    searchQuery,
  ]);

  const selectedPoint = useMemo(() => {
    return points.find((p) => p.id === selectedPointId) || null;
  }, [points, selectedPointId]);

  const selectedCategory = useMemo(() => {
    if (!selectedPoint) return undefined;
    return categories.find((c) => c.id === selectedPoint.categoryId);
  }, [selectedPoint, categories]);

  const allPopulationTypes = useMemo(() => {
    const set = new Set<string>();
    populationTypes.forEach((pop) => {
      if (pop && pop.trim()) set.add(pop.trim());
    });
    points.forEach((p) => {
      p.populationTypes?.forEach((pop) => {
        if (pop && pop.trim()) set.add(pop.trim());
      });
    });
    return Array.from(set);
  }, [populationTypes, points]);

  // Point Handlers
  const handleMapClickToCreate = (lat: number, lng: number) => {
    setNewCoordinates({ lat, lng });
    setPointToEdit(null);
    setIsPointModalOpen(true);
    setIsAddingPointMode(false);
  };

  const handleStartAddingPoint = () => {
    setIsAddingPointMode(true);
    setActiveTab('map');
  };

  const handleOpenEditPoint = (point: HumanitarianPoint) => {
    setPointToEdit(point);
    setNewCoordinates(null);
    setIsPointModalOpen(true);
  };

  const handleSavePoint = async (
    pointData: Omit<HumanitarianPoint, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const pointId = pointToEdit ? pointToEdit.id : `pt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const pointRef = doc(db, 'points', pointId);

    const payload: Partial<HumanitarianPoint> = {
      ...pointData,
      id: pointId,
      updatedAt: new Date().toISOString(),
      ...(pointToEdit ? {} : { createdAt: new Date().toISOString() }),
    };

    await setDoc(pointRef, payload, { merge: true });
    setSelectedPointId(pointId);
  };

  const handleDeletePoint = async (pointId: string) => {
    await deleteDoc(doc(db, 'points', pointId));
    if (selectedPointId === pointId) {
      setSelectedPointId(null);
    }
  };

  // Category Handlers
  const handleAddCategory = async (catData: Omit<PointCategory, 'id'>): Promise<PointCategory> => {
    const id = `cat_${Date.now()}`;
    const newCat: PointCategory = {
      ...catData,
      id,
    };
    await setDoc(doc(db, 'categories', id), newCat);
    return newCat;
  };

  const handleDeleteCategory = async (catId: string) => {
    await deleteDoc(doc(db, 'categories', catId));
  };

  // Population Types Handlers
  const handleAddPopulationType = async (typeName: string) => {
    const trimmed = typeName.trim();
    if (!trimmed || populationTypes.includes(trimmed)) return;
    const updated = [...populationTypes, trimmed];
    setPopulationTypes(updated);
    try {
      await setDoc(doc(db, 'settings', 'population_types'), { items: updated }, { merge: true });
    } catch (e) {
      console.warn('Error saving population type:', e);
    }
  };

  const handleDeletePopulationType = async (typeName: string) => {
    const updated = populationTypes.filter((t) => t !== typeName);
    setPopulationTypes(updated);
    try {
      await setDoc(doc(db, 'settings', 'population_types'), { items: updated }, { merge: true });
    } catch (e) {
      console.warn('Error deleting population type:', e);
    }
  };

  // Export data as JSON
  const handleExportJSON = () => {
    const exportData = {
      app: 'Pastoral Social Florencia - Caquetá',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      categories,
      points,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pastoral-social-caqueta-puntos-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleResetFilters = () => {
    setSelectedCategoryFilter('all');
    setSelectedMunicipalityFilter('all');
    setSelectedPopulationFilter('all');
    setSelectedStatusFilter('all');
    setYearRange([1986, new Date().getFullYear()]);
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-100 font-sans text-stone-900">
      {/* Top Navigation Bar */}
      <header
        id="app-header"
        className="bg-stone-900 text-white px-3 sm:px-6 py-2.5 flex items-center justify-between border-b border-stone-800 shrink-0 z-20"
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-xs font-bold text-sm shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white leading-none">
                Pastoral Social Florencia
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-sm hidden sm:inline-block">
                Desde 1986
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-stone-400 leading-none mt-0.5">
              Cartografía de Labor Humanitaria &bull; Caquetá
            </p>
          </div>
        </div>

        {/* Action buttons on desktop and mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Layer switcher for Map */}
          {activeTab === 'map' && (
            <div className="hidden sm:flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700 text-xs text-stone-300">
              <button
                onClick={() => setMapLayer('standard')}
                className={`px-2 py-1 rounded-md transition ${
                  mapLayer === 'standard' ? 'bg-amber-600 text-white font-semibold' : 'hover:text-white'
                }`}
              >
                Estándar
              </button>
              <button
                onClick={() => setMapLayer('satellite')}
                className={`px-2 py-1 rounded-md transition ${
                  mapLayer === 'satellite' ? 'bg-amber-600 text-white font-semibold' : 'hover:text-white'
                }`}
              >
                Satélite
              </button>
              <button
                onClick={() => setMapLayer('topo')}
                className={`px-2 py-1 rounded-md transition ${
                  mapLayer === 'topo' ? 'bg-amber-600 text-white font-semibold' : 'hover:text-white'
                }`}
              >
                Relieve
              </button>
            </div>
          )}

          {/* Categories Modal button */}
          <button
            id="open-categories-modal-btn"
            onClick={() => setIsCategoryModalOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border border-stone-700"
            title="Administrar categorías personalizadas"
          >
            <Tags className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Categorías</span>
          </button>

          {/* GitHub / Deploy Guide Button */}
          <button
            id="open-github-guide-btn"
            onClick={() => setIsGitHubModalOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border border-stone-700"
            title="Guía de despliegue a GitHub y celulares"
          >
            <Github className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Despliegue</span>
          </button>

          {/* Export JSON Button */}
          <button
            onClick={handleExportJSON}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border border-stone-700"
            title="Descargar datos en JSON"
          >
            <Download className="w-3.5 h-3.5 text-stone-300" />
            <span className="hidden md:inline">Exportar</span>
          </button>

          {/* Timeline Report Button */}
          <button
            id="open-timeline-report-btn"
            onClick={() => setIsReportModalOpen(true)}
            className="px-2 sm:px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition border border-amber-500/60 shadow-xs"
            title="Generar informe formal y línea de tiempo histórica"
          >
            <FileText className="w-3.5 h-3.5 text-amber-200" />
            <span className="hidden sm:inline">Informe & Línea de Tiempo</span>
            <span className="sm:hidden">Informe</span>
          </button>

          {/* Add New Point Button (Main CTA) */}
          <button
            id="add-point-main-btn"
            onClick={handleStartAddingPoint}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
              isAddingPointMode
                ? 'bg-amber-400 text-stone-900 ring-2 ring-white animate-pulse'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingPointMode ? 'Toca el mapa...' : 'Nuevo Punto'}</span>
          </button>
        </div>
      </header>

      {/* Filter and timeline bar */}
      <FilterBar
        categories={categories}
        populationTypes={allPopulationTypes}
        selectedCategoryId={selectedCategoryFilter}
        onSelectCategory={setSelectedCategoryFilter}
        selectedMunicipality={selectedMunicipalityFilter}
        onSelectMunicipality={setSelectedMunicipalityFilter}
        selectedPopulation={selectedPopulationFilter}
        onSelectPopulation={setSelectedPopulationFilter}
        selectedStatus={selectedStatusFilter}
        onSelectStatus={setSelectedStatusFilter}
        yearRange={yearRange}
        onChangeYearRange={setYearRange}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        onResetFilters={handleResetFilters}
        totalFiltered={filteredPoints.length}
        totalPoints={points.length}
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="relative flex-1 flex overflow-hidden">
        {activeTab === 'map' ? (
          <MapView
            points={filteredPoints}
            categories={categories}
            selectedPointId={selectedPointId}
            onSelectPoint={(point) => setSelectedPointId(point.id)}
            onMapClickToCreate={handleMapClickToCreate}
            isAddingPoint={isAddingPointMode}
            activeLayer={mapLayer}
            selectedMunicipality={selectedMunicipalityFilter}
            onSelectMunicipality={setSelectedMunicipalityFilter}
            onChangeActiveLayer={setMapLayer}
          />
        ) : (
          <div className="w-full h-full overflow-y-auto bg-stone-50">
            <PointsListView
              points={filteredPoints}
              categories={categories}
              selectedPointId={selectedPointId}
              onSelectPoint={(point) => {
                setSelectedPointId(point.id);
                setActiveTab('map');
              }}
              onAddNewPoint={handleStartAddingPoint}
              onOpenReport={() => setIsReportModalOpen(true)}
            />
          </div>
        )}

        {/* Selected Point Drawer */}
        {selectedPoint && (
          <PointDetailDrawer
            point={selectedPoint}
            category={selectedCategory}
            onClose={() => setSelectedPointId(null)}
            onEdit={handleOpenEditPoint}
            onDelete={handleDeletePoint}
          />
        )}
      </div>

      {/* Bottom Floating Navigation for Mobile & Quick Switch */}
      <div className="sm:hidden bg-white border-t border-stone-200 p-2 flex items-center justify-around z-20">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-0.5 rounded-lg text-[11px] font-semibold ${
            activeTab === 'map' ? 'text-amber-600 bg-amber-50' : 'text-stone-500'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>Mapa</span>
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-0.5 rounded-lg text-[11px] font-semibold ${
            activeTab === 'list' ? 'text-amber-600 bg-amber-50' : 'text-stone-500'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Lista ({filteredPoints.length})</span>
        </button>
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex-1 py-1.5 flex flex-col items-center gap-0.5 rounded-lg text-[11px] font-semibold text-amber-800"
        >
          <FileText className="w-4 h-4 text-amber-600" />
          <span>Informe</span>
        </button>
        <button
          onClick={handleStartAddingPoint}
          className="flex-1 py-1.5 flex flex-col items-center gap-0.5 rounded-lg text-[11px] font-semibold text-amber-700"
        >
          <Plus className="w-4 h-4" />
          <span>Marcar</span>
        </button>
      </div>

      {/* Point Modal (Create or Edit) */}
      <PointFormModal
        isOpen={isPointModalOpen}
        onClose={() => {
          setIsPointModalOpen(false);
          setPointToEdit(null);
          setNewCoordinates(null);
        }}
        pointToEdit={pointToEdit}
        categories={categories}
        populationTypes={allPopulationTypes}
        newCoordinates={newCoordinates}
        onSave={handleSavePoint}
        onDelete={handleDeletePoint}
        onAddCategory={handleAddCategory}
        onAddPopulationType={handleAddPopulationType}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        populationTypes={populationTypes}
        onAddPopulationType={handleAddPopulationType}
        onDeletePopulationType={handleDeletePopulationType}
      />

      {/* GitHub & Deployment Guide Modal */}
      <GitHubGuideModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      {/* Timeline & Executive Report Modal */}
      <TimelineReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        allPoints={points}
        filteredPoints={filteredPoints}
        categories={categories}
        currentYearRange={yearRange}
        onSelectPoint={(point) => {
          setSelectedPointId(point.id);
          setIsReportModalOpen(false);
          setActiveTab('map');
        }}
      />
    </div>
  );
}

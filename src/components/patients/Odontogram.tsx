import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { ToothCondition, ToothConditionType, ToothSurface, OdontogramSnapshot, TUSSProcedure, TreatmentPlanItem } from '../../types';
import { CANONICAL_FACES, getRestorationSuggestion } from '../../data/faceData';
import { Smile, Info, Check, Plus, AlertCircle, Edit2, RotateCcw, Clock, History, Calendar, Trash2, ArrowLeftRight, Maximize2, Minimize2, Eye, ZoomIn, ZoomOut, RotateCw, FileCheck2, CheckCircle2, Sparkles, BookOpen, HelpCircle, X, MousePointerClick } from 'lucide-react';
import { ImageGalleryWithEditor } from '../common/ImageGalleryWithEditor';

interface OdontogramProps {
  patientId: string;
  readOnly?: boolean;
}

const CONDITION_CONFIG: Record<ToothConditionType, { label: string; color: string; bg: string; text: string }> = {
  sio: { label: 'Hígido / Sem Alteração', color: '#94a3b8', bg: 'bg-slate-700', text: 'text-slate-300' },
  carie: { label: 'Cárie', color: '#ef4444', bg: 'bg-red-500', text: 'text-red-400' },
  restauracao: { label: 'Restauração satisfatória', color: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-400' },
  restauracao_insatisfatoria: { label: 'Restauração insatisfatória', color: '#86efac', bg: 'bg-emerald-300', text: 'text-emerald-900' },
  girovertido: { label: 'Dente girovertido', color: '#fde047', bg: 'bg-yellow-300', text: 'text-yellow-900' },
  canal: { label: 'Canal (Endodontia)', color: '#eab308', bg: 'bg-amber-500', text: 'text-amber-400' },
  extracao_indicada: { label: 'Extração Indicada', color: '#f97316', bg: 'bg-orange-500', text: 'text-orange-400' },
  ausente: { label: 'Ausente / Extraído', color: '#64748b', bg: 'bg-slate-600', text: 'text-slate-400' },
  implante: { label: 'Implante', color: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-400' },
  protese: { label: 'Prótese / Coroa', color: '#a855f7', bg: 'bg-purple-500', text: 'text-purple-400' },
  calculo_supragengival: { label: 'Cálculo Supragengival', color: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-900' },
  calculo_subgengival: { label: 'Cálculo Subgengival', color: '#0f766e', bg: 'bg-teal-700', text: 'text-teal-100' },
};

// FDI Tooth Notation Groups
const PERMANENT_UPPER_RIGHT = [19, 18, 17, 16, 15, 14, 13, 12, 11];
const PERMANENT_UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28, 29];
const PERMANENT_LOWER_RIGHT = [49, 48, 47, 46, 45, 44, 43, 42, 41];
const PERMANENT_LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38, 39];

const DECIDUOUS_UPPER_RIGHT = [55, 54, 53, 52, 51];
const DECIDUOUS_UPPER_LEFT = [61, 62, 63, 64, 65];
const DECIDUOUS_LOWER_RIGHT = [85, 84, 83, 82, 81];
const DECIDUOUS_LOWER_LEFT = [71, 72, 73, 74, 75];

const MOTIVO_SUGGESTIONS = [
  'Avaliação',
  'Laudo odontológico',
  'Pós-tratamento',
  'Exame Inicial',
  'Reavaliação Periodontal',
  'Documentação Ortodôntica',
  'Plano de Tratamento',
  'Outro'
];

export const Odontogram: React.FC<OdontogramProps> = ({ patientId, readOnly = false }) => {
  const { 
    odontograms, 
    updateToothCondition, 
    odontogramSnapshots, 
    saveOdontogramSnapshot, 
    deleteOdontogramSnapshot, 
    restoreOdontogramSnapshot, 
    getClinicalExam, 
    updateClinicalExam,
    tussProcedures,
    treatmentPlans,
    addTreatmentPlan,
    updateTreatmentPlan,
    patients,
    updatePatient,
    activeProfessional,
    clinicInfo,
    layoutTheme
  } = useApp();

  const t = getThemeStyles(layoutTheme);
  
  // State for Modal and Selection (supports multiple teeth selection)
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [selectedConditionTypes, setSelectedConditionTypes] = useState<ToothConditionType[]>(['carie']);
  const [selectedSurfaces, setSelectedSurfaces] = useState<ToothSurface[]>(['oclusal']);
  const [toothNote, setToothNote] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [addedSuccessMsg, setAddedSuccessMsg] = useState<string | null>(null);

  // Timeline & Snapshots State
  const [activeSnapshotId, setActiveSnapshotId] = useState<string>('current');
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [snapshotDate, setSnapshotDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMotivoOption, setSelectedMotivoOption] = useState<string>('Avaliação');
  const [customSnapshotTitle, setCustomSnapshotTitle] = useState<string>('');
  const [snapshotNotes, setSnapshotNotes] = useState<string>('');

  // Canvas Display Scale / Auto-Fit Mode & Orientation
  const [autoFitScreen, setAutoFitScreen] = useState<boolean>(true);
  const [customScale, setCustomScale] = useState<number>(100); // 70% to 120%
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  // Mouse Drag Selection State
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const startPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const activePatientConditions = odontograms[patientId] || [];
  const snapshotsList = (odontogramSnapshots[patientId] || []).slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const hasDraggedRef = React.useRef(false);

  // Window mousemove / mouseup handlers for click-drag multi-selection
  React.useEffect(() => {
    if (!isMouseDown) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!startPosRef.current) return;

      const dx = Math.abs(e.clientX - startPosRef.current.x);
      const dy = Math.abs(e.clientY - startPosRef.current.y);

      if (dx > 4 || dy > 4) {
        if (!isDragging) {
          setIsDragging(true);
        }
        hasDraggedRef.current = true;

        const left = Math.min(startPosRef.current.x, e.clientX);
        const top = Math.min(startPosRef.current.y, e.clientY);
        const width = Math.abs(e.clientX - startPosRef.current.x);
        const height = Math.abs(e.clientY - startPosRef.current.y);

        setSelectionBox({ left, top, width, height });

        if (canvasRef.current) {
          const toothElements = canvasRef.current.querySelectorAll('[data-tooth-number]');
          const newlySelected: number[] = [];

          toothElements.forEach(el => {
            const toothNum = Number(el.getAttribute('data-tooth-number'));
            if (isNaN(toothNum)) return;

            const rect = el.getBoundingClientRect();
            const intersects = !(
              rect.right < left ||
              rect.left > left + width ||
              rect.bottom < top ||
              rect.top > top + height
            );

            if (intersects) {
              newlySelected.push(toothNum);
            }
          });

          if (newlySelected.length > 0) {
            setSelectedTeeth(prev => {
              const combined = new Set([...prev, ...newlySelected]);
              return Array.from(combined);
            });
          }
        }
      }
    };

    const handleWindowMouseUp = () => {
      setIsMouseDown(false);
      setIsDragging(false);
      setSelectionBox(null);
      startPosRef.current = null;
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 100);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isMouseDown, isDragging, readOnly, activeSnapshotId]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (readOnly || activeSnapshotId !== 'current') return;
    if (e.button !== 0) return; // Left button only

    setIsMouseDown(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleToothMouseEnter = (toothNum: number) => {
    if (isDragging && !readOnly && activeSnapshotId === 'current') {
      setSelectedTeeth(prev => prev.includes(toothNum) ? prev : [...prev, toothNum]);
    }
  };

  const selectedSnapshot = snapshotsList.find(s => s.id === activeSnapshotId);
  const displayedConditions = selectedSnapshot ? selectedSnapshot.conditions : activePatientConditions;

  const currentPatient = patients.find(p => p.id === patientId);
  const exam = getClinicalExam(patientId);
  const odontogramImages = currentPatient?.images || exam.odontogramImages || [];

  const getToothData = (toothNum: number): ToothCondition | undefined => {
    return displayedConditions.find(c => c.toothNumber === toothNum);
  };

  const handleToothClick = (num: number) => {
    if (readOnly || activeSnapshotId !== 'current') return;
    if (hasDraggedRef.current) return;
    setSelectedTeeth(prev => {
      if (prev.includes(num)) {
        return prev.filter(t => t !== num);
      } else {
        return [...prev, num];
      }
    });
  };

  const handleOpenEditModal = () => {
    if (selectedTeeth.length === 0) return;
    setSelectedSurfaces(['oclusal']);
    setSelectedConditionTypes(['carie']);
    const existing = getToothData(selectedTeeth[0]);
    if (existing?.notes) {
      setToothNote(existing.notes);
    } else {
      setToothNote('');
    }
    setIsEditModalOpen(true);
  };

  const handleToggleSurface = (surf: ToothSurface) => {
    if (selectedSurfaces.includes(surf)) {
      setSelectedSurfaces(prev => prev.filter(s => s !== surf));
    } else {
      setSelectedSurfaces(prev => [...prev, surf]);
    }
  };

  const handleApplyConditionToSurfaces = () => {
    if (selectedTeeth.length === 0 || selectedSurfaces.length === 0 || selectedConditionTypes.length === 0) return;

    selectedTeeth.forEach(num => {
      selectedConditionTypes.forEach(cond => {
        const surfacesMap: Partial<Record<ToothSurface, ToothConditionType>> = {};
        selectedSurfaces.forEach(s => {
          surfacesMap[s] = cond;
        });

        // If 'sio' (Hígido) is selected, undo marking and clear whole tooth condition if all surfaces set to sio
        const isSio = cond === 'sio';
        updateToothCondition(patientId, {
          toothNumber: num,
          wholeToothCondition: isSio ? 'sio' : undefined,
          surfaces: surfacesMap,
          notes: toothNote
        });
      });
    });
  };

  const handleApplyWholeToothCondition = () => {
    if (selectedTeeth.length === 0 || selectedConditionTypes.length === 0) return;
    selectedTeeth.forEach(num => {
      selectedConditionTypes.forEach(cond => {
        const isSio = cond === 'sio';
        updateToothCondition(patientId, {
          toothNumber: num,
          wholeToothCondition: cond,
          surfaces: isSio ? {
            mesial: 'sio',
            distal: 'sio',
            oclusal: 'sio',
            vestibular: 'sio',
            lingual: 'sio'
          } : undefined,
          notes: isSio ? '' : toothNote
        });
      });
    });
  };

  const handleResetTooth = () => {
    if (selectedTeeth.length === 0) return;
    selectedTeeth.forEach(num => {
      updateToothCondition(patientId, {
        toothNumber: num,
        wholeToothCondition: 'sio',
        surfaces: {
          mesial: 'sio',
          distal: 'sio',
          oclusal: 'sio',
          vestibular: 'sio',
          lingual: 'sio'
        },
        notes: ''
      });
    });
    setToothNote('');
  };

  const handleCreateChronologicalSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = selectedMotivoOption === 'Outro' 
      ? customSnapshotTitle.trim() || 'Avaliação'
      : selectedMotivoOption;
    
    saveOdontogramSnapshot(patientId, {
      date: snapshotDate,
      title: finalTitle,
      conditions: JSON.parse(JSON.stringify(activePatientConditions)),
      notes: snapshotNotes
    });

    setIsSnapshotModalOpen(false);
    setCustomSnapshotTitle('');
    setSnapshotNotes('');
  };

  // Long press timer ref for dedicated 'Limpar Seleção'
  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleTouchOrMouseDownTooth = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      // Long press / holding button is dedicated 'Limpar Seleção'
      setSelectedTeeth([]);
    }, 600);
  };

  const handleTouchOrMouseUpTooth = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const ALL_PERMANENT_TEETH = [
    ...PERMANENT_UPPER_RIGHT,
    ...PERMANENT_UPPER_LEFT,
    ...PERMANENT_LOWER_RIGHT,
    ...PERMANENT_LOWER_LEFT
  ];

  const ALL_DECIDUOUS_TEETH = [
    ...DECIDUOUS_UPPER_RIGHT,
    ...DECIDUOUS_UPPER_LEFT,
    ...DECIDUOUS_LOWER_RIGHT,
    ...DECIDUOUS_LOWER_LEFT
  ];

  const handleSelectPermanents = () => {
    setSelectedTeeth(ALL_PERMANENT_TEETH);
  };

  const handleSelectDeciduous = () => {
    setSelectedTeeth(ALL_DECIDUOUS_TEETH);
  };

  const handleInvertSelection = () => {
    setSelectedTeeth(prev => {
      const currentSet = new Set(prev);
      return ALL_PERMANENT_TEETH.filter(t => !currentSet.has(t));
    });
  };

  // Render graphic tooth item with 7 anatomical polygon surfaces (V, M, O, I, D, P, L)
  const renderToothGraphic = (toothNum: number) => {
    const data = getToothData(toothNum);
    const wholeCond = data?.wholeToothCondition;
    const surfaces = data?.surfaces || {};

    const isSelected = selectedTeeth.includes(toothNum);

    // Anatomical classification for tooth location
    const isUpper = (toothNum >= 11 && toothNum <= 29) || (toothNum >= 51 && toothNum <= 65);
    const isAnterior = [11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43, 51, 52, 53, 61, 62, 63, 71, 72, 73, 81, 82, 83].includes(toothNum);

    // Anatomical surface mapping keys
    const topSurfKey: ToothSurface = 'vestibular';
    const centerSurfKey: ToothSurface = isAnterior ? 'incisal' : 'oclusal';
    const bottomSurfKey: ToothSurface = isUpper ? 'palatina' : 'lingual';
    
    // Proximal surface orientation based on quadrant (Midline facing)
    // Quadrants 1, 4, 5, 8 (Right side of patient, Left on screen): Left polygon = Distal, Right polygon = Mesial
    // Quadrants 2, 3, 6, 7 (Left side of patient, Right on screen): Left polygon = Mesial, Right polygon = Distal
    const isPatientRightQuad = [1, 4, 5, 8].includes(Math.floor(toothNum / 10));
    const leftSurfKey: ToothSurface = isPatientRightQuad ? 'distal' : 'mesial';
    const rightSurfKey: ToothSurface = isPatientRightQuad ? 'mesial' : 'distal';

    // Calculus and Girovertido presence checks
    const hasCalculoSupra = wholeCond === 'calculo_supragengival' || Object.values(surfaces).includes('calculo_supragengival');
    const hasCalculoSub = wholeCond === 'calculo_subgengival' || Object.values(surfaces).includes('calculo_subgengival');
    const hasGirovertido = wholeCond === 'girovertido' || Object.values(surfaces).includes('girovertido');

    // Conditions that replace the polygon body
    const isBadgeWholeCond = wholeCond && 
      wholeCond !== 'sio' && 
      wholeCond !== 'calculo_supragengival' && 
      wholeCond !== 'calculo_subgengival' && 
      wholeCond !== 'girovertido';

    // Surface colors with fallback compatibility for O/I and P/L
    const getSurfaceColor = (surf: ToothSurface) => {
      let type = surfaces[surf];
      if (!type && surf === 'incisal') type = surfaces['oclusal'];
      if (!type && surf === 'oclusal') type = surfaces['incisal'];
      if (!type && surf === 'palatina') type = surfaces['lingual'];
      if (!type && surf === 'lingual') type = surfaces['palatina'];
      type = type || 'sio';
      return CONDITION_CONFIG[type]?.color || CONDITION_CONFIG.sio.color;
    };

    const isSurfHighlighted = (surf: ToothSurface) => {
      if (!isSelected) return false;
      return selectedSurfaces.includes(surf) || 
        (surf === 'incisal' && selectedSurfaces.includes('oclusal')) ||
        (surf === 'oclusal' && selectedSurfaces.includes('incisal')) ||
        (surf === 'palatina' && selectedSurfaces.includes('lingual')) ||
        (surf === 'lingual' && selectedSurfaces.includes('palatina'));
    };

    // Handler for clicking directly on an individual tooth surface polygon
    const handleSurfaceClick = (e: React.MouseEvent, surf: ToothSurface) => {
      e.stopPropagation();
      e.preventDefault();
      if (readOnly || activeSnapshotId !== 'current') return;

      if (!selectedTeeth.includes(toothNum)) {
        setSelectedTeeth(prev => [...prev, toothNum]);
      }
      handleToggleSurface(surf);
    };

    return (
      <div 
        key={toothNum} 
        data-tooth-number={toothNum}
        onClick={() => {
          if (!isDragging) {
            handleToothClick(toothNum);
          }
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSelectedTeeth([]);
          setSelectedSurfaces([]);
          setToothNote('');
        }}
        onMouseDown={handleTouchOrMouseDownTooth}
        onMouseUp={handleTouchOrMouseUpTooth}
        onTouchStart={handleTouchOrMouseDownTooth}
        onTouchEnd={handleTouchOrMouseUpTooth}
        onMouseEnter={() => handleToothMouseEnter(toothNum)}
        className={`
          flex flex-col items-center gap-0.5 p-0.5 rounded-xl transition-all cursor-pointer group shrink-0 relative select-none
          ${isSelected ? 'bg-amber-400/35 ring-3 ring-amber-400 shadow-xl scale-110 z-20 border-amber-400' : 'hover:bg-slate-800/80 border border-transparent'}
        `}
        title={`Dente ${toothNum} (${isUpper ? 'Sup' : 'Inf'} ${isAnterior ? 'Anterior' : 'Posterior'}) — Faces: V, M, ${isAnterior ? 'I' : 'O'}, D, ${isUpper ? 'P' : 'L'}`}
      >
        <span className={`text-[10px] sm:text-[11px] font-mono font-bold ${isSelected ? 'text-amber-300 font-extrabold' : 'text-slate-300 group-hover:text-amber-200'}`}>
          {toothNum}
        </span>

        {/* Tooth SVG Surface Drawing with 7 Anatomical Polygon Map */}
        <div 
          className="relative transition-all"
          style={{
            width: autoFitScreen ? 'clamp(20px, 3.2vw, 38px)' : `${(38 * customScale) / 100}px`,
            height: autoFitScreen ? 'clamp(20px, 3.2vw, 38px)' : `${(38 * customScale) / 100}px`,
          }}
        >
          {isBadgeWholeCond ? (
            /* Whole Tooth Special Condition Badge */
            <div className="w-full h-full rounded-lg border border-slate-700 flex flex-col items-center justify-center text-[9px] font-bold text-white shadow-inner overflow-hidden"
              style={{ backgroundColor: CONDITION_CONFIG[wholeCond!]?.color || '#334155' }}
            >
              {wholeCond === 'ausente' && <span className="text-xs font-extrabold text-white">X</span>}
              {wholeCond === 'implante' && <span className="text-[8px]">IMP</span>}
              {wholeCond === 'canal' && <span className="text-[8px]">ENDO</span>}
              {wholeCond === 'protese' && <span className="text-[8px]">CRA</span>}
              {wholeCond === 'extracao_indicada' && <span className="text-[8px]">EXT</span>}
              {wholeCond === 'restauracao_insatisfatoria' && <span className="text-[8px] text-emerald-950 font-extrabold">R.INS</span>}
            </div>
          ) : (
            /* 7 Anatomical Polygon Map Grid */
            <svg viewBox="0 0 100 100" className="w-full h-full rounded-md shadow-xs bg-slate-900 border border-slate-700">
              {/* Vestibular (Top - V) */}
              <polygon 
                points="0,0 100,0 70,30 30,30" 
                fill={getSurfaceColor(topSurfKey)} 
                stroke={isSurfHighlighted(topSurfKey) ? '#fbbf24' : '#1e293b'} 
                strokeWidth={isSurfHighlighted(topSurfKey) ? '4' : '2'}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(e) => handleSurfaceClick(e, topSurfKey)}
              />
              {/* Left Proximal (Distal or Mesial) */}
              <polygon 
                points="0,0 30,30 30,70 0,100" 
                fill={getSurfaceColor(leftSurfKey)} 
                stroke={isSurfHighlighted(leftSurfKey) ? '#fbbf24' : '#1e293b'} 
                strokeWidth={isSurfHighlighted(leftSurfKey) ? '4' : '2'}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(e) => handleSurfaceClick(e, leftSurfKey)}
              />
              {/* Center Surface (Oclusal O or Incisal I) */}
              <polygon 
                points="30,30 70,30 70,70 30,70" 
                fill={getSurfaceColor(centerSurfKey)} 
                stroke={isSurfHighlighted(centerSurfKey) ? '#fbbf24' : '#1e293b'} 
                strokeWidth={isSurfHighlighted(centerSurfKey) ? '4' : '2'}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(e) => handleSurfaceClick(e, centerSurfKey)}
              />
              {/* Right Proximal (Mesial or Distal) */}
              <polygon 
                points="100,0 100,100 70,70 70,30" 
                fill={getSurfaceColor(rightSurfKey)} 
                stroke={isSurfHighlighted(rightSurfKey) ? '#fbbf24' : '#1e293b'} 
                strokeWidth={isSurfHighlighted(rightSurfKey) ? '4' : '2'}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(e) => handleSurfaceClick(e, rightSurfKey)}
              />
              {/* Bottom Surface (Palatina P for Upper / Lingual L for Lower) */}
              <polygon 
                points="0,100 30,70 70,70 100,100" 
                fill={getSurfaceColor(bottomSurfKey)} 
                stroke={isSurfHighlighted(bottomSurfKey) ? '#fbbf24' : '#1e293b'} 
                strokeWidth={isSurfHighlighted(bottomSurfKey) ? '4' : '2'}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(e) => handleSurfaceClick(e, bottomSurfKey)}
              />
            </svg>
          )}
        </div>

        {/* Taller Colored Rectangle Indicators Underneath Tooth for Calculus and Girovertido */}
        {(hasCalculoSupra || hasCalculoSub || hasGirovertido) && (
          <div className="flex flex-col gap-0.5 w-full mt-1 z-10 animate-in fade-in duration-150">
            {hasCalculoSupra && (
              <div 
                className="w-full h-3.5 sm:h-4 rounded-xs bg-cyan-500 border border-cyan-300 shadow-2xs flex items-center justify-center text-[8px] sm:text-[9px] font-extrabold text-cyan-950 leading-none px-0.5"
                title="Cálculo Supragengival"
              >
                Cá.Sup
              </div>
            )}
            {hasCalculoSub && (
              <div 
                className="w-full h-3.5 sm:h-4 rounded-xs bg-teal-700 border border-teal-500 shadow-2xs flex items-center justify-center text-[8px] sm:text-[9px] font-extrabold text-teal-100 leading-none px-0.5"
                title="Cálculo Subgengival"
              >
                Cá.Sub
              </div>
            )}
            {hasGirovertido && (
              <div 
                className="w-full h-3.5 sm:h-4 rounded-xs bg-amber-400 border border-amber-300 shadow-2xs flex items-center justify-center text-[8px] sm:text-[9px] font-extrabold text-amber-950 leading-none px-0.5"
                title="Dente Girovertido"
              >
                Giro
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-4 sm:p-6 shadow-sm space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e5e5d1] pb-4">
        <div>
          <h2 className="text-lg font-serif italic text-[#5a5a40] flex items-center gap-2">
            <Smile className="w-5 h-5 text-[#d4a373]" />
            Odontograma
          </h2>
          <p className="text-xs text-gray-500">Mapeamento anatômico de dentes permanentes e decíduos com evolução comparativa e visualização adaptativa.</p>
        </div>

        {addedSuccessMsg && (
          <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {addedSuccessMsg}
          </div>
        )}

        {/* Action Controls: Snapshot Selector & Cronologia button */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* History Selector */}
          <div className="flex items-center gap-1.5 bg-[#fbfbf9] p-1 border border-[#e5e5d1] rounded-xl">
            <Clock className="w-4 h-4 text-[#d4a373] ml-1 shrink-0" />
            <select
              value={activeSnapshotId}
              onChange={(e) => setActiveSnapshotId(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#5a5a40] focus:outline-none cursor-pointer pr-1"
            >
              <option value="current">🌟 Odontograma Atual (Em Tempo Real)</option>
              {snapshotsList.map(s => (
                <option key={s.id} value={s.id}>
                  📜 {s.date.split('-').reverse().join('/')} - {s.title}
                </option>
              ))}
            </select>
          </div>

          {!readOnly && (
            <button
              onClick={() => setIsSnapshotModalOpen(true)}
              className="px-3 py-1.5 bg-[#d4a373] hover:bg-[#c29363] text-white font-bold rounded-xl flex items-center gap-1.5 transition shadow-2xs"
            >
              <History className="w-3.5 h-3.5" />
              <span>Cronologia do odontograma</span>
            </button>
          )}
        </div>
      </div>

      {/* Snapshot Active Notice Banner */}
      {selectedSnapshot && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">
                Exibindo Registro: "{selectedSnapshot.title}" ({selectedSnapshot.date.split('-').reverse().join('/')})
              </p>
              <p className="text-[11px] text-amber-700">
                {selectedSnapshot.notes ? `"${selectedSnapshot.notes}" • ` : ''} Registrado por {selectedSnapshot.dentistName || 'Dentista Operador'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!readOnly && (
              <button
                onClick={() => {
                  if (confirm(`Deseja restaurar as condições do registro "${selectedSnapshot.title}" no Odontograma Atual?`)) {
                    restoreOdontogramSnapshot(patientId, selectedSnapshot.id);
                    setActiveSnapshotId('current');
                  }
                }}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] transition shadow-2xs"
              >
                Restaurar no Atual
              </button>
            )}

            {!readOnly && (
              <button
                onClick={() => {
                  if (confirm('Excluir este registro do histórico?')) {
                    deleteOdontogramSnapshot(patientId, selectedSnapshot.id);
                    setActiveSnapshotId('current');
                  }
                }}
                className="p-1 text-amber-700 hover:text-red-600 transition"
                title="Excluir do Histórico"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setActiveSnapshotId('current')}
              className="px-2.5 py-1 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold rounded-lg text-[11px] transition"
            >
              Voltar ao Atual
            </button>
          </div>
        </div>
      )}

      {/* Evolução (Timeline Strip View) */}
      {snapshotsList.length > 0 && (
        <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-3">
          <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-2">
            <h3 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#d4a373]" />
              Evolução
            </h3>
            <span className="text-[11px] text-gray-500 font-medium">
              {snapshotsList.length + 1} marcos registrados
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
            {/* Historical Snapshots Order */}
            {snapshotsList.map((snap, idx) => {
              const isActive = activeSnapshotId === snap.id;
              return (
                <div 
                  key={snap.id}
                  onClick={() => setActiveSnapshotId(snap.id)}
                  className={`
                    shrink-0 p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 w-48 sm:w-56 relative
                    ${isActive 
                      ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-400/50 shadow-md' 
                      : 'bg-white border-[#e5e5d1] hover:border-[#5a5a40] shadow-2xs'}
                  `}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-[#f0f0e8] text-[#5a5a40]">
                      #{idx + 1} • {snap.date.split('-').reverse().join('/')}
                    </span>
                    {isActive && <span className="font-bold text-amber-600">Ativo</span>}
                  </div>
                  <h4 className="text-xs font-bold text-[#2c2c2c] truncate">{snap.title}</h4>
                  <p className="text-[10px] text-gray-500 truncate">{snap.dentistName || 'Dentista Responsável'}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400 border-t border-[#e5e5d1]/60">
                    <span>{snap.conditions.length} dentes mapeados</span>
                    <Eye className="w-3.5 h-3.5 text-[#5a5a40]" />
                  </div>
                </div>
              );
            })}

            {/* Current Real-Time Odontogram Node */}
            <div 
              onClick={() => setActiveSnapshotId('current')}
              className={`
                shrink-0 p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 w-48 sm:w-56
                ${activeSnapshotId === 'current'
                  ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-400/50 shadow-md' 
                  : 'bg-white border-[#e5e5d1] hover:border-[#5a5a40] shadow-2xs'}
              `}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  🌟 Estado Atual
                </span>
                {activeSnapshotId === 'current' && <span className="font-bold text-emerald-600">Ativo</span>}
              </div>
              <h4 className="text-xs font-bold text-[#2c2c2c] truncate">Odontograma Em Tempo Real</h4>
              <p className="text-[10px] text-gray-500 truncate">Sincronizado com os exames</p>
              <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400 border-t border-[#e5e5d1]/60">
                <span>{activePatientConditions.length} alterações ativas</span>
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container Stack: Canvas on Top, Edit Panel & Legend Below */}
      <div className="space-y-4">
        {/* TOP: Main Graphic Teeth Map Canvas with Full Width Visibility */}
        <div className="w-full bg-[#fbfbf9] rounded-2xl border border-[#e5e5d1] p-3 sm:p-5 space-y-4">
          {/* Canvas Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5e5d1] pb-3 text-xs min-h-[44px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-[#5a5a40] flex items-center gap-1.5 text-sm">
                <Smile className="w-4 h-4 text-[#d4a373]" />
                Odontograma Interativo
              </span>

              {/* Real-time Auto-save Badge */}
              <div className="bg-emerald-100/80 border border-emerald-300 text-emerald-900 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>⚡ Salvo automaticamente em tempo real</span>
              </div>

              {/* Multi-Teeth Inline Selection Pill */}
              {selectedTeeth.length > 0 && activeSnapshotId === 'current' && !readOnly && (
                <div className="flex items-center gap-2 bg-amber-100/90 border border-amber-300 px-3 py-1 rounded-xl text-xs animate-in fade-in duration-200">
                  <span className="font-bold text-amber-950 font-mono">
                    {selectedTeeth.length} dente(s) ({selectedTeeth.sort((a,b)=>a-b).join(', ')})
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTeeth([])}
                    className="text-[11px] font-bold text-amber-900 hover:text-amber-950 hover:bg-amber-200 px-2 py-0.5 rounded-lg transition cursor-pointer"
                    title="Limpar dentes selecionados"
                  >
                    Limpar
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className={`px-3 py-1 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar dente(s)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Arch Multi-Select Buttons */}
              {!readOnly && activeSnapshotId === 'current' && (
                <div className="flex flex-wrap items-center gap-1 bg-white border border-[#e5e5d1] rounded-xl p-1 text-[11px] shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setSelectedTeeth([
                      ...PERMANENT_UPPER_RIGHT,
                      ...PERMANENT_UPPER_LEFT,
                      ...PERMANENT_LOWER_RIGHT,
                      ...PERMANENT_LOWER_LEFT
                    ])}
                    className="px-2.5 py-1 hover:bg-[#5a5a40] hover:text-white bg-amber-50 text-amber-950 border border-amber-300 font-extrabold rounded-lg transition cursor-pointer flex items-center gap-1"
                    title="Selecionar todos os dentes de ambas as arcadas (Maxilar + Mandíbula / ASAI)"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Ambas as Arcadas</span>
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTeeth(PERMANENT_UPPER_RIGHT.concat(PERMANENT_UPPER_LEFT))}
                    className="px-2 py-0.5 hover:bg-[#f0f0e8] text-[#5a5a40] font-bold rounded-lg cursor-pointer"
                    title="Selecionar todos os dentes da Arcada Superior"
                  >
                    Arcada Superior
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTeeth(PERMANENT_LOWER_RIGHT.concat(PERMANENT_LOWER_LEFT))}
                    className="px-2 py-0.5 hover:bg-[#f0f0e8] text-[#5a5a40] font-bold rounded-lg cursor-pointer"
                    title="Selecionar todos os dentes da Arcada Inferior"
                  >
                    Arcada Inferior
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTeeth([
                      ...DECIDUOUS_UPPER_RIGHT,
                      ...DECIDUOUS_UPPER_LEFT,
                      ...DECIDUOUS_LOWER_RIGHT,
                      ...DECIDUOUS_LOWER_LEFT
                    ])}
                    className="px-2 py-0.5 hover:bg-amber-100 text-amber-900 font-bold rounded-lg cursor-pointer"
                    title="Selecionar dentes decíduos (infantil)"
                  >
                    Decíduos
                  </button>
                </div>
              )}

              {/* Zoom controls */}
              {!autoFitScreen && (
                <div className="flex items-center gap-1 bg-white border border-[#e5e5d1] rounded-xl px-2 py-1 text-[11px] text-gray-600">
                  <button 
                    onClick={() => setCustomScale(prev => Math.max(70, prev - 10))}
                    className="hover:text-[#5a5a40] p-0.5 cursor-pointer"
                    title="Reduzir Tamanho"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold w-10 text-center">{customScale}%</span>
                  <button 
                    onClick={() => setCustomScale(prev => Math.min(130, prev + 10))}
                    className="hover:text-[#5a5a40] p-0.5 cursor-pointer"
                    title="Aumentar Tamanho"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Rotation Toggle button (Horizontal / Vertical) */}
              <button
                type="button"
                onClick={() => setOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal')}
                className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer ${
                  orientation === 'vertical' 
                    ? 'bg-[#5a5a40] text-white border-[#5a5a40] ring-2 ring-[#5a5a40]/30' 
                    : 'bg-white text-gray-700 border-[#e5e5d1] hover:bg-[#f0f0e8]'
                }`}
                title="Alternar posição do odontograma entre Horizontal e Vertical"
              >
                <RotateCw className={`w-3.5 h-3.5 transition-transform duration-300 ${orientation === 'vertical' ? 'rotate-90 text-amber-300' : 'text-[#5a5a40]'}`} />
                <span>{orientation === 'horizontal' ? 'Posição Horizontal' : 'Posição Vertical'}</span>
              </button>

              {/* Direct "Ajustar à Tela" Toggle button */}
              <button
                type="button"
                onClick={() => setAutoFitScreen(!autoFitScreen)}
                className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer ${
                  autoFitScreen 
                    ? 'bg-[#5a5a40] text-white border-[#5a5a40] ring-2 ring-[#5a5a40]/30' 
                    : 'bg-white text-gray-700 border-[#e5e5d1] hover:bg-[#f0f0e8]'
                }`}
                title="Ajustar odontograma para caber 100% na largura da tela sem rolar"
              >
                {autoFitScreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-300" /> : <Maximize2 className="w-3.5 h-3.5 text-[#5a5a40]" />}
                <span>{autoFitScreen ? 'Ajustado à Tela (100%)' : 'Ajustar à Tela'}</span>
              </button>

              {/* Manual & Instructions Modal Toggle Button */}
              <button
                type="button"
                onClick={() => setIsManualModalOpen(true)}
                className="px-3 py-1.5 bg-[#5a5a40] hover:bg-[#4a4a35] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer border border-[#5a5a40]"
                title="Abrir o Manual do Odontograma com instruções de uso e atalhos de clique"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>Manual do Odontograma</span>
              </button>
            </div>
          </div>

          {/* Selection Box Marquee Overlay */}
          {selectionBox && (
            <div 
              className="fixed border-2 border-amber-400 bg-amber-400/20 backdrop-blur-[0.5px] rounded-lg pointer-events-none z-50 shadow-xs"
              style={{
                left: `${selectionBox.left}px`,
                top: `${selectionBox.top}px`,
                width: `${selectionBox.width}px`,
                height: `${selectionBox.height}px`,
              }}
            />
          )}

          {/* Teeth Graphic Map Container */}
          <div 
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            className={`w-full transition-all duration-300 flex items-center justify-center select-none ${
            autoFitScreen ? 'overflow-hidden max-w-full' : 'overflow-x-auto pb-2'
          } ${
            orientation === 'vertical' ? 'min-h-[520px] sm:min-h-[620px] py-10 sm:py-14' : ''
          }`}>
            <div className={`space-y-5 py-2 transition-transform duration-500 ease-in-out origin-center ${
              orientation === 'vertical' 
                ? 'rotate-90 scale-90 sm:scale-95 my-auto' 
                : 'rotate-0'
            } ${
              autoFitScreen ? 'w-full' : 'min-w-[680px]'
            }`}>
              {/* UPPER ARCH (MAXILAR SUPERIOR) */}
              <div className="space-y-3">
                <div className="text-center">
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#5a5a40] text-white uppercase tracking-wider shadow-2xs">
                    Maxilar Superior (Arcada Superior)
                  </span>
                </div>

                {/* Permanent Upper Teeth */}
                <div className="space-y-1">
                  <div className="text-center text-[10px] sm:text-[11px] font-semibold text-[#5a5a40]">Dentes Permanentes Superiores</div>
                  <div className={`flex justify-center items-center ${autoFitScreen ? 'gap-0.5 xs:gap-1 sm:gap-2 md:gap-3 w-full' : 'gap-3 sm:gap-5'}`}>
                    <div className="flex gap-0.5 border-r border-[#e5e5d1] pr-1">
                      {PERMANENT_UPPER_RIGHT.map(renderToothGraphic)}
                    </div>
                    <div className="flex gap-0.5 pl-1">
                      {PERMANENT_UPPER_LEFT.map(renderToothGraphic)}
                    </div>
                  </div>
                </div>

                {/* Deciduous Upper Teeth */}
                <div className="space-y-1 bg-[#f0f0e8]/50 p-1.5 rounded-2xl border border-[#e5e5d1]/60 max-w-fit mx-auto">
                  <div className="text-center text-[9px] sm:text-[10px] font-bold text-amber-800 uppercase tracking-wider">Dentes Decíduos Superiores (Infantil)</div>
                  <div className={`flex justify-center items-center ${autoFitScreen ? 'gap-0.5 xs:gap-1 sm:gap-2' : 'gap-3'}`}>
                    <div className="flex gap-0.5 border-r border-[#e5e5d1] pr-1">
                      {DECIDUOUS_UPPER_RIGHT.map(renderToothGraphic)}
                    </div>
                    <div className="flex gap-0.5 pl-1">
                      {DECIDUOUS_UPPER_LEFT.map(renderToothGraphic)}
                    </div>
                  </div>
                </div>
              </div>

              {/* DIVIDER ARCH LINE */}
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-dashed border-[#5a5a40]/30 w-full" />
                <span className="absolute bg-[#fbfbf9] px-3 py-0.5 rounded-full border border-[#e5e5d1] text-[9px] sm:text-[10px] font-mono text-[#5a5a40] font-bold uppercase">
                  Linha Oclusal Central
                </span>
              </div>

              {/* LOWER ARCH (MANDÍBULA INFERIOR) */}
              <div className="space-y-3">
                {/* Deciduous Lower Teeth */}
                <div className="space-y-1 bg-[#f0f0e8]/50 p-1.5 rounded-2xl border border-[#e5e5d1]/60 max-w-fit mx-auto">
                  <div className="text-center text-[9px] sm:text-[10px] font-bold text-amber-800 uppercase tracking-wider">Dentes Decíduos Inferiores (Infantil)</div>
                  <div className={`flex justify-center items-center ${autoFitScreen ? 'gap-0.5 xs:gap-1 sm:gap-2' : 'gap-3'}`}>
                    <div className="flex gap-0.5 border-r border-[#e5e5d1] pr-1">
                      {DECIDUOUS_LOWER_RIGHT.map(renderToothGraphic)}
                    </div>
                    <div className="flex gap-0.5 pl-1">
                      {DECIDUOUS_LOWER_LEFT.map(renderToothGraphic)}
                    </div>
                  </div>
                </div>

                {/* Permanent Lower Teeth */}
                <div className="space-y-1">
                  <div className="text-center text-[10px] sm:text-[11px] font-semibold text-[#5a5a40]">Dentes Permanentes Inferiores</div>
                  <div className={`flex justify-center items-center ${autoFitScreen ? 'gap-0.5 xs:gap-1 sm:gap-2 md:gap-3 w-full' : 'gap-3 sm:gap-5'}`}>
                    <div className="flex gap-0.5 border-r border-[#e5e5d1] pr-1">
                      {PERMANENT_LOWER_RIGHT.map(renderToothGraphic)}
                    </div>
                    <div className="flex gap-0.5 pl-1">
                      {PERMANENT_LOWER_LEFT.map(renderToothGraphic)}
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#5a5a40] text-white uppercase tracking-wider shadow-2xs">
                    Mandíbula Inferior (Arcada Inferior)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM PANEL: LEGENDA & PAINEL DE EDIÇÃO DE DENTES (ABAIXO DO ODONTOGRAMA) */}
        <div className="w-full bg-[#fbfbf9] p-4 sm:p-5 rounded-2xl border border-[#e5e5d1] space-y-4 shadow-2xs">
          {/* Panel Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#e5e5d1] pb-2.5 gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
                <Edit2 className="w-3.5 h-3.5 text-[#d4a373]" />
                Painel de Edição e Legenda de Condições
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 font-extrabold">
                {selectedTeeth.length} dente(s) selecionado(s)
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Salvo automaticamente em tempo real</span>
            </div>
          </div>

          {/* 4-Column Responsive Grid Below Odontogram */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* COL 1: Status & Arch Presets */}
            <div className="space-y-3 bg-white p-3.5 rounded-xl border border-[#e5e5d1]">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                1. Seleção de Dentes:
              </span>

              {selectedTeeth.length > 0 ? (
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-950">
                      Dentes: {selectedTeeth.sort((a,b)=>a-b).join(', ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedTeeth([])}
                      className="text-[10px] text-amber-900 underline font-bold hover:text-amber-950 cursor-pointer"
                    >
                      Limpar
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-800">
                    Clique na condição ao lado para aplicar a edição.
                  </p>
                </div>
              ) : (
                <div className="bg-[#f0f0e8]/70 border border-[#e5e5d1] p-2.5 rounded-xl text-center space-y-1">
                  <p className="text-[11px] text-[#5a5a40] font-bold">
                    💡 Seleção por clique no mapa:
                  </p>
                  <p className="text-[10px] text-gray-600">
                    1º clique seleciona dente, 2º clique deseleciona.
                  </p>
                </div>
              )}

              {/* Arch Presets */}
              <div className="space-y-1">
                <span className="block text-[10px] font-semibold text-gray-400">Atalhos de Seleção:</span>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={handleSelectPermanents}
                    className="px-2 py-1 bg-[#f0f0e8] hover:bg-[#5a5a40] hover:text-white text-[#5a5a40] font-bold rounded-lg transition cursor-pointer"
                    title="Selecionar todos os dentes permanentes (ambas as arcadas / ASAI)"
                  >
                    Toda Boca (ASAI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTeeth(PERMANENT_UPPER_RIGHT.concat(PERMANENT_UPPER_LEFT))}
                    className="px-2 py-1 bg-white border border-[#e5e5d1] hover:bg-[#f0f0e8] text-[#5a5a40] font-bold rounded-lg transition cursor-pointer"
                  >
                    Arcada Sup
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTeeth(PERMANENT_LOWER_RIGHT.concat(PERMANENT_LOWER_LEFT))}
                    className="px-2 py-1 bg-white border border-[#e5e5d1] hover:bg-[#f0f0e8] text-[#5a5a40] font-bold rounded-lg transition cursor-pointer"
                  >
                    Arcada Inf
                  </button>
                  <button
                    type="button"
                    onClick={handleInvertSelection}
                    className="px-2 py-1 bg-white border border-[#e5e5d1] hover:bg-[#f0f0e8] text-gray-600 font-bold rounded-lg transition cursor-pointer"
                    title="Inverter seleção de dentes"
                  >
                    Inverter
                  </button>
                </div>
              </div>
            </div>

            {/* COL 2: Legenda Clicável de Condições */}
            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#e5e5d1]">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                2. Condição Clínica (Legenda Clicável):
              </span>
              <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
                {(Object.entries(CONDITION_CONFIG) as [ToothConditionType, typeof CONDITION_CONFIG['carie']][]).map(([type, cfg]) => {
                  const isSelected = selectedConditionTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSelectedConditionTypes([type]);
                      }}
                      className={`
                        p-1.5 rounded-xl text-left text-[11px] border flex items-center justify-between gap-2 transition cursor-pointer
                        ${isSelected 
                          ? 'bg-amber-100/80 border-amber-400 text-amber-950 font-bold shadow-2xs ring-1 ring-amber-400' 
                          : 'bg-white border-[#e5e5d1] text-gray-700 hover:bg-[#f0f0e8]'}
                      `}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-3 h-3 rounded-full shrink-0 ${cfg.bg}`} />
                        <span className="truncate">{cfg.label}</span>
                      </div>
                      {isSelected && <span className="text-[10px] text-amber-900 font-extrabold shrink-0">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COL 3: 7 Faces Anatômicas & Observação */}
            <div className="space-y-3 bg-white p-3.5 rounded-xl border border-[#e5e5d1]">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    3. Mapeamento das 7 Faces Anatômicas:
                  </span>
                  <div className="flex gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSelectedSurfaces(['vestibular', 'mesial', 'oclusal', 'incisal', 'distal', 'palatina', 'lingual'])}
                      className="text-[#5a5a40] font-bold hover:underline cursor-pointer"
                    >
                      Todas
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSurfaces([])}
                      className="text-gray-400 hover:underline cursor-pointer"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                  {CANONICAL_FACES.map(surf => {
                    const isSelected = selectedSurfaces.includes(surf.key);
                    return (
                      <button
                        key={surf.key}
                        type="button"
                        onClick={() => handleToggleSurface(surf.key)}
                        title={surf.fullName}
                        className={`
                          p-1 rounded-lg border font-bold transition cursor-pointer flex flex-col items-center justify-center
                          ${isSelected 
                            ? 'bg-[#5a5a40] text-white border-[#5a5a40] shadow-2xs' 
                            : 'bg-white text-gray-700 border-[#e5e5d1] hover:bg-[#f0f0e8]'}
                        `}
                      >
                        <span className="text-[11px] font-mono leading-none">{surf.code}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedSurfaces.length > 0 && (() => {
                  const restSug = getRestorationSuggestion(selectedTeeth[0] || 11, selectedSurfaces);
                  if (!restSug) return null;
                  return (
                    <div className="mt-1.5 p-1.5 bg-amber-50/80 border border-amber-200/80 rounded-lg text-[10px] text-amber-900 flex items-center justify-between gap-1 leading-tight">
                      <span className="font-semibold truncate">
                        TUSS {restSug.tussCode}: {restSug.description}
                      </span>
                      <span className="shrink-0 px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded-md font-mono font-bold text-[9px]">
                        R$ {restSug.suggestedCostParticular}
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Observação do Dente:
                </span>
                <input
                  type="text"
                  placeholder="Ex: Fratura na cúspide, cárie profunda..."
                  value={toothNote}
                  onChange={(e) => setToothNote(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-2.5 py-1.5 text-[11px] text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>
            </div>

            {/* COL 4: Botões de Ação */}
            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#e5e5d1] flex flex-col justify-between">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                4. Salvar / Aplicar:
              </span>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    handleApplyWholeToothCondition();
                    setAddedSuccessMsg('Condição salva no dente com sucesso!');
                    setTimeout(() => setAddedSuccessMsg(null), 3000);
                  }}
                  disabled={selectedTeeth.length === 0 || readOnly || activeSnapshotId !== 'current'}
                  className={`
                    w-full py-2 px-3 font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer
                    ${selectedTeeth.length > 0 
                      ? `${t.btnPrimaryBg} ${t.btnPrimaryText}` 
                      : 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'}
                  `}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aplicar no Dente Inteiro</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleApplyConditionToSurfaces();
                    setAddedSuccessMsg('Condição salva nas faces com sucesso!');
                    setTimeout(() => setAddedSuccessMsg(null), 3000);
                  }}
                  disabled={selectedTeeth.length === 0 || selectedSurfaces.length === 0 || readOnly || activeSnapshotId !== 'current'}
                  className="w-full py-2 px-3 bg-white border border-[#5a5a40] text-[#5a5a40] hover:bg-[#f0f0e8] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Aplicar em {selectedSurfaces.length} Face(s)</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetTooth}
                  disabled={selectedTeeth.length === 0 || readOnly || activeSnapshotId !== 'current'}
                  className="w-full py-1.5 px-3 text-rose-600 hover:text-rose-700 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpar Dente(s) Selecionado(s)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Radiographic / Patient Clinical Photos Section */}
      <ImageGalleryWithEditor
        title="Galeria Unificada do Prontuário (Fotos e Radiografias)"
        description="Anexe radiografias periapicais, panorâmicas, telerradiografias ou fotos intraorais. Todas as fotos pertencem ao banco de dados unificado deste prontuário."
        images={odontogramImages}
        onUpdateImages={(newImgs) => {
          updatePatient(patientId, { images: newImgs });
          updateClinicalExam(patientId, { odontogramImages: newImgs });
        }}
        readOnly={readOnly}
      />

      {/* TOOTH INSPECTOR MODAL */}
      {isEditModalOpen && selectedTeeth.length > 0 && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <div>
                <h3 className="text-base font-serif italic text-[#5a5a40] flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#d4a373]" />
                  Editar dente(s)
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  Dentes selecionados: {selectedTeeth.sort((a,b)=>a-b).join(', ')}
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-[#2c2c2c]">✕</button>
            </div>

            <div className="space-y-4">
              {/* Quick Selection Presets inside Modal */}
              <div className="bg-[#fbfbf9] p-2.5 rounded-2xl border border-[#e5e5d1] space-y-1">
                <span className="block text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider">Atalho de Seleção de Dentes / Arcadas:</span>
                <div className="flex flex-wrap gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedTeeth([
                      ...PERMANENT_UPPER_RIGHT,
                      ...PERMANENT_UPPER_LEFT,
                      ...PERMANENT_LOWER_RIGHT,
                      ...PERMANENT_LOWER_LEFT
                    ])}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-extrabold rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Ambas as Arcadas (Toda a Boca)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTeeth(PERMANENT_UPPER_RIGHT.concat(PERMANENT_UPPER_LEFT))}
                    className="px-2 py-1 bg-white border border-[#e5e5d1] hover:bg-[#f0f0e8] text-[#5a5a40] font-bold rounded-lg transition cursor-pointer"
                  >
                    Arcada Superior
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTeeth(PERMANENT_LOWER_RIGHT.concat(PERMANENT_LOWER_LEFT))}
                    className="px-2 py-1 bg-white border border-[#e5e5d1] hover:bg-[#f0f0e8] text-[#5a5a40] font-bold rounded-lg transition cursor-pointer"
                  >
                    Arcada Inferior
                  </button>
                </div>
              </div>

              {/* STEP 1: Select Clinical Condition (Multiple Selection) */}
              <div>
                <label className="block text-xs font-semibold text-[#5a5a40] mb-1.5 flex items-center justify-between">
                  <span>1. Selecione a condição clínica (Múltipla seleção):</span>
                  <span className="text-[10px] text-gray-500 font-normal">{selectedConditionTypes.length} selecionada(s)</span>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {(Object.entries(CONDITION_CONFIG) as [ToothConditionType, typeof CONDITION_CONFIG['carie']][]).map(([type, cfg]) => {
                    const isSelected = selectedConditionTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setSelectedConditionTypes(prev =>
                            prev.includes(type)
                              ? (prev.length > 1 ? prev.filter(t => t !== type) : prev)
                              : [...prev, type]
                          );
                        }}
                        className={`
                          p-2 rounded-xl text-left text-xs font-medium border flex items-center justify-between gap-2 transition
                          ${isSelected 
                            ? 'bg-[#f0f0e8] border-[#5a5a40] text-[#5a5a40] font-bold shadow-2xs ring-1 ring-[#5a5a40]' 
                            : 'bg-[#fbfbf9] border-[#e5e5d1] text-gray-600 hover:bg-[#f0f0e8]'}
                        `}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-3 h-3 rounded-full shrink-0 ${cfg.bg}`} />
                          <span className="truncate">{cfg.label}</span>
                        </div>
                        {isSelected && <span className="text-[10px] text-[#5a5a40] font-bold shrink-0">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: Select Tooth Surface(s) (7 Mapeamentos Anatômicos) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#5a5a40]">
                    2. Mapeamento das 7 Faces Anatômicas:
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSurfaces(['vestibular', 'mesial', 'oclusal', 'incisal', 'distal', 'palatina', 'lingual'])}
                      className="text-[10px] text-[#5a5a40] font-bold hover:underline"
                    >
                      Todas
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSurfaces([])}
                      className="text-[10px] text-gray-400 hover:underline"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {CANONICAL_FACES.map(s => {
                    const isSelected = selectedSurfaces.includes(s.key);
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => handleToggleSurface(s.key)}
                        title={s.fullName}
                        className={`
                          p-1.5 rounded-xl text-xs font-medium transition border relative flex flex-col items-center justify-center cursor-pointer
                          ${isSelected 
                            ? 'bg-[#5a5a40] text-white border-[#5a5a40] font-bold shadow-2xs' 
                            : 'bg-[#fbfbf9] text-gray-700 border-[#e5e5d1] hover:bg-[#f0f0e8]'}
                        `}
                      >
                        <span className="text-xs font-bold font-mono">{s.code}</span>
                        <span className="text-[9px] opacity-80 scale-90 truncate max-w-[32px]">{s.label.substring(0, 3)}</span>
                        {isSelected && <span className="absolute top-0.5 right-0.5 text-[8px] font-bold text-amber-300">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e5e5d1]">
                <button
                  type="button"
                  onClick={() => {
                    handleApplyConditionToSurfaces();
                    setIsEditModalOpen(false);
                  }}
                  disabled={selectedSurfaces.length === 0 || selectedConditionTypes.length === 0}
                  className={`px-3 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} disabled:opacity-50 font-medium text-xs rounded-xl transition shadow-xs cursor-pointer`}
                >
                  Aplicar nas Faces ({selectedSurfaces.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleApplyWholeToothCondition();
                    setIsEditModalOpen(false);
                  }}
                  disabled={selectedConditionTypes.length === 0}
                  className={`
                    px-3 py-2 font-medium text-xs rounded-xl transition disabled:opacity-50 cursor-pointer
                    ${selectedSurfaces.length === 5
                      ? 'border border-[#5a5a40] text-[#5a5a40] bg-transparent hover:bg-[#f0f0e8] opacity-80 shadow-none'
                      : `${t.btnPrimaryBg} ${t.btnPrimaryText} shadow-xs`}
                  `}
                >
                  Aplicar no Dente Inteiro
                </button>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#5a5a40] mb-1">
                  Observações para os dentes selecionados:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sensibilidade, restauração profunda, fratura..."
                  value={toothNote}
                  onChange={(e) => setToothNote(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-2xl px-3.5 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#e5e5d1]">
              <button
                type="button"
                onClick={() => {
                  handleResetTooth();
                  setIsEditModalOpen(false);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar Dente(s)
              </button>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-medium text-xs rounded-xl cursor-pointer`}
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FOR SAVING SNAPSHOT / CRONOLOGIA DO ODONTOGRAMA */}
      {isSnapshotModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateChronologicalSnapshot} className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <div>
                <h3 className="text-base font-serif italic text-[#5a5a40] flex items-center gap-2">
                  <History className="w-4 h-4 text-[#d4a373]" />
                  Cronologia do odontograma
                </h3>
                <p className="text-xs text-gray-400">Grave uma versão das condições do odontograma nesta data.</p>
              </div>
              <button type="button" onClick={() => setIsSnapshotModalOpen(false)} className="text-gray-400 hover:text-[#2c2c2c]">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#5a5a40] mb-1">Data do Registro:</label>
                <input
                  type="date"
                  required
                  value={snapshotDate}
                  onChange={(e) => setSnapshotDate(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              {/* Motivo do Odontograma with Dropdown Suggestions */}
              <div>
                <label className="block font-bold text-[#5a5a40] mb-1">Motivo do Odontograma:</label>
                <select
                  value={selectedMotivoOption}
                  onChange={(e) => setSelectedMotivoOption(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs font-medium text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] mb-2 cursor-pointer"
                >
                  {MOTIVO_SUGGESTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>

                {selectedMotivoOption === 'Outro' && (
                  <input
                    type="text"
                    required
                    placeholder="Digite o motivo específico..."
                    value={customSnapshotTitle}
                    onChange={(e) => setCustomSnapshotTitle(e.target.value)}
                    className="w-full bg-white border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#5a5a40]"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-[#5a5a40] mb-1">Observações:</label>
                <textarea
                  rows={3}
                  placeholder="Detalhes ou observações do laudo..."
                  value={snapshotNotes}
                  onChange={(e) => setSnapshotNotes(e.target.value)}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#5a5a40]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e5d1]">
              <button
                type="button"
                onClick={() => setIsSnapshotModalOpen(false)}
                className="px-4 py-2 border border-[#e5e5d1] text-gray-600 rounded-xl text-xs font-bold hover:bg-[#fbfbf9]"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer`}
              >
                <Check className="w-4 h-4" /> Salvar no Histórico
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: MANUAL DO ODONTOGRAMA E INSTRUÇÕES INTERATIVAS */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#fbfbf9] rounded-2xl border border-[#e5e5d1] shadow-2xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-xl border border-amber-300">
                  <BookOpen className="w-5 h-5 text-amber-900" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#2c2c2c] uppercase tracking-wider">
                    Manual do Odontograma Interativo
                  </h3>
                  <p className="text-[11px] text-gray-600">
                    Guia rápido de comandos, cliques e sinalizações clínicas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Manual Instructions List */}
            <div className="space-y-3 text-xs text-stone-700">
              {/* Command 1: Selection */}
              <div className="p-3 bg-white border border-[#e5e5d1] rounded-xl flex items-start gap-3">
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 shrink-0 mt-0.5">
                  <MousePointerClick className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#2c2c2c]">1. Seleção e Marcação de Dentes</h4>
                  <ul className="list-disc list-inside space-y-1 text-stone-600 text-[11px]">
                    <li><strong>Clique no Dente:</strong> Seleciona o dente para edição (destaque em moldura dourada e iluminação).</li>
                    <li><strong>Segundo Clique no Dente:</strong> Deseleciona o dente.</li>
                    <li><strong>Duplo Clique Rápido no Dente:</strong> Limpa todas as seleções ativas (dentes, faces selecionadas e observações).</li>
                  </ul>
                </div>
              </div>

              {/* Command 2: Direct Surface Click */}
              <div className="p-3 bg-white border border-[#e5e5d1] rounded-xl flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 text-blue-800 shrink-0 mt-0.5">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#2c2c2c]">2. Clique Direto nas Faces Dentárias</h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Você pode clicar <strong>diretamente nos polígonos das faces</strong> (Vestibular, Mesial, Oclusal/Incisal, Distal, Lingual) no mapa anatômico do dente. A face clicada será destacada em amarelo para aplicação direta da condição clínica.
                  </p>
                </div>
              </div>

              {/* Command 3: Indicators below tooth */}
              <div className="p-3 bg-white border border-[#e5e5d1] rounded-xl flex items-start gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 shrink-0 mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#2c2c2c]">3. Indicadores Especiais Embaixo do Dente</h4>
                  <p className="text-[11px] text-stone-600 mb-2">
                    Condições como Cálculo e Giroversão são sinalizadas em pequenos retângulos destacados diretamente abaixo da raiz do dente:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                    <div className="p-2 bg-cyan-100 border border-cyan-300 rounded-lg font-bold text-cyan-950 flex items-center justify-between">
                      <span>Cá.Sup</span>
                      <span className="text-[9px] font-normal text-cyan-800">Cálculo Supragengival</span>
                    </div>
                    <div className="p-2 bg-teal-800 border border-teal-600 rounded-lg font-bold text-teal-100 flex items-center justify-between">
                      <span>Cá.Sub</span>
                      <span className="text-[9px] font-normal text-teal-200">Cálculo Subgengival</span>
                    </div>
                    <div className="p-2 bg-amber-100 border border-amber-300 rounded-lg font-bold text-amber-950 flex items-center justify-between">
                      <span>Giro</span>
                      <span className="text-[9px] font-normal text-amber-800">Dente Girovertido</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Command 4: Realtime Auto-save */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Salvamento Automático em Tempo Real</span>
                </div>
                <span className="text-[11px] text-emerald-800 font-medium">
                  Não é necessário salvar manualmente após cada alteração.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-[#e5e5d1]">
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} rounded-xl text-xs font-bold shadow-xs cursor-pointer`}
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

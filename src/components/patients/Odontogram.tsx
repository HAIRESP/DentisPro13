import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { ToothCondition, ToothConditionType, ToothSurface, OdontogramSnapshot } from '../../types';
import { 
  CANONICAL_FACES, 
  getRestorationSuggestion,
  getValidFacesForTooth,
  isUpperArchTooth,
  isAnteriorTooth
} from '../../data/faceData';
import { 
  Smile, 
  Info, 
  Check, 
  Edit2, 
  RotateCcw, 
  Clock, 
  History, 
  Calendar, 
  Trash2, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  X, 
  MousePointerClick,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Smartphone,
  Layers,
  ArrowRight,
  Send,
  HelpCircle
} from 'lucide-react';
import { ImageGalleryWithEditor } from '../common/ImageGalleryWithEditor';
import { 
  parseDentalVoiceCommandWithGemini, 
  parseLocalDentalVoiceCommand, 
  speakDentalFeedback, 
  VoiceOdontogramResult 
} from '../../utils/voiceOdontogramParser';

interface OdontogramProps {
  patientId: string;
  readOnly?: boolean;
}

const CONDITION_CONFIG: Record<ToothConditionType, { label: string; color: string; bg: string; text: string; textDark?: boolean }> = {
  sio: { label: 'Hígido (Íntegro)', color: '#ffffff', bg: 'bg-white', text: 'text-slate-900', textDark: true },
  carie: { label: 'Cárie', color: '#ef4444', bg: 'bg-red-500', text: 'text-white' },
  restauracao: { label: 'Restauração satisfatória', color: '#2563eb', bg: 'bg-blue-600', text: 'text-white' },
  restauracao_insatisfatoria: { label: 'Restauração insatisfatória', color: '#4ade80', bg: 'bg-green-400', text: 'text-slate-950', textDark: true },
  necessidade_endodontica: { label: 'Necessidade Endodôntica', color: '#fef08a', bg: 'bg-yellow-200', text: 'text-yellow-950', textDark: true },
  canal: { label: 'Endodontia insatisfatória', color: '#f97316', bg: 'bg-orange-500', text: 'text-white' },
  endodontia_insatisfatoria: { label: 'Endodontia insatisfatória', color: '#f97316', bg: 'bg-orange-500', text: 'text-white' },
  endodontia_satisfatoria: { label: 'Endodontia satisfatória', color: '#172554', bg: 'bg-blue-950', text: 'text-white' },
  extracao_indicada: { label: 'Extração Indicada', color: '#9333ea', bg: 'bg-purple-600', text: 'text-white' },
  ausente: { label: 'Ausente / Extraído', color: '#4b5563', bg: 'bg-gray-600', text: 'text-white' },
  implante: { label: 'Implante', color: '#059669', bg: 'bg-emerald-600', text: 'text-white' },
  protese: { label: 'Prótese / Coroa', color: '#0891b2', bg: 'bg-cyan-600', text: 'text-white' },
  girovertido: { label: 'Dente girovertido', color: '#ea580c', bg: 'bg-orange-600', text: 'text-white' },
  calculo_supragengival: { label: 'Cálculo Supragengival', color: '#d97706', bg: 'bg-amber-600', text: 'text-white' },
  calculo_subgengival: { label: 'Cálculo Subgengival', color: '#92400e', bg: 'bg-amber-900', text: 'text-white' },
};

const DISPLAYED_CONDITIONS: ToothConditionType[] = [
  'sio',
  'carie',
  'restauracao',
  'restauracao_insatisfatoria',
  'necessidade_endodontica',
  'canal', // "Endodontia insatisfatória"
  'endodontia_satisfatoria',
  'extracao_indicada',
  'ausente',
  'implante',
  'protese',
  'girovertido',
  'calculo_supragengival',
  'calculo_subgengival',
];

// Standard FDI Dental Groups (32 permanent teeth)
const PERMANENT_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const PERMANENT_UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const PERMANENT_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const PERMANENT_LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

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
    patients,
    updatePatient,
    layoutTheme
  } = useApp();

  const t = getThemeStyles(layoutTheme);
  
  // Selection States
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [selectedConditionTypes, setSelectedConditionTypes] = useState<ToothConditionType[]>(['carie']);
  const [selectedSurfaces, setSelectedSurfaces] = useState<ToothSurface[]>(['oclusal']);
  const [toothNote, setToothNote] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [addedSuccessMsg, setAddedSuccessMsg] = useState<string | null>(null);

  // Mobile Selection Mode Toggle
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);

  // Timeline & Snapshots State
  const [activeSnapshotId, setActiveSnapshotId] = useState<string>('current');
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [snapshotDate, setSnapshotDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMotivoOption, setSelectedMotivoOption] = useState<string>('Avaliação');
  const [customSnapshotTitle, setCustomSnapshotTitle] = useState<string>('');
  const [snapshotNotes, setSnapshotNotes] = useState<string>('');

  // Canvas Display Scale / Auto-Fit Mode & Orientation
  const [customScale, setCustomScale] = useState<number>(100); // 80% to 130%
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isDeviceLandscape, setIsDeviceLandscape] = useState<boolean>(false);

  // AI Voice Sensor & Intelligent Filling States
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceProcessing, setVoiceProcessing] = useState<boolean>(false);
  const [lastVoiceResult, setLastVoiceResult] = useState<VoiceOdontogramResult | null>(null);
  const [voiceAutoApply, setVoiceAutoApply] = useState<boolean>(true);
  const [voiceFeedbackSpeech, setVoiceFeedbackSpeech] = useState<boolean>(true);
  const [manualVoiceInput, setManualVoiceInput] = useState<string>('');
  const speechRecognitionRef = useRef<any>(null);

  // Mouse Drag Selection State
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activePatientConditions = odontograms[patientId] || [];
  const snapshotsList = (odontogramSnapshots[patientId] || []).slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const hasDraggedRef = useRef(false);

  // Dynamically compute valid anatomical faces for the currently selected teeth
  const validFaces = React.useMemo(() => {
    if (selectedTeeth.length === 0) {
      return CANONICAL_FACES;
    }
    if (selectedTeeth.length === 1) {
      return getValidFacesForTooth(selectedTeeth[0]);
    }
    const map = new Map<ToothSurface, typeof CANONICAL_FACES[0]>();
    for (const t of selectedTeeth) {
      const faces = getValidFacesForTooth(t);
      for (const f of faces) {
        map.set(f.key, f);
      }
    }
    return CANONICAL_FACES.filter(f => map.has(f.key));
  }, [selectedTeeth]);

  const facesSubtitle = React.useMemo(() => {
    if (selectedTeeth.length === 0) {
      return 'Selecione um dente no odontograma para exibir estritamente as faces anatômicas correspondentes.';
    }
    if (selectedTeeth.length === 1) {
      const t = selectedTeeth[0];
      const isUp = isUpperArchTooth(t);
      const isAnt = isAnteriorTooth(t);
      const arch = isUp ? 'Superior' : 'Inferior';
      const type = isAnt ? 'Anterior' : 'Posterior';
      const disallowed: string[] = [];
      if (isAnt) disallowed.push('Oclusal'); else disallowed.push('Incisal');
      if (isUp) disallowed.push('Lingual'); else disallowed.push('Palatina');
      return `Dente #${t} (${type} ${arch}) • 5 Faces: ${validFaces.map(f => f.code).join(', ')} (Sem ${disallowed.join(' e sem ')})`;
    }
    return `${selectedTeeth.length} dentes selecionados (${selectedTeeth.sort((a,b)=>a-b).join(', ')}) • Faces válidas: ${validFaces.map(f => f.code).join(', ')}`;
  }, [selectedTeeth, validFaces]);

  // Keep selected surfaces clean when tooth selection changes
  useEffect(() => {
    if (selectedTeeth.length > 0) {
      const validKeys = new Set(validFaces.map(f => f.key));
      setSelectedSurfaces(prev => prev.filter(s => validKeys.has(s)));
    }
  }, [selectedTeeth, validFaces]);

  // Detect Mobile Orientation changes
  useEffect(() => {
    const handleResize = () => {
      const isLandscape = window.innerWidth > window.innerHeight && window.innerWidth < 1024;
      setIsDeviceLandscape(isLandscape);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Web Speech API Initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setVoiceTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('[VOICE RECOGNITION ERROR]:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        speechRecognitionRef.current = recognition;
      }
    }

    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Window mousemove / mouseup handlers for click-drag multi-selection
  useEffect(() => {
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

  const isSurfaceCondition = (cond?: ToothConditionType): boolean => {
    return cond === 'carie' || cond === 'restauracao' || cond === 'restauracao_insatisfatoria' || cond === 'sio';
  };

  // Synchronize surfaces, condition types, and notes when teeth selection changes
  const syncSelectionFromTeeth = (teeth: number[]) => {
    if (teeth.length === 0) {
      setSelectedSurfaces([]);
      setToothNote('');
      return;
    }
    if (teeth.length === 1) {
      const data = getToothData(teeth[0]);
      if (data) {
        setToothNote(data.notes || '');
        const activeSurfs: ToothSurface[] = [];
        const conditionsFound: ToothConditionType[] = [];
        if (data.surfaces) {
          (Object.entries(data.surfaces) as [ToothSurface, ToothConditionType][]).forEach(([surf, cond]) => {
            if (cond && cond !== 'sio') {
              activeSurfs.push(surf);
              if (!conditionsFound.includes(cond)) {
                conditionsFound.push(cond);
              }
            }
          });
        }
        // Keep active recorded surfaces if any, otherwise empty
        setSelectedSurfaces(activeSurfs);
        if (conditionsFound.length > 0) {
          setSelectedConditionTypes([conditionsFound[0]]);
        } else if (data.wholeToothCondition && data.wholeToothCondition !== 'sio') {
          setSelectedConditionTypes([data.wholeToothCondition]);
        }
      } else {
        setToothNote('');
        setSelectedSurfaces([]);
      }
    } else {
      setSelectedSurfaces([]);
    }
  };

  // Ensure surfaces are always cleared when no teeth are selected
  useEffect(() => {
    if (selectedTeeth.length === 0 && selectedSurfaces.length > 0) {
      setSelectedSurfaces([]);
    }
  }, [selectedTeeth, selectedSurfaces.length]);

  // Single & Multi-select click handler for teeth
  const handleToothClick = (num: number) => {
    if (readOnly || activeSnapshotId !== 'current') return;
    if (hasDraggedRef.current) return;

    if (isMultiSelectMode) {
      const next = selectedTeeth.includes(num) ? selectedTeeth.filter(t => t !== num) : [...selectedTeeth, num];
      setSelectedTeeth(next);
      syncSelectionFromTeeth(next);
    } else {
      const next = (selectedTeeth.length === 1 && selectedTeeth[0] === num) ? [] : [num];
      setSelectedTeeth(next);
      syncSelectionFromTeeth(next);
    }
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

  const handleToggleSurface = (surf: ToothSurface, targetTeethOverride?: number[]) => {
    if (readOnly || activeSnapshotId !== 'current') return;

    const targetTeeth = (targetTeethOverride && targetTeethOverride.length > 0) ? targetTeethOverride : selectedTeeth;
    if (targetTeeth.length === 0) return;

    const currentCond = selectedConditionTypes[0] || 'carie';
    const effectiveCond = isSurfaceCondition(currentCond) && currentCond !== 'sio' ? currentCond : 'carie';
    if (!isSurfaceCondition(currentCond)) {
      setSelectedConditionTypes(['carie']);
    }

    // Check if the face currently already has the effectiveCond on the first target tooth
    const firstToothData = getToothData(targetTeeth[0]);
    let currentSurfCond = firstToothData?.surfaces?.[surf];
    if (!currentSurfCond && surf === 'incisal') currentSurfCond = firstToothData?.surfaces?.['oclusal'];
    if (!currentSurfCond && surf === 'oclusal') currentSurfCond = firstToothData?.surfaces?.['incisal'];
    if (!currentSurfCond && surf === 'palatina') currentSurfCond = firstToothData?.surfaces?.['lingual'];
    if (!currentSurfCond && surf === 'lingual') currentSurfCond = firstToothData?.surfaces?.['palatina'];

    const isAlreadyThatCondition = currentSurfCond === effectiveCond;
    const condToApply: ToothConditionType = isAlreadyThatCondition ? 'sio' : effectiveCond;

    // Apply immediate coordinated painting to target teeth (preserving other face conditions!)
    handleApplyConditionToSurfaces(targetTeeth, condToApply, [surf]);

    // Update selectedSurfaces state
    setSelectedSurfaces(prev => {
      if (condToApply === 'sio') {
        return prev.filter(s => s !== surf && !(surf === 'incisal' && s === 'oclusal') && !(surf === 'oclusal' && s === 'incisal') && !(surf === 'palatina' && s === 'lingual') && !(surf === 'lingual' && s === 'palatina'));
      } else {
        return prev.includes(surf) ? prev : [...prev, surf];
      }
    });

    const cfg = CONDITION_CONFIG[condToApply];
    if (condToApply === 'sio') {
      setAddedSuccessMsg(`Face ${surf.toUpperCase()} limpa no(s) dente(s) ${targetTeeth.join(', ')}`);
    } else {
      setAddedSuccessMsg(`Face ${surf.toUpperCase()} marcada como "${cfg.label}" no(s) dente(s) ${targetTeeth.join(', ')}`);
    }
    setTimeout(() => setAddedSuccessMsg(null), 3000);
  };

  const handleApplyConditionToSurfaces = (
    overrideTeeth?: number[],
    overrideCondition?: ToothConditionType,
    overrideSurfaces?: ToothSurface[],
    overrideNotes?: string
  ) => {
    const targetTeeth = overrideTeeth || selectedTeeth;
    const targetConditions = overrideCondition ? [overrideCondition] : selectedConditionTypes;
    const targetSurfaces = overrideSurfaces || selectedSurfaces;
    const targetNote = overrideNotes !== undefined ? overrideNotes : toothNote;

    if (targetTeeth.length === 0 || targetSurfaces.length === 0 || targetConditions.length === 0) return;

    targetTeeth.forEach(num => {
      const existing = activePatientConditions.find(c => c.toothNumber === num);
      const surfacesMap: Partial<Record<ToothSurface, ToothConditionType>> = {
        ...(existing?.surfaces || {})
      };

      targetConditions.forEach(cond => {
        targetSurfaces.forEach(s => {
          surfacesMap[s] = cond;
          if (s === 'oclusal') surfacesMap['incisal'] = cond;
          if (s === 'incisal') surfacesMap['oclusal'] = cond;
          if (s === 'lingual') surfacesMap['palatina'] = cond;
          if (s === 'palatina') surfacesMap['lingual'] = cond;
        });
      });

      const isSio = targetConditions.every(c => c === 'sio');
      updateToothCondition(patientId, {
        toothNumber: num,
        wholeToothCondition: isSio ? (existing?.wholeToothCondition || undefined) : (existing?.wholeToothCondition || undefined),
        isGirovertido: existing?.isGirovertido,
        hasCalculoSupra: existing?.hasCalculoSupra,
        hasCalculoSub: existing?.hasCalculoSub,
        surfaces: surfacesMap,
        notes: targetNote || existing?.notes
      });
    });
  };

  const handleSelectConditionAndPaint = (condType: ToothConditionType) => {
    setSelectedConditionTypes([condType]);

    if (selectedTeeth.length === 0 || readOnly || activeSnapshotId !== 'current') {
      return;
    }

    const cfg = CONDITION_CONFIG[condType];

    if (condType === 'sio') {
      handleResetTooth(selectedTeeth);
      setAddedSuccessMsg(`Dente(s) ${selectedTeeth.join(', ')} restaurado(s) para Hígido`);
    } else if (condType === 'girovertido') {
      // Toggle Giroversão on selected teeth while strictly preserving wholeToothCondition, cálculo and surfaces
      selectedTeeth.forEach(num => {
        const existing = activePatientConditions.find(c => c.toothNumber === num);
        const currentIsGiro = Boolean(existing?.isGirovertido || existing?.wholeToothCondition === 'girovertido');
        const newGiro = !currentIsGiro;
        updateToothCondition(patientId, {
          toothNumber: num,
          isGirovertido: newGiro,
          wholeToothCondition: existing?.wholeToothCondition === 'girovertido' ? (newGiro ? 'girovertido' : undefined) : existing?.wholeToothCondition,
          hasCalculoSupra: existing?.hasCalculoSupra,
          hasCalculoSub: existing?.hasCalculoSub,
          surfaces: existing?.surfaces || {},
          notes: existing?.notes
        });
      });
      setAddedSuccessMsg(`Giroversão alternada no(s) dente(s) ${selectedTeeth.join(', ')}`);
    } else if (condType === 'calculo_supragengival') {
      // Toggle Cálculo Supragengival on selected teeth while strictly preserving giroversão, endodontia and surfaces
      selectedTeeth.forEach(num => {
        const existing = activePatientConditions.find(c => c.toothNumber === num);
        const currentHasSupra = Boolean(existing?.hasCalculoSupra || existing?.wholeToothCondition === 'calculo_supragengival');
        const newSupra = !currentHasSupra;
        updateToothCondition(patientId, {
          toothNumber: num,
          hasCalculoSupra: newSupra,
          isGirovertido: existing?.isGirovertido,
          hasCalculoSub: existing?.hasCalculoSub,
          wholeToothCondition: existing?.wholeToothCondition === 'calculo_supragengival' ? (newSupra ? 'calculo_supragengival' : undefined) : existing?.wholeToothCondition,
          surfaces: existing?.surfaces || {},
          notes: existing?.notes
        });
      });
      setAddedSuccessMsg(`Cálculo Supragengival alternado no(s) dente(s) ${selectedTeeth.join(', ')}`);
    } else if (condType === 'calculo_subgengival') {
      // Toggle Cálculo Subgengival on selected teeth while strictly preserving giroversão, endodontia and surfaces
      selectedTeeth.forEach(num => {
        const existing = activePatientConditions.find(c => c.toothNumber === num);
        const currentHasSub = Boolean(existing?.hasCalculoSub || existing?.wholeToothCondition === 'calculo_subgengival');
        const newSub = !currentHasSub;
        updateToothCondition(patientId, {
          toothNumber: num,
          hasCalculoSub: newSub,
          isGirovertido: existing?.isGirovertido,
          hasCalculoSupra: existing?.hasCalculoSupra,
          wholeToothCondition: existing?.wholeToothCondition === 'calculo_subgengival' ? (newSub ? 'calculo_subgengival' : undefined) : existing?.wholeToothCondition,
          surfaces: existing?.surfaces || {},
          notes: existing?.notes
        });
      });
      setAddedSuccessMsg(`Cálculo Subgengival alternado no(s) dente(s) ${selectedTeeth.join(', ')}`);
    } else if (
      condType === 'necessidade_endodontica' || 
      condType === 'canal' || 
      condType === 'endodontia_insatisfatoria' || 
      condType === 'endodontia_satisfatoria'
    ) {
      // Endodontic conditions:
      // Do NOT select or auto-paint any face! Leaves anatomical surfaces free for independent selection.
      selectedTeeth.forEach(num => {
        const existing = activePatientConditions.find(c => c.toothNumber === num);
        updateToothCondition(patientId, {
          toothNumber: num,
          wholeToothCondition: condType,
          isGirovertido: existing?.isGirovertido,
          hasCalculoSupra: existing?.hasCalculoSupra,
          hasCalculoSub: existing?.hasCalculoSub,
          surfaces: existing?.surfaces || {},
          notes: toothNote || existing?.notes
        });
      });
      setSelectedSurfaces([]);
      setAddedSuccessMsg(`Condição "${cfg.label}" aplicada no(s) dente(s) ${selectedTeeth.join(', ')}. Faces anatômicas disponíveis para seleção independente.`);
    } else if (
      condType === 'ausente' || 
      condType === 'implante' || 
      condType === 'protese' || 
      condType === 'extracao_indicada'
    ) {
      handleApplyWholeToothCondition(selectedTeeth, condType);
      setSelectedSurfaces([]);
      setAddedSuccessMsg(`Condição "${cfg.label}" aplicada no(s) dente(s) ${selectedTeeth.join(', ')}`);
    } else {
      // Surface conditions: 'carie', 'restauracao', 'restauracao_insatisfatoria'
      // Only paint if surfaces were specifically selected by the professional; otherwise do NOT auto-select all faces
      if (selectedSurfaces.length > 0) {
        handleApplyConditionToSurfaces(selectedTeeth, condType, selectedSurfaces);
        const surfText = `face(s) ${selectedSurfaces.map(s => s.toUpperCase().slice(0, 3)).join(', ')}`;
        setAddedSuccessMsg(`Condição "${cfg.label}" pintada no(s) dente(s) ${selectedTeeth.join(', ')} (${surfText})`);
      } else {
        setAddedSuccessMsg(`Condição "${cfg.label}" ativa. Selecione ou clique nas faces do dente para pintar.`);
      }
    }

    setTimeout(() => setAddedSuccessMsg(null), 3500);
  };

  const handleApplyWholeToothCondition = (
    overrideTeeth?: number[],
    overrideCondition?: ToothConditionType,
    overrideNotes?: string
  ) => {
    const targetTeeth = overrideTeeth || selectedTeeth;
    const targetConditions = overrideCondition ? [overrideCondition] : selectedConditionTypes;
    const targetNote = overrideNotes !== undefined ? overrideNotes : toothNote;

    if (targetTeeth.length === 0 || targetConditions.length === 0) return;

    targetTeeth.forEach(num => {
      const existing = activePatientConditions.find(c => c.toothNumber === num);
      targetConditions.forEach(cond => {
        const isSio = cond === 'sio';
        const isAusente = cond === 'ausente';
        updateToothCondition(patientId, {
          toothNumber: num,
          wholeToothCondition: cond,
          isGirovertido: isSio ? false : existing?.isGirovertido,
          hasCalculoSupra: isSio ? false : existing?.hasCalculoSupra,
          hasCalculoSub: isSio ? false : existing?.hasCalculoSub,
          surfaces: (isSio || isAusente) ? {
            mesial: 'sio',
            distal: 'sio',
            oclusal: 'sio',
            vestibular: 'sio',
            lingual: 'sio'
          } : (existing?.surfaces || {}),
          notes: isSio ? '' : (targetNote || existing?.notes)
        });
      });
    });
  };

  const handleResetTooth = (overrideTeeth?: number[]) => {
    const targetTeeth = overrideTeeth || selectedTeeth;
    if (targetTeeth.length === 0) return;
    targetTeeth.forEach(num => {
      updateToothCondition(patientId, {
        toothNumber: num,
        wholeToothCondition: 'sio',
        isGirovertido: false,
        hasCalculoSupra: false,
        hasCalculoSub: false,
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
    setSelectedSurfaces([]);
    setToothNote('');
  };

  // Snapshot handler
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

  // Tooth groupings for shortcuts
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

  const ALL_MOLARS = [18, 17, 16, 26, 27, 28, 48, 47, 46, 36, 37, 38];
  const ALL_PREMOLARS = [15, 14, 24, 25, 45, 44, 34, 35];
  const ALL_ANTERIORS = [13, 12, 11, 21, 22, 23, 43, 42, 41, 31, 32, 33];

  const handleSelectPermanents = () => {
    setSelectedTeeth(ALL_PERMANENT_TEETH);
  };

  const handleInvertSelection = () => {
    setSelectedTeeth(prev => {
      const currentSet = new Set(prev);
      return ALL_PERMANENT_TEETH.filter(t => !currentSet.has(t));
    });
  };

  // Mobile Quadrant Scrolling Helper
  const scrollToQuadrant = (quadrant: 'q1' | 'q2' | 'q3' | 'q4' | 'center' | 'all') => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (quadrant === 'all' || quadrant === 'center') {
      container.scrollTo({ left: maxScroll / 2, behavior: 'smooth' });
    } else if (quadrant === 'q1' || quadrant === 'q4') {
      // Right side of patient is left on screen
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (quadrant === 'q2' || quadrant === 'q3') {
      // Left side of patient is right on screen
      container.scrollTo({ left: maxScroll, behavior: 'smooth' });
    }
  };

  // Voice Recognition Controls
  const handleToggleVoiceListening = () => {
    if (isListening) {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      if (voiceTranscript.trim()) {
        processVoiceCommand(voiceTranscript);
      }
    } else {
      setVoiceTranscript('');
      setLastVoiceResult(null);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.start();
          setIsListening(true);
        } catch (err) {
          console.warn('Erro ao iniciar reconhecimento de voz:', err);
          setIsListening(false);
        }
      } else {
        alert('Reconhecimento de voz não suportado pelo navegador. Você pode digitar seu comando no campo abaixo.');
      }
    }
  };

  const processVoiceCommand = async (commandText: string) => {
    if (!commandText.trim()) return;
    setVoiceProcessing(true);

    try {
      const result = await parseDentalVoiceCommandWithGemini(commandText, selectedTeeth);
      setLastVoiceResult(result);

      if (voiceAutoApply && result) {
        applyVoiceResult(result);
      }

      if (voiceFeedbackSpeech && result.spokenFeedback) {
        speakDentalFeedback(result.spokenFeedback);
      }
    } catch (err) {
      console.error('Erro no processamento de comando de voz:', err);
      // Heuristic fallback
      const fallbackResult = parseLocalDentalVoiceCommand(commandText, selectedTeeth);
      setLastVoiceResult(fallbackResult);
      if (voiceAutoApply) {
        applyVoiceResult(fallbackResult);
      }
    } finally {
      setVoiceProcessing(false);
    }
  };

  const applyVoiceResult = (result: VoiceOdontogramResult) => {
    if (result.action === 'select_teeth') {
      setSelectedTeeth(result.teeth);
      setAddedSuccessMsg(result.summary);
      setTimeout(() => setAddedSuccessMsg(null), 3500);
      return;
    }

    if (result.action === 'clear_teeth' || result.conditionType === 'sio') {
      handleResetTooth(result.teeth);
      setSelectedTeeth(result.teeth);
      setAddedSuccessMsg(result.summary);
      setTimeout(() => setAddedSuccessMsg(null), 3500);
      return;
    }

    if (result.isWholeTooth || result.surfaces.length === 0) {
      handleApplyWholeToothCondition(result.teeth, result.conditionType, result.notes);
    } else {
      handleApplyConditionToSurfaces(result.teeth, result.conditionType, result.surfaces, result.notes);
    }

    setSelectedTeeth(result.teeth);
    setAddedSuccessMsg(result.summary);
    setTimeout(() => setAddedSuccessMsg(null), 4000);
  };

  // Render individual tooth graphic
  const renderToothGraphic = (toothNum: number) => {
    const data = getToothData(toothNum);
    const wholeCond = data?.wholeToothCondition;
    const surfaces = data?.surfaces || {};

    const isSelected = selectedTeeth.includes(toothNum);

    const isUpper = (toothNum >= 11 && toothNum <= 29) || (toothNum >= 51 && toothNum <= 65);
    const isAnterior = [11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43, 51, 52, 53, 61, 62, 63, 71, 72, 73, 81, 82, 83].includes(toothNum);

    const topSurfKey: ToothSurface = 'vestibular';
    const centerSurfKey: ToothSurface = isAnterior ? 'incisal' : 'oclusal';
    const bottomSurfKey: ToothSurface = isUpper ? 'palatina' : 'lingual';
    
    const isPatientRightQuad = [1, 4, 5, 8].includes(Math.floor(toothNum / 10));
    const leftSurfKey: ToothSurface = isPatientRightQuad ? 'distal' : 'mesial';
    const rightSurfKey: ToothSurface = isPatientRightQuad ? 'mesial' : 'distal';

    const isAbsent = wholeCond === 'ausente';
    const isEndo = wholeCond === 'canal' || wholeCond === 'endodontia_insatisfatoria' || wholeCond === 'necessidade_endodontica' || wholeCond === 'endodontia_satisfatoria';
    const isProtese = wholeCond === 'protese';
    const isImplante = wholeCond === 'implante';
    const isExtracao = wholeCond === 'extracao_indicada';
    const hasCalculoSupra = Boolean(data?.hasCalculoSupra || wholeCond === 'calculo_supragengival' || Object.values(surfaces).includes('calculo_supragengival'));
    const hasCalculoSub = Boolean(data?.hasCalculoSub || wholeCond === 'calculo_subgengival' || Object.values(surfaces).includes('calculo_subgengival'));
    const hasGirovertido = Boolean(data?.isGirovertido || wholeCond === 'girovertido' || Object.values(surfaces).includes('girovertido'));

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

    const handleSurfaceClick = (e: React.MouseEvent, surf: ToothSurface) => {
      e.stopPropagation();
      e.preventDefault();
      if (readOnly || activeSnapshotId !== 'current') return;

      const targetTeeth = selectedTeeth.includes(toothNum)
        ? selectedTeeth
        : (isMultiSelectMode ? [...selectedTeeth, toothNum] : [toothNum]);
      
      setSelectedTeeth(targetTeeth);
      handleToggleSurface(surf, targetTeeth);
    };

    // Calculate tooth box size
    const toothSizePx = `${Math.round((36 * customScale) / 100)}px`;

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
        onMouseEnter={() => handleToothMouseEnter(toothNum)}
        className={`
          flex flex-col items-center gap-0.5 p-1 rounded-xl transition-colors cursor-pointer group shrink-0 relative select-none touch-manipulation
          ${isSelected ? 'bg-amber-400/35 ring-2 ring-amber-400 shadow-md z-10 border-amber-400' : 'hover:bg-slate-800/80 border border-transparent'}
        `}
        title={`Dente ${toothNum} (${isUpper ? 'Sup' : 'Inf'} ${isAnterior ? 'Anterior' : 'Posterior'})`}
      >
        <span className={`text-[10px] sm:text-[11px] font-mono font-bold ${isSelected ? 'text-amber-300 font-extrabold' : 'text-slate-300 group-hover:text-amber-200'}`}>
          {toothNum}
        </span>

        {/* Tooth SVG Surface Drawing with 7 Anatomical Polygon Map & Coexistent Condition Overlays */}
        <div 
          className="relative transition-all"
          style={{
            width: toothSizePx,
            height: toothSizePx,
            minWidth: '28px',
            minHeight: '28px'
          }}
        >
          {isAbsent ? (
            <div className="w-full h-full rounded-md border border-slate-700 bg-slate-900 flex flex-col items-center justify-center text-xs font-black text-slate-300 shadow-inner select-none">
              <span className="text-sm font-extrabold text-slate-300">✕</span>
            </div>
          ) : (
            <svg viewBox="0 0 100 100" className="w-full h-full rounded-md shadow-xs bg-slate-900 border border-slate-700 overflow-visible">
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

              {/* OVERLAYS FOR COEXISTENT CONDITIONS */}
              {/* 1. Endodontic Root Canal Visual Overlay */}
              {isEndo && (
                <g pointerEvents="none">
                  <line 
                    x1="50" y1="12" x2="50" y2="88" 
                    stroke={wholeCond === 'necessidade_endodontica' ? '#fef08a' : wholeCond === 'endodontia_satisfatoria' ? '#172554' : '#f97316'} 
                    strokeWidth="7" 
                    strokeLinecap="round" 
                    strokeDasharray={wholeCond === 'necessidade_endodontica' ? '6,3' : undefined}
                  />
                  <circle 
                    cx="50" cy="50" r="10" 
                    fill={wholeCond === 'necessidade_endodontica' ? '#fef08a' : wholeCond === 'endodontia_satisfatoria' ? '#172554' : '#f97316'} 
                    stroke="#ffffff" 
                    strokeWidth="2.5" 
                  />
                </g>
              )}

              {/* 2. Prosthetic Crown Frame Overlay */}
              {isProtese && (
                <rect 
                  x="5" y="5" width="90" height="90" rx="10" 
                  fill="none" 
                  stroke="#0891b2" 
                  strokeWidth="5" 
                  pointerEvents="none"
                />
              )}

              {/* 3. Implant Fixture Overlay */}
              {isImplante && (
                <g pointerEvents="none">
                  <line x1="50" y1="20" x2="50" y2="80" stroke="#059669" strokeWidth="6" strokeLinecap="round" />
                  <line x1="36" y1="36" x2="64" y2="36" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
                  <line x1="38" y1="50" x2="62" y2="50" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
                  <line x1="40" y1="64" x2="60" y2="64" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="50" cy="22" r="5" fill="#059669" />
                </g>
              )}

              {/* 4. Indicated Extraction Overlay */}
              {isExtracao && (
                <g pointerEvents="none">
                  <circle cx="50" cy="50" r="18" fill="#9333ea" fillOpacity="0.85" stroke="#ffffff" strokeWidth="2" />
                  <path d="M42,42 L58,58 M58,42 L42,58" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                </g>
              )}
            </svg>
          )}
        </div>

        {/* Indicators Underneath Tooth */}
        <div className="flex flex-col gap-0.5 w-full mt-1 z-10 animate-in fade-in duration-150">
          {wholeCond === 'protese' && (
            <div className="w-full h-3.5 sm:h-4 rounded-xs bg-cyan-600 border border-cyan-400 shadow-2xs flex items-center justify-center text-[8px] sm:text-[9px] font-extrabold text-white leading-none px-0.5" title="Prótese / Coroa">
              CRA
            </div>
          )}
          {wholeCond === 'necessidade_endodontica' && (
            <div className="w-full h-3.5 sm:h-4 rounded-xs bg-yellow-200 border border-yellow-400 shadow-2xs flex items-center justify-center text-[8px] sm:text-[9px] font-extrabold text-yellow-950 leading-none px-0.5" title="Necessidade Endodôntica">
              N.ENDO
            </div>
          )}
          {wholeCond === 'endodontia_satisfatoria' && (
            <div className="w-full h-3.5 sm:h-4 rounded-xs bg-blue-950 border border-blue-800 shadow-2xs flex items-center justify-center text-[8px] sm:text-[9px] font-extrabold text-white leading-none px-0.5" title="Endodontia satisfatória">
              E.SAT
            </div>
          )}
          {(wholeCond === 'canal' || wholeCond === 'endodontia_insatisfatoria') && (
            <div className="w-full h-3.5 sm:h-4 rounded-xs bg-orange-600 border border-orange-400 shadow-2xs flex items-center justify-center text-[8px] sm:text-[9px] font-extrabold text-white leading-none px-0.5" title="Endodontia insatisfatória">
              E.INS
            </div>
          )}
          {wholeCond === 'implante' && (
            <div className="w-full h-3.5 sm:h-4 rounded-xs bg-emerald-600 border border-emerald-400 shadow-2xs flex items-center justify-center text-[8px] sm:text-[9px] font-extrabold text-white leading-none px-0.5" title="Implante">
              IMP
            </div>
          )}
          {wholeCond === 'extracao_indicada' && (
            <div className="w-full h-3.5 sm:h-4 rounded-xs bg-purple-600 border border-purple-400 shadow-2xs flex items-center justify-center text-[8px] sm:text-[9px] font-extrabold text-white leading-none px-0.5" title="Extração Indicada">
              EXT
            </div>
          )}
          {hasCalculoSupra && (
            <div className="w-full h-3.5 sm:h-4 rounded-xs bg-cyan-500 border border-cyan-300 shadow-2xs flex items-center justify-center text-[8px] sm:text-[9px] font-extrabold text-cyan-950 leading-none px-0.5" title="Cálculo Supragengival">
              Cá.Sup
            </div>
          )}
          {hasCalculoSub && (
            <div className="w-full h-3.5 sm:h-4 rounded-xs bg-teal-700 border border-teal-500 shadow-2xs flex items-center justify-center text-[8px] sm:text-[9px] font-extrabold text-teal-100 leading-none px-0.5" title="Cálculo Subgengival">
              Cá.Sub
            </div>
          )}
          {hasGirovertido && (
            <div className="w-full h-3.5 sm:h-4 rounded-xs bg-amber-400 border border-amber-300 shadow-2xs flex items-center justify-center text-[8px] sm:text-[9px] font-extrabold text-amber-950 leading-none px-0.5" title="Dente Girovertido">
              Giro
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-3 sm:p-6 shadow-sm space-y-5">
      {/* Header & Main Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e5e5d1] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-serif italic text-[#5a5a40] flex items-center gap-2">
              <Smile className="w-5 h-5 text-[#d4a373]" />
              Odontograma
            </h2>
            {/* AI Voice Fill Button */}
            {!readOnly && (
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform hover:scale-105 cursor-pointer animate-pulse"
                title="Preencher odontograma com voz interativa e inteligente (IA)"
              >
                <Mic className="w-3.5 h-3.5 text-amber-200" />
                <span>Preencher por Voz</span>
                <Sparkles className="w-3 h-3 text-amber-300" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Mapeamento anatômico completo de 32 dentes permanentes e decíduos com suporte a gestos no celular e inteligência artificial.
          </p>
        </div>

        {/* Action Controls: Snapshot Selector & Cronologia button */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-[#fbfbf9] p-1 border border-[#e5e5d1] rounded-xl">
            <Clock className="w-4 h-4 text-[#d4a373] ml-1 shrink-0" />
            <select
              value={activeSnapshotId}
              onChange={(e) => setActiveSnapshotId(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#5a5a40] focus:outline-none cursor-pointer pr-1"
            >
              <option value="current">🌟 Odontograma Atual (Tempo Real)</option>
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
              <span>Cronologia</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Toast (Fixed position to prevent any odontogram jumping/layout shift) */}
      {addedSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-emerald-900/95 text-white border border-emerald-500/50 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="leading-snug">{addedSuccessMsg}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setAddedSuccessMsg(null)} 
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800/60 transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mobile Orientation Hint Banner */}
      {isDeviceLandscape && (
        <div className="sm:hidden bg-blue-50 border border-blue-200 text-blue-900 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-2">
          <Smartphone className="w-3.5 h-3.5 text-blue-600 rotate-90 shrink-0" />
          <span>Modo Paisagem Ativo: Todos os dentes posteriores visíveis em tela cheia!</span>
        </div>
      )}

      {/* Snapshot Active Notice Banner */}
      {selectedSnapshot && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">
                Exibindo Registro Histórico: "{selectedSnapshot.title}" ({selectedSnapshot.date.split('-').reverse().join('/')})
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

      {/* Timeline Strip */}
      {snapshotsList.length > 0 && (
        <div className="bg-[#fbfbf9] p-3 sm:p-4 rounded-2xl border border-[#e5e5d1] space-y-2">
          <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-1.5">
            <h3 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#d4a373]" />
              Evolução Temporal
            </h3>
            <span className="text-[11px] text-gray-500 font-medium">
              {snapshotsList.length + 1} registros
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
            {snapshotsList.map((snap, idx) => {
              const isActive = activeSnapshotId === snap.id;
              return (
                <div 
                  key={snap.id}
                  onClick={() => setActiveSnapshotId(snap.id)}
                  className={`
                    shrink-0 p-2.5 rounded-2xl border transition-all cursor-pointer space-y-1 w-44 sm:w-52 relative
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
                  <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400 border-t border-[#e5e5d1]/60">
                    <span>{snap.conditions.length} dentes</span>
                    <Eye className="w-3.5 h-3.5 text-[#5a5a40]" />
                  </div>
                </div>
              );
            })}

            <div 
              onClick={() => setActiveSnapshotId('current')}
              className={`
                shrink-0 p-2.5 rounded-2xl border transition-all cursor-pointer space-y-1 w-44 sm:w-52
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
              <h4 className="text-xs font-bold text-[#2c2c2c] truncate">Odontograma em Tempo Real</h4>
              <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400 border-t border-[#e5e5d1]/60">
                <span>{activePatientConditions.length} alterações</span>
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED ODONTOGRAM CARD: ODONTOGRAMA INTERATIVO */}
      <div className="w-full bg-[#fbfbf9] rounded-2xl border border-[#e5e5d1] p-3 sm:p-5 space-y-4 shadow-2xs">
        {/* Canvas Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5e5d1] pb-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[#5a5a40] flex items-center gap-1.5 text-sm">
              <Smile className="w-4 h-4 text-[#d4a373]" />
              Odontograma Interativo
            </span>

            {/* Multi-Select Mode Toggle Switch */}
            {!readOnly && activeSnapshotId === 'current' && (
              <button
                type="button"
                onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
                className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isMultiSelectMode 
                    ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400/40 shadow-xs' 
                    : 'bg-white text-gray-700 border-[#e5e5d1] hover:bg-[#f0f0e8]'
                }`}
                title="Ativar seleção múltipla de dentes com um toque no celular ou clique no mouse"
              >
                <MousePointerClick className="w-3.5 h-3.5" />
                <span>Múltipla Seleção: {isMultiSelectMode ? 'LIGADA' : 'Desligada'}</span>
              </button>
            )}

            {/* Multi-Teeth Count Pill */}
            {selectedTeeth.length > 0 && activeSnapshotId === 'current' && !readOnly && (
              <div className="flex items-center gap-1.5 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-xl text-xs">
                <span className="font-bold text-amber-950 font-mono">
                  {selectedTeeth.length} dente(s) ({selectedTeeth.sort((a,b)=>a-b).join(', ')})
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTeeth([])}
                  className="text-[10px] font-bold text-amber-900 underline hover:text-amber-950 cursor-pointer ml-1"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>

          {/* Quick Arch & Sector Selector for Mobile & Desktop */}
          <div className="flex flex-wrap items-center gap-1.5">
            {!readOnly && activeSnapshotId === 'current' && (
              <div className="flex flex-wrap items-center gap-1 bg-white border border-[#e5e5d1] rounded-xl p-0.5 text-[11px] shadow-2xs">
                <button
                  type="button"
                  onClick={handleSelectPermanents}
                  className="px-2 py-0.5 hover:bg-[#5a5a40] hover:text-white bg-amber-50 text-amber-950 border border-amber-300 font-extrabold rounded-lg transition cursor-pointer flex items-center gap-1"
                  title="Selecionar todos os 32 dentes permanentes"
                >
                  <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>Toda Boca</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTeeth(PERMANENT_UPPER_RIGHT.concat(PERMANENT_UPPER_LEFT))}
                  className="px-1.5 py-0.5 hover:bg-[#f0f0e8] text-[#5a5a40] font-bold rounded-lg cursor-pointer"
                  title="Selecionar dentes superiores"
                >
                  Arcada Sup
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTeeth(PERMANENT_LOWER_RIGHT.concat(PERMANENT_LOWER_LEFT))}
                  className="px-1.5 py-0.5 hover:bg-[#f0f0e8] text-[#5a5a40] font-bold rounded-lg cursor-pointer"
                  title="Selecionar dentes inferiores"
                >
                  Arcada Inf
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTeeth(ALL_MOLARS)}
                  className="px-1.5 py-0.5 hover:bg-[#f0f0e8] text-stone-700 font-medium rounded-lg cursor-pointer hidden sm:inline-block"
                  title="Selecionar todos os molares"
                >
                  Molares
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTeeth(ALL_PREMOLARS)}
                  className="px-1.5 py-0.5 hover:bg-[#f0f0e8] text-stone-700 font-medium rounded-lg cursor-pointer hidden sm:inline-block"
                  title="Selecionar pré-molares"
                >
                  Pré-Molares
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTeeth(ALL_ANTERIORS)}
                  className="px-1.5 py-0.5 hover:bg-[#f0f0e8] text-stone-700 font-medium rounded-lg cursor-pointer hidden sm:inline-block"
                  title="Selecionar dentes anteriores"
                >
                  Anteriores
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTeeth(ALL_DECIDUOUS_TEETH)}
                  className="px-1.5 py-0.5 hover:bg-amber-100 text-amber-900 font-bold rounded-lg cursor-pointer"
                  title="Selecionar dentes decíduos (infantil)"
                >
                  Decíduos
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white border border-[#e5e5d1] rounded-xl px-1.5 py-0.5 text-[11px] text-gray-600">
              <button 
                onClick={() => setCustomScale(prev => Math.max(80, prev - 10))}
                className="hover:text-[#5a5a40] p-0.5 cursor-pointer"
                title="Reduzir Tamanho"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="font-mono font-bold w-9 text-center text-[10px]">{customScale}%</span>
              <button 
                onClick={() => setCustomScale(prev => Math.min(130, prev + 10))}
                className="hover:text-[#5a5a40] p-0.5 cursor-pointer"
                title="Aumentar Tamanho"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>

            {/* Rotation Toggle */}
            <button
              type="button"
              onClick={() => setOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal')}
              className={`px-2.5 py-1 rounded-xl border font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer ${
                orientation === 'vertical' 
                  ? 'bg-[#5a5a40] text-white border-[#5a5a40] ring-2 ring-[#5a5a40]/30' 
                  : 'bg-white text-gray-700 border-[#e5e5d1] hover:bg-[#f0f0e8]'
              }`}
              title="Girar odontograma 90 graus"
            >
              <RotateCw className={`w-3.5 h-3.5 transition-transform duration-300 ${orientation === 'vertical' ? 'rotate-90 text-amber-300' : 'text-[#5a5a40]'}`} />
              <span className="hidden sm:inline">{orientation === 'horizontal' ? 'Girar 90°' : 'Modo Vertical'}</span>
            </button>

            {/* Manual Modal */}
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-[#5a5a40] hover:bg-[#4a4a35] text-white font-bold rounded-xl text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer"
              title="Manual do Odontograma"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Manual</span>
            </button>
          </div>
        </div>

        {/* Mobile Quick Quadrant Navigation Bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-[11px] font-bold text-[#5a5a40]">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] uppercase text-gray-400 mr-1 hidden xs:inline">Navegação Rápida:</span>
            <button
              type="button"
              onClick={() => scrollToQuadrant('q1')}
              className="px-2 py-0.5 bg-white border border-[#e5e5d1] rounded-lg hover:bg-[#f0f0e8] text-[10px] cursor-pointer"
              title="Ir para Quadrante 1 (Dentes 18 a 11)"
            >
              Q1 (18-11)
            </button>
            <button
              type="button"
              onClick={() => scrollToQuadrant('center')}
              className="px-2 py-0.5 bg-white border border-[#e5e5d1] rounded-lg hover:bg-[#f0f0e8] text-[10px] cursor-pointer"
              title="Centralizar Dentes Anteriores"
            >
              Centro
            </button>
            <button
              type="button"
              onClick={() => scrollToQuadrant('q2')}
              className="px-2 py-0.5 bg-white border border-[#e5e5d1] rounded-lg hover:bg-[#f0f0e8] text-[10px] cursor-pointer"
              title="Ir para Quadrante 2 (Dentes 21 a 28)"
            >
              Q2 (21-28)
            </button>
            <button
              type="button"
              onClick={() => scrollToQuadrant('q3')}
              className="px-2 py-0.5 bg-white border border-[#e5e5d1] rounded-lg hover:bg-[#f0f0e8] text-[10px] cursor-pointer"
              title="Ir para Quadrante 3 (Dentes 31 a 38)"
            >
              Q3 (31-38)
            </button>
            <button
              type="button"
              onClick={() => scrollToQuadrant('q4')}
              className="px-2 py-0.5 bg-white border border-[#e5e5d1] rounded-lg hover:bg-[#f0f0e8] text-[10px] cursor-pointer"
              title="Ir para Quadrante 4 (Dentes 48 a 41)"
            >
              Q4 (48-41)
            </button>
          </div>

          <span className="text-[10px] text-gray-400 font-medium italic shrink-0">
            ↔ Deslize para ver todos os dentes posteriores
          </span>
        </div>

        {/* Selection Box Marquee Overlay for Drag */}
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

        {/* Scrollable & Touch-Swipeable Teeth Graphic Map Container */}
        <div 
          ref={scrollContainerRef}
          className="w-full overflow-x-auto overflow-y-visible touch-pan-x scrollbar-thin rounded-xl pb-3 pt-1"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div 
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            className={`transition-all duration-300 flex items-center justify-center select-none min-w-[580px] sm:min-w-[660px] mx-auto ${
              orientation === 'vertical' ? 'min-h-[540px] py-10' : ''
            }`}
          >
            <div className={`space-y-4 py-2 transition-transform duration-500 ease-in-out origin-center w-full ${
              orientation === 'vertical' ? 'rotate-90 scale-90 sm:scale-95 my-auto' : 'rotate-0'
            }`}>
              {/* UPPER ARCH (MAXILAR SUPERIOR) */}
              <div className="space-y-2.5">
                <div className="text-center">
                  <span className="px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#5a5a40] text-white uppercase tracking-wider shadow-2xs">
                    Maxilar Superior (Arcada Superior)
                  </span>
                </div>

                {/* Permanent Upper Teeth: 18..11 and 21..28 (All Posterior Teeth Included) */}
                <div className="space-y-1">
                  <div className="text-center text-[10px] sm:text-[11px] font-semibold text-[#5a5a40]">Dentes Permanentes Superiores</div>
                  <div className="flex justify-center items-center gap-2 sm:gap-4 w-full">
                    {/* Quadrant 1 (Right of patient: 18 down to 11) */}
                    <div className="flex gap-0.5 sm:gap-1 border-r border-[#e5e5d1] pr-1 sm:pr-2">
                      {PERMANENT_UPPER_RIGHT.map(renderToothGraphic)}
                    </div>
                    {/* Quadrant 2 (Left of patient: 21 to 28) */}
                    <div className="flex gap-0.5 sm:gap-1 pl-1 sm:pl-2">
                      {PERMANENT_UPPER_LEFT.map(renderToothGraphic)}
                    </div>
                  </div>
                </div>

                {/* Deciduous Upper Teeth */}
                <div className="space-y-1 bg-[#f0f0e8]/50 p-1.5 rounded-2xl border border-[#e5e5d1]/60 max-w-fit mx-auto">
                  <div className="text-center text-[9px] sm:text-[10px] font-bold text-amber-800 uppercase tracking-wider">Dentes Decíduos Superiores (Infantil)</div>
                  <div className="flex justify-center items-center gap-2">
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
              <div className="relative flex items-center justify-center my-1.5">
                <div className="border-t border-dashed border-[#5a5a40]/30 w-full" />
                <span className="absolute bg-[#fbfbf9] px-3 py-0.5 rounded-full border border-[#e5e5d1] text-[9px] sm:text-[10px] font-mono text-[#5a5a40] font-bold uppercase">
                  Linha Oclusal Central
                </span>
              </div>

              {/* LOWER ARCH (MANDÍBULA INFERIOR) */}
              <div className="space-y-2.5">
                {/* Deciduous Lower Teeth */}
                <div className="space-y-1 bg-[#f0f0e8]/50 p-1.5 rounded-2xl border border-[#e5e5d1]/60 max-w-fit mx-auto">
                  <div className="text-center text-[9px] sm:text-[10px] font-bold text-amber-800 uppercase tracking-wider">Dentes Decíduos Inferiores (Infantil)</div>
                  <div className="flex justify-center items-center gap-2">
                    <div className="flex gap-0.5 border-r border-[#e5e5d1] pr-1">
                      {DECIDUOUS_LOWER_RIGHT.map(renderToothGraphic)}
                    </div>
                    <div className="flex gap-0.5 pl-1">
                      {DECIDUOUS_LOWER_LEFT.map(renderToothGraphic)}
                    </div>
                  </div>
                </div>

                {/* Permanent Lower Teeth: 48..41 and 31..38 (All Posterior Teeth Included) */}
                <div className="space-y-1">
                  <div className="text-center text-[10px] sm:text-[11px] font-semibold text-[#5a5a40]">Dentes Permanentes Inferiores</div>
                  <div className="flex justify-center items-center gap-2 sm:gap-4 w-full">
                    {/* Quadrant 4 (Right of patient: 48 down to 41) */}
                    <div className="flex gap-0.5 sm:gap-1 border-r border-[#e5e5d1] pr-1 sm:pr-2">
                      {PERMANENT_LOWER_RIGHT.map(renderToothGraphic)}
                    </div>
                    {/* Quadrant 3 (Left of patient: 31 to 38) */}
                    <div className="flex gap-0.5 sm:gap-1 pl-1 sm:pl-2">
                      {PERMANENT_LOWER_LEFT.map(renderToothGraphic)}
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <span className="px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#5a5a40] text-white uppercase tracking-wider shadow-2xs">
                    Mandíbula Inferior (Arcada Inferior)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INTEGRATED CLINICAL CONDITIONS & EDIT CONTROLS */}
        <div className="space-y-4 pt-2 border-t border-[#e5e5d1]">
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#e5e5d1] pb-2.5 gap-2">
            <div className="flex items-center gap-2">
              {selectedTeeth.length > 0 ? (
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 font-extrabold animate-in fade-in">
                  {selectedTeeth.length} dente(s) selecionado(s): {selectedTeeth.sort((a,b)=>a-b).join(', ')}
                </span>
              ) : (
                <span className="text-[11px] text-[#5a5a40] font-medium">
                  Selecione dentes ou faces anatômicas para pintar e registrar condições
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Salvo automaticamente em tempo real</span>
            </div>
          </div>

          {/* 1. FIRST ROW: CONDIÇÕES CLÍNICAS (CLIQUE PARA PINTAR EM TEMPO REAL) */}
          <div className="space-y-2.5 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#e5e5d1]">
            <div className="flex flex-wrap items-center justify-between border-b border-[#e5e5d1] pb-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Condições Clínicas (Clique para Pintar o Odontograma em Tempo Real)
                </span>
              </div>
              <span className="text-[11px] text-gray-500 font-medium">
                {DISPLAYED_CONDITIONS.length} condições padronizadas
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5">
              {DISPLAYED_CONDITIONS.map((type) => {
                const cfg = CONDITION_CONFIG[type];
                const isSelected = (() => {
                  if (selectedConditionTypes.includes(type)) return true;
                  if (selectedTeeth.length === 1) {
                    const d = getToothData(selectedTeeth[0]);
                    if (!d) return false;
                    if (type === 'girovertido') return Boolean(d.isGirovertido || d.wholeToothCondition === 'girovertido');
                    if (type === 'calculo_supragengival') return Boolean(d.hasCalculoSupra || d.wholeToothCondition === 'calculo_supragengival');
                    if (type === 'calculo_subgengival') return Boolean(d.hasCalculoSub || d.wholeToothCondition === 'calculo_subgengival');
                    if (type === 'necessidade_endodontica') return d.wholeToothCondition === 'necessidade_endodontica';
                    if (type === 'canal' || type === 'endodontia_insatisfatoria') return d.wholeToothCondition === 'canal' || d.wholeToothCondition === 'endodontia_insatisfatoria';
                    if (type === 'endodontia_satisfatoria') return d.wholeToothCondition === 'endodontia_satisfatoria';
                    if (type === 'ausente') return d.wholeToothCondition === 'ausente';
                    if (type === 'implante') return d.wholeToothCondition === 'implante';
                    if (type === 'protese') return d.wholeToothCondition === 'protese';
                    if (type === 'extracao_indicada') return d.wholeToothCondition === 'extracao_indicada';
                  }
                  return false;
                })();
                const isLight = cfg.textDark;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSelectConditionAndPaint(type)}
                    disabled={readOnly || activeSnapshotId !== 'current'}
                    title={`Clique para selecionar e pintar com ${cfg.label}`}
                    style={{
                      backgroundColor: cfg.color,
                      color: isLight ? '#0f172a' : '#ffffff',
                      borderColor: isLight ? '#cbd5e1' : 'rgba(0,0,0,0.18)',
                    }}
                    className={`
                      px-3 py-1.5 rounded-full text-center border flex items-center justify-center transition-all cursor-pointer relative shadow-2xs hover:brightness-105 active:scale-95 select-none
                      ${isSelected 
                        ? 'ring-2.5 ring-[#0f172a] ring-offset-1 shadow-sm z-10 font-black border-transparent scale-105' 
                        : 'hover:shadow-2xs opacity-95 hover:opacity-100'}
                    `}
                  >
                    <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap leading-none">
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. SECOND ROW: FACES ANATÔMICAS AND CLINICAL NOTES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-[#e5e5d1]">
            {/* Box 1: Anatomical Faces Selector matching strictly tooth anatomy */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-[#d4a373]" />
                    Faces Anatômicas:
                  </span>
                  <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                    Cáries & Restaurações Coexistentes
                  </span>
                </div>
                <div className="flex gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      if (readOnly || activeSnapshotId !== 'current') return;
                      const allSurfs = validFaces.map(f => f.key);
                      setSelectedSurfaces(allSurfs);
                      if (selectedTeeth.length > 0) {
                        const currentCond = isSurfaceCondition(selectedConditionTypes[0]) ? selectedConditionTypes[0] : 'carie';
                        handleApplyConditionToSurfaces(selectedTeeth, currentCond, allSurfs);
                        setAddedSuccessMsg(`Todas as faces válidas (${allSurfs.map(s => s.slice(0,3).toUpperCase()).join(', ')}) pintadas com "${CONDITION_CONFIG[currentCond]?.label}" nos dentes ${selectedTeeth.join(', ')}`);
                        setTimeout(() => setAddedSuccessMsg(null), 3000);
                      }
                    }}
                    className="text-[#5a5a40] font-bold hover:underline cursor-pointer"
                  >
                    Todas
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (readOnly || activeSnapshotId !== 'current') return;
                      setSelectedSurfaces([]);
                      if (selectedTeeth.length > 0) {
                        const allSurfs = validFaces.map(f => f.key);
                        handleApplyConditionToSurfaces(selectedTeeth, 'sio', allSurfs);
                        setAddedSuccessMsg(`Faces limpas nos dentes ${selectedTeeth.join(', ')}`);
                        setTimeout(() => setAddedSuccessMsg(null), 3000);
                      }
                    }}
                    className="text-gray-400 hover:underline cursor-pointer"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-[#5a5a40] font-medium bg-[#f0f0e8] px-2.5 py-1.5 rounded-lg border border-[#e5e5d1]">
                {facesSubtitle}
              </div>

              {/* Dynamic Anatomical Faces Buttons styled identically to Condition Buttons */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5">
                {validFaces.map(surf => {
                  const isSelected = selectedSurfaces.includes(surf.key) ||
                    (surf.key === 'incisal' && selectedSurfaces.includes('oclusal')) ||
                    (surf.key === 'oclusal' && selectedSurfaces.includes('incisal')) ||
                    (surf.key === 'palatina' && selectedSurfaces.includes('lingual')) ||
                    (surf.key === 'lingual' && selectedSurfaces.includes('palatina'));

                  // Get surface status if 1 tooth selected
                  const singleToothData = selectedTeeth.length === 1 ? getToothData(selectedTeeth[0]) : undefined;
                  let existingSurfCond = singleToothData?.surfaces?.[surf.key];
                  if (!existingSurfCond && surf.key === 'incisal') existingSurfCond = singleToothData?.surfaces?.['oclusal'];
                  if (!existingSurfCond && surf.key === 'oclusal') existingSurfCond = singleToothData?.surfaces?.['incisal'];
                  if (!existingSurfCond && surf.key === 'palatina') existingSurfCond = singleToothData?.surfaces?.['lingual'];
                  if (!existingSurfCond && surf.key === 'lingual') existingSurfCond = singleToothData?.surfaces?.['palatina'];
                  
                  const hasCondition = Boolean(existingSurfCond && existingSurfCond !== 'sio');
                  const conditionCfg = hasCondition && existingSurfCond ? CONDITION_CONFIG[existingSurfCond] : null;
                  const isDarkText = conditionCfg?.textDark ?? true;

                  return (
                    <button
                      key={surf.key}
                      type="button"
                      onClick={() => handleToggleSurface(surf.key)}
                      disabled={readOnly || activeSnapshotId !== 'current'}
                      title={`${surf.fullName}${hasCondition ? ` - ${conditionCfg?.label}` : ''} (Clique para pintar com a condição ativa)`}
                      style={hasCondition ? {
                        backgroundColor: conditionCfg?.color,
                        color: isDarkText ? '#0f172a' : '#ffffff',
                        borderColor: isDarkText ? '#cbd5e1' : 'rgba(0,0,0,0.18)',
                      } : {
                        backgroundColor: '#ffffff',
                        color: '#334155',
                        borderColor: '#cbd5e1'
                      }}
                      className={`
                        px-3.5 py-1.5 rounded-full text-center border flex items-center justify-center gap-1.5 transition-all cursor-pointer relative shadow-2xs hover:brightness-105 active:scale-95 select-none
                        ${hasCondition 
                          ? `${isSelected ? 'ring-2.5 ring-[#0f172a] ring-offset-1 shadow-sm z-10 font-black border-transparent scale-105' : 'opacity-95 hover:opacity-100 font-bold'}`
                          : isSelected 
                            ? 'bg-amber-100 text-amber-950 border-amber-400 ring-2 ring-amber-500 shadow-xs font-black' 
                            : 'hover:bg-slate-50 hover:border-[#5a5a40] font-semibold'
                        }
                      `}
                    >
                      <span className="font-mono font-black text-xs">{surf.code}</span>
                      <span className="text-[11px] sm:text-xs whitespace-nowrap leading-none">
                        {hasCondition ? (conditionCfg?.label.replace('Restauração', 'Rest.').replace('satisfatória', 'sat.').replace('insatisfatória', 'insat.') || surf.label) : surf.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-500 italic">
                * Toque na face aqui ou diretamente no odontograma acima para pintar em tempo real. Condições em diferentes faces coexistem de forma independente.
              </p>
            </div>

            {/* Box 2: Note & Reset / Clear Tooth */}
            <div className="space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="block text-xs font-bold text-[#5a5a40] uppercase tracking-wider">
                  Observação Clínica do Dente:
                </span>
                <input
                  type="text"
                  placeholder="Ex: Fratura de cúspide, sensibilidade, faceta..."
                  value={toothNote}
                  onChange={(e) => {
                    setToothNote(e.target.value);
                    if (selectedTeeth.length > 0) {
                      selectedTeeth.forEach(num => {
                        updateToothCondition(patientId, {
                          toothNumber: num,
                          notes: e.target.value
                        });
                      });
                    }
                  }}
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#e5e5d1]">
                <div className="text-[11px] text-gray-500 font-medium">
                  {selectedTeeth.length > 0 ? (
                    <span className="font-mono text-amber-900 font-bold">
                      Dente(s): {selectedTeeth.sort((a,b)=>a-b).join(', ')}
                    </span>
                  ) : (
                    <span>Nenhum dente selecionado</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleResetTooth()}
                  disabled={selectedTeeth.length === 0 || readOnly || activeSnapshotId !== 'current'}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Restaurar dente(s) para Hígido (Sem Alteração)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Hígido</span>
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

      {/* AI VOICE INTERACTIVE FILLING MODAL */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#fbfbf9] rounded-3xl border border-[#e5e5d1] shadow-2xl max-w-lg w-full p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-600 text-white rounded-2xl shadow-sm">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#2c2c2c] uppercase tracking-wider flex items-center gap-1.5">
                    Sensor de Voz Inteligente
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Preenchimento do odontograma por comando de voz com IA (Gemini 3.7 Flash)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isListening && speechRecognitionRef.current) {
                    try { speechRecognitionRef.current.stop(); } catch(e) {}
                  }
                  setIsListening(false);
                  setIsVoiceModalOpen(false);
                }}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voice Listening Box */}
            <div className="p-4 bg-white border border-[#e5e5d1] rounded-2xl space-y-3 text-center">
              {/* Mic Sensor Button */}
              <div className="flex flex-col items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleVoiceListening}
                  className={`
                    w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg
                    ${isListening 
                      ? 'bg-rose-500 hover:bg-rose-600 text-white ring-8 ring-rose-300/50 animate-pulse scale-105' 
                      : 'bg-[#5a5a40] hover:bg-[#4a4a35] text-white hover:scale-105'}
                  `}
                >
                  {isListening ? <Mic className="w-8 h-8 animate-bounce" /> : <Mic className="w-8 h-8" />}
                </button>

                <div>
                  <span className="text-xs font-bold text-[#2c2c2c]">
                    {isListening ? 'Ouvindo... Fale o comando odontológico' : 'Toque no microfone para falar'}
                  </span>
                  <p className="text-[10px] text-gray-500">
                    {isListening ? 'Fale dentes, faces ou procedimentos clínicos em português' : 'Sensor pronto para captura'}
                  </p>
                </div>
              </div>

              {/* Live Audio Transcript Display */}
              <div className="p-3 bg-[#fbfbf9] rounded-xl border border-[#e5e5d1] text-left min-h-[50px]">
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-1">
                  <span>Transcrição em tempo real:</span>
                  {voiceProcessing && <span className="text-amber-600 animate-pulse">Processando com IA...</span>}
                </div>
                <p className="text-xs font-medium text-[#2c2c2c] italic">
                  {voiceTranscript ? `"${voiceTranscript}"` : 'Aguardando voz ou digitação...'}
                </p>
              </div>

              {/* AI Recognition Result Card */}
              {lastVoiceResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {lastVoiceResult.summary}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-mono">
                      Dentes: {lastVoiceResult.teeth.join(', ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-emerald-800">
                    {lastVoiceResult.spokenFeedback}
                  </p>

                  <div className="pt-1 border-t border-emerald-200/60 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => applyVoiceResult(lastVoiceResult)}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Reaplicar Condição</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Manual Text Command Input Fallback */}
              <div className="pt-2 border-t border-[#e5e5d1] text-left space-y-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Ou digite o comando clínico por texto:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Dente 16 e 17 cárie oclusal e mesial..."
                    value={manualVoiceInput}
                    onChange={(e) => setManualVoiceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        processVoiceCommand(manualVoiceInput);
                        setManualVoiceInput('');
                      }
                    }}
                    className="flex-1 bg-white border border-[#e5e5d1] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#5a5a40]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      processVoiceCommand(manualVoiceInput);
                      setManualVoiceInput('');
                    }}
                    disabled={!manualVoiceInput.trim() || voiceProcessing}
                    className={`px-3 py-1.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Command Examples Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Exemplos de comandos inteligentes aceitos:
              </span>
              <div className="flex flex-wrap gap-1 text-[10px]">
                {[
                  'Dente 16 cárie oclusal',
                  'Restauração nos dentes 11, 12, 21 e 22',
                  'Dentes 18 e 28 ausentes',
                  'Implante no dente 24',
                  'Tratamento Endodôntico no dente 46',
                  'Cálculo supragengival nos dentes 31, 32, 41, 42',
                  'Dente 12 girovertido',
                  'Limpar dente 36',
                  'Selecionar toda arcada superior'
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setVoiceTranscript(sample);
                      processVoiceCommand(sample);
                    }}
                    className="px-2 py-1 bg-white hover:bg-amber-100 border border-[#e5e5d1] rounded-lg text-stone-700 font-medium transition cursor-pointer"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Options / Settings */}
            <div className="p-2.5 bg-[#f0f0e8]/60 rounded-xl border border-[#e5e5d1] flex flex-wrap items-center justify-between gap-2 text-xs">
              <label className="flex items-center gap-1.5 text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceAutoApply}
                  onChange={(e) => setVoiceAutoApply(e.target.checked)}
                  className="rounded text-[#5a5a40]"
                />
                <span className="font-semibold text-[11px]">Aplicar automaticamente ao falar</span>
              </label>

              <label className="flex items-center gap-1.5 text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceFeedbackSpeech}
                  onChange={(e) => setVoiceFeedbackSpeech(e.target.checked)}
                  className="rounded text-[#5a5a40]"
                />
                <span className="font-semibold text-[11px] flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                  Resposta por voz (TTS)
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-[#e5e5d1]">
              <button
                type="button"
                onClick={() => {
                  if (isListening && speechRecognitionRef.current) {
                    try { speechRecognitionRef.current.stop(); } catch(e) {}
                  }
                  setIsListening(false);
                  setIsVoiceModalOpen(false);
                }}
                className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} rounded-xl text-xs font-bold shadow-xs cursor-pointer`}
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOOTH INSPECTOR MODAL */}
      {isEditModalOpen && selectedTeeth.length > 0 && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
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

            <div className="space-y-3.5">
              {/* Quick Presets */}
              <div className="bg-[#fbfbf9] p-2.5 rounded-2xl border border-[#e5e5d1] space-y-1">
                <span className="block text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider">Atalhos de Seleção:</span>
                <div className="flex flex-wrap gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={handleSelectPermanents}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-extrabold rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Toda a Boca</span>
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

              {/* STEP 1: Select Condition */}
              <div>
                <label className="block text-xs font-semibold text-[#5a5a40] mb-1.5 flex items-center justify-between">
                  <span>1. Condição clínica:</span>
                  <span className="text-[10px] text-gray-500 font-normal">{selectedConditionTypes.length} selecionada(s)</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
                  {DISPLAYED_CONDITIONS.map((type) => {
                    const cfg = CONDITION_CONFIG[type];
                    const isSelected = selectedConditionTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedConditionTypes([type])}
                        className={`
                          p-2 rounded-xl text-left text-xs font-medium border flex items-center justify-between gap-2 transition cursor-pointer
                          ${isSelected 
                            ? 'bg-[#f0f0e8] border-[#5a5a40] text-[#5a5a40] font-bold shadow-2xs ring-1 ring-[#5a5a40]' 
                            : 'bg-[#fbfbf9] border-[#e5e5d1] text-gray-600 hover:bg-[#f0f0e8]'}
                        `}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-3 h-3 rounded-full shrink-0 ${cfg.bg}`} />
                          <span className="truncate">{cfg.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: Select Surfaces */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#5a5a40]">
                    2. Faces Anatômicas:
                  </label>
                  <div className="flex gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSelectedSurfaces(['vestibular', 'mesial', 'oclusal', 'incisal', 'distal', 'palatina', 'lingual'])}
                      className="text-[#5a5a40] font-bold hover:underline"
                    >
                      Todas
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSurfaces([])}
                      className="text-gray-400 hover:underline"
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
                      </button>
                    );
                  })}
                </div>
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
                  className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3.5 py-1.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
                />
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
                  className={`px-3 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} disabled:opacity-50 font-medium text-xs rounded-xl transition shadow-xs cursor-pointer`}
                >
                  Aplicar no Dente Inteiro
                </button>
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
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium cursor-pointer"
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

      {/* MODAL: MANUAL DO ODONTOGRAMA */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#fbfbf9] rounded-2xl border border-[#e5e5d1] shadow-2xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
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
                    Guia de comandos de toque, voz e sinalizações clínicas
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

            <div className="space-y-3 text-xs text-stone-700">
              <div className="p-3 bg-white border border-[#e5e5d1] rounded-xl flex items-start gap-3">
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 shrink-0 mt-0.5">
                  <MousePointerClick className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#2c2c2c]">1. Seleção no Celular e Computador</h4>
                  <ul className="list-disc list-inside space-y-1 text-stone-600 text-[11px]">
                    <li><strong>Toque Simples:</strong> Seleciona ou deseleciona o dente.</li>
                    <li><strong>Múltipla Seleção:</strong> Ative o botão "Múltipla Seleção" para selecionar vários dentes tocando sucessivamente neles.</li>
                    <li><strong>Deslizar a tela:</strong> Deslize horizontalmente para visualizar todos os dentes posteriores (18 a 28 e 48 a 38).</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-white border border-[#e5e5d1] rounded-xl flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg border border-amber-300 text-amber-900 shrink-0 mt-0.5">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#2c2c2c]">2. Preenchimento por Voz com IA</h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Toque no botão <strong>"Preencher por Voz"</strong> e fale naturalmente. A inteligência artificial identifica automaticamente o dente, as faces anatômicas e o procedimento.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white border border-[#e5e5d1] rounded-xl flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 text-blue-800 shrink-0 mt-0.5">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#2c2c2c]">3. Clique Direto nas Faces Dentárias</h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Você pode tocar <strong>diretamente nos polígonos das faces</strong> (Vestibular, Mesial, Oclusal/Incisal, Distal, Lingual/Palatina).
                  </p>
                </div>
              </div>

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

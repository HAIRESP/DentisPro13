import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getThemeStyles } from '../../utils/themeUtils';
import { 
  FileText, 
  Plus, 
  Calendar, 
  User, 
  DollarSign, 
  Clock, 
  Image as ImageIcon, 
  Edit3, 
  Trash2, 
  RotateCw, 
  Check, 
  X,
  Paintbrush,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  Sun,
  CheckCircle2,
  Clock3,
  Send,
  ListTodo,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Printer
} from 'lucide-react';
import { TreatmentPlanItem } from '../../types';

interface ClinicalEvolutionProps {
  patientId: string;
  onOpenReport?: () => void;
}

export const ClinicalEvolution: React.FC<ClinicalEvolutionProps> = ({ patientId, onOpenReport }) => {
  const { 
    clinicalEvolutions, 
    addClinicalEvolution, 
    deleteClinicalEvolution,
    treatmentPlans, 
    updateTreatmentPlan, 
    clinicInfo, 
    layoutTheme 
  } = useApp();
  const t = getThemeStyles(layoutTheme);

  // Form State
  const [selectedPlanItemId, setSelectedPlanItemId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'pendente' | 'em_andamento' | 'concluido' | 'encaminhado'>('concluido');
  const [procedure, setProcedure] = useState('');
  const [description, setDescription] = useState('');
  const [toothNumber, setToothNumber] = useState('');
  const [cost, setCost] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [filterPlanStatus, setFilterPlanStatus] = useState<'todos' | 'pendente' | 'em_andamento' | 'concluido'>('todos');
  const [showPlanSection, setShowPlanSection] = useState(true);

  // Image Editor State
  const [editingImageIndex, setEditingImageIndex] = useState<{ evoId?: string; imgIndex: number; src: string } | null>(null);
  const [imageRotation, setImageRotation] = useState(0);
  const [fineRotation, setFineRotation] = useState(0); // Rotação fina (-10° a +10°)
  const [imageFilter, setImageFilter] = useState<'none' | 'contrast' | 'brightness' | 'grayscale' | 'enhance'>('none');
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  
  // Crop Tool State
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);

  const [brushColor, setBrushColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawingMode, setIsDrawingMode] = useState(true);
  const [annotationText, setAnnotationText] = useState('');
  const [legendPosition, setLegendPosition] = useState<'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-left' | 'top-right' | 'top-center'>('bottom-right');
  const [strokes, setStrokes] = useState<Array<{ points: Array<{ x: number; y: number }>; color: string; size: number }>>([]);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Patient's Treatment Plans
  const patientPlans = treatmentPlans.filter(p => p.patientId === patientId);

  // All individual procedure items from patient's treatment plans
  const allPlanItems = patientPlans.flatMap(plan => 
    plan.items.map(item => ({
      ...item,
      planId: plan.id,
      planTitle: plan.title,
      planDate: plan.date,
      planStatus: plan.status
    }))
  );

  const patientEvolutions = clinicalEvolutions
    .filter(e => e.patientId === patientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Handle Select Procedure Item from Treatment Plan
  const handleSelectPlanItem = (compositeId: string) => {
    setSelectedPlanItemId(compositeId);
    if (!compositeId) {
      setProcedure('');
      setToothNumber('');
      setCost('');
      setDescription('');
      setSelectedStatus('concluido');
      return;
    }

    const [planId, itemId] = compositeId.split('___');
    const targetPlan = patientPlans.find(p => p.id === planId);
    if (!targetPlan) return;
    const targetItem = targetPlan.items.find(i => i.id === itemId);
    if (!targetItem) return;

    setProcedure(targetItem.procedureName);
    setToothNumber(targetItem.toothNumber ? String(targetItem.toothNumber) : '');
    setCost(targetItem.finalCost ? String(targetItem.finalCost) : '');

    let defaultDesc = targetItem.fullProcedureDetails || targetItem.notes || '';
    if (!defaultDesc) {
      defaultDesc = `Atendimento realizado referente ao procedimento: ${targetItem.procedureName}${targetItem.toothNumber ? ` (Dente #${targetItem.toothNumber})` : ''}. Executado e acompanhado no consultório.`;
    }
    setDescription(defaultDesc);
    setSelectedStatus(targetItem.status === 'pendente' ? 'concluido' : (targetItem.status as any));
    setIsAdding(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Direct Status Update for Treatment Plan Item
  const handleUpdateItemStatusDirectly = (
    planId: string, 
    itemId: string, 
    newStatus: 'pendente' | 'em_andamento' | 'concluido' | 'encaminhado'
  ) => {
    const targetPlan = patientPlans.find(p => p.id === planId);
    if (!targetPlan) return;

    const targetItem = targetPlan.items.find(i => i.id === itemId);
    if (!targetItem) return;

    const updatedItems = targetPlan.items.map(i => {
      if (i.id === itemId) {
        return { ...i, status: newStatus === 'encaminhado' ? 'pendente' : newStatus };
      }
      return i;
    });

    const allCompleted = updatedItems.every(i => i.status === 'concluido');
    const anyInProgressOrDone = updatedItems.some(i => i.status === 'concluido' || i.status === 'em_andamento');
    let newPlanStatus = targetPlan.status;
    if (allCompleted) newPlanStatus = 'concluido';
    else if (anyInProgressOrDone) newPlanStatus = 'em_andamento';

    updateTreatmentPlan(planId, { items: updatedItems, status: newPlanStatus });

    const statusLabelMap: Record<string, string> = {
      'concluido': 'Procedimento CONCLUÍDO',
      'em_andamento': 'Procedimento EM ANDAMENTO',
      'encaminhado': 'Procedimento ENCAMINHADO para especialista',
      'pendente': 'Status mantido em PENDENTE'
    };

    // Auto record evolution entry
    addClinicalEvolution({
      patientId,
      date: new Date().toISOString().split('T')[0],
      dentistName: clinicInfo.dentistName,
      procedure: targetItem.procedureName,
      toothNumber: targetItem.toothNumber,
      cost: targetItem.finalCost,
      description: `[Acompanhamento do Plano de Tratamento]: ${statusLabelMap[newStatus]} em ${new Date().toLocaleDateString('pt-BR')}.${targetItem.notes ? ` Obs: ${targetItem.notes}` : ''}`,
      status: newStatus,
      treatmentPlanId: planId,
      treatmentItemId: itemId
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file as Blob);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedure || !description) return;

    let planId: string | undefined;
    let itemId: string | undefined;

    if (selectedPlanItemId) {
      const parts = selectedPlanItemId.split('___');
      planId = parts[0];
      itemId = parts[1];
    }

    addClinicalEvolution({
      patientId,
      date: new Date().toISOString().split('T')[0],
      dentistName: clinicInfo.dentistName,
      procedure,
      description,
      toothNumber: toothNumber ? parseInt(toothNumber) : undefined,
      cost: cost ? parseFloat(cost) : undefined,
      images: images.length > 0 ? images : undefined,
      status: selectedStatus,
      treatmentPlanId: planId,
      treatmentItemId: itemId
    });

    // Sync status into Treatment Plan
    if (planId && itemId) {
      const targetPlan = patientPlans.find(p => p.id === planId);
      if (targetPlan) {
        const updatedItems = targetPlan.items.map(i => {
          if (i.id === itemId) {
            return { ...i, status: selectedStatus === 'encaminhado' ? 'pendente' : selectedStatus };
          }
          return i;
        });

        const allCompleted = updatedItems.every(i => i.status === 'concluido');
        const anyInProgressOrDone = updatedItems.some(i => i.status === 'concluido' || i.status === 'em_andamento');
        let newPlanStatus = targetPlan.status;
        if (allCompleted) newPlanStatus = 'concluido';
        else if (anyInProgressOrDone) newPlanStatus = 'em_andamento';

        updateTreatmentPlan(planId, { items: updatedItems, status: newPlanStatus });
      }
    }

    setSelectedPlanItemId('');
    setProcedure('');
    setDescription('');
    setToothNumber('');
    setCost('');
    setImages([]);
    setSelectedStatus('concluido');
    setIsAdding(false);
  };

  // Open Image Editor Modal
  const openImageEditor = (src: string, imgIndex: number, evoId?: string) => {
    setEditingImageIndex({ evoId, imgIndex, src });
    setImageRotation(0);
    setFineRotation(0);
    setImageFilter('none');
    setFlipH(false);
    setFlipV(false);
    setCropTop(0);
    setCropBottom(0);
    setCropLeft(0);
    setCropRight(0);
    setIsCropMode(false);
    setStrokes([]);
    setAnnotationText('');
    setLegendPosition('bottom-right');
    setIsDrawingMode(true);
  };

  // Redraw Canvas whenever controls change
  useEffect(() => {
    if (!editingImageIndex || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = editingImageIndex.src;
    img.onload = () => {
      // Crop bounds
      const sx = img.width * (cropLeft / 100);
      const sy = img.height * (cropTop / 100);
      const sw = Math.max(1, img.width * (1 - (cropLeft + cropRight) / 100));
      const sh = Math.max(1, img.height * (1 - (cropTop + cropBottom) / 100));

      const totalAngle = imageRotation + fineRotation;

      // Set canvas dimensions
      if (imageRotation % 180 !== 0) {
        canvas.width = Math.round(sh);
        canvas.height = Math.round(sw);
      } else {
        canvas.width = Math.round(sw);
        canvas.height = Math.round(sh);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply Filter
      if (imageFilter === 'enhance') ctx.filter = 'contrast(135%) saturate(140%) brightness(105%)';
      else if (imageFilter === 'contrast') ctx.filter = 'contrast(160%)';
      else if (imageFilter === 'brightness') ctx.filter = 'brightness(130%)';
      else if (imageFilter === 'grayscale') ctx.filter = 'grayscale(100%)';
      else ctx.filter = 'none';

      // Apply Center Transforms for rotation & flips
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((totalAngle * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);
      ctx.restore();

      // Render Brush Strokes (Freehand Drawing)
      strokes.forEach(stroke => {
        if (stroke.points.length < 2) return;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
      });

      // Apply Text Annotation if provided
      if (annotationText) {
        ctx.save();
        ctx.font = 'bold 22px sans-serif';
        const textMetrics = ctx.measureText(annotationText);
        const textWidth = textMetrics.width;
        const textHeight = 26;

        let x = 20;
        let y = canvas.height - 25;

        if (legendPosition === 'bottom-right') {
          x = Math.max(10, canvas.width - textWidth - 25);
          y = canvas.height - 25;
        } else if (legendPosition === 'bottom-left') {
          x = 20;
          y = canvas.height - 25;
        } else if (legendPosition === 'bottom-center') {
          x = Math.max(10, (canvas.width - textWidth) / 2);
          y = canvas.height - 25;
        } else if (legendPosition === 'top-left') {
          x = 20;
          y = 35;
        } else if (legendPosition === 'top-right') {
          x = Math.max(10, canvas.width - textWidth - 25);
          y = 35;
        } else if (legendPosition === 'top-center') {
          x = Math.max(10, (canvas.width - textWidth) / 2);
          y = 35;
        }

        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(x - 8, y - textHeight + 4, textWidth + 16, textHeight + 8);

        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(annotationText, x, y);
        ctx.fillText(annotationText, x, y);
        ctx.restore();
      }
    };
  }, [editingImageIndex, imageRotation, fineRotation, imageFilter, flipH, flipV, cropTop, cropBottom, cropLeft, cropRight, strokes, annotationText, legendPosition]);

  // Pointer position helper
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    setIsMouseDown(true);
    const pos = getCanvasPos(e);
    setStrokes(prev => [...prev, { points: [pos], color: brushColor, size: brushSize }]);
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMouseDown || !isDrawingMode) return;
    const pos = getCanvasPos(e);
    setStrokes(prev => {
      if (prev.length === 0) return prev;
      const lastStroke = prev[prev.length - 1];
      const updatedStroke = {
        ...lastStroke,
        points: [...lastStroke.points, pos]
      };
      return [...prev.slice(0, -1), updatedStroke];
    });
  };

  const handlePointerUp = () => {
    setIsMouseDown(false);
  };

  // Save Image Modifications via Canvas Rendering
  const handleSaveEditedImage = () => {
    if (!editingImageIndex || !canvasRef.current) return;

    const editedDataUrl = canvasRef.current.toDataURL('image/jpeg');

    if (!editingImageIndex.evoId) {
      // Updating image in the "New Evolution Form" draft
      setImages(prev => {
        const updated = [...prev];
        updated[editingImageIndex.imgIndex] = editedDataUrl;
        return updated;
      });
    }
    setEditingImageIndex(null);
  };

  return (
    <div className="bg-white border border-[#e5e5d1] rounded-[32px] p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e5d1] pb-4">
        <div>
          <h3 className="text-base font-serif italic text-[#5a5a40] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#d4a373]" />
            Evolução Clínica e Acompanhamento dos Planos
          </h3>
          <p className="text-xs text-gray-500">
            Selecione procedimentos do plano de tratamento para confirmar conclusão, andamento ou encaminhamento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenReport && (
            <button
              type="button"
              onClick={onOpenReport}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-xs transition cursor-pointer border border-amber-500/30"
              title="Imprimir Relatório de Atendimento Unificado"
            >
              <Printer className="w-4 h-4 text-stone-900" />
              <span>Imprimir Relatório</span>
            </button>
          )}

          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`px-4 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-medium text-xs rounded-2xl flex items-center gap-1.5 shadow-xs transition cursor-pointer`}
          >
            <Plus className="w-4 h-4" />
            Nova Anotação de Prontuário
          </button>
        </div>
      </div>

      {/* SECTION 1: PROCEDURES FROM TREATMENT PLANS (Selection & Quick Status Update) */}
      <div className="bg-[#fbfbf9] rounded-2xl border border-[#e5e5d1] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <button 
            type="button"
            onClick={() => setShowPlanSection(!showPlanSection)}
            className="flex items-center gap-2 text-xs font-bold text-[#5a5a40] uppercase tracking-wider cursor-pointer hover:text-[#d4a373] transition"
          >
            <ListTodo className="w-4 h-4 text-[#d4a373]" />
            <span>Procedimentos do Plano de Tratamento ({allPlanItems.length})</span>
            {showPlanSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {allPlanItems.length > 0 && showPlanSection && (
            <div className="flex items-center gap-1 bg-white border border-[#e5e5d1] rounded-xl p-1 text-[11px]">
              <button
                type="button"
                onClick={() => setFilterPlanStatus('todos')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${filterPlanStatus === 'todos' ? 'bg-[#5a5a40] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Todos ({allPlanItems.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPlanStatus('pendente')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${filterPlanStatus === 'pendente' ? 'bg-amber-600 text-white' : 'text-amber-700 hover:bg-amber-50'}`}
              >
                Pendentes ({allPlanItems.filter(i => i.status === 'pendente').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPlanStatus('em_andamento')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${filterPlanStatus === 'em_andamento' ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-50'}`}
              >
                Andamento ({allPlanItems.filter(i => i.status === 'em_andamento').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPlanStatus('concluido')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${filterPlanStatus === 'concluido' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'}`}
              >
                Concluídos ({allPlanItems.filter(i => i.status === 'concluido').length})
              </button>
            </div>
          )}
        </div>

        {showPlanSection && (
          <>
            {allPlanItems.length === 0 ? (
              <div className="p-4 bg-white rounded-xl border border-dashed border-[#e5e5d1] text-center space-y-1">
                <p className="text-xs text-gray-500 font-medium">Nenhum procedimento cadastrado nos Planos de Tratamento deste paciente.</p>
                <p className="text-[11px] text-gray-400">Você pode criar orçamentos e planos na aba "Plano de Tratamento" ou registrar evoluções livres abaixo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allPlanItems
                  .filter(item => filterPlanStatus === 'todos' ? true : item.status === filterPlanStatus)
                  .map(item => {
                    const compositeId = `${item.planId}___${item.id}`;
                    return (
                      <div 
                        key={compositeId} 
                        className={`bg-white rounded-2xl border p-3.5 space-y-2.5 transition shadow-2xs hover:shadow-xs ${
                          item.status === 'concluido' ? 'border-emerald-200 bg-emerald-50/20' : 
                          item.status === 'em_andamento' ? 'border-blue-200 bg-blue-50/20' : 
                          'border-[#e5e5d1]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#2c2c2c]">{item.procedureName}</span>
                              {item.toothNumber && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#f0f0e8] text-[#5a5a40] border border-[#e5e5d1]">
                                  Dente #{item.toothNumber}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Plano: <span className="font-medium text-gray-600">{item.planTitle}</span> ({item.planDate})
                              {item.tussCode && <span className="ml-1 text-gray-400">| TUSS: {item.tussCode}</span>}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {item.status === 'concluido' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Concluído
                              </span>
                            )}
                            {item.status === 'em_andamento' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                                <Clock3 className="w-3 h-3 text-blue-600" /> Em Andamento
                              </span>
                            )}
                            {item.status === 'pendente' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" /> Pendente
                              </span>
                            )}
                          </div>
                        </div>

                        {item.notes && (
                          <p className="text-[11px] text-gray-600 italic bg-[#fbfbf9] p-2 rounded-xl border border-[#e5e5d1]">
                            "{item.notes}"
                          </p>
                        )}

                        {/* Direct Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100 text-xs">
                          <span className="font-mono font-bold text-[11px] text-[#5a5a40]">
                            R$ {item.finalCost ? item.finalCost.toFixed(2) : '0.00'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {/* Fast status toggles */}
                            <button
                              type="button"
                              onClick={() => handleUpdateItemStatusDirectly(item.planId, item.id, 'em_andamento')}
                              className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold transition cursor-pointer"
                              title="Marcar como Em Andamento"
                            >
                              🟡 Andamento
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateItemStatusDirectly(item.planId, item.id, 'concluido')}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold transition cursor-pointer"
                              title="Marcar como Concluído"
                            >
                              🟢 Concluir
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateItemStatusDirectly(item.planId, item.id, 'encaminhado')}
                              className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold transition cursor-pointer"
                              title="Marcar como Encaminhado a Especialista"
                            >
                              🔵 Encaminhar
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectPlanItem(compositeId)}
                              className={`px-2.5 py-1 ${t.btnPrimaryBg} ${t.btnPrimaryText} rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer`}
                              title="Preencher Prontuário para este procedimento"
                            >
                              <span>Evoluir</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Entry Form */}
      {isAdding && (
        <form ref={formRef} onSubmit={handleSubmit} className="bg-[#fbfbf9] p-5 rounded-2xl border border-[#e5e5d1] space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-2">
            <h4 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#d4a373]" />
              Registrar Atendimento / Evolução Clínica
            </h4>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selector for Procedures from Treatment Plans */}
          {allPlanItems.length > 0 && (
            <div className="bg-white p-3 rounded-xl border border-[#d4a373]/50 space-y-1">
              <label className="block text-xs font-bold text-[#5a5a40]">
                Vincular a um Procedimento do Plano de Tratamento
              </label>
              <select
                value={selectedPlanItemId}
                onChange={(e) => handleSelectPlanItem(e.target.value)}
                className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-medium"
              >
                <option value="">-- Digitação Livre / Sem vínculo com Plano --</option>
                {allPlanItems.map(item => (
                  <option key={`${item.planId}___${item.id}`} value={`${item.planId}___${item.id}`}>
                    [{item.planTitle}] {item.procedureName} {item.toothNumber ? `(Dente #${item.toothNumber})` : ''} - Status Atual: {
                      item.status === 'concluido' ? 'Concluído' : 
                      item.status === 'em_andamento' ? 'Em Andamento' : 'Pendente'
                    }
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Procedure Status Selector Pills */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#5a5a40]">
              Status do Procedimento nesta Anotação
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatus('concluido')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  selectedStatus === 'concluido' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>🟢 Concluído / Executado</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('em_andamento')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  selectedStatus === 'em_andamento' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50'
                }`}
              >
                <Clock3 className="w-3.5 h-3.5" />
                <span>🟡 Em Andamento</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('encaminhado')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  selectedStatus === 'encaminhado' 
                    ? 'bg-purple-600 text-white shadow-xs' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-purple-50'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>🔵 Encaminhado (Especialista/Exame)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('pendente')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  selectedStatus === 'pendente' 
                    ? 'bg-amber-600 text-white shadow-xs' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-amber-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>⚪ Pendente</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Procedimento Realizado *</label>
              <input
                type="text"
                required
                placeholder="Ex: Restauração em Resina Composta, Tratamento Endodôntico, Exodontia..."
                value={procedure}
                onChange={(e) => setProcedure(e.target.value)}
                className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Dente Trato (Opcional)</label>
              <input
                type="number"
                placeholder="Ex: 26, 11..."
                value={toothNumber}
                onChange={(e) => setToothNumber(e.target.value)}
                className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Descrição Detalhada do Procedimento *</label>
            <textarea
              required
              rows={3}
              placeholder="Descreva a técnica utilizada, anestésico, materiais, intercorrências ou orientações dadas ao paciente..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-[#e5e5d1] rounded-2xl p-3.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] leading-relaxed"
            />
          </div>

          {/* Attach Images/Radiographs */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#5a5a40]">
              Anexar Fotos Clínicas / Radiografias
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {images.map((imgSrc, i) => (
                <div key={i} className="relative group w-20 h-20 rounded-2xl overflow-hidden border border-[#d4a373]">
                  <img src={imgSrc} alt="Anexo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition">
                    <button
                      type="button"
                      onClick={() => openImageEditor(imgSrc, i)}
                      className="p-1 bg-white/80 rounded-full text-xs text-black hover:bg-white"
                      title="Editar Imagem"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="p-1 bg-rose-500/80 rounded-full text-xs text-white hover:bg-rose-600"
                      title="Remover Imagem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#d4a373] bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-[#f0f0e8] transition text-[#5a5a40]">
                <ImageIcon className="w-5 h-5 text-[#d4a373]" />
                <span className="text-[10px] font-bold mt-1">+ Imagem</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#5a5a40] mb-1">Valor do Procedimento (R$)</label>
              <input
                type="number"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-white border border-[#e5e5d1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2c2c2c] focus:outline-none focus:border-[#5a5a40] font-mono"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="w-1/2 py-2.5 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] text-xs font-medium rounded-2xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`w-1/2 py-2.5 ${t.btnPrimaryBg} ${t.btnPrimaryText} text-xs font-medium rounded-2xl shadow-xs cursor-pointer`}
              >
                Salvar Prontuário
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Evolution Logs Timeline */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-[#5a5a40] uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#d4a373]" />
          Histórico de Evoluções Clínicas do Prontuário ({patientEvolutions.length})
        </h4>

        {patientEvolutions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-[#fbfbf9] rounded-2xl border border-[#e5e5d1]">
            <Clock className="w-8 h-8 mx-auto mb-2 text-[#d4a373]" />
            <p className="text-xs font-medium">Nenhum registro de evolução clínica cadastrado para este paciente.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-[#e5e5d1] ml-4 space-y-6">
            {patientEvolutions.map(evo => (
              <div key={evo.id} className="relative pl-6">
                {/* Timeline Dot */}
                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white ${
                  evo.status === 'concluido' ? 'bg-emerald-500' :
                  evo.status === 'em_andamento' ? 'bg-blue-500' :
                  evo.status === 'encaminhado' ? 'bg-purple-500' :
                  'bg-[#d4a373]'
                }`} />

                <div className="bg-[#fbfbf9] p-4 rounded-2xl border border-[#e5e5d1] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5e5d1] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#5a5a40]">{evo.procedure}</span>
                      {evo.toothNumber && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#f0f0e8] text-[#5a5a40] border border-[#e5e5d1]">
                          Dente #{evo.toothNumber}
                        </span>
                      )}

                      {/* Status Tag */}
                      {evo.status === 'concluido' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          🟢 Concluído
                        </span>
                      )}
                      {evo.status === 'em_andamento' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          🟡 Em Andamento
                        </span>
                      )}
                      {evo.status === 'encaminhado' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          🔵 Encaminhado
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#d4a373]" /> {evo.date}</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-[#d4a373]" /> {evo.dentistName}</span>

                      <button
                        type="button"
                        onClick={() => deleteClinicalEvolution(evo.id)}
                        className="p-1 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-600 transition cursor-pointer"
                        title="Excluir Registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#2c2c2c] leading-relaxed whitespace-pre-wrap">{evo.description}</p>

                  {/* Attached Images Render */}
                  {evo.images && evo.images.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-[#5a5a40] uppercase tracking-wider block">Exames / Fotos Radiográficas ({evo.images.length})</span>
                      <div className="flex flex-wrap gap-2">
                        {evo.images.map((img, idx) => (
                          <div key={idx} className="relative group w-24 h-24 rounded-2xl overflow-hidden border border-[#e5e5d1]">
                            <img src={img} alt="Radiografia" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              <button
                                onClick={() => openImageEditor(img, idx, evo.id)}
                                className="px-2 py-1 bg-white/90 text-[10px] font-bold text-[#5a5a40] rounded-xl flex items-center gap-1 shadow-xs"
                              >
                                <Edit3 className="w-3 h-3" /> Editar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {evo.cost && evo.cost > 0 && (
                    <div className="pt-2 text-right">
                      <span className="text-xs font-mono font-bold text-[#5a5a40] bg-[#f0f0e8] px-3 py-1 rounded-full border border-[#e5e5d1]">
                        R$ {evo.cost.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* IMAGE EDITOR MODAL */}
      {editingImageIndex && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-xl w-full p-6 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <h3 className="text-base font-serif italic text-[#5a5a40] flex items-center gap-2">
                <Paintbrush className="w-5 h-5 text-[#d4a373]" />
                Edição de Imagem Radiográfica / Anotação do Prontuário
              </h3>
              <button onClick={() => setEditingImageIndex(null)} className="text-gray-400 hover:text-[#2c2c2c]">✕</button>
            </div>

            {/* Interactive Drawing Canvas Container */}
            <div className="bg-black/90 rounded-2xl p-2 flex items-center justify-center min-h-[260px] overflow-hidden relative cursor-crosshair">
              <canvas
                ref={canvasRef}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
                className="max-h-72 max-w-full object-contain rounded-xl touch-none"
              />
            </div>

            {/* Brush / Pencil Drawing Toolbar */}
            <div className="bg-[#f0f0e8] p-3 rounded-2xl border border-[#e5e5d1] space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-[#5a5a40] flex items-center gap-1.5">
                  <Paintbrush className="w-4 h-4 text-[#d4a373]" /> Pincel / Lápis de Anotação
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsDrawingMode(!isDrawingMode)}
                    className={`px-3 py-1 rounded-xl font-bold transition text-[11px] ${
                      isDrawingMode ? `${t.btnPrimaryBg} ${t.btnPrimaryText}` : 'bg-white text-gray-600 border border-[#e5e5d1]'
                    }`}
                  >
                    {isDrawingMode ? '✏️ Desenho Ativo' : '🖐️ Modo Visualizar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStrokes([])}
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 font-bold rounded-xl border border-[#e5e5d1] text-[11px] flex items-center gap-1"
                    title="Limpar Riscos"
                  >
                    <RotateCcw className="w-3 h-3" /> Limpar
                  </button>
                </div>
              </div>

              {isDrawingMode && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#e5e5d1]">
                  {/* Colors */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-gray-600">Cor:</span>
                    {[
                      { name: 'Vermelho', code: '#ef4444' },
                      { name: 'Amarelo', code: '#f59e0b' },
                      { name: 'Verde', code: '#10b981' },
                      { name: 'Ciano', code: '#06b6d4' },
                      { name: 'Branco', code: '#ffffff' },
                      { name: 'Preto', code: '#000000' }
                    ].map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setBrushColor(c.code)}
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          brushColor === c.code ? 'border-[#5a5a40] scale-110 shadow-xs' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.code }}
                        title={c.name}
                      />
                    ))}
                  </div>

                  {/* Size */}
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-600">
                    <span>Espessura:</span>
                    {[
                      { label: 'Fino', size: 2 },
                      { label: 'Médio', size: 5 },
                      { label: 'Grosso', size: 10 }
                    ].map(s => (
                      <button
                        key={s.size}
                        type="button"
                        onClick={() => setBrushSize(s.size)}
                        className={`px-2 py-0.5 rounded-lg border transition ${
                          brushSize === s.size ? `${t.btnPrimaryBg} ${t.btnPrimaryText} border-transparent` : 'bg-white text-gray-700 border-[#e5e5d1]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filter & Image Transformation Controls */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Filtro Visual</label>
                  <select
                    value={imageFilter}
                    onChange={(e) => setImageFilter(e.target.value as any)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-2.5 py-2 text-xs focus:outline-none font-medium"
                  >
                    <option value="none">Normal</option>
                    <option value="enhance">Realçador (Vivacidade & Nitidez)</option>
                    <option value="contrast">Alto Contraste (Cárie/Raiz)</option>
                    <option value="brightness">Brilho Ajustado</option>
                    <option value="grayscale">Preto & Branco</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Rotação 90°</label>
                  <button
                    type="button"
                    onClick={() => setImageRotation(prev => (prev + 90) % 360)}
                    className="w-full bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-medium py-2 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#d4a373]" /> Giro 90° ({imageRotation}°)
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Rotação Fina (-10° a +10°)</label>
                  <div className="flex items-center gap-1 bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-2 py-1">
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={fineRotation}
                      onChange={(e) => setFineRotation(parseInt(e.target.value, 10))}
                      className="w-full accent-[#5a5a40] cursor-pointer h-1.5"
                    />
                    <span className="text-[10px] font-bold text-[#5a5a40] w-7 text-right">
                      {fineRotation > 0 ? `+${fineRotation}°` : `${fineRotation}°`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Inverter / Espelhar</label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setFlipH(!flipH)}
                      className={`py-2 rounded-xl font-medium flex items-center justify-center gap-1 border text-[11px] cursor-pointer ${
                        flipH ? `${t.btnPrimaryBg} ${t.btnPrimaryText} border-transparent` : 'bg-[#f0f0e8] text-[#5a5a40] border-[#e5e5d1]'
                      }`}
                      title="Espelhar Horizontal"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" /> Flip H
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlipV(!flipV)}
                      className={`py-2 rounded-xl font-medium flex items-center justify-center gap-1 border text-[11px] cursor-pointer ${
                        flipV ? `${t.btnPrimaryBg} ${t.btnPrimaryText} border-transparent` : 'bg-[#f0f0e8] text-[#5a5a40] border-[#e5e5d1]'
                      }`}
                      title="Espelhar Vertical"
                    >
                      <FlipVertical className="w-3.5 h-3.5" /> Flip V
                    </button>
                  </div>
                </div>
              </div>

              {/* Crop Tool Section */}
              <div className="bg-[#fbfbf9] border border-[#e5e5d1] p-2.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#5a5a40] text-[11px] flex items-center gap-1.5">
                    ✂️ Ferramenta de Corte & Margens
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCropMode(!isCropMode)}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      isCropMode ? `${t.btnPrimaryBg} ${t.btnPrimaryText}` : 'bg-white text-gray-600 border border-[#e5e5d1]'
                    }`}
                  >
                    {isCropMode ? 'Ativo' : 'Ajustar Corte'}
                  </button>
                </div>

                {isCropMode && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#e5e5d1] text-[10px]">
                    <div>
                      <span className="text-gray-500 font-semibold block mb-0.5">Topo: {cropTop}%</span>
                      <input
                        type="range" min="0" max="35" value={cropTop}
                        onChange={(e) => setCropTop(parseInt(e.target.value, 10))}
                        className="w-full accent-[#5a5a40]"
                      />
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block mb-0.5">Base: {cropBottom}%</span>
                      <input
                        type="range" min="0" max="35" value={cropBottom}
                        onChange={(e) => setCropBottom(parseInt(e.target.value, 10))}
                        className="w-full accent-[#5a5a40]"
                      />
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block mb-0.5">Esquerda: {cropLeft}%</span>
                      <input
                        type="range" min="0" max="35" value={cropLeft}
                        onChange={(e) => setCropLeft(parseInt(e.target.value, 10))}
                        className="w-full accent-[#5a5a40]"
                      />
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block mb-0.5">Direita: {cropRight}%</span>
                      <input
                        type="range" min="0" max="35" value={cropRight}
                        onChange={(e) => setCropRight(parseInt(e.target.value, 10))}
                        className="w-full accent-[#5a5a40]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Legenda & Posicionador */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Legenda</label>
                  <input
                    type="text"
                    placeholder="Ex: Fratura Apical Dente #21..."
                    value={annotationText}
                    onChange={(e) => setAnnotationText(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs text-[#2c2c2c] focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5a5a40] mb-1">Posicionador de Legenda</label>
                  <select
                    value={legendPosition}
                    onChange={(e) => setLegendPosition(e.target.value as any)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-2.5 py-2 text-xs focus:outline-none font-medium"
                  >
                    <option value="bottom-right">Inferior Direito</option>
                    <option value="bottom-left">Inferior Esquerdo</option>
                    <option value="bottom-center">Inferior Centro</option>
                    <option value="top-left">Superior Esquerdo</option>
                    <option value="top-right">Superior Direito</option>
                    <option value="top-center">Superior Centro</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e5d1]">
              <button
                type="button"
                onClick={() => setEditingImageIndex(null)}
                className="px-4 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-medium text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEditedImage}
                className={`px-5 py-2 ${t.btnPrimaryBg} ${t.btnPrimaryText} font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer`}
              >
                <Check className="w-4 h-4" /> Salvar Imagem Editada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { CameraModal } from './CameraModal';
import { printDocumentWithTitle } from '../../utils/printUtils';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Paintbrush, 
  FlipHorizontal, 
  FlipVertical, 
  RotateCw, 
  RotateCcw, 
  Check, 
  X, 
  Sparkles,
  Edit3,
  ZoomIn,
  ArrowLeft,
  Printer
} from 'lucide-react';

interface ImageGalleryWithEditorProps {
  title?: string;
  description?: string;
  images: string[];
  onUpdateImages: (images: string[]) => void;
  readOnly?: boolean;
}

export const ImageGalleryWithEditor: React.FC<ImageGalleryWithEditorProps> = ({
  title = "Galeria de Imagens e Fotos do Exame",
  description = "Adicione fotos clínicas ou radiografias. Clique na imagem para abrir a ferramenta avançada de edição e anotação.",
  images = [],
  onUpdateImages,
  readOnly = false
}) => {
  // Live Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Modal Editor State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingSrc, setEditingSrc] = useState<string | null>(null);

  // Canvas Editor Parameters
  const [imageRotation, setImageRotation] = useState(0);
  const [fineRotation, setFineRotation] = useState(0); // Rotação fina de ate 10° (-10° a +10°)
  const [imageFilter, setImageFilter] = useState<'none' | 'enhance' | 'contrast' | 'brightness' | 'grayscale'>('none');
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  
  // Crop Tool State
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);

  // Drawing parameters
  const [isDrawingMode, setIsDrawingMode] = useState(true);
  const [brushColor, setBrushColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(5);
  const [annotationText, setAnnotationText] = useState('');
  const [legendPosition, setLegendPosition] = useState<'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-left' | 'top-right' | 'top-center'>('bottom-right');
  const [strokes, setStrokes] = useState<Array<{ points: Array<{ x: number; y: number }>; color: string; size: number }>>([]);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdateImages([...images, reader.result as string]);
        }
      };
      reader.readAsDataURL(file as Blob);
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onUpdateImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const openEditor = (index: number) => {
    setEditingIndex(index);
    setEditingSrc(images[index]);
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

  // Redraw Canvas
  useEffect(() => {
    if (editingIndex === null || !editingSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = editingSrc;
    img.onload = () => {
      // Calculate cropped sub-rectangle source dimensions
      const sx = img.width * (cropLeft / 100);
      const sy = img.height * (cropTop / 100);
      const sw = Math.max(1, img.width * (1 - (cropLeft + cropRight) / 100));
      const sh = Math.max(1, img.height * (1 - (cropTop + cropBottom) / 100));

      // Calculate total angle including fine rotation (-10° to +10°)
      const totalAngle = imageRotation + fineRotation;

      if (imageRotation % 180 !== 0) {
        canvas.width = Math.round(sh);
        canvas.height = Math.round(sw);
      } else {
        canvas.width = Math.round(sw);
        canvas.height = Math.round(sh);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply Radiographic / Enhancer Filter
      if (imageFilter === 'enhance') ctx.filter = 'contrast(135%) saturate(140%) brightness(105%)';
      else if (imageFilter === 'contrast') ctx.filter = 'contrast(170%)';
      else if (imageFilter === 'brightness') ctx.filter = 'brightness(135%)';
      else if (imageFilter === 'grayscale') ctx.filter = 'grayscale(100%)';
      else ctx.filter = 'none';

      // Center transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((totalAngle * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);
      ctx.restore();

      // Render Brush Strokes
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

      // Apply Text Annotation (Legenda) with Positioner
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

        // Background box for caption legibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(x - 8, y - textHeight + 4, textWidth + 16, textHeight + 8);

        // Text rendering
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(annotationText, x, y);
        ctx.fillText(annotationText, x, y);
        ctx.restore();
      }
    };
  }, [editingIndex, editingSrc, imageRotation, fineRotation, imageFilter, flipH, flipV, cropTop, cropBottom, cropLeft, cropRight, strokes, annotationText, legendPosition]);

  // Pointer position helper
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
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

  const saveEditedImage = () => {
    if (editingIndex === null || !canvasRef.current) return;
    const editedDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.92);
    const updated = [...images];
    updated[editingIndex] = editedDataUrl;
    onUpdateImages(updated);
    setEditingIndex(null);
  };

  return (
    <div className="bg-white border border-[#e5e5d1] rounded-2xl p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5e5d1] pb-2.5">
        <div>
          <h4 className="text-xs font-bold text-[#5a5a40] flex items-center gap-1.5 uppercase tracking-wider">
            <Camera className="w-4 h-4 text-[#d4a373]" />
            {title} ({images.length})
          </h4>
          <p className="text-[11px] text-gray-400">{description}</p>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="px-3.5 py-1.5 bg-[#2c3e2e] hover:bg-[#1f2d22] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
            >
              <Camera className="w-3.5 h-3.5 text-[#d4a373]" /> Tirar Foto com Câmera
            </button>

            <label className="px-3.5 py-1.5 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition">
              <Upload className="w-3.5 h-3.5 text-[#d4a373]" /> + Upload Foto / RX
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          </div>
        )}
      </div>

      {images.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-[#e5e5d1] rounded-2xl bg-[#fbfbf9] text-xs text-gray-400">
          Nenhuma imagem anexada. Clique no botão de upload para importar fotos ou radiografias do exame.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative group rounded-2xl overflow-hidden border border-[#e5e5d1] bg-black aspect-square shadow-2xs">
              <img 
                src={img} 
                alt={`Exame ${index + 1}`} 
                className="w-full h-full object-cover transition duration-200 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditor(index)}
                  className="p-2 bg-white/90 hover:bg-white text-[#5a5a40] rounded-xl shadow-xs transition"
                  title="Abrir Editor Avançado de Imagem"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl shadow-xs transition"
                    title="Excluir Foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADVANCED IMAGE EDITOR MODAL */}
      {editingIndex !== null && editingSrc && (
        <div className="fixed inset-0 z-50 bg-[#2c2c2c]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#e5e5d1] rounded-[32px] max-w-2xl w-full p-6 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-[#e5e5d1] pb-3">
              <h3 className="text-base font-serif italic text-[#5a5a40] flex items-center gap-2">
                <Paintbrush className="w-5 h-5 text-[#d4a373]" />
                Editor Avançado de Fotografia Radiográfica / Clínica
              </h3>
              <button onClick={() => setEditingIndex(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            {/* Interactive Drawing Canvas Container */}
            <div className="bg-black/95 rounded-2xl p-2 flex items-center justify-center min-h-[280px] overflow-hidden relative cursor-crosshair border border-gray-800">
              <canvas
                ref={canvasRef}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
                className="max-h-80 max-w-full object-contain rounded-xl touch-none"
              />
            </div>

            {/* Drawing Controls */}
            <div className="bg-[#f0f0e8] p-3 rounded-2xl border border-[#e5e5d1] space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-[#5a5a40] flex items-center gap-1.5">
                  <Paintbrush className="w-4 h-4 text-[#d4a373]" /> Ferramenta de Anotação e Desenho Livre
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsDrawingMode(!isDrawingMode)}
                    className={`px-3 py-1 rounded-xl font-bold transition text-[11px] ${
                      isDrawingMode ? 'bg-[#5a5a40] text-white' : 'bg-white text-gray-600 border border-[#e5e5d1]'
                    }`}
                  >
                    {isDrawingMode ? '✏️ Modo Lápis Ativo' : '🖐️ Modo Navegação'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStrokes([])}
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 font-bold rounded-xl border border-[#e5e5d1] text-[11px] flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Limpar Riscos
                  </button>
                </div>
              </div>

              {isDrawingMode && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1.5 border-t border-[#e5e5d1]">
                  {/* Color Palette */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-gray-600">Cor:</span>
                    {[
                      { name: 'Vermelho', code: '#ef4444' },
                      { name: 'Amarelo', code: '#f59e0b' },
                      { name: 'Verde', code: '#10b981' },
                      { name: 'Ciano', code: '#06b6d4' },
                      { name: 'Laranja', code: '#f97316' },
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
                          brushSize === s.size ? 'bg-[#5a5a40] text-white border-[#5a5a40]' : 'bg-white text-gray-700 border-[#e5e5d1]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Image Adjustments & Enhancements */}
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
                    <option value="enhance">Realçador (Vivacidade e Nitidez)</option>
                    <option value="contrast">Alto Contraste (Cárie/Raiz)</option>
                    <option value="brightness">Brilho Ajustado</option>
                    <option value="grayscale">Preto e Branco</option>
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
                      className={`py-2 rounded-xl font-medium flex items-center justify-center gap-1 border text-[11px] ${
                        flipH ? 'bg-[#5a5a40] text-white border-[#5a5a40]' : 'bg-[#f0f0e8] text-[#5a5a40] border-[#e5e5d1]'
                      }`}
                    >
                      <FlipHorizontal className="w-3.5 h-3.5 text-[#d4a373]" /> Flip H
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlipV(!flipV)}
                      className={`py-2 rounded-xl font-medium flex items-center justify-center gap-1 border text-[11px] ${
                        flipV ? 'bg-[#5a5a40] text-white border-[#5a5a40]' : 'bg-[#f0f0e8] text-[#5a5a40] border-[#e5e5d1]'
                      }`}
                    >
                      <FlipVertical className="w-3.5 h-3.5 text-[#d4a373]" /> Flip V
                    </button>
                  </div>
                </div>
              </div>

              {/* Crop Tool Section */}
              <div className="bg-[#fbfbf9] border border-[#e5e5d1] p-2.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#5a5a40] text-[11px] flex items-center gap-1.5">
                    ✂️ Ferramenta de Corte e Margem
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCropMode(!isCropMode)}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition ${
                      isCropMode ? 'bg-[#5a5a40] text-white' : 'bg-white text-gray-600 border border-[#e5e5d1]'
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
                    placeholder="Ex: Nódulo Submandibular / Lesão Apical #26..."
                    value={annotationText}
                    onChange={(e) => setAnnotationText(e.target.value)}
                    className="w-full bg-[#fbfbf9] border border-[#e5e5d1] rounded-xl px-3 py-2 text-xs focus:outline-none font-medium"
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

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#e5e5d1] flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  className="px-3.5 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#5a5a40]" /> Voltar
                </button>
                <button
                  type="button"
                  onClick={() => printDocumentWithTitle({
                    docTitle: 'Galeria_Fotografica_Odontologica',
                    date: new Date()
                  })}
                  className="px-3.5 py-2 bg-[#f0f0e8] hover:bg-[#e5e5d1] text-[#5a5a40] font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#5a5a40]" /> Imprimir
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={saveEditedImage}
                  className="px-5 py-2 bg-[#5a5a40] hover:bg-[#4a4a35] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#d4a373]" /> Salvar Imagem Editada
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(dataUrl) => {
          onUpdateImages([...images, dataUrl]);
          setIsCameraOpen(false);
        }}
        title="Fotografia Clínica / Exame Odontológico"
        subtitle="Posicione a câmera para capturar imagens da boca, dentes ou radiografia"
        defaultFacingMode="environment"
      />
    </div>
  );
};

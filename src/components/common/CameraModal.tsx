import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  RotateCw, 
  Check, 
  RefreshCw, 
  Grid, 
  Zap, 
  ZapOff, 
  Maximize2, 
  Minimize2, 
  Timer, 
  AlertCircle,
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  title?: string;
  subtitle?: string;
  defaultFacingMode?: 'user' | 'environment';
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = "Captura de Foto / Imagem",
  subtitle = "Posicione o paciente, material ou procedimento e clique para capturar",
  defaultFacingMode = 'environment'
}) => {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(defaultFacingMode);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0); // 0 or 3
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Start video stream
  const startCamera = async (mode: 'user' | 'environment') => {
    setCameraError(null);
    setIsStarting(true);
    stopStream();

    try {
      // First attempt with ideal constraints
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (err) {
        // Fallback attempt with generic video constraint
        console.warn('Strict camera constraints failed, attempting basic fallback', err);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
      }

      // Check if torch/flashlight capability is available
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() as any : {};
        if (capabilities.torch) {
          setHasTorch(true);
        } else {
          setHasTorch(false);
        }
      }

      setIsStarting(false);
    } catch (error: any) {
      console.error('Error opening camera:', error);
      setIsStarting(false);
      setCameraError(
        'Não foi possível acessar a câmera do dispositivo. Verifique se concedeu permissão de uso da câmera no navegador.'
      );
    }
  };

  // Toggle Torch/Flash
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack && hasTorch) {
      const newStatus = !torchOn;
      try {
        await videoTrack.applyConstraints({
          advanced: [{ torch: newStatus } as any]
        });
        setTorchOn(newStatus);
      } catch (e) {
        console.warn('Torch failed', e);
      }
    }
  };

  // Switch facing mode (Front / Back)
  const switchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Trigger capture logic
  const handleShutterClick = () => {
    if (capturedPhoto) return;

    if (timerSeconds > 0) {
      setIsCountingDown(true);
      setCountdown(timerSeconds);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsCountingDown(false);
            takeSnapshot();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      takeSnapshot();
    }
  };

  // Take the snapshot from video feed
  const takeSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // If front facing, mirror horizontally so preview matches natural mirror perception
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedPhoto(dataUrl);
    }
  };

  // File fallback upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCapturedPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Accept captured photo
  const handleConfirmPhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      handleClose();
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  // Close modal and cleanup
  const handleClose = () => {
    stopStream();
    setCapturedPhoto(null);
    setCameraError(null);
    setIsCountingDown(false);
    onClose();
  };

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      const modeToUse: 'user' | 'environment' = defaultFacingMode === 'user' ? 'user' : 'environment';
      setFacingMode(modeToUse);
      startCamera(modeToUse);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      {/* Container - Full Screen or Half Screen / Dialog */}
      <div 
        className={`bg-black relative text-white transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl border border-white/10 ${
          isFullScreen 
            ? 'w-full h-full rounded-none' 
            : 'w-full max-w-4xl h-[90vh] sm:h-[80vh] rounded-3xl'
        }`}
      >
        {/* TOP BAR / CONTROLS */}
        <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer border border-white/10"
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Voltar</span>
            </button>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse hidden sm:block" />
            <div>
              <h3 className="font-bold text-white text-sm leading-tight drop-shadow-sm">{title}</h3>
              <p className="text-[11px] text-gray-300 hidden sm:block">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Grid Toggle */}
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-full transition ${
                showGrid ? 'bg-amber-500 text-black font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Grelha de Alinhamento"
            >
              <Grid className="w-4 h-4" />
            </button>

            {/* Timer Toggle */}
            <button
              type="button"
              onClick={() => setTimerSeconds(timerSeconds === 0 ? 3 : 0)}
              className={`p-2 rounded-full transition flex items-center gap-1 ${
                timerSeconds > 0 ? 'bg-amber-500 text-black font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Temporizador 3s"
            >
              <Timer className="w-4 h-4" />
              {timerSeconds > 0 && <span className="text-[10px]">3s</span>}
            </button>

            {/* Flash / Torch Toggle if available */}
            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2 rounded-full transition ${
                  torchOn ? 'bg-amber-400 text-black' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Lanterna / Flash"
              >
                {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
              </button>
            )}

            {/* View Mode Toggle: Full Screen vs Half Screen / Dialog */}
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              title={isFullScreen ? "Visão Normal" : "Tela Cheia"}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition ml-2"
              title="Fechar Câmera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN VIEWPORT */}
        <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
          {/* 1. Captured Photo Preview */}
          {capturedPhoto ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img 
                src={capturedPhoto} 
                alt="Foto Capturada" 
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute bottom-20 inset-x-0 text-center">
                <span className="px-3 py-1 bg-black/70 text-amber-300 font-bold text-xs rounded-full border border-amber-500/30">
                  Pré-visualização da Foto
                </span>
              </div>
            </div>
          ) : cameraError ? (
            /* 2. Error Screen with Upload Fallback */
            <div className="p-6 max-w-md text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Câmera Indisponível</h4>
              <p className="text-xs text-gray-300 leading-relaxed">{cameraError}</p>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 bg-[#d4a373] hover:bg-[#c29262] text-black font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <ImageIcon className="w-4 h-4" /> Escolher Foto dos Arquivos / Galeria
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />

                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Tentar Novamente
                </button>
              </div>
            </div>
          ) : (
            /* 3. Live Video Stream */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-transform ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Optional 3x3 Alignment Grid */}
              {showGrid && (
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/20">
                  <div className="border border-white/15" />
                  <div className="border border-white/15" />
                  <div className="border border-white/15" />
                  <div className="border border-white/15" />
                  <div className="border border-white/15" />
                  <div className="border border-white/15" />
                  <div className="border border-white/15" />
                  <div className="border border-white/15" />
                  <div className="border border-white/15" />
                </div>
              )}

              {/* Countdown Overlay */}
              {isCountingDown && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center pointer-events-none">
                  <span className="text-7xl font-bold text-amber-400 animate-ping font-mono drop-shadow-lg">
                    {countdown}
                  </span>
                </div>
              )}

              {/* Loading Indicator */}
              {isStarting && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-white gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                  <span>Iniciando câmera...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS / ACTION BAR */}
        <div className="p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-around z-20">
          {capturedPhoto ? (
            /* Review Actions */
            <div className="flex items-center gap-4 w-full max-w-sm justify-center">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 px-4 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 backdrop-blur-md transition"
              >
                <RotateCw className="w-4 h-4" /> Tirar Outra
              </button>

              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xl transition"
              >
                <Check className="w-4 h-4" /> Usar esta Foto
              </button>
            </div>
          ) : (
            /* Camera Live Actions */
            <div className="flex items-center justify-between w-full max-w-md px-4">
              {/* Upload fallback button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center"
                title="Galeria / Fotos"
              >
                <ImageIcon className="w-5 h-5 text-gray-300" />
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />
              </button>

              {/* Big Shutter Button */}
              <button
                type="button"
                disabled={isCountingDown || isStarting || !!cameraError}
                onClick={handleShutterClick}
                className="w-18 h-18 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 active:scale-95 flex items-center justify-center transition shadow-2xl disabled:opacity-50"
                title="Bater Foto"
              >
                <div className="w-14 h-14 rounded-full bg-amber-400 group-hover:bg-amber-300 flex items-center justify-center">
                  <Camera className="w-7 h-7 text-black" />
                </div>
              </button>

              {/* Flip Front / Rear Camera */}
              <button
                type="button"
                onClick={switchCamera}
                disabled={isStarting}
                className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center"
                title={`Alternar para câmera ${facingMode === 'environment' ? 'frontal (Selfie)' : 'traseira'}`}
              >
                <RotateCw className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  Sparkles,
  Sliders,
  Download,
  Share2,
  Check,
  Split,
  Heart,
  ExternalLink,
  ShoppingBag,
  Upload,
  User,
  Info,
  Layers,
  Sun,
  FlipHorizontal,
  ChevronUp,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import { Product, ShadeOption } from '../types';
import {
  getFaceLandmarker,
  processLandmarks,
  FaceMeshResult,
  NormalizedLandmark,
  LIP_LANDMARKS,
} from '../utils/faceLandmarker';

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialProduct?: Product | null;
  initialShade?: ShadeOption | null;
  onSelectProduct?: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  isWishlisted?: (productId: string) => boolean;
}

interface ModelProfile {
  id: string;
  name: string;
  tone: string;
  image: string;
  lipY: number;
  lipX: number;
  lipWidth: number;
  lipHeight: number;
  upperLipRatio: number;
  lowerLipRatio: number;
}

const BEAUTY_MODELS: ModelProfile[] = [
  {
    id: 'model-1',
    name: 'Emma',
    tone: 'Fair Warm',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=640&q=80',
    lipY: 69.2,
    lipX: 50.0,
    lipWidth: 26.5,
    lipHeight: 10.5,
    upperLipRatio: 1.0,
    lowerLipRatio: 1.05,
  },
  {
    id: 'model-2',
    name: 'Aanya',
    tone: 'Medium Golden',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=640&q=80',
    lipY: 68.6,
    lipX: 50.1,
    lipWidth: 27.2,
    lipHeight: 11.2,
    upperLipRatio: 1.05,
    lowerLipRatio: 1.1,
  },
  {
    id: 'model-3',
    name: 'Zara',
    tone: 'Deep Rich',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=640&q=80',
    lipY: 70.2,
    lipX: 50.0,
    lipWidth: 28.5,
    lipHeight: 12.0,
    upperLipRatio: 1.1,
    lowerLipRatio: 1.15,
  },
  {
    id: 'model-4',
    name: 'Maya',
    tone: 'Olive Tan',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=640&q=80',
    lipY: 67.8,
    lipX: 49.8,
    lipWidth: 26.8,
    lipHeight: 10.8,
    upperLipRatio: 0.95,
    lowerLipRatio: 1.05,
  },
];

type TryOnMode = 'lips' | 'foundation' | 'fullGlam' | 'radiance';
type LipFinishType = 'gloss' | 'matte' | 'satin' | 'tint';
type FoundationFinishType = 'matte' | 'dewy' | 'satin';

export interface FoundationShade {
  name: string;
  code: string;
  hex: string;
  undertone: 'Warm' | 'Cool' | 'Neutral' | 'Golden';
  depth: 'Fair' | 'Light' | 'Medium' | 'Tan' | 'Deep';
}

const UNIVERSAL_LIP_SHADES: ShadeOption[] = [
  { name: 'Berry Velvet', hex: '#BE123C', code: '01' },
  { name: 'Crimson Satin', hex: '#9F1239', code: '02' },
  { name: 'Warm Nude', hex: '#9A3412', code: '03' },
  { name: 'Rose Petal', hex: '#E11D48', code: '04' },
  { name: 'Ruby Gloss', hex: '#DC2626', code: '05' },
  { name: 'Deep Plum', hex: '#701A75', code: '06' },
  { name: 'Coral Pop', hex: '#F43F5E', code: '07' },
  { name: 'Mocha Rose', hex: '#7C2D12', code: '08' },
  { name: 'Cherry Glaze', hex: '#B91C1C', code: '09' },
  { name: 'Peach Shimmer', hex: '#FB7185', code: '10' },
];

const UNIVERSAL_FOUNDATION_SHADES: FoundationShade[] = [
  { name: 'Fair Porcelain', code: '110', hex: '#F9E4D4', undertone: 'Cool', depth: 'Fair' },
  { name: 'Warm Ivory', code: '115', hex: '#F1D6BF', undertone: 'Warm', depth: 'Fair' },
  { name: 'Classic Ivory', code: '120', hex: '#EACCAE', undertone: 'Neutral', depth: 'Light' },
  { name: 'Warm Nude', code: '128', hex: '#E2B895', undertone: 'Warm', depth: 'Light' },
  { name: 'Natural Beige', code: '220', hex: '#D7A77D', undertone: 'Neutral', depth: 'Medium' },
  { name: 'Soft Honey', code: '230', hex: '#CC966B', undertone: 'Warm', depth: 'Medium' },
  { name: 'Sun Beige', code: '310', hex: '#BC8359', undertone: 'Golden', depth: 'Tan' },
  { name: 'Golden Caramel', code: '332', hex: '#A76D44', undertone: 'Warm', depth: 'Tan' },
  { name: 'Deep Toffee', code: '340', hex: '#945834', undertone: 'Neutral', depth: 'Deep' },
  { name: 'Rich Espresso', code: '360', hex: '#6D3F25', undertone: 'Cool', depth: 'Deep' },
];

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({
  isOpen,
  onClose,
  products,
  initialProduct,
  initialShade,
  onSelectProduct,
  onToggleWishlist,
  isWishlisted,
}) => {
  const tryOnProducts = products;

  const [selectedProduct, setSelectedProduct] = useState<Product>(
    initialProduct && tryOnProducts.some((p) => p.id === initialProduct.id)
      ? initialProduct
      : tryOnProducts[0] || products[0]
  );

  // Active Lens Category Mode (Lips vs Foundation vs Full Glam)
  const isInitialFoundation =
    initialProduct?.category === 'Makeup' ||
    Boolean(initialProduct?.title.toLowerCase().includes('foundation'));

  const [activeMode, setActiveMode] = useState<TryOnMode>(isInitialFoundation ? 'foundation' : 'lips');

  // Shade indices
  const [selectedLipShadeIndex, setSelectedLipShadeIndex] = useState<number>(0);
  const [selectedFoundationShadeIndex, setSelectedFoundationShadeIndex] = useState<number>(3); // Warm Nude default

  // Finish & Coverage
  const [lipFinish, setLipFinish] = useState<LipFinishType>('gloss');
  const [foundationFinish, setFoundationFinish] = useState<FoundationFinishType>('matte');
  const [coverageIntensity, setCoverageIntensity] = useState<number>(65); // 40 = Sheer, 65 = Medium, 85 = Full

  // Snapchat Camera Controls
  const [useCamera, setUseCamera] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraConnecting, setCameraConnecting] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [ringLightActive, setRingLightActive] = useState<boolean>(true);
  const [beautyFilterActive, setBeautyFilterActive] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // MediaPipe Landmark Real-Time Detection
  const [faceMeshResult, setFaceMeshResult] = useState<FaceMeshResult | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState<boolean>(false);
  const [isTrackerLoading, setIsTrackerLoading] = useState<boolean>(false);
  const [isTrackerReady, setIsTrackerReady] = useState<boolean>(false);
  const [showMeshWireframe, setShowMeshWireframe] = useState<boolean>(false);

  // Studio Models & Custom Photo
  const [selectedModelIndex, setSelectedModelIndex] = useState<number>(0);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);

  // Split-screen Before / After slider
  const [splitPosition, setSplitPosition] = useState<number>(50);
  const [isSplitMode, setIsSplitMode] = useState<boolean>(false);

  // UI Panels
  const [showProductDrawer, setShowProductDrawer] = useState<boolean>(false);
  const [drawerCategoryFilter, setDrawerCategoryFilter] = useState<string>('All');

  // Calibration fallback
  const [nudgeX, setNudgeX] = useState<number>(0);
  const [nudgeY, setNudgeY] = useState<number>(0);
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1);

  // Shutter Flash & Snapshot
  const [isShutterFlashing, setIsShutterFlashing] = useState<boolean>(false);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const prevLandmarksRef = useRef<NormalizedLandmark[] | null>(null);
  const lastDetectTimestampRef = useRef<number>(0);

  // Switch mode automatically based on product
  useEffect(() => {
    if (initialProduct) {
      setSelectedProduct(initialProduct);
      const isFound =
        initialProduct.category === 'Makeup' ||
        initialProduct.title.toLowerCase().includes('foundation');
      if (isFound) {
        setActiveMode('foundation');
      } else {
        setActiveMode('lips');
      }

      if (initialShade && initialProduct.shadeOptions) {
        const foundIdx = initialProduct.shadeOptions.findIndex((s) => s.name === initialShade.name);
        if (foundIdx >= 0) {
          if (isFound) setSelectedFoundationShadeIndex(foundIdx);
          else setSelectedLipShadeIndex(foundIdx);
        }
      }
    }
  }, [initialProduct, initialShade]);

  // Stop camera stream & landmarker loop
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraConnecting(false);
    setIsFaceDetected(false);
    setFaceMeshResult(null);
    prevLandmarksRef.current = null;
  }, []);

  // MediaPipe Face Landmark Detection Loop
  const startLandmarkDetection = useCallback(async () => {
    setIsTrackerLoading(true);
    const landmarker = await getFaceLandmarker();
    setIsTrackerLoading(false);

    if (!landmarker) return;

    setIsTrackerReady(true);

    const detectFrame = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && !video.paused) {
        try {
          const now = performance.now();
          const timestamp = Math.max(now, lastDetectTimestampRef.current + 16);
          lastDetectTimestampRef.current = timestamp;

          const results = landmarker.detectForVideo(video, timestamp);
          if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
            const rawLandmarks: NormalizedLandmark[] = results.faceLandmarks[0];

            let smoothedLandmarks = rawLandmarks;
            if (prevLandmarksRef.current && prevLandmarksRef.current.length === rawLandmarks.length) {
              const alpha = 0.55;
              smoothedLandmarks = rawLandmarks.map((pt, i) => {
                const prev = prevLandmarksRef.current![i];
                return {
                  x: pt.x * alpha + prev.x * (1 - alpha),
                  y: pt.y * alpha + prev.y * (1 - alpha),
                  z: pt.z * alpha + prev.z * (1 - alpha),
                };
              });
            }
            prevLandmarksRef.current = smoothedLandmarks;

            const processed = processLandmarks(
              smoothedLandmarks,
              640,
              640,
              video.videoWidth || 640,
              video.videoHeight || 640
            );
            setFaceMeshResult(processed);
            setIsFaceDetected(true);
          } else {
            setIsFaceDetected(false);
          }
        } catch {
          // ignore transient frame glitches
        }
      }
      animFrameIdRef.current = requestAnimationFrame(detectFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(detectFrame);
  }, []);

  // Start Camera Stream
  const requestCameraAccess = useCallback(
    async (targetFacingMode = facingMode) => {
      setCameraError(null);
      setCameraConnecting(true);
      setUseCamera(true);

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported in this browser.');
        }

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: targetFacingMode,
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
          },
          audio: false,
        });

        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn('Video playback warning:', playErr);
          }
        }

        setCameraActive(true);
        setCameraConnecting(false);
        setNudgeY(0);
        setNudgeX(0);
        setScaleMultiplier(1);

        startLandmarkDetection();
      } catch (err: unknown) {
        console.warn('Camera request error:', err);
        const errMsg = err instanceof Error ? err.message : String(err);
        setCameraActive(false);
        setCameraConnecting(false);

        let friendlyNotice = 'Camera access was blocked.';
        if (errMsg.includes('Permission') || errMsg.includes('denied') || errMsg.includes('NotAllowedError')) {
          friendlyNotice = 'Camera permission blocked. Click the lock/camera icon in your address bar to Allow, then tap Retry.';
        } else {
          friendlyNotice = 'Camera unavailable. Tap below to test with our HD studio models or retry.';
        }

        setCameraError(friendlyNotice);
        setUseCamera(false);
      }
    },
    [facingMode, startLandmarkDetection]
  );

  // Auto-start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      requestCameraAccess();
    } else {
      stopCamera();
    }
  }, [isOpen, requestCameraAccess, stopCamera]);

  // Keep videoRef attached
  useEffect(() => {
    if (useCamera && cameraActive && videoRef.current && mediaStreamRef.current) {
      if (videoRef.current.srcObject !== mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
        videoRef.current.muted = true;
        videoRef.current.play().catch(console.warn);
      }
    }
  }, [useCamera, cameraActive]);

  // Flip Camera Mode
  const toggleFlipCamera = () => {
    if (!useCamera) {
      setUseCamera(true);
      requestCameraAccess();
      return;
    }
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    requestCameraAccess(nextMode);
  };

  const switchToModel = () => {
    stopCamera();
    setUseCamera(false);
    setCameraError(null);
  };

  const currentModel = BEAUTY_MODELS[selectedModelIndex];

  // Fallback lip coordinates
  const activeLipY = useCamera ? 71.0 + nudgeY : currentModel.lipY + nudgeY;
  const activeLipX = useCamera ? 50.0 + nudgeX : currentModel.lipX + nudgeX;
  const activeLipWidth = (useCamera ? 27.0 : currentModel.lipWidth) * scaleMultiplier;
  const activeLipHeight = (useCamera ? 11.5 : currentModel.lipHeight) * scaleMultiplier;

  // Available Lip Shades
  const isCurrentProductLipstick =
    selectedProduct.category === 'Lipsticks' ||
    selectedProduct.title.toLowerCase().includes('lip') ||
    selectedProduct.title.toLowerCase().includes('ink');

  const currentProductLipShades: ShadeOption[] =
    isCurrentProductLipstick && selectedProduct.shadeOptions && selectedProduct.shadeOptions.length > 0
      ? selectedProduct.shadeOptions
      : UNIVERSAL_LIP_SHADES;

  const activeLipShade: ShadeOption =
    currentProductLipShades[selectedLipShadeIndex] || currentProductLipShades[0];

  // Available Foundation Shades
  const isCurrentProductFoundation =
    selectedProduct.category === 'Makeup' ||
    selectedProduct.title.toLowerCase().includes('foundation');

  const currentProductFoundationShades: FoundationShade[] =
    isCurrentProductFoundation && selectedProduct.shadeOptions && selectedProduct.shadeOptions.length > 0
      ? selectedProduct.shadeOptions.map((s, idx) => ({
          name: s.name,
          code: s.code || `F0${idx + 1}`,
          hex: s.hex,
          undertone: s.name.toLowerCase().includes('warm') ? 'Warm' : s.name.toLowerCase().includes('golden') ? 'Golden' : 'Neutral',
          depth: idx <= 1 ? 'Fair' : idx <= 3 ? 'Light' : idx <= 5 ? 'Medium' : idx <= 7 ? 'Tan' : 'Deep',
        }))
      : UNIVERSAL_FOUNDATION_SHADES;

  const activeFoundationShade: FoundationShade =
    currentProductFoundationShades[selectedFoundationShadeIndex] || currentProductFoundationShades[0];

  // Lowest offer
  const inStockOffers = selectedProduct.offers.filter((o) => o.inStock);
  const lowestOffer = inStockOffers.length > 0
    ? inStockOffers.reduce((min, o) => (o.price < min.price ? o : min), inStockOffers[0])
    : selectedProduct.offers[0];

  const isCurrentWishlisted = isWishlisted ? isWishlisted(selectedProduct.id) : false;

  // Snapchat Snap Capture
  const handleSnapShutter = () => {
    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 220);

    const canvas = document.createElement('canvas');
    const width = 720;
    const height = 960;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (useCamera && videoRef.current && videoRef.current.readyState >= 2) {
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      ctx.restore();
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = customPhotoUrl || currentModel.image;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        drawSnapWatermark(ctx, width, height);
        setCapturedSnapshot(canvas.toDataURL('image/png'));
      };
      return;
    }

    drawSnapWatermark(ctx, width, height);
    setCapturedSnapshot(canvas.toDataURL('image/png'));
  };

  const drawSnapWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = 'rgba(15, 12, 14, 0.82)';
    ctx.fillRect(20, height - 80, width - 40, 56);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    const tag = activeMode === 'foundation' ? `Foundation: ${activeFoundationShade.name}` : `Shade: ${activeLipShade.name}`;
    ctx.fillText(`${selectedProduct.brand} • ${tag}`, 36, height - 46);
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`₹${lowestOffer.price} on ${lowestOffer.storeName}`, width - 210, height - 46);
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomPhotoUrl(url);
      setUseCamera(false);
      stopCamera();
    }
  };

  // Filtered products in drawer
  const drawerProducts = tryOnProducts.filter((p) => {
    if (drawerCategoryFilter === 'All') return true;
    if (drawerCategoryFilter === 'Foundations') {
      return p.category === 'Makeup' || p.title.toLowerCase().includes('foundation');
    }
    if (drawerCategoryFilter === 'Lipsticks') {
      return p.category === 'Lipsticks' || p.title.toLowerCase().includes('lip') || p.title.toLowerCase().includes('ink');
    }
    if (drawerCategoryFilter === 'Skincare') {
      return p.category === 'Skincare' || p.category === 'Serums';
    }
    return true;
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/95 backdrop-blur-xl flex items-center justify-center p-0 sm:p-3 md:p-6 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* SNAPCHAT FULL-FRAME AR VIEWPORT */}
      <div
        className="relative bg-black w-full max-w-lg md:max-w-xl h-full sm:h-[94vh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* White Shutter Flash */}
        <div
          className={`absolute inset-0 bg-white pointer-events-none z-50 transition-opacity duration-200 ${
            isShutterFlashing ? 'opacity-90' : 'opacity-0'
          }`}
        />

        {/* CAMERA / MODEL VIEWFINDER */}
        <div className="relative flex-1 w-full h-full overflow-hidden bg-[#0A0708] flex items-center justify-center">
          {/* Live Webcam Stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={(e) => {
              (e.currentTarget as HTMLVideoElement).play().catch(console.warn);
            }}
            className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
              useCamera && cameraActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none -z-10'
            } ${
              beautyFilterActive
                ? 'contrast-105 saturate-110 brightness-105'
                : 'contrast-100'
            }`}
          />

          {/* Studio Beauty Model Fallback */}
          <img
            src={customPhotoUrl || currentModel.image}
            alt={currentModel.name}
            crossOrigin="anonymous"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              useCamera && cameraActive ? 'opacity-0 pointer-events-none -z-10' : 'opacity-100 z-0'
            } ${
              beautyFilterActive
                ? 'contrast-105 saturate-110 brightness-105'
                : 'contrast-100'
            }`}
          />

          {/* Ring Light Ambient Glow Halo */}
          {ringLightActive && (
            <div
              className="absolute inset-0 pointer-events-none z-15 shadow-[inset_0_0_90px_rgba(255,235,215,0.45)] border-4 border-amber-200/20"
              style={{ mixBlendMode: 'screen' }}
            />
          )}

          {/* Camera Connecting Overlay */}
          {cameraConnecting && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-30 text-white text-center p-4">
              <div className="w-12 h-12 rounded-full border-3 border-rose-500 border-t-transparent animate-spin" />
              <p className="text-sm font-bold text-rose-200">Connecting Snapchat Lens...</p>
              <p className="text-xs text-stone-400">Please tap Allow if prompted for camera permission</p>
            </div>
          )}

          {/* Camera Error / Permission Blocked Card */}
          {!cameraActive && cameraError && (
            <div className="absolute inset-x-5 top-16 z-30 bg-stone-900/95 border border-rose-500/80 p-4 rounded-2xl text-white text-xs shadow-2xl space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <Info className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-200 text-sm">Camera Blocked</p>
                  <p className="text-stone-300 text-xs mt-1 leading-relaxed">{cameraError}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => requestCameraAccess()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Retry Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCameraError(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-stone-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Use Studio Model
                </button>
              </div>
            </div>
          )}

          {/* REAL-TIME AR MAKEUP & FOUNDATION OVERLAY LAYER (z-20 so it renders visibly over video) */}
          <div
            className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
            style={{
              clipPath: isSplitMode
                ? `polygon(0 0, ${splitPosition}% 0, ${splitPosition}% 100%, 0 100%)`
                : 'none',
            }}
          >
            {useCamera && isFaceDetected && faceMeshResult ? (
              <svg
                viewBox="0 0 640 640"
                className="w-full h-full overflow-visible transform -scale-x-100"
              >
                <defs>
                  <filter id="snapVermilionFeather" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.8" />
                  </filter>
                  <filter id="snapFoundationSoftBlend" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.0" />
                  </filter>
                  <filter id="snapGlossGlint" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="1.6" />
                  </filter>
                  <linearGradient id="snapLipShading" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#000000" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
                  </linearGradient>
                </defs>

                {/* 1. FOUNDATION SKIN VEIL (PUNCHES OUT EYES AND MOUTH CLEANLY) */}
                {(activeMode === 'foundation' || activeMode === 'fullGlam') && (
                  <>
                    {/* Primary Color Toning Pass */}
                    <path
                      d={faceMeshResult.foundationMaskPath}
                      fillRule="evenodd"
                      fill={activeFoundationShade.hex}
                      filter="url(#snapFoundationSoftBlend)"
                      style={{
                        opacity: (coverageIntensity / 100) * 0.55,
                        mixBlendMode: 'color',
                      }}
                    />
                    {/* Secondary Tone & Texture Evening Pass */}
                    <path
                      d={faceMeshResult.foundationMaskPath}
                      fillRule="evenodd"
                      fill={activeFoundationShade.hex}
                      filter="url(#snapFoundationSoftBlend)"
                      style={{
                        opacity: (coverageIntensity / 100) * 0.35,
                        mixBlendMode: foundationFinish === 'dewy' ? 'screen' : 'soft-light',
                      }}
                    />
                  </>
                )}

                {/* 2. SKINCARE DEWY RADIANCE / GLASS SKIN */}
                {(activeMode === 'radiance' ||
                  selectedProduct.category === 'Skincare' ||
                  selectedProduct.category === 'Serums' ||
                  selectedProduct.title.toLowerCase().includes('lumi')) && (
                  <path
                    d={faceMeshResult.faceOvalPath}
                    fill="#ffffff"
                    filter="url(#snapGlossGlint)"
                    style={{
                      opacity: 0.22,
                      mixBlendMode: 'screen',
                    }}
                  />
                )}

                {/* 3. LIPSTICK CONTOURING (UPPER & LOWER LIPS) */}
                {(activeMode === 'lips' || activeMode === 'fullGlam' || activeMode === 'radiance') && (
                  <>
                    <path
                      d={faceMeshResult.upperLipPath}
                      fill={activeLipShade.hex}
                      filter="url(#snapVermilionFeather)"
                      style={{
                        opacity: 0.95,
                        mixBlendMode: lipFinish === 'tint' ? 'soft-light' : 'multiply',
                      }}
                    />
                    <path
                      d={faceMeshResult.upperLipPath}
                      fill={activeLipShade.hex}
                      filter="url(#snapVermilionFeather)"
                      style={{
                        opacity: 0.55,
                        mixBlendMode: 'color',
                      }}
                    />
                    <path
                      d={faceMeshResult.lowerLipPath}
                      fill={activeLipShade.hex}
                      filter="url(#snapVermilionFeather)"
                      style={{
                        opacity: 0.95,
                        mixBlendMode: lipFinish === 'tint' ? 'soft-light' : 'multiply',
                      }}
                    />
                    <path
                      d={faceMeshResult.lowerLipPath}
                      fill={activeLipShade.hex}
                      filter="url(#snapVermilionFeather)"
                      style={{
                        opacity: 0.55,
                        mixBlendMode: 'color',
                      }}
                    />
                    <path
                      d={faceMeshResult.fullLipPathWithInnerHole}
                      fill="url(#snapLipShading)"
                      style={{ mixBlendMode: 'overlay', opacity: 0.45 }}
                    />

                    {/* Specular Gloss Glints */}
                    {lipFinish === 'gloss' && (
                      <>
                        <ellipse
                          cx={faceMeshResult.lowerCushionLeftX}
                          cy={faceMeshResult.lowerCushionLeftY}
                          rx={15}
                          ry={4.5}
                          fill="#ffffff"
                          opacity={0.7}
                          filter="url(#snapGlossGlint)"
                        />
                        <ellipse
                          cx={faceMeshResult.lowerCushionRightX}
                          cy={faceMeshResult.lowerCushionRightY}
                          rx={15}
                          ry={4.5}
                          fill="#ffffff"
                          opacity={0.7}
                          filter="url(#snapGlossGlint)"
                        />
                        <ellipse
                          cx={faceMeshResult.cupidsBowX}
                          cy={faceMeshResult.cupidsBowY}
                          rx={11}
                          ry={2.8}
                          fill="#ffffff"
                          opacity={0.55}
                          filter="url(#snapGlossGlint)"
                        />
                      </>
                    )}

                    {lipFinish === 'satin' && (
                      <ellipse
                        cx={(faceMeshResult.lowerCushionLeftX + faceMeshResult.lowerCushionRightX) / 2}
                        cy={(faceMeshResult.lowerCushionLeftY + faceMeshResult.lowerCushionRightY) / 2}
                        rx={20}
                        ry={4}
                        fill="#ffffff"
                        opacity={0.35}
                        filter="url(#snapGlossGlint)"
                      />
                    )}
                  </>
                )}

                {/* 4. CHEEKBONE RADIANCE & BLUSH */}
                {(activeMode === 'radiance' ||
                  selectedProduct.title.toLowerCase().includes('lumi') ||
                  selectedProduct.title.toLowerCase().includes('highlighter')) && (
                  <>
                    <circle
                      cx={faceMeshResult.leftCheekX}
                      cy={faceMeshResult.leftCheekY}
                      r={32}
                      fill={activeLipShade.hex}
                      opacity={0.5}
                      style={{ mixBlendMode: 'screen' }}
                      filter="url(#snapGlossGlint)"
                    />
                    <circle
                      cx={faceMeshResult.rightCheekX}
                      cy={faceMeshResult.rightCheekY}
                      r={32}
                      fill={activeLipShade.hex}
                      opacity={0.5}
                      style={{ mixBlendMode: 'screen' }}
                      filter="url(#snapGlossGlint)"
                    />
                  </>
                )}

                {/* 5. SNAPCHAT 468 MESH WIREFRAME NODES */}
                {showMeshWireframe && (
                  <g opacity={0.8}>
                    {LIP_LANDMARKS.lipsOuter.map((idx) => {
                      const pt = faceMeshResult.landmarks[idx];
                      if (!pt) return null;
                      return (
                        <circle
                          key={`lip-outer-${idx}`}
                          cx={faceMeshResult.toPixelX(pt)}
                          cy={faceMeshResult.toPixelY(pt)}
                          r={2}
                          fill="#f43f5e"
                        />
                      );
                    })}
                    {[10, 338, 297, 332, 152, 148, 176, 234, 454, 50, 280, 1].map((idx) => {
                      const pt = faceMeshResult.landmarks[idx];
                      if (!pt) return null;
                      return (
                        <circle
                          key={`face-mesh-${idx}`}
                          cx={faceMeshResult.toPixelX(pt)}
                          cy={faceMeshResult.toPixelY(pt)}
                          r={1.8}
                          fill="#38bdf8"
                        />
                      );
                    })}
                  </g>
                )}
              </svg>
            ) : (
              /* Fallback Anatomical Makeup Overlay */
              <>
                {/* Fallback Foundation Veil */}
                {(activeMode === 'foundation' || activeMode === 'fullGlam') && (
                  <div
                    className="absolute inset-0 transition-all duration-150"
                    style={{
                      backgroundColor: activeFoundationShade.hex,
                      opacity: (coverageIntensity / 100) * 0.38,
                      mixBlendMode: 'color',
                      maskImage: 'radial-gradient(circle at 50% 50%, black 55%, transparent 80%)',
                      WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 55%, transparent 80%)',
                    }}
                  />
                )}

                {/* Fallback Lip Contour */}
                {(activeMode === 'lips' || activeMode === 'fullGlam') && (
                  <div
                    className="absolute transition-all duration-150"
                    style={{
                      left: `${activeLipX}%`,
                      top: `${activeLipY}%`,
                      width: `${activeLipWidth}%`,
                      height: `${activeLipHeight}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
                      <defs>
                        <filter id="fallbackFeather" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="1.5" />
                        </filter>
                      </defs>
                      <path
                        d="M 18,50 C 35,42 62,24 78,22 C 88,21 95,28 100,29 C 105,28 112,21 122,22 C 138,24 165,42 182,50 C 158,54 135,55 100,55 C 65,55 42,54 18,50 Z"
                        fill={activeLipShade.hex}
                        filter="url(#fallbackFeather)"
                        style={{
                          opacity: 0.95,
                          mixBlendMode: lipFinish === 'tint' ? 'soft-light' : 'multiply',
                        }}
                      />
                      <path
                        d="M 18,52 C 45,56 68,58 100,58 C 132,58 155,56 182,52 C 168,75 145,90 100,90 C 55,90 32,75 18,52 Z"
                        fill={activeLipShade.hex}
                        filter="url(#fallbackFeather)"
                        style={{
                          opacity: 0.95,
                          mixBlendMode: lipFinish === 'tint' ? 'soft-light' : 'multiply',
                        }}
                      />
                    </svg>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Before / After Split Slider Bar */}
          {isSplitMode && (
            <>
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)] pointer-events-none z-30"
                style={{ left: `${splitPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-stone-900 font-extrabold text-xs flex items-center justify-center shadow-2xl border-2 border-stone-900">
                  ⇔
                </div>
              </div>
              <div className="absolute top-16 left-4 bg-black/70 backdrop-blur-md text-[10px] font-bold text-white px-2.5 py-1 rounded-full uppercase tracking-wider z-30 border border-white/20">
                {activeMode === 'foundation' ? activeFoundationShade.name : activeLipShade.name}
              </div>
              <div className="absolute top-16 right-4 bg-black/70 backdrop-blur-md text-[10px] font-bold text-stone-300 px-2.5 py-1 rounded-full uppercase tracking-wider z-30 border border-white/20">
                Natural Bare
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={splitPosition}
                onChange={(e) => setSplitPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              />
            </>
          )}

          {/* 3. SNAPCHAT TOP FLOATING HUD CONTROLS */}
          <div className="absolute top-0 inset-x-0 p-4 z-40 flex items-center justify-between pointer-events-none">
            {/* Left Top: Close Button + Active Lens Status */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-all border border-white/20 shadow-lg"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs shadow-lg">
                <span
                  className={`w-2 h-2 rounded-full ${
                    useCamera && cameraActive && isFaceDetected
                      ? 'bg-emerald-400 animate-ping'
                      : useCamera && cameraActive
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                />
                <span className="font-semibold text-[11px] tracking-wide">
                  {useCamera && cameraActive
                    ? isFaceDetected
                      ? 'Face Mesh Locked'
                      : 'Locating Face...'
                    : `Model: ${currentModel.name}`}
                </span>
              </div>
            </div>

            {/* Right Top Snapchat Tool Column */}
            <div className="flex flex-col gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={toggleFlipCamera}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-all border border-white/20 shadow-lg"
                title="Flip Camera / Switch to Model"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setRingLightActive((prev) => !prev)}
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all border shadow-lg ${
                  ringLightActive
                    ? 'bg-amber-500 text-stone-950 border-amber-300 font-bold'
                    : 'bg-black/60 text-white border-white/20'
                }`}
                title="Studio Ring Light Filter"
              >
                <Sun className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setBeautyFilterActive((prev) => !prev)}
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all border shadow-lg ${
                  beautyFilterActive
                    ? 'bg-rose-600 text-white border-rose-400'
                    : 'bg-black/60 text-white border-white/20'
                }`}
                title="Snapchat Beauty Glow Filter"
              >
                <Sparkles className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsSplitMode((prev) => !prev)}
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all border shadow-lg ${
                  isSplitMode
                    ? 'bg-rose-600 text-white border-rose-400'
                    : 'bg-black/60 text-white border-white/20'
                }`}
                title="Before / After Split Screen"
              >
                <Split className="w-4 h-4" />
              </button>

              {useCamera && isFaceDetected && (
                <button
                  type="button"
                  onClick={() => setShowMeshWireframe((prev) => !prev)}
                  className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all border shadow-lg ${
                    showMeshWireframe
                      ? 'bg-sky-500 text-white border-sky-300'
                      : 'bg-black/60 text-white border-white/20'
                  }`}
                  title="Toggle 468 Landmark Mesh"
                >
                  <Layers className="w-4 h-4" />
                </button>
              )}

              {useCamera ? (
                <button
                  type="button"
                  onClick={switchToModel}
                  className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-all border border-white/20 shadow-lg"
                  title="Switch to HD Beauty Models"
                >
                  <User className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => requestCameraAccess()}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-pink-600 text-white flex items-center justify-center shadow-lg animate-pulse"
                  title="Return to Camera"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 4. SNAPCHAT BOTTOM AR HUD OVERLAY */}
          <div className="absolute bottom-0 inset-x-0 p-4 pb-6 z-40 flex flex-col items-center gap-3 bg-gradient-to-t from-black/95 via-black/75 to-transparent pointer-events-none">
            {/* CATEGORY / MODE SELECTOR (LIPS vs FOUNDATION vs FULL GLAM) */}
            <div className="pointer-events-auto flex items-center p-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-xs shadow-xl">
              <button
                type="button"
                onClick={() => setActiveMode('foundation')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMode === 'foundation'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span>🧴 Foundation</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('lips')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMode === 'lips'
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span>💄 Lip Color</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('fullGlam')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMode === 'fullGlam'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span>👑 Full Look</span>
              </button>
            </div>

            {/* Active Shade & Undertone Chip */}
            <div className="pointer-events-auto flex items-center gap-2 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs shadow-xl animate-in zoom-in-95">
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                style={{
                  backgroundColor:
                    activeMode === 'foundation' ? activeFoundationShade.hex : activeLipShade.hex,
                }}
              />
              <span className="font-bold text-xs">
                {activeMode === 'foundation' ? activeFoundationShade.name : activeLipShade.name}
              </span>
              <span className="text-[10px] text-amber-300 font-mono font-semibold uppercase">
                {activeMode === 'foundation'
                  ? `${activeFoundationShade.undertone} • ${activeFoundationShade.depth}`
                  : activeLipShade.code || lipFinish}
              </span>
            </div>

            {/* Formula / Coverage Switcher */}
            <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto py-0.5">
              {activeMode === 'foundation' ? (
                <>
                  <span className="text-[10px] text-stone-400 font-bold uppercase mr-1">Coverage:</span>
                  {[
                    { label: 'Sheer Tint', val: 40 },
                    { label: 'Medium Build', val: 65 },
                    { label: 'Full Matte', val: 85 },
                  ].map((cov) => (
                    <button
                      key={cov.label}
                      type="button"
                      onClick={() => setCoverageIntensity(cov.val)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                        coverageIntensity === cov.val
                          ? 'bg-white text-stone-950 font-bold shadow-md'
                          : 'bg-black/60 text-stone-300 border border-white/15 hover:bg-black/80'
                      }`}
                    >
                      {cov.label}
                    </button>
                  ))}
                </>
              ) : (
                (['gloss', 'matte', 'satin', 'tint'] as LipFinishType[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setLipFinish(f)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                      lipFinish === f
                        ? 'bg-white text-stone-950 shadow-lg scale-105'
                        : 'bg-black/60 text-stone-300 border border-white/15 hover:bg-black/80'
                    }`}
                  >
                    {f}
                  </button>
                ))
              )}
            </div>

            {/* SNAPCHAT HORIZONTAL LENS CAROUSEL */}
            <div className="pointer-events-auto w-full flex items-center justify-center gap-3.5 overflow-x-auto py-1 px-4 scrollbar-none">
              {activeMode === 'foundation'
                ? currentProductFoundationShades.map((shade, idx) => {
                    const isSelected = selectedFoundationShadeIndex === idx;
                    return (
                      <button
                        key={shade.name}
                        type="button"
                        onClick={() => setSelectedFoundationShadeIndex(idx)}
                        className="group relative flex flex-col items-center shrink-0 transition-transform active:scale-95"
                      >
                        <div
                          className={`relative rounded-full transition-all duration-200 flex items-center justify-center ${
                            isSelected
                              ? 'w-14 h-14 ring-4 ring-amber-400 ring-offset-2 ring-offset-black scale-110 shadow-[0_0_20px_rgba(251,191,36,0.7)]'
                              : 'w-11 h-11 border-2 border-white/40 opacity-85 hover:opacity-100 hover:scale-105'
                          }`}
                          style={{ backgroundColor: shade.hex }}
                        >
                          <span className="text-[10px] font-mono font-bold text-stone-900 drop-shadow-xs">
                            {shade.code}
                          </span>
                        </div>
                      </button>
                    );
                  })
                : currentProductLipShades.map((shade, idx) => {
                    const isSelected = selectedLipShadeIndex === idx;
                    return (
                      <button
                        key={shade.name}
                        type="button"
                        onClick={() => setSelectedLipShadeIndex(idx)}
                        className="group relative flex flex-col items-center shrink-0 transition-transform active:scale-95"
                      >
                        <div
                          className={`relative rounded-full transition-all duration-200 flex items-center justify-center ${
                            isSelected
                              ? 'w-14 h-14 ring-4 ring-white ring-offset-2 ring-offset-black scale-110 shadow-[0_0_20px_rgba(255,255,255,0.7)]'
                              : 'w-11 h-11 border-2 border-white/40 opacity-85 hover:opacity-100 hover:scale-105'
                          }`}
                          style={{ backgroundColor: shade.hex }}
                        >
                          {isSelected && (
                            <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs animate-pulse" />
                          )}
                        </div>
                      </button>
                    );
                  })}
            </div>

            {/* SNAPCHAT SHUTTER BUTTON & BOTTOM BAR */}
            <div className="pointer-events-auto flex items-center justify-between w-full max-w-sm px-2 pt-1">
              <button
                type="button"
                onClick={() => setShowProductDrawer((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-xs transition-all text-left shadow-lg"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-rose-300" />
                <div className="min-w-0 max-w-[110px]">
                  <span className="block text-[10px] font-bold text-rose-300 uppercase leading-none truncate">
                    {selectedProduct.brand}
                  </span>
                  <span className="block text-[11px] font-semibold text-white truncate">
                    ₹{lowestOffer.price}
                  </span>
                </div>
                <ChevronUp className={`w-3.5 h-3.5 text-stone-300 transition-transform ${showProductDrawer ? 'rotate-180' : ''}`} />
              </button>

              {/* SNAPCHAT SHUTTER TRIGGER */}
              <button
                type="button"
                onClick={handleSnapShutter}
                className="group relative w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 shadow-2xl transition-transform active:scale-90"
                title="Snap Look"
              >
                <div className="w-full h-full rounded-full bg-white transition-all group-hover:scale-95 group-active:scale-90 shadow-inner flex items-center justify-center">
                  <Camera className="w-6 h-6 text-stone-900" />
                </div>
              </button>

              <a
                href={lowestOffer.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-lg"
              >
                <span>Buy</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* 5. SLIDE-UP PRODUCT SELECTOR DRAWER */}
        {showProductDrawer && (
          <div className="absolute inset-x-0 bottom-0 z-50 bg-stone-950/95 border-t border-white/20 rounded-t-3xl p-5 text-white max-h-[72%] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-rose-400" />
                <h3 className="font-serif font-bold text-sm text-white">
                  Beauty Catalog Lenses
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProductDrawer(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 pb-3 overflow-x-auto text-[11px] font-bold">
              {['All', 'Foundations', 'Lipsticks', 'Skincare'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setDrawerCategoryFilter(tab)}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    drawerCategoryFilter === tab
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white/10 text-stone-300 hover:bg-white/20'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-2.5">
              {drawerProducts.map((p) => {
                const isSelected = p.id === selectedProduct.id;
                const inStock = p.offers.filter((o) => o.inStock);
                const lowest = inStock.length > 0
                  ? inStock.reduce((min, o) => (o.price < min.price ? o : min), inStock[0])
                  : p.offers[0];

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedProduct(p);
                      const isFound =
                        p.category === 'Makeup' || p.title.toLowerCase().includes('foundation');
                      if (isFound) {
                        setActiveMode('foundation');
                        setSelectedFoundationShadeIndex(0);
                      } else {
                        setActiveMode('lips');
                        setSelectedLipShadeIndex(0);
                      }
                      setShowProductDrawer(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-950/40 ring-1 ring-rose-500 shadow-md'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.imageURL}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-contain rounded-xl bg-white p-1 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-rose-400 uppercase block">
                          {p.brand}
                        </span>
                        <span className="text-xs font-semibold text-white truncate block">
                          {p.title}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-white font-mono block">
                        ₹{lowest.price}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold block">
                        on {lowest.storeName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. SNAPSHOT PREVIEW CARD DIALOG (SNAPCHAT SAVED LOOK) */}
        {capturedSnapshot && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95">
            <div className="bg-stone-900 border border-white/20 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <h3 className="font-serif font-bold text-sm">Snap Look Captured!</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCapturedSnapshot(null)}
                  className="p-1 text-stone-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/15 aspect-[3/4] bg-black">
                <img src={capturedSnapshot} alt="Captured Look" className="w-full h-full object-cover" />
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-white">{selectedProduct.title}</div>
                <div className="text-rose-400 font-semibold">
                  {activeMode === 'foundation'
                    ? `Foundation: ${activeFoundationShade.name} (${activeFoundationShade.code})`
                    : `Lipstick: ${activeLipShade.name}`}
                </div>
                <div className="text-emerald-400 font-mono">
                  Best: ₹{lowestOffer.price} on {lowestOffer.storeName} ({lowestOffer.discountPercent}% OFF)
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={capturedSnapshot}
                  download={`skinora-snap-${(activeMode === 'foundation' ? activeFoundationShade.name : activeLipShade.name)
                    .toLowerCase()
                    .replace(/\s+/g, '-')}.png`}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Save Snap</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="py-2.5 px-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied' : 'Share'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

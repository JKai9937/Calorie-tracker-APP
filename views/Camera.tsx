import React, { useRef, useState, useEffect } from 'react';
import { AppView } from '../types';
import { analyzeFoodImage } from '../services/geminiService';

interface CameraProps {
  onCapture: (image: string, analysisPromise: Promise<any>) => void;
  onClose: () => void;
  mode?: 'food' | 'body';
}

export const Camera: React.FC<CameraProps> = ({ onCapture, onClose, mode = 'food' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  const startCamera = async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.warn("Camera access denied.", err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  // Helper to resize image to prevent API payload errors
  const resizeAndProcess = (originalBase64: string) => {
    const img = new Image();
    img.onload = () => {
      // Optimization: Reduced from 1024 to 640 to speed up upload/analysis significantly
      const MAX_DIM = 640; 
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        }
      } else {
        if (height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }
      }

      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;
      const ctx = offscreenCanvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Optimization: Reduced quality from 0.8 to 0.5 for faster transmission
      const resizedBase64 = offscreenCanvas.toDataURL('image/jpeg', 0.5);
      
      setIsAnalyzing(true);
      const analysisPromise = mode === 'food' ? analyzeFoodImage(resizedBase64) : Promise.resolve(null);
      onCapture(resizedBase64, analysisPromise);
    };
    img.src = originalBase64;
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => resizeAndProcess(reader.result as string);
      reader.readAsDataURL(blob);
    } catch (error) {
      alert("无法加载图片链接。请确保图片允许跨域访问。");
      setIsAnalyzing(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      // Capture at video's natural size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        if (facingMode === 'user') {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        resizeAndProcess(canvas.toDataURL('image/jpeg'));
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-black overflow-hidden font-display">
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${cameraActive ? 'opacity-100' : 'opacity-0'} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
      ></video>
      <canvas ref={canvasRef} className="hidden"></canvas>

      <div className="relative z-20 flex flex-col h-full pointer-events-none">
        <div className="flex items-center justify-between p-6 pointer-events-auto pt-[env(safe-area-inset-top)]">
          <button onClick={onClose} className="text-white active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-3xl drop-shadow-md">close</span>
          </button>
          <div className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  {mode === 'food' ? 'Food Scanner' : 'Body Tracker'}
              </span>
          </div>
          <button onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')} className="text-white active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-3xl drop-shadow-md">cameraswitch</span>
          </button>
        </div>

        <div className="flex-1 relative flex items-center justify-center">
            <div className="w-64 h-64 border border-white/20 relative">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white"></div>
            </div>
        </div>

        {showUrlInput && (
            <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 pointer-events-auto">
                <form onSubmit={handleUrlSubmit} className="w-full flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Hot-link Image URL</span>
                        <input 
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/food.jpg"
                            className="w-full bg-white/5 border border-white/20 p-4 font-bold text-white focus:border-white outline-none rounded-none"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setShowUrlInput(false)} className="flex-1 h-14 border border-white/20 text-white font-bold uppercase tracking-widest text-xs">Cancel</button>
                        <button type="submit" className="flex-1 h-14 bg-white text-black font-black uppercase tracking-widest text-xs">Analyze</button>
                    </div>
                </form>
            </div>
        )}

        <div className="pointer-events-auto bg-black/40 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom)] pt-8 px-8">
          <div className="flex items-center justify-between max-w-xs mx-auto mb-8">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1 text-white opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-2xl">photo_library</span>
              <span className="text-[8px] font-black uppercase tracking-widest">Library</span>
            </button>

            <button 
              onClick={takePhoto}
              disabled={isAnalyzing}
              className="relative size-20 flex items-center justify-center group"
            >
              <div className="absolute inset-0 rounded-full border-2 border-white group-active:scale-90 transition-transform"></div>
              <div className="size-16 rounded-full bg-white group-active:scale-95 transition-transform"></div>
              {isAnalyzing && (
                  <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              )}
            </button>

            <button 
              onClick={() => setShowUrlInput(true)}
              className="flex flex-col items-center gap-1 text-white opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-2xl">link</span>
              <span className="text-[8px] font-black uppercase tracking-widest">Hot-link</span>
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => resizeAndProcess(ev.target?.result as string);
                    reader.readAsDataURL(file);
                }
            }}
          />
        </div>
      </div>
    </div>
  );
};
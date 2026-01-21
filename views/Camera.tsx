import React, { useRef, useState, useEffect } from 'react';
import { AppView } from '../types';
import { analyzeFoodImage } from '../services/geminiService';

interface CameraProps {
  onCapture: (image: string, analysisPromise: Promise<any>) => void;
  onClose: () => void;
  mode?: 'food' | 'body'; // Support different modes if needed logic differs, primarily UI context
}

export const Camera: React.FC<CameraProps> = ({ onCapture, onClose, mode = 'food' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]); // Restart when facingMode changes

  const startCamera = async () => {
    stopCamera(); // Ensure previous stream is stopped
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: facingMode } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.warn("Camera access denied or unavailable, using file input fallback.", err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Mirror the context if using front camera for natural feel
      const context = canvas.getContext('2d');
      if (context) {
        if (facingMode === 'user') {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
        processImage(base64);
      }
    } else {
      // Fallback if camera didn't init
      triggerFileInput();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = (base64: string) => {
    setIsAnalyzing(true);
    // If mode is body, we might skip API analysis, but passing a dummy promise or valid one is fine
    // The App.tsx handles the logic based on mode.
    const analysisPromise = mode === 'food' ? analyzeFoodImage(base64) : Promise.resolve(null);
    onCapture(base64, analysisPromise);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-black overflow-hidden font-display">
      {/* Real Camera Feed */}
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-0'} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
      ></video>
      <canvas ref={canvasRef} className="hidden"></canvas>

      {/* Fallback Background if no camera */}
      {!cameraActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
          <span className="text-gray-500">Camera Unavailable</span>
        </div>
      )}

      {/* Overlays */}
      <div className="relative z-10 flex flex-col h-full justify-between pointer-events-none">
        {/* Top Controls - TRANSPARENT BACKGROUND */}
        <div className="flex items-center justify-between p-6 pt-12 pointer-events-auto">
          <button 
            onClick={onClose}
            className="flex items-center justify-center size-10 text-white active:opacity-70"
          >
            <span className="material-symbols-outlined text-3xl drop-shadow-md">close</span>
          </button>
          
          {/* Mode Indicator */}
          <div className="px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  {mode === 'food' ? 'Food Scanner' : 'Body Tracker'}
              </span>
          </div>

          <button className="flex items-center justify-center size-10 text-white active:opacity-70">
            <span className="material-symbols-outlined text-3xl drop-shadow-md">flash_off</span>
          </button>
        </div>

        {/* Viewfinder Grid (Decoration) */}
        <div className="absolute inset-0 pointer-events-none flex flex-col opacity-30">
          <div className="flex-1 border-b border-white/20"></div>
          <div className="flex-1 border-b border-white/20"></div>
          <div className="flex-1"></div>
          <div className="absolute inset-0 flex">
            <div className="flex-1 border-r border-white/20"></div>
            <div className="flex-1 border-r border-white/20"></div>
            <div className="flex-1"></div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex flex-col w-full pointer-events-auto bg-black/20 backdrop-blur-md pb-12 pt-8">
          {isAnalyzing && (
             <div className="absolute top-[-50px] left-0 w-full flex justify-center">
               <div className="bg-yellow-400 text-black px-4 py-1 font-bold text-xs uppercase tracking-widest animate-pulse">
                 Processing...
               </div>
             </div>
          )}

          <div className="flex items-center justify-around px-8 relative">
            {/* Gallery Button - Transparent, Icon Only */}
            <button 
              onClick={triggerFileInput}
              className="flex shrink-0 items-center justify-center size-12 text-white active:scale-95 transition-transform opacity-90 hover:opacity-100"
            >
              <span className="material-symbols-outlined text-[32px] drop-shadow-md">photo_library</span>
            </button>
            
            {/* iPhone Style Shutter Button 
                Structure:
                - Outer: w-20 h-20, border-4 white (The Ring), bg-black (The Gap)
                - Inner: w-16 h-16, bg-white (The Circle)
            */}
            <button 
              onClick={takePhoto}
              disabled={isAnalyzing}
              className="group relative flex shrink-0 items-center justify-center size-20 rounded-full bg-black border-[4px] border-white outline-none transition-transform active:scale-95"
              style={{ borderRadius: '50%' }}
            >
              <div 
                className="size-16 rounded-full bg-white transition-all duration-150 group-active:scale-90"
                style={{ borderRadius: '50%' }}
              ></div>
            </button>

            {/* Flip Camera Button */}
             <button 
              onClick={toggleCamera}
              className="flex shrink-0 items-center justify-center size-12 text-white active:scale-95 transition-transform opacity-90 hover:opacity-100"
            >
              <span className="material-symbols-outlined text-[32px] drop-shadow-md">cameraswitch</span>
            </button>

            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
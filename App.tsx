import React, { useState, useEffect } from 'react';
import { NavBar } from './components/NavBar';
import { Setup } from './views/Setup';
import { Home } from './views/Home';
import { Camera } from './views/Camera';
import { Result } from './views/Result';
import { Profile } from './views/Profile';
import { Input } from './views/Input';
import { Saved } from './views/Saved';
import { Settings } from './views/Settings';
import { BodyTracker } from './views/BodyTracker';
import { AppView, DailyStats, FoodItem, UserProfile, Macros, BodyLog } from './types';
import { analyzeFoodImage } from './services/geminiService';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SETUP);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // State for analysis flow
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodItem | null>(null);
  
  // Camera Mode State
  const [cameraMode, setCameraMode] = useState<'food' | 'body'>('food');
  const [pendingBodyImage, setPendingBodyImage] = useState<string | null>(null);

  // Stats & Logs State
  const [stats, setStats] = useState<DailyStats>({
    currentCalories: 0,
    targetCalories: 2400,
    targetMacros: { protein: 150, carbs: 200, fat: 65 },
    logs: []
  });

  const [bodyLogs, setBodyLogs] = useState<BodyLog[]>([]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleSetupComplete = (newProfile: UserProfile, calculatedTarget: number, calculatedMacros: Macros) => {
    setProfile(newProfile);
    setStats(prev => ({ 
        ...prev, 
        targetCalories: calculatedTarget,
        targetMacros: calculatedMacros
    }));
    setCurrentView(AppView.HOME);
  };

  const handleUpdateProfile = (newProfile: UserProfile, newTarget: number, newMacros: Macros) => {
    setProfile(newProfile);
    setStats(prev => ({
        ...prev,
        targetCalories: newTarget,
        targetMacros: newMacros
    }));
  };

  const openCamera = (mode: 'food' | 'body') => {
      setCameraMode(mode);
      setCurrentView(AppView.CAMERA);
  };

  // REFACTORED: Handle capture and analysis in App controller
  const handleCapture = async (image: string) => {
    setCapturedImage(image);
    
    if (cameraMode === 'food') {
        // 1. Immediately switch view
        setCurrentView(AppView.RESULT);
        // 2. Set Loading State
        setIsAnalyzing(true);
        setAnalysisResult(null);

        // 3. Trigger API Call
        try {
            const result = await analyzeFoodImage(image);
            setAnalysisResult(result);
        } catch (e) {
            console.error(e);
            // Fallback error object
            setAnalysisResult({
                name: "System Error",
                calories: 0,
                macros: { protein:0, carbs:0, fat:0 },
                confidence: 0,
                evaluation: "Internal processing error.",
                timestamp: new Date()
            });
        } finally {
            setIsAnalyzing(false);
        }

    } else {
        // Body Mode
        setPendingBodyImage(image);
        setCurrentView(AppView.BODY_TRACKER);
    }
  };

  const handleConfirmLog = (item: FoodItem) => {
    setStats(prev => ({
      ...prev,
      currentCalories: prev.currentCalories + item.calories,
      logs: [...prev.logs, item]
    }));
    setCurrentView(AppView.HOME);
  };

  const handleAddBodyLog = (image: string, note: string) => {
      const newLog: BodyLog = {
          id: Date.now().toString(),
          date: new Date(),
          imageUrl: image,
          note: note
      };
      setBodyLogs(prev => [...prev, newLog]);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.SETUP:
        return <Setup onComplete={handleSetupComplete} />;
      case AppView.HOME:
        return <Home stats={stats} onChangeView={(v) => v === AppView.CAMERA ? openCamera('food') : setCurrentView(v)} installPrompt={deferredPrompt} onInstall={handleInstall} />;
      case AppView.CAMERA:
        return <Camera onCapture={handleCapture} onClose={() => setCurrentView(cameraMode === 'body' ? AppView.BODY_TRACKER : AppView.HOME)} mode={cameraMode} />;
      case AppView.RESULT:
        return (
          <Result 
            image={capturedImage} 
            result={analysisResult}
            isLoading={isAnalyzing}
            targetCalories={stats.targetCalories}
            onConfirm={handleConfirmLog}
            onRetake={() => openCamera('food')}
          />
        );
      case AppView.INPUT:
        return <Input onAdd={handleConfirmLog} onCancel={() => setCurrentView(AppView.HOME)} />;
      case AppView.SAVED:
        return <Saved logs={stats.logs} onBack={() => setCurrentView(AppView.HOME)} />;
      case AppView.PROFILE:
        return <Profile profile={profile} logs={stats.logs} />;
      case AppView.BODY_TRACKER:
        return (
            <BodyTracker 
                logs={bodyLogs} 
                onAddLog={handleAddBodyLog} 
                onOpenCamera={() => openCamera('body')}
                pendingImage={pendingBodyImage}
                onClearPending={() => setPendingBodyImage(null)}
            />
        );
      case AppView.SETTINGS:
        return <Settings profile={profile} onUpdateProfile={handleUpdateProfile} />;
      default:
        return <Home stats={stats} onChangeView={setCurrentView} />;
    }
  };

  const fullScreenViews = [AppView.SETUP, AppView.CAMERA, AppView.RESULT, AppView.INPUT, AppView.SAVED];

  if (fullScreenViews.includes(currentView)) {
    return renderView();
  }

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-black overflow-hidden border-x border-white/10 shadow-2xl">
      <main className="flex-grow overflow-y-auto bg-black scrollbar-hide flex flex-col relative">
        <div className={currentView === AppView.HOME ? 'pt-[env(safe-area-inset-top)]' : ''}>
           {renderView()}
        </div>
      </main>
      <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} className="bg-black border-t border-white/10">
        <NavBar currentView={currentView} onChangeView={setCurrentView} />
      </div>
    </div>
  );
}
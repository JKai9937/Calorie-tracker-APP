import React, { useState } from 'react';
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

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SETUP);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // State for the flow: Capture -> Analyze -> Confirm
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [analysisPromise, setAnalysisPromise] = useState<Promise<FoodItem> | null>(null);
  
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

  const handleCapture = (image: string, promise: Promise<FoodItem>) => {
    setCapturedImage(image);
    
    if (cameraMode === 'food') {
        setAnalysisPromise(promise);
        setCurrentView(AppView.RESULT);
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
        return <Home stats={stats} onChangeView={(v) => v === AppView.CAMERA ? openCamera('food') : setCurrentView(v)} />;
      case AppView.CAMERA:
        return <Camera onCapture={handleCapture} onClose={() => setCurrentView(cameraMode === 'body' ? AppView.BODY_TRACKER : AppView.HOME)} mode={cameraMode} />;
      case AppView.RESULT:
        return (
          <Result 
            image={capturedImage} 
            analysisPromise={analysisPromise!} 
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

  // Views that hide the layout wrapper
  const fullScreenViews = [AppView.SETUP, AppView.CAMERA, AppView.RESULT, AppView.INPUT, AppView.SAVED];

  if (fullScreenViews.includes(currentView)) {
    return renderView();
  }

  return (
    // Use h-[100dvh] to fix mobile browser address bar height issues
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-industrial-bg overflow-hidden shadow-2xl border-x border-[#d4d4d4]">
      {/* Header - Only visible on non-fullscreen views like Home/Profile */}
      {currentView !== AppView.HOME && currentView !== AppView.SETTINGS && currentView !== AppView.BODY_TRACKER && (
         <header className="flex-none px-5 py-6 bg-industrial-bg flex items-center justify-between border-b border-[#E5E5E5]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-black text-3xl">grid_view</span>
            <h1 className="text-xl font-extrabold tracking-tighter uppercase leading-none text-black">INTAKE // TRACKER</h1>
          </div>
          <div className="flex items-center">
            <span className="text-xs font-medium text-industrial-text tracking-widest">V.1.0</span>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto bg-industrial-bg scrollbar-hide flex flex-col relative">
        {renderView()}
      </main>

      {/* Navbar */}
      <NavBar currentView={currentView} onChangeView={setCurrentView} />
    </div>
  );
}
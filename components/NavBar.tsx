import React from 'react';
import { AppView } from '../types';

interface NavBarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ currentView, onChangeView }) => {
  const getLinkClass = (view: AppView) => {
    const isActive = currentView === view;
    return `group flex flex-col items-center justify-center w-16 h-14 gap-1 ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-100'} transition-opacity cursor-pointer`;
  };

  const getIndicatorClass = (view: AppView) => {
    const isActive = currentView === view;
    return `h-[2px] bg-black mt-1 transition-all duration-300 ${isActive ? 'w-4' : 'w-0 group-hover:w-4'}`;
  };

  return (
    <nav className="flex-none bg-industrial-bg border-t border-[#D4D4D4] pb-6 pt-2 z-50">
      <div className="flex justify-around items-center px-2">
        <div className={getLinkClass(AppView.HOME)} onClick={() => onChangeView(AppView.HOME)}>
          <span className={`material-symbols-outlined text-black text-2xl ${currentView === AppView.HOME ? 'filled' : ''}`}>home</span>
          <div className={getIndicatorClass(AppView.HOME)}></div>
        </div>

        <div className={getLinkClass(AppView.PROFILE)} onClick={() => onChangeView(AppView.PROFILE)}>
          <span className={`material-symbols-outlined text-black text-2xl ${currentView === AppView.PROFILE ? 'filled' : ''}`}>bar_chart</span>
          <div className={getIndicatorClass(AppView.PROFILE)}></div>
        </div>

        <div className={getLinkClass(AppView.BODY_TRACKER)} onClick={() => onChangeView(AppView.BODY_TRACKER)}>
          <span className={`material-symbols-outlined text-black text-2xl ${currentView === AppView.BODY_TRACKER ? 'filled' : ''}`}>accessibility_new</span>
          <div className={getIndicatorClass(AppView.BODY_TRACKER)}></div>
        </div>

        <div className={getLinkClass(AppView.SETTINGS)} onClick={() => onChangeView(AppView.SETTINGS)}>
          <span className={`material-symbols-outlined text-black text-2xl ${currentView === AppView.SETTINGS ? 'filled' : ''}`}>settings</span>
          <div className={getIndicatorClass(AppView.SETTINGS)}></div>
        </div>
      </div>
    </nav>
  );
};
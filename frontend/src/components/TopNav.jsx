import React from 'react';
import { Settings, Layers } from 'lucide-react';

const TopNav = ({ onOpenSettings, showSettings }) => {
  return (
    <div className="topnav h-16 border-b flex items-center justify-between px-6 shrink-0 shadow-sm">
      <div className="flex items-center space-x-3">
        <Layers className="text-yellow-400" size={36} />
        <h1 className="font-semibold tracking-wide text-base">PDF TOOLKIT</h1>
      </div>
      <button
        id="btn-open-settings"
        onClick={onOpenSettings}
        title="Settings"
        className={`group flex items-center gap-2 transition-colors duration-150 px-3 py-2.5 rounded-md
          ${showSettings ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
      >
        <span
          className="overflow-hidden max-w-0 group-hover:max-w-[80px] transition-all duration-300 ease-in-out text-sm font-medium whitespace-nowrap"
        >
          Settings
        </span>
        <Settings size={24} />
      </button>
    </div>
  );
};

export default TopNav;

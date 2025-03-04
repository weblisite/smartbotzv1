import { useState } from 'react';
import { FiMonitor, FiTablet, FiSmartphone } from 'react-icons/fi';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DeviceSwitcherProps {
  currentDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
}

export default function DeviceSwitcher({ currentDevice, onDeviceChange }: DeviceSwitcherProps) {
  return (
    <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm rounded-lg p-1">
      <button
        onClick={() => onDeviceChange('desktop')}
        className={`p-2 rounded-md transition-colors ${
          currentDevice === 'desktop'
            ? 'bg-cyan-500/20 text-cyan-400'
            : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50'
        }`}
        title="Desktop view"
      >
        <FiMonitor className="w-5 h-5" />
      </button>
      <button
        onClick={() => onDeviceChange('tablet')}
        className={`p-2 rounded-md transition-colors ${
          currentDevice === 'tablet'
            ? 'bg-cyan-500/20 text-cyan-400'
            : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50'
        }`}
        title="Tablet view"
      >
        <FiTablet className="w-5 h-5" />
      </button>
      <button
        onClick={() => onDeviceChange('mobile')}
        className={`p-2 rounded-md transition-colors ${
          currentDevice === 'mobile'
            ? 'bg-cyan-500/20 text-cyan-400'
            : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50'
        }`}
        title="Mobile view"
      >
        <FiSmartphone className="w-5 h-5" />
      </button>
    </div>
  );
} 
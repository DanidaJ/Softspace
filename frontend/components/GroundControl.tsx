import React, { useMemo, useState } from 'react';
import { BreathingExercise } from './BreathingExercise';
import { GroundingExercise } from './GroundingExercise';
import { REGION_OPTIONS, getEmergencyResources, getUserRegionCode } from '../utils/emergencyResources';

export const GroundControl: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'menu' | 'breathe' | 'ground' | 'crisis'>('menu');
  const [region, setRegion] = useState<string>('GLOBAL');
  const [detectedRegion, setDetectedRegion] = useState<string | undefined>(undefined);

  // Listen for external trigger to open crisis resources
  React.useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setMode('crisis');
    };
    window.addEventListener('openGroundControl', handleOpen);
    return () => window.removeEventListener('openGroundControl', handleOpen);
  }, []);

  // Auto-detect region from browser locale so we can show local helplines first.
  React.useEffect(() => {
    const inferred = getUserRegionCode();
    if (inferred) {
      setRegion(inferred);
      setDetectedRegion(inferred);
    }
  }, []);

  const selectedResources = useMemo(() => getEmergencyResources(region), [region]);
  const globalResources = useMemo(() => getEmergencyResources('GLOBAL'), []);
  const emergencyNumber = selectedResources.emergencyNumber || 'your local emergency number';
  const emergencyHref = selectedResources.emergencyNumber
    ? `tel:${selectedResources.emergencyNumber.replace(/[^+\d]/g, '')}`
    : undefined;

  const handleClose = () => {
    setIsOpen(false);
    setMode('menu');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]"
        title="SOS - Ground Control"
      >
        <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">🚨</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#0B1026] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚨</span>
          <div>
            <h2 className="text-xl font-bold text-white">Ground Control</h2>
            <p className="text-sm text-gray-400">You are safe. We are here.</p>
          </div>
        </div>
        <button 
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        {mode === 'menu' && (
          <div className="grid gap-6 w-full max-w-md">
            {/* Crisis Resources - TOP PRIORITY */}
            <button
              onClick={() => setMode('crisis')}
              className="p-6 rounded-2xl bg-gradient-to-r from-red-600/30 to-red-700/30 border-2 border-red-500/50 hover:border-red-400 hover:bg-red-600/40 transition-all group text-left shadow-lg"
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl group-hover:scale-110 transition-transform">☎️</span>
                <h3 className="text-xl font-bold text-white">Need Immediate Help?</h3>
              </div>
              <p className="text-red-100 text-sm font-medium">Crisis hotlines & emergency resources</p>
            </button>

            <button
              onClick={() => setMode('breathe')}
              className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-600/30 transition-all group text-left"
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl group-hover:scale-110 transition-transform">🌬️</span>
                <h3 className="text-xl font-bold text-white">Breathe</h3>
              </div>
              <p className="text-blue-200 text-sm">4-7-8 rhythmic breathing to slow your heart rate</p>
            </button>

            <button
              onClick={() => setMode('ground')}
              className="p-6 rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-600/30 transition-all group text-left"
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl group-hover:scale-110 transition-transform">🦶</span>
                <h3 className="text-xl font-bold text-white">Ground</h3>
              </div>
              <p className="text-purple-200 text-sm">5-4-3-2-1 technique to reconnect with your senses</p>
            </button>
          </div>
        )}

        {mode === 'crisis' && (
          <div className="w-full max-w-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">You Don't Have to Face This Alone</h2>
                <p className="text-gray-400">Showing resources for {selectedResources.label}. Professional help is available 24/7.</p>
                {detectedRegion && detectedRegion !== region && (
                  <p className="text-xs text-gray-500 mt-1">Detected {detectedRegion}; you can switch back any time.</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {REGION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#0B1026] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                {detectedRegion && detectedRegion !== region && (
                  <button
                    onClick={() => setRegion(detectedRegion)}
                    className="text-xs text-red-200 underline hover:text-red-100"
                  >
                    Use detected
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 bg-red-900/30 border-2 border-red-500/50 rounded-xl">
              <h4 className="font-bold text-white mb-2 text-lg">🚨 Immediate Danger?</h4>
              <p className="text-sm text-red-100 mb-3">
                If you or someone else is in immediate danger, call emergency services right away.
              </p>
              {emergencyHref ? (
                <a
                  href={emergencyHref}
                  className="block w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-center transition-colors"
                >
                  📞 Call {emergencyNumber}
                </a>
              ) : (
                <div className="block w-full px-4 py-3 bg-red-600/50 text-white font-bold rounded-lg text-center">
                  Call your local emergency number
                </div>
              )}
            </div>

            <div className="space-y-4">
              {selectedResources.resources.map((resource) => (
                <div
                  key={`${selectedResources.regionCode}-${resource.name}`}
                  className="p-5 bg-white/5 border border-white/10 rounded-xl"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-bold text-white text-lg">{resource.name}</h4>
                      <p className="text-sm text-gray-300">{resource.description}</p>
                    </div>
                    {resource.availability && (
                      <span className="text-xs bg-white/10 text-white px-2 py-1 rounded border border-white/20">{resource.availability}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-3">
                    {resource.actions.map((action) => (
                      <a
                        key={action.label}
                        href={action.href}
                        target={action.kind === 'web' ? '_blank' : undefined}
                        rel={action.kind === 'web' ? 'noopener noreferrer' : undefined}
                        className="px-4 py-2 rounded-lg font-semibold text-sm bg-white/10 hover:bg-white/20 text-white transition-colors"
                      >
                        {action.label}
                      </a>
                    ))}
                  </div>

                  {resource.note && (
                    <p className="text-xs text-gray-400 mt-2">{resource.note}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">🌍 International fallback</h3>
              {globalResources.resources.map((resource) => (
                <div key={`global-${resource.name}`} className="p-5 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-bold text-white">{resource.name}</h4>
                      <p className="text-sm text-gray-300">{resource.description}</p>
                    </div>
                    {resource.availability && (
                      <span className="text-xs bg-white/10 text-white px-2 py-1 rounded border border-white/20">{resource.availability}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {resource.actions.map((action) => (
                      <a
                        key={action.label}
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg font-semibold text-sm bg-white/10 hover:bg-white/20 text-white transition-colors"
                      >
                        {action.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setMode('menu')} 
              className="mt-4 text-sm text-gray-400 hover:text-white w-full text-center py-2"
            >
              ← Back to Grounding Tools
            </button>
          </div>
        )}

        {mode === 'breathe' && (
          <div className="w-full max-w-lg">
            <BreathingExercise onComplete={() => setMode('menu')} />
            <button onClick={() => setMode('menu')} className="mt-8 text-sm text-gray-400 hover:text-white w-full text-center">
              ← Back to Menu
            </button>
          </div>
        )}

        {mode === 'ground' && (
          <div className="w-full max-w-lg">
            <GroundingExercise onComplete={() => setMode('menu')} />
            <button onClick={() => setMode('menu')} className="mt-8 text-sm text-gray-400 hover:text-white w-full text-center">
              ← Back to Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

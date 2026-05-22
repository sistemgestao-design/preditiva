import { useState } from 'react';
import type { StoryAlert } from '../types';

interface StoryBarProps {
  alerts: StoryAlert[];
}

export default function StoryBar({ alerts }: StoryBarProps) {
  const [selectedStory, setSelectedStory] = useState<StoryAlert | null>(null);

  const urgencyColors = {
    critical: 'from-red-500 via-orange-500 to-yellow-500',
    high: 'from-neon-green via-electric-blue to-neon-green',
    medium: 'from-electric-blue via-blue-400 to-electric-blue',
  };

  const urgencyBg = {
    critical: 'bg-red-500/10 border-red-500/30',
    high: 'bg-neon-green/10 border-neon-green/30',
    medium: 'bg-electric-blue/10 border-electric-blue/30',
  };

  return (
    <div className="relative">
      <div className="px-3 sm:px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            🔝 Termômetro do Dia
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-grafite-500 to-transparent" />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {alerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() => setSelectedStory(selectedStory?.id === alert.id ? null : alert)}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
            >
              <div className={`p-[2px] rounded-2xl bg-gradient-to-br ${urgencyColors[alert.urgency]} ${selectedStory?.id === alert.id ? 'opacity-50' : ''}`}>
                <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-2xl bg-grafite-800 flex items-center justify-center text-3xl group-hover:bg-grafite-700 transition-colors">
                  {alert.icon}
                </div>
              </div>
              <span className="text-xs text-gray-400 max-w-[80px] truncate">
                {alert.type === 'football' ? '⚽' : '🎰'} {alert.time}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedStory && (
        <div className={`mx-3 sm:mx-4 mb-3 p-3 sm:p-4 rounded-xl border ${urgencyBg[selectedStory.urgency]} animate-slide-in`}>
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl flex-shrink-0">{selectedStory.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">{selectedStory.title}</h3>
                {selectedStory.urgency === 'critical' && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full uppercase">
                    Urgente
                  </span>
                )}
              </div>
              <p className="text-base text-gray-300 mt-1">{selectedStory.description}</p>
              <span className="text-xs text-gray-500 mt-2 block">{selectedStory.time}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

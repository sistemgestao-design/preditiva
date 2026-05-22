import { useState } from 'react';
import type { StoryAlert } from '../types';

interface StoryBarProps {
  alerts: StoryAlert[];
}

const urgencyColors: Record<string, string> = {
  critical: 'from-red-500 to-orange-500',
  high: 'from-[#0284C7] to-[#0EA5E9]',
  medium: 'from-[#64748B] to-[#94A3B8]',
};

const urgencyBg: Record<string, string> = {
  critical: 'bg-red-50 border-red-200',
  high: 'bg-[#E0F2FE] border-[#BAE6FD]',
  medium: 'bg-[#F1F5F9] border-[#E2E8F0]',
};

export default function StoryBar({ alerts }: StoryBarProps) {
  const [selectedStory, setSelectedStory] = useState<StoryAlert | null>(null);

  return (
    <div className="relative">
      <div className="px-3 sm:px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-[#64748B] uppercase tracking-wider">
            🔝 Termômetro do Dia
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-[#E2E8F0] to-transparent" />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {alerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() => setSelectedStory(selectedStory?.id === alert.id ? null : alert)}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
            >
              <div className={`p-[2px] rounded-2xl bg-gradient-to-br ${urgencyColors[alert.urgency]} ${selectedStory?.id === alert.id ? 'opacity-50' : ''}`}>
                <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-2xl bg-white flex items-center justify-center text-3xl group-hover:bg-[#F8F9FA] transition-colors border border-[#E2E8F0]">
                  {alert.icon}
                </div>
              </div>
              <span className="text-xs text-[#64748B] max-w-[80px] truncate">
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
                <h3 className="font-bold text-[#0F172A] text-base">{selectedStory.title}</h3>
                {selectedStory.urgency === 'critical' && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase">
                    Urgente
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-[#475569] mt-1">{selectedStory.description}</p>
              <span className="text-xs text-[#94A3B8] mt-2 block">{selectedStory.time}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Bell, ChevronDown, ChevronUp } from 'lucide-react';
import type { FeedAlert } from '../types';

interface AlertFeedProps {
  alerts: FeedAlert[];
}

const importanceBorder: Record<string, string> = {
  high: 'border-l-emerald-500',
  medium: 'border-l-[#0284C7]',
  low: 'border-l-[#94A3B8]',
};

export default function AlertFeed({ alerts }: AlertFeedProps) {
  const [expanded, setExpanded] = useState(false);
  const [newAlertPulse, setNewAlertPulse] = useState(false);

  const visibleAlerts = expanded ? alerts : alerts.slice(0, 3);

  useEffect(() => {
    const interval = setInterval(() => {
      setNewAlertPulse(true);
      setTimeout(() => setNewAlertPulse(false), 2000);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className={`w-4 h-4 text-emerald-600 ${newAlertPulse ? 'animate-pulse-neon' : ''}`} />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
          <span className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
            Feed de Alertas em Tempo Real
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-600 font-medium">Ao Vivo</span>
        </div>
      </div>

      <div className="space-y-2">
        {visibleAlerts.map((alert, idx) => (
          <div
            key={alert.id}
            className={`bg-white rounded-xl border border-[#E2E8F0] border-l-2 ${importanceBorder[alert.importance]} p-3 transition-all hover:shadow-sm shadow-sm`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{alert.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#475569] leading-relaxed">{alert.message}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-[#94A3B8]">{alert.time}</span>
                  <span className="text-xs text-[#CBD5E1]">·</span>
                  <span className={`text-xs font-medium ${
                    alert.type === 'football' ? 'text-[#0284C7]' :
                    alert.type === 'arbitrage' ? 'text-[#B45309]' : 'text-purple-500'
                  }`}>
                    {alert.type === 'football' ? '⚽ Futebol' :
                     alert.type === 'arbitrage' ? '💰 Arbitragem' : '🎰 Loteria'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 py-2 flex items-center justify-center gap-1.5 text-sm text-[#0284C7] font-semibold hover:text-[#0369A1] transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              + {alerts.length - 3} alertas
            </>
          )}
        </button>
      )}
    </div>
  );
}

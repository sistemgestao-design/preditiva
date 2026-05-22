import { useState, useEffect } from 'react';
import { Bell, ChevronDown, ChevronUp } from 'lucide-react';
import type { FeedAlert } from '../types';

interface AlertFeedProps {
  alerts: FeedAlert[];
}

export default function AlertFeed({ alerts }: AlertFeedProps) {
  const [expanded, setExpanded] = useState(false);
  const [newAlertPulse, setNewAlertPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setNewAlertPulse((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const visibleAlerts = expanded ? alerts : alerts.slice(0, 3);

  const importanceBorder = {
    high: 'border-l-neon-green',
    medium: 'border-l-electric-blue',
    low: 'border-l-gray-600',
  };

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className={`w-4 h-4 text-neon-green ${newAlertPulse ? 'animate-pulse-neon' : ''}`} />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-neon-green rounded-full" />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Feed de Alertas em Tempo Real
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-neon-green/10 border border-neon-green/20">
          <div className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" />
          <span className="text-[10px] text-neon-green font-medium">Ao Vivo</span>
        </div>
      </div>

      <div className="space-y-2">
        {visibleAlerts.map((alert, idx) => (
          <div
            key={alert.id}
            className={`bg-grafite-800 rounded-xl border border-grafite-600 border-l-2 ${importanceBorder[alert.importance]} p-3 transition-all hover:bg-grafite-700`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">{alert.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 leading-relaxed">{alert.message}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-gray-500">{alert.time}</span>
                  <span className="text-[10px] text-gray-600">·</span>
                  <span className={`text-[10px] font-medium ${
                    alert.type === 'football' ? 'text-electric-blue' :
                    alert.type === 'arbitrage' ? 'text-gold' : 'text-purple-400'
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
          className="w-full mt-3 py-2 flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Ver mais {alerts.length - 3} alertas
            </>
          )}
        </button>
      )}
    </div>
  );
}

import { Radio, Database, AlertTriangle, Loader2 } from 'lucide-react';
import type { DataSource } from '../services/api';

interface DataStatusBarProps {
  source: DataSource;
  updatedAt: string;
  notice?: string;
  loading: boolean;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

const CONFIG: Record<DataSource, { label: string; classes: string; Icon: typeof Radio }> = {
  live: {
    label: 'Dados ao vivo',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Icon: Radio,
  },
  cache: {
    label: 'Dados recentes (cache)',
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
    Icon: Database,
  },
  fallback: {
    label: 'Modo demonstração',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: AlertTriangle,
  },
};

export default function DataStatusBar({ source, updatedAt, notice, loading }: DataStatusBarProps) {
  const cfg = CONFIG[source];
  const Icon = loading ? Loader2 : cfg.Icon;

  return (
    <div className="px-3 sm:px-4 pt-3">
      <div
        className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${cfg.classes}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <Icon className={`w-3.5 h-3.5 shrink-0 ${loading ? 'animate-spin' : source === 'live' ? 'animate-pulse' : ''}`} />
          <span className="truncate">{loading ? 'Carregando dados...' : notice ?? cfg.label}</span>
        </span>
        <span className="shrink-0 opacity-70">Atualizado {formatTime(updatedAt)}</span>
      </div>
    </div>
  );
}

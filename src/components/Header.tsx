import { Brain, Zap, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-grafite-900/95 backdrop-blur-md border-b border-grafite-600">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="w-8 h-8 text-electric-blue" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full animate-pulse-neon" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-neon-green to-electric-blue bg-clip-text text-transparent">
              TOP WORLD PREMIUM
            </h1>
            <p className="text-[10px] text-gray-500 tracking-widest uppercase">
              Inteligência Preditiva
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-grafite-700 border border-grafite-500">
            <Zap className="w-3.5 h-3.5 text-neon-green" />
            <span className="text-xs text-neon-green font-medium">IA Online</span>
          </div>
          <button className="p-2 rounded-lg hover:bg-grafite-700 transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
}

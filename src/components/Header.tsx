import { Brain, Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

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
          <button
            onClick={toggleTheme}
            className="relative p-2 rounded-xl bg-grafite-700 border border-grafite-500 hover:border-electric-blue/50 transition-all duration-300 group"
            title={theme === 'dark' ? 'Modo Dia' : 'Modo Noite'}
          >
            <div className="relative w-5 h-5">
              <Sun
                className={`w-5 h-5 text-gold absolute inset-0 transition-all duration-300 ${
                  theme === 'light'
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 rotate-90 scale-50'
                }`}
              />
              <Moon
                className={`w-5 h-5 text-electric-blue absolute inset-0 transition-all duration-300 ${
                  theme === 'dark'
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 -rotate-90 scale-50'
                }`}
              />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

import { Brain, Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-grafite-900/95 backdrop-blur-md border-b border-grafite-600">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-electric-blue" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-neon-green rounded-full animate-pulse-neon" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-neon-green to-electric-blue bg-clip-text text-transparent truncate">
              TOP WORLD PREMIUM
            </h1>
            <p className="text-[9px] sm:text-[10px] text-gray-500 tracking-widest uppercase">
              Inteligência Preditiva
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-grafite-700 border border-grafite-500">
            <Zap className="w-3.5 h-3.5 text-neon-green" />
            <span className="text-xs text-neon-green font-medium">IA Online</span>
          </div>
          <button
            onClick={toggleTheme}
            className="relative p-2.5 sm:p-2 rounded-xl bg-grafite-700 border border-grafite-500 hover:border-electric-blue/50 transition-all duration-300 group"
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

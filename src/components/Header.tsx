import { Brain, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-[#E0F2FE] text-[#0284C7] rounded-lg flex-shrink-0 dark:neon-border">
            <Brain className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#0284C7] uppercase">Sistema Preditivo</span>
            <h1 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
              TOP WORLD <span className="text-[#B45309]">PREMIUM</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 dark:neon-border-green uppercase tracking-wide">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            IA ONLINE <span className="hidden md:inline">[ACTIVE]</span>
          </span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] hover:bg-[#E2E8F0] transition-all"
            title={theme === 'light' ? 'Modo Noite' : 'Modo Dia'}
          >
            <div className="relative w-5 h-5">
              <Sun
                className={`w-5 h-5 text-[#D97706] absolute inset-0 transition-all duration-300 ${
                  theme === 'light'
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 rotate-90 scale-50'
                }`}
              />
              <Moon
                className={`w-5 h-5 text-[#0284C7] absolute inset-0 transition-all duration-300 ${
                  theme === 'dark'
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 -rotate-90 scale-50'
                }`}
              />
            </div>
          </button>
          <div className="h-8 w-8 rounded-full bg-[#E2E8F0] flex items-center justify-center font-bold text-xs text-[#64748B]">
            VIP
          </div>
        </div>
      </div>
    </header>
  );
}

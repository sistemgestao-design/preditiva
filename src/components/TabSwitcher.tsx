interface TabSwitcherProps {
  activeTab: 'football' | 'lottery';
  onTabChange: (tab: 'football' | 'lottery') => void;
}

export default function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="px-3 sm:px-4 py-2">
      <div className="flex bg-grafite-800 rounded-2xl p-1 border border-grafite-600">
        <button
          onClick={() => onTabChange('football')}
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
            activeTab === 'football'
              ? 'bg-gradient-to-r from-neon-green/20 to-electric-blue/20 text-neon-green border border-neon-green/30 shadow-[0_0_15px_rgba(57,255,20,0.15)]'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <span className="text-lg sm:text-xl">⚽</span>
          <span className="hidden sm:inline">Futebol Premium</span>
          <span className="sm:hidden">Futebol</span>
        </button>
        <button
          onClick={() => onTabChange('lottery')}
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
            activeTab === 'lottery'
              ? 'bg-gradient-to-r from-gold/20 to-orange-500/20 text-gold border border-gold/30 shadow-[0_0_15px_rgba(255,215,0,0.15)]'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <span className="text-lg sm:text-xl">🎰</span>
          <span className="hidden sm:inline">Loterias Inteligente</span>
          <span className="sm:hidden">Loterias</span>
        </button>
      </div>
    </div>
  );
}

interface TabSwitcherProps {
  activeTab: 'football' | 'lottery';
  onTabChange: (tab: 'football' | 'lottery') => void;
}

export default function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="mx-3 sm:mx-4 my-4 flex gap-2 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
      <button
        onClick={() => onTabChange('football')}
        className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
          activeTab === 'football'
            ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]'
            : 'text-[#64748B] hover:text-[#475569] hover:bg-white/50'
        }`}
      >
        <span className="text-xl sm:text-2xl">⚽</span>
        <span className="hidden sm:inline">Futebol Premium</span>
        <span className="sm:hidden">Futebol</span>
      </button>
      <button
        onClick={() => onTabChange('lottery')}
        className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
          activeTab === 'lottery'
            ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]'
            : 'text-[#64748B] hover:text-[#475569] hover:bg-white/50'
        }`}
      >
        <span className="text-xl sm:text-2xl">🎰</span>
        <span className="hidden sm:inline">Loterias Inteligente</span>
        <span className="sm:hidden">Loterias</span>
      </button>
    </div>
  );
}

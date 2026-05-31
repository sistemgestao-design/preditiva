import { useState } from 'react';
import Header from './components/Header';
import TabSwitcher from './components/TabSwitcher';
import FootballPanel from './components/FootballPanel';
import LotteryPanel from './components/LotteryPanel';
import RealtimeAlerts from './components/RealtimeAlerts';
import DashboardGrid from './components/DashboardGrid';
import CommandBar from './components/CommandBar';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { lotteries } from './data/mockData';
import { useDashboardData } from './hooks/useDashboardData';
import DataStatusBar from './components/DataStatusBar';

function Dashboard() {
  const [activeTab, setActiveTab] = useState<'football' | 'lottery'>('football');
  const { theme } = useTheme();
  const { matches, source, updatedAt, notice, loading, refreshing, refresh } = useDashboardData();

  return (
    <div className={`min-h-screen bg-grafite-900 transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
      <Header />

      <main className="max-w-6xl mx-auto pb-20 sm:pb-8 px-2 sm:px-4">
        {/* Status da fonte de dados (ao vivo / cache / demonstração) */}
        <DataStatusBar source={source} updatedAt={updatedAt} notice={notice} loading={loading} />

        {/* Painel de comando: estatísticas rápidas + botão "Analisar Jogos de Hoje" */}
        <CommandBar matches={matches} refreshing={refreshing} onRefresh={refresh} />

        {/* Alertas em tempo real (grid de 2 colunas + surebet) */}
        <RealtimeAlerts />

        {/* Ranking ROI + Jogo em análise ao vivo */}
        <DashboardGrid matches={matches} />

        {/* Divider */}
        <div className="mx-3 sm:mx-4 my-4 h-px bg-gradient-to-r from-transparent via-grafite-600 to-transparent" />

        {/* Tab Switcher */}
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        {activeTab === 'football' ? (
          <FootballPanel matches={matches} />
        ) : (
          <LotteryPanel lotteries={lotteries} />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <Dashboard />
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;

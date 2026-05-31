import { useState } from 'react';
import Header from './components/Header';
import StoryBar from './components/StoryBar';
import TabSwitcher from './components/TabSwitcher';
import FootballPanel from './components/FootballPanel';
import LotteryPanel from './components/LotteryPanel';
import AlertFeed from './components/AlertFeed';
import StatsPanel from './components/StatsPanel';
import CommandBar from './components/CommandBar';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { storyAlerts, lotteries, feedAlerts } from './data/mockData';
import { useDashboardData } from './hooks/useDashboardData';
import DataStatusBar from './components/DataStatusBar';

function Dashboard() {
  const [activeTab, setActiveTab] = useState<'football' | 'lottery'>('football');
  const { theme } = useTheme();
  const { matches, source, updatedAt, notice, loading, refreshing, refresh } = useDashboardData();

  return (
    <div className={`min-h-screen bg-grafite-900 transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
      <Header />

      <main className="max-w-5xl mx-auto pb-20 sm:pb-8 px-2 sm:px-4">
        {/* Status da fonte de dados (ao vivo / cache / demonstração) */}
        <DataStatusBar source={source} updatedAt={updatedAt} notice={notice} loading={loading} />

        {/* Painel de comando: estatísticas rápidas + botão "Analisar Jogos de Hoje" */}
        <CommandBar matches={matches} refreshing={refreshing} onRefresh={refresh} />

        {/* Story Alerts - Termômetro do Dia */}
        <StoryBar alerts={storyAlerts} />

        {/* Divider */}
        <div className="mx-3 sm:mx-4 h-px bg-gradient-to-r from-transparent via-grafite-600 to-transparent" />

        {/* Tab Switcher */}
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        {activeTab === 'football' ? (
          <FootballPanel matches={matches} />
        ) : (
          <LotteryPanel lotteries={lotteries} />
        )}

        {/* Divider */}
        <div className="mx-3 sm:mx-4 my-4 h-px bg-gradient-to-r from-transparent via-grafite-600 to-transparent" />

        {/* Stats Panel - Performance da IA */}
        <StatsPanel />

        {/* Divider */}
        <div className="mx-3 sm:mx-4 my-4 h-px bg-gradient-to-r from-transparent via-grafite-600 to-transparent" />

        {/* Alert Feed */}
        <AlertFeed alerts={feedAlerts} />
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

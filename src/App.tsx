import { useState } from 'react';
import Header from './components/Header';
import StoryBar from './components/StoryBar';
import TabSwitcher from './components/TabSwitcher';
import FootballPanel from './components/FootballPanel';
import LotteryPanel from './components/LotteryPanel';
import AlertFeed from './components/AlertFeed';
import StatsPanel from './components/StatsPanel';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { storyAlerts, matches, lotteries, feedAlerts } from './data/mockData';

function Dashboard() {
  const [activeTab, setActiveTab] = useState<'football' | 'lottery'>('football');
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen bg-grafite-900 transition-colors duration-500 ${theme === 'light' ? 'light' : ''}`}>
      <Header />

      <main className="max-w-2xl mx-auto pb-8">
        {/* Story Alerts - Termômetro do Dia */}
        <StoryBar alerts={storyAlerts} />

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-grafite-500 to-transparent" />

        {/* Tab Switcher */}
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        {activeTab === 'football' ? (
          <FootballPanel matches={matches} />
        ) : (
          <LotteryPanel lotteries={lotteries} />
        )}

        {/* Divider */}
        <div className="mx-4 my-4 h-px bg-gradient-to-r from-transparent via-grafite-500 to-transparent" />

        {/* Stats Panel - Performance da IA */}
        <StatsPanel />

        {/* Divider */}
        <div className="mx-4 my-4 h-px bg-gradient-to-r from-transparent via-grafite-500 to-transparent" />

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

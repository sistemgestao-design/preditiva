import { useState } from 'react';
import Header from './components/Header';
import StoryBar from './components/StoryBar';
import TabSwitcher from './components/TabSwitcher';
import FootballPanel from './components/FootballPanel';
import LotteryPanel from './components/LotteryPanel';
import AlertFeed from './components/AlertFeed';
import { storyAlerts, matches, lotteries, feedAlerts } from './data/mockData';

function App() {
  const [activeTab, setActiveTab] = useState<'football' | 'lottery'>('football');

  return (
    <div className="min-h-screen bg-grafite-900">
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

        {/* Alert Feed */}
        <AlertFeed alerts={feedAlerts} />
      </main>
    </div>
  );
}

export default App;

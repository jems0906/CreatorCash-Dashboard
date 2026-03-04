import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './components/common/Header';
import { NavTabs } from './components/common/NavTabs';
import { EarningsDashboard } from './components/Dashboard/EarningsDashboard';
import { SponsoredMarketplace } from './components/Marketplace/SponsoredMarketplace';
import { VideoFeed } from './components/VideoFeed/VideoFeed';
import { ABTestPanel } from './components/ABTesting/ABTestPanel';
import { useWebSocket } from './hooks/useWebSocket';
import { useEarnings } from './hooks/useEarnings';
import {
  generateSponsoredDeals,
  generateVideoFeed,
  generateCreatorProfile,
} from './services/mockData';
import type { DashboardTab } from './types';

// Static data generated once on app load
const DEALS = generateSponsoredDeals();
const VIDEOS = generateVideoFeed();
const CREATOR = generateCreatorProfile();

const tabVariants = {
  initial:  { opacity: 0, x: 24 },
  animate:  { opacity: 1, x: 0,  transition: { duration: 0.22, ease: 'easeOut' } },
  exit:     { opacity: 0, x: -24, transition: { duration: 0.16 } },
};

function App() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('earnings');
  const [isDark, setIsDark] = useState(true);

  const { isConnected, latestSnapshot } = useWebSocket();
  const { history, projection, metrics } = useEarnings(latestSnapshot);

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`} data-theme={isDark ? 'dark' : 'light'}>
      <Header
        creator={CREATOR}
        isDark={isDark}
        isConnected={isConnected}
        onToggleDark={() => setIsDark(d => !d)}
      />

      <NavTabs active={activeTab} onChange={setActiveTab} />

      <main className="app-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="tab-content"
          >
            {activeTab === 'earnings' && (
              <EarningsDashboard
                liveSnapshot={latestSnapshot}
                history={history}
                metrics={metrics}
                projection={projection}
                lifetimeEarnings={CREATOR.lifetimeEarnings}
                isConnected={isConnected}
                isDark={isDark}
              />
            )}
            {activeTab === 'marketplace' && (
              <SponsoredMarketplace deals={DEALS} />
            )}
            {activeTab === 'feed' && (
              <VideoFeed videos={VIDEOS} />
            )}
            {activeTab === 'abtests' && (
              <ABTestPanel />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;

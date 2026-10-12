import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { FeedbackExplorerPage } from './pages/FeedbackExplorerPage';
import { ImportWorkbenchPage } from './pages/ImportWorkbenchPage';
import { InsightsPage } from './pages/InsightsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { IssueTrackerPage } from './pages/IssueTrackerPage';
import { ReportsSettingsPage } from './pages/ReportsSettingsPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');

  // Check if token exists on load
  useEffect(() => {
    const token = localStorage.getItem('insightflow_token');
    if (token) {
      setCurrentTab('dashboard');
    }
  }, []);

  if (currentTab === 'landing') {
    return <LandingPage setTab={setCurrentTab} />;
  }

  if (currentTab === 'auth') {
    return <AuthPage setTab={setCurrentTab} />;
  }

  return (
    <Layout currentTab={currentTab} setTab={setCurrentTab}>
      {currentTab === 'dashboard' && <DashboardPage setTab={setCurrentTab} />}
      {currentTab === 'feedback' && <FeedbackExplorerPage setTab={setCurrentTab} />}
      {currentTab === 'import' && <ImportWorkbenchPage setTab={setCurrentTab} />}
      {currentTab === 'insights' && <InsightsPage setTab={setCurrentTab} />}
      {currentTab === 'recommendations' && <RecommendationsPage setTab={setCurrentTab} />}
      {currentTab === 'issues' && <IssueTrackerPage setTab={setCurrentTab} />}
      {currentTab === 'reports' && <ReportsSettingsPage initialTab="reports" />}
      {currentTab === 'settings' && <ReportsSettingsPage initialTab="settings" />}
    </Layout>
  );
}

export default App;

import React, { useState } from 'react';
import { SiteRiskDashboard } from './pages/SiteRiskDashboard';
import { SafetyDashboard } from './pages/SafetyDashboard';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('site-risk');

  if (activeTab === 'safety') {
    return <SafetyDashboard activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />;
  }

  return <SiteRiskDashboard activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />;
};

export default App;

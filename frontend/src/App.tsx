import React, { useState } from 'react';
import { SiteRiskDashboard } from './pages/SiteRiskDashboard';
import { SafetyDashboard } from './pages/SafetyDashboard';
import { ComplianceDashboard } from './pages/ComplianceDashboard';
import { InsuranceDashboard } from './pages/InsuranceDashboard';
import { CommandCenterDashboard } from './pages/CommandCenterDashboard';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('site-risk');

  if (activeTab === 'command-center') {
    return <CommandCenterDashboard activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />;
  }

  if (activeTab === 'safety') {
    return <SafetyDashboard activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />;
  }

  if (activeTab === 'compliance') {
    return <ComplianceDashboard activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />;
  }

  if (activeTab === 'insurance') {
    return <InsuranceDashboard activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />;
  }

  return <SiteRiskDashboard activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />;
};

export default App;

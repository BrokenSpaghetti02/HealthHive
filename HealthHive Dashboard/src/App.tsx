import { useState } from "react";
import { AppShell } from "./components/health/AppShell";
import { HealthSidebar } from "./components/health/HealthSidebar";
import { TopBar } from "./components/health/TopBar";
import { LoginPage } from "./components/health/pages/LoginPage";
import { OverviewPage } from "./components/health/pages/OverviewPage";
import { AnalyticsPage } from "./components/health/pages/AnalyticsPage";
import { FieldOpsPage } from "./components/health/pages/FieldOpsPage";
import { RegistryPage } from "./components/health/pages/RegistryPage";
import { DataQualityPage } from "./components/health/pages/DataQualityPage";
import { ResourcesPage } from "./components/health/pages/ResourcesPage";
import { AdminPage } from "./components/health/pages/AdminPage";
import { ProfilePage } from "./components/health/pages/ProfilePage";
import { SettingsPage } from "./components/health/pages/SettingsPage";
import { Toaster } from "./components/ui/sonner";
import { LanguageProvider } from "./lib/i18n";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('this-month');

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('overview'); // Reset to overview on logout
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <LanguageProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[#F9FAFB]">
        {/* Sidebar_Static - 168px fixed, stays pinned */}
        <aside className="w-[168px] h-full flex-shrink-0 border-r border-[#D4DBDE] bg-white overflow-y-auto">
          <HealthSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>
        
        {/* ContentViewport - Scrollable content area */}
        <main className="flex-1 h-full flex flex-col overflow-hidden">
          {/* TopBar - Full width, sticky at top */}
          <div className="flex-shrink-0 sticky top-0 z-40">
            <TopBar 
              dateRange={dateRange} 
              onDateRangeChange={setDateRange}
              onLogout={handleLogout}
              onNavigate={setActiveTab}
            />
          </div>

          {/* MainContent - Scrollable with centered 70% container */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="w-full min-h-full flex justify-center">
              <div className="w-full max-w-[1008px] min-w-[320px] px-6">
                {/* Page Content - All pages use consistent 70% container */}
                {activeTab === 'overview' && <OverviewPage onNavigate={setActiveTab} />}
                {activeTab === 'analytics' && <AnalyticsPage />}
                {activeTab === 'field-ops' && <FieldOpsPage />}
                {activeTab === 'registry' && <RegistryPage />}
                {activeTab === 'data-quality' && <DataQualityPage />}
                {activeTab === 'resources' && <ResourcesPage />}
                {activeTab === 'admin' && <AdminPage />}
                {activeTab === 'profile' && <ProfilePage />}
                {activeTab === 'settings' && <SettingsPage />}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </LanguageProvider>
  );
}

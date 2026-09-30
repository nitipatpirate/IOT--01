import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar, PageId } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RealtimePage } from './pages/RealtimePage';
import { HistoryPage } from './pages/HistoryPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';
import { api } from './services/api';

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [alertBadgeCount, setAlertBadgeCount] = useState<number>(0);

  // Poll alert count for sidebar badge
  useEffect(() => {
    if (!user) return;
    const checkAlerts = () => {
      api.getAlerts('all', 'all', 'pending')
        .then(res => setAlertBadgeCount(res.alerts.length))
        .catch(() => {});
    };
    checkAlerts();
    const timer = setInterval(checkAlerts, 10000);
    return () => clearInterval(timer);
  }, [user]);

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080B11] text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={(page) => setCurrentPage(page)}
          alertCount={alertBadgeCount}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {currentPage === 'dashboard' && (
            <DashboardPage onNavigateToRealtime={() => setCurrentPage('realtime')} />
          )}
          {currentPage === 'realtime' && <RealtimePage />}
          {currentPage === 'history' && <HistoryPage />}
          {currentPage === 'alerts' && <AlertsPage />}
          {currentPage === 'reports' && <ReportsPage />}
          {currentPage === 'settings' && <SettingsPage />}
          {currentPage === 'users' && <UsersPage />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

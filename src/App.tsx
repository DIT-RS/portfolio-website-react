import { useState, useEffect } from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WorkView } from './components/WorkView';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { AdminToolbar } from './components/AdminToolbar';

function PortfolioApp() {
  const [activeTab, setActiveTab] = useState<'work' | 'about' | 'contact'>('about');

  // Handle browser popstate / back button if users navigate
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'about' || hash === 'contact' || hash === 'work') {
        setActiveTab(hash);
      } else {
        setActiveTab('about');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleTabChange = (tab: 'work' | 'about' | 'contact') => {
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-[#a0a5b5] bg-grid-pattern relative selection:bg-blue-600 selection:text-white">
      {/* Subtle background ambient light */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/5 blur-[120px] pointer-events-none rounded-full"></div>

      {/* Main Header */}
      <Header activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-5 py-6 md:py-10">
        {activeTab === 'about' && (
          <AboutView
            onNavigateToContact={() => handleTabChange('contact')}
            onNavigateToWork={() => handleTabChange('work')}
          />
        )}
        {activeTab === 'work' && (
          <WorkView onNavigateToContact={() => handleTabChange('contact')} />
        )}
        {activeTab === 'contact' && <ContactView />}
      </main>

      {/* Footer with secret 5-click trigger */}
      <Footer setActiveTab={handleTabChange} />

      {/* Floating Admin Toolbar when Live Edit Mode is Active */}
      <AdminToolbar />
    </div>
  );
}

export function App() {
  return (
    <PortfolioProvider>
      <PortfolioApp />
    </PortfolioProvider>
  );
}

export default App;

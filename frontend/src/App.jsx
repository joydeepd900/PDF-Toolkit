import { useState } from 'react';
import TopNav from './components/TopNav';
import Sidebar from './components/Sidebar';
import Workspace from './components/Workspace';
import SettingsPanel from './components/SettingsPanel';

const DEFAULT_SETTINGS = {
  lightMode: false,
  matrixScale: 2.0,
  stripMetadata: false,
  outputDirectory: '',
};

function App() {
  const [activeTool, setActiveTool] = useState('merge');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden bg-black text-gray-100${settings.lightMode ? ' light-mode' : ''}`}>
      <TopNav onOpenSettings={() => setShowSettings(true)} showSettings={showSettings} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay — sits behind the sidebar, above main content */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar
          activeTool={activeTool}
          setActiveTool={(tool) => { setActiveTool(tool); setShowSettings(false); }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        {showSettings ? (
          <SettingsPanel
            settings={settings}
            onSettingChange={handleSettingChange}
            onClose={() => setShowSettings(false)}
          />
        ) : (
          <Workspace
            activeTool={activeTool}
            settings={settings}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        )}
      </div>
    </div>
  );
}

export default App;

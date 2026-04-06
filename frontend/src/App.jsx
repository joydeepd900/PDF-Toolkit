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

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden bg-black text-gray-100${settings.lightMode ? ' light-mode' : ''}`}>
      <TopNav onOpenSettings={() => setShowSettings(true)} showSettings={showSettings} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTool={activeTool} setActiveTool={(tool) => { setActiveTool(tool); setShowSettings(false); }} />
        {showSettings ? (
          <SettingsPanel
            settings={settings}
            onSettingChange={handleSettingChange}
            onClose={() => setShowSettings(false)}
          />
        ) : (
          <Workspace activeTool={activeTool} settings={settings} />
        )}
      </div>
    </div>
  );
}

export default App;

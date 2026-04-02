import React from 'react';
import {
  Sun,
  Image as ImageIcon,
  ShieldOff,
  FolderOpen,
  ArrowLeft,
  Info,
} from 'lucide-react';

const SettingsPanel = ({ settings, onSettingChange, onClose }) => {
  return (
    <div className="settings-panel flex-1 flex flex-col overflow-y-auto p-8">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8">
        <button
          onClick={onClose}
          className="settings-back-btn flex items-center space-x-2 text-sm mb-6 transition-colors duration-150"
        >
          <ArrowLeft size={16} />
          <span>Back to Workspace</span>
        </button>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Settings</h2>
        <p className="settings-description text-sm">
          Configure global defaults for all PDF operations.
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-4">

        {/* Light Mode */}
        <div className="settings-card rounded-xl p-5 flex items-center justify-between border">
          <div className="flex items-center space-x-4">
            <div className="settings-icon-bg p-2.5 rounded-lg">
              <Sun size={20} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Light Mode</h3>
              <p className="settings-description text-xs mt-0.5">
                Switch to a white / light-grey interface.
              </p>
            </div>
          </div>
          <button
            id="toggle-light-mode"
            onClick={() => onSettingChange('lightMode', !settings.lightMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none
              ${settings.lightMode ? 'bg-yellow-400' : 'bg-neutral-600'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200
                ${settings.lightMode ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>


        {/* Universal Metadata Stripping */}
        <div className="settings-card rounded-xl p-5 flex items-center justify-between border">
          <div className="flex items-center space-x-4">
            <div className="settings-icon-bg p-2.5 rounded-lg">
              <ShieldOff size={20} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Universal Metadata Stripping</h3>
              <p className="settings-description text-xs mt-0.5">
                Automatically remove author, creator &amp; date from every processed PDF.
              </p>
              <p className="text-blue-400 text-xs mt-1.5 font-medium">
                Note: This feature will not work for tools that create ZIP files as output (like Split PDF).
              </p>
            </div>
          </div>
          <button
            id="toggle-strip-metadata"
            onClick={() => onSettingChange('stripMetadata', !settings.stripMetadata)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none shrink-0
              ${settings.stripMetadata ? 'bg-yellow-400' : 'bg-neutral-600'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200
                ${settings.stripMetadata ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {/* Default Output Directory */}
        <div className="settings-card rounded-xl p-5 border">
          <div className="flex items-start space-x-4 mb-4">
            <div className="settings-icon-bg p-2.5 rounded-lg shrink-0">
              <FolderOpen size={20} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Default Output Directory</h3>
              <p className="settings-description text-xs mt-0.5">
                When set, processed files are saved directly to this path on the server machine instead of being downloaded.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <input
              id="input-output-dir"
              type="text"
              placeholder="e.g. C:\Users\...\Downloads\PDF_Output"
              value={settings.outputDirectory}
              onChange={(e) => onSettingChange('outputDirectory', e.target.value)}
              className="settings-input flex-1 rounded-md px-3 py-2.5 text-sm outline-none transition-all font-mono"
            />
            <button
              onClick={async () => {
                try {
                  const res = await fetch('http://localhost:8000/api/pick-folder');
                  const data = await res.json();
                  if (data.path) {
                    onSettingChange('outputDirectory', data.path);
                  }
                } catch (e) {
                  console.error('Failed to open native picker:', e);
                }
              }}
              className="accent-primary px-5 py-2.5 rounded-md text-sm font-medium shrink-0 shadow-sm"
              title="Select folder via File Explorer"
            >
              Browse...
            </button>
          </div>
          <div className="flex flex-col space-y-2 mt-3">
            <div className="flex items-start space-x-1.5">
              <Info size={12} className="text-yellow-400 shrink-0 mt-0.5" />
              <p className="settings-description text-xs">
                Leave blank to use the standard browser download. The path must be a valid directory
                that exists on the machine running the backend server.
              </p>
            </div>
            <div className="flex items-start space-x-1.5 text-blue-400">
              <p className="text-xs font-medium">
                Note: This feature will not work for tools that create ZIP files as output (like Split PDF).
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPanel;

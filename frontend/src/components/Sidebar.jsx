import React from 'react';
import clsx from 'clsx';
import {
  Combine,
  Scissors,
  SplitSquareHorizontal,
  ImagePlay,
  Lock,
  FileMinus,
  FileText,
  FileImage,
  ImageDown,
  Minimize2,
} from 'lucide-react';

const tools = [
  { id: 'merge', label: 'Merge PDFs & Images', icon: Combine },
  { id: 'extract-pages', label: 'Extract Pages', icon: Scissors },
  { id: 'split', label: 'Split PDF', icon: SplitSquareHorizontal },
  { id: 'images-to-pdf', label: 'Images to PDF', icon: ImagePlay },
  { id: 'lock', label: 'Lock PDF (Protect)', icon: Lock },
  { id: 'strip-metadata', label: 'Strip Metadata', icon: FileMinus },
  { id: 'extract-text', label: 'Extract Text', icon: FileText },
  { id: 'pdf-to-images', label: 'PDF to Images', icon: FileImage },
  { id: 'extract-images', label: 'Extract Images', icon: ImageDown },
  { id: 'compress', label: 'Compress PDF', icon: Minimize2 },
];

const Sidebar = ({ activeTool, setActiveTool }) => {
  return (
    <div className="w-[250px] bg-neutral-900 border-r border-white/5 flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 flex-1">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Utilities</h2>
        <nav className="space-y-1">
          {tools.map((tool) => {
            const isActive = activeTool === tool.id;
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={clsx(
                  'w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-yellow-400 text-black shadow-sm'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                )}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="px-4 pb-4">
        <p className="text-xs italic text-gray-600 select-none">— made by Joy</p>
      </div>
    </div>
  );
};

export default Sidebar;

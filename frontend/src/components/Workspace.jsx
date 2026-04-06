import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, File, X, Loader2, CheckCircle2, FolderOpen, AlertTriangle, Menu } from 'lucide-react';
import { executeTool, downloadFile, MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES } from '../api';

const toolConfig = {
  merge: { label: 'Merge Files', needsMultiple: true, extraInputs: false, acceptsOutputName: true },
  'extract-pages': { label: 'Extract Pages', extraInputs: true },
  split: { label: 'Split PDF', extraInputs: false },
  'images-to-pdf': { label: 'Convert to PDF', needsMultiple: true, extraInputs: false, acceptsOutputName: true },
  lock: { label: 'Lock PDF', extraInputs: false },
  'strip-metadata': { label: 'Strip Metadata', extraInputs: false },
  'extract-text': { label: 'Extract Text', extraInputs: false, acceptsOutputName: true },
  'pdf-to-images': { label: 'Render to Images', extraInputs: true, acceptsOutputName: true },
  'extract-images': { label: 'Extract Images', extraInputs: false, acceptsOutputName: true },
  compress: { label: 'Compress PDF', extraInputs: true, acceptsOutputName: true },
};

const getNamingPrompt = (tool) => {
  switch(tool) {
    case 'images-to-pdf': return { prompt: 'Enter name for PDF', defaultName: 'converted_images' };
    case 'extract-text': return { prompt: 'Enter name for text file', defaultName: 'extracted_text' };
    case 'pdf-to-images': return { prompt: 'Enter name for ZIP archive', defaultName: 'rendered_images' };
    case 'extract-images': return { prompt: 'Enter name for ZIP archive', defaultName: 'extracted_images' };
    case 'merge': return { prompt: 'Enter output name', defaultName: 'merged_output' };
    case 'compress': return { prompt: 'Enter name for compressed PDF', defaultName: 'compressed_output' };
    default: return { prompt: 'Enter output name', defaultName: `${tool}_output` };
  }
};

const Workspace = ({ activeTool, settings = {}, onOpenSidebar }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [result, setResult] = useState(null); // { blob, filename } | { saved, path, filename }

  // Extra options state
  const [options, setOptions] = useState({
    startPage: 1, endPage: 1, password: '', compressionLevel: 1, outputName: '', matrixScale: 2.0
  });

  const [showNamingModal, setShowNamingModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fileInputRef = useRef(null);
  const config = toolConfig[activeTool];

  // Reset workspace state when the active tool changes
  useEffect(() => {
    setFiles([]);
    setResult(null);
    setOptions({
      startPage: 1, endPage: 1, password: '', compressionLevel: 1, outputName: '', matrixScale: 2.0
    });
    setToast(null);
    setLoading(false);
    setShowNamingModal(false);
    setShowPasswordModal(false);
  }, [activeTool]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
      setResult(null); // Clear previous result when adding new files
    }
  };

  const addFiles = (newFiles) => {
    // ── Front-end file size gate ────────────────────────────────────────────
    const oversized = newFiles.filter(f => f.size > MAX_FILE_SIZE_BYTES);
    const valid     = newFiles.filter(f => f.size <= MAX_FILE_SIZE_BYTES);

    if (oversized.length > 0) {
      const names = oversized.map(f => f.name).join(', ');
      toggleToast(
        `File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB. (${names})`,
        'error'
      );
      // Stop entirely if every selected file is oversized
      if (valid.length === 0) return;
    }

    if (config.needsMultiple) {
      setFiles((prev) => [...prev, ...valid]);
    } else {
      setFiles([valid[0]]); // Only take first file for single-file tools
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleExecute = async (finalOptions = options) => {
    if (files.length === 0) return;
    setLoading(true);
    setResult(null);
    const res = await executeTool(activeTool, files, finalOptions, settings);
    setLoading(false);

    if (res.success) {
      if (res.saved) {
        toggleToast(`✓ File saved to: ${res.path}`, 'success');
        setResult({ saved: true, path: res.path, filename: res.filename });
      } else {
        toggleToast('Processing complete! Click "Download Result" to save.', 'success');
        setResult({ blob: res.blob, filename: res.filename });
      }
    } else if (res.oversized) {
      // Specific toast for size-limit violations (frontend guard or HTTP 413)
      toggleToast(res.error || `File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`, 'error');
    } else {
      toggleToast('An error occurred during processing.', 'error');
    }
  };

  const handleMainActionClick = () => {
    if (activeTool === 'lock') {
      setShowPasswordModal(true);
      setOptions({...options, password: ''});
      setPasswordConfirm('');
      setPasswordError('');
    } else if (config.acceptsOutputName) {
      const { defaultName } = getNamingPrompt(activeTool);
      setOptions({...options, outputName: defaultName});
      setShowNamingModal(true);
    } else {
      handleExecute();
    }
  };

  const handlePasswordSubmit = () => {
    if (!options.password) {
      setPasswordError('Password cannot be empty!');
      return;
    }
    if (options.password !== passwordConfirm) {
      setPasswordError('Error: Passwords do not match. Please try again.');
      return;
    }
    setShowPasswordModal(false);
    handleExecute();
  };

  const handleNamingSubmit = () => {
    let finalOptions = { ...options };
    if (!options.outputName.trim()) {
      const { defaultName } = getNamingPrompt(activeTool);
      finalOptions.outputName = defaultName;
      setOptions(finalOptions);
    }
    setShowNamingModal(false);
    handleExecute(finalOptions);
  };

  const handleDownloadResult = () => {
    if (result && result.blob) {
      downloadFile(result.blob, result.filename);
      toggleToast('Download started!', 'success');
      setFiles([]);
      setResult(null);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
  };

  return (
    <div className="workspace flex-1 flex flex-col items-center px-4 md:px-8 pt-4 md:pt-8 pb-8 relative overflow-y-auto">

      {/* Hamburger button — mobile only */}
      <div className="w-full max-w-3xl flex items-center mb-4 md:hidden">
        <button
          id="btn-open-sidebar"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Menu size={22} />
        </button>
        <span className="ml-3 text-sm font-medium text-gray-400">Tools</span>
      </div>

      <div className="w-full max-w-3xl mb-6">
        <h2 className="text-xl font-semibold mb-2">{config.label}</h2>
        <p className="workspace-subtitle text-sm mb-6">
          {config.needsMultiple ? 'Upload multiple files.' : 'Upload a single file.'}
        </p>

        {config.extraInputs && (
          <div className="workspace-extra-inputs flex gap-4 flex-wrap p-4 rounded-lg mb-6 border">
            {activeTool === 'extract-pages' && (
              <>
                <label className="workspace-label flex flex-col text-sm">
                  Start Page:
                  <input type="number" min="1" value={options.startPage} onChange={(e) => setOptions({...options, startPage: e.target.value})}
                    className="workspace-input mt-1 border rounded-md px-3 py-2" />
                </label>
                <label className="workspace-label flex flex-col text-sm">
                  End Page:
                  <input type="number" min="1" value={options.endPage} onChange={(e) => setOptions({...options, endPage: e.target.value})}
                    className="workspace-input mt-1 border rounded-md px-3 py-2" />
                </label>
              </>
            )}
            {activeTool === 'pdf-to-images' && (
              <label className="workspace-label flex flex-col w-full text-sm">
                Image Render Quality (Matrix Scale):
                <div className="flex items-center space-x-4 mt-2">
                  <input
                    type="range"
                    min="0.5"
                    max="4.0"
                    step="0.5"
                    value={options.matrixScale}
                    onChange={(e) => setOptions({...options, matrixScale: parseFloat(e.target.value)})}
                    className="flex-1 h-2 rounded-lg appearance-none cursor-pointer workspace-input"
                  />
                  <div className="font-mono text-sm font-bold px-3 py-1 rounded-md min-w-[52px] text-center" style={{ backgroundColor: 'rgba(250,204,21,0.12)', color: 'rgb(253,224,71)' }}>
                    {options.matrixScale ? options.matrixScale.toFixed(1) : '2.0'}×
                  </div>
                </div>
              </label>
            )}
            {activeTool === 'compress' && (
              <label className="workspace-label flex w-full flex-col text-sm">
                Compression Level:
                <select value={options.compressionLevel} onChange={(e) => setOptions({...options, compressionLevel: e.target.value})}
                  className="workspace-input mt-1 border rounded-md px-3 py-2 w-full">
                  <option value={1}>Less compression (Lossless)</option>
                  <option value={2}>High Compression (Lossy)</option>
                </select>
              </label>
            )}
          </div>
        )}
      </div>

      {/* DROPZONE */}
      {files.length === 0 ? (
        <div
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className={`w-full max-w-3xl flex-1 max-h-[400px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200
            ${isDragging ? 'border-yellow-400 bg-yellow-400/10' : 'dropzone-default'}`}
        >
          <UploadCloud size={48} className={`mb-4 ${isDragging ? 'text-yellow-400' : 'text-gray-400'}`} />
          <p className="workspace-subtitle font-medium">Drag &amp; Drop PDF files here, or click to browse</p>
          <input ref={fileInputRef} type="file" multiple={config.needsMultiple} onChange={handleChange} className="hidden" />
        </div>
      ) : (
        /* FILE LIST VIEW */
        <div className="file-list w-full max-w-3xl flex-1 max-h-[400px] rounded-xl border p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold file-list-title">Selected Files ({files.length})</h3>
            <button onClick={() => fileInputRef.current.click()} className="text-sm text-yellow-400 hover:text-yellow-300">
              + Add More
            </button>
            <input ref={fileInputRef} type="file" multiple={config.needsMultiple} onChange={handleChange} className="hidden" />
          </div>
          <div className="space-y-2">
            {files.map((file, idx) => (
              <div key={idx} className="file-item flex items-center justify-between p-3 rounded-md border">
                <div className="flex items-center space-x-3 truncate">
                  <File size={16} className="text-yellow-400 shrink-0" />
                  <span className="text-sm file-item-name truncate">{file.name}</span>
                </div>
                <button onClick={() => removeFile(idx)} className="file-remove-btn p-1 rounded-md">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRIMARY ACTION BUTTONS */}
      <div className="w-full max-w-3xl mt-6 flex items-center justify-between">
        {/* ZIP badge — shown on tools that produce ZIP archives */}
        {['split', 'pdf-to-images', 'extract-images'].includes(activeTool) ? (
          <div className="flex items-center space-x-1.5 text-gray-500">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="text-xs">(ZIP File Output)</span>
          </div>
        ) : <div />}
        <div className="flex space-x-4">
        {result && result.saved && (
          <button
            onClick={handleReset}
            className="border border-white/10 hover:bg-white/5 text-gray-300 flex items-center space-x-2 px-6 py-3 rounded-md font-medium text-sm shadow-md transition-colors"
          >
            <FolderOpen size={16} className="text-green-400" />
            <span className="text-green-400">Saved — Process Another</span>
          </button>
        )}
        {result && result.blob && (
          <button
            onClick={handleDownloadResult}
            className="bg-green-600 hover:bg-green-500 text-white flex items-center space-x-2 px-6 py-3 rounded-md font-medium text-sm shadow-md transition-colors"
          >
            <span>Download Result</span>
            <File size={16} />
          </button>
        )}
        <button
          onClick={handleMainActionClick}
          disabled={loading || files.length === 0 || !!result}
          className="accent-primary flex items-center space-x-2 px-6 py-3 rounded-md font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : null}
          <span>{result ? 'Process Complete' : config.label}</span>
        </button>
        </div>{/* end inner flex */}
      </div>{/* end outer justify-between */}

      {/* HAZY BACKGROUND & POP-UP MODALS */}
      {(showNamingModal || showPasswordModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

          {showNamingModal && (() => {
            const { prompt, defaultName } = getNamingPrompt(activeTool);
            return (
              <div className="modal-card border p-6 rounded-xl w-full max-w-md shadow-2xl flex flex-col">
                <h3 className="text-xl font-semibold mb-6">Output Settings</h3>
                <label className="modal-label flex flex-col text-sm mb-6">
                  {prompt} (Default: {defaultName}):
                  <input type="text" autoFocus placeholder={defaultName} value={options.outputName}
                    onChange={(e) => setOptions({...options, outputName: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleNamingSubmit()}
                    className="modal-input mt-2 border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-400/50 w-full" />
                </label>
                <div className="flex justify-end space-x-3 mt-2">
                  <button onClick={() => setShowNamingModal(false)} className="modal-cancel-btn px-4 py-2 text-sm transition-colors">Cancel</button>
                  <button onClick={handleNamingSubmit} className="px-5 py-2 rounded-md font-medium text-sm text-black bg-yellow-400 hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-400/20">Confirm &amp; Process</button>
                </div>
              </div>
            );
          })()}

          {showPasswordModal && (
            <div className="modal-card border p-6 rounded-xl w-full max-w-md shadow-2xl flex flex-col">
              <h3 className="text-xl font-semibold mb-6">Lock PDF</h3>

              {passwordError && (
                <div className="border border-dashed border-blue-400 bg-blue-400/10 text-blue-400 px-4 py-3 rounded-md text-sm mb-6 font-medium">
                  {passwordError}
                </div>
              )}

              <label className="modal-label flex flex-col text-sm mb-4">
                Enter a strong password (keystrokes hidden):
                <input type="password" autoFocus value={options.password}
                  onChange={(e) => { setOptions({...options, password: e.target.value}); setPasswordError(''); }}
                  className="modal-input mt-2 border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-400/50 w-full" />
              </label>
              <label className="modal-label flex flex-col text-sm mb-8">
                Confirm password:
                <input type="password" value={passwordConfirm}
                  onChange={(e) => { setPasswordConfirm(e.target.value); setPasswordError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  className="modal-input mt-2 border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-400/50 w-full" />
              </label>

              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowPasswordModal(false)} className="modal-cancel-btn px-4 py-2 text-sm transition-colors">Cancel</button>
                <button onClick={handlePasswordSubmit} className="px-5 py-2 rounded-md font-medium text-sm text-black bg-yellow-400 hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-400/20">Lock File</button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed bottom-6 right-4 md:right-8 max-w-xs md:max-w-sm px-4 py-3 rounded-md shadow-lg border text-sm font-medium flex items-center space-x-2 z-50
          ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.type === 'success'
            ? <CheckCircle2 size={16} className="shrink-0" />
            : <AlertTriangle size={16} className="shrink-0" />}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
};

export default Workspace;

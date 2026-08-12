import axios from 'axios';

// Pull the URL from Vercel's environment variables
const API_BASE = import.meta.env.VITE_API_URL;

// ── Global Configuration ──────────────────────────────────────────────────────
export const MAX_FILE_SIZE_MB = 70;              // Maximum allowed upload size in MB
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const downloadFile = (blob, filename) => {
  // Ensure we have a valid string as the filename
  let finalName = filename || 'downloaded_file.pdf';
  // Strip any surrounding quotes that might have slipped through
  finalName = finalName.replace(/['"]/g, '').trim();
  // Browsers will reject the "download" attribute if it contains a path — strip directory refs
  finalName = finalName.replace(/^.*[\\\/]/, '');

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalName;
  document.body.appendChild(link);
  link.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 150);
};

export const executeTool = async (tool, files, options, settings = {}) => {
  // ── Front-end file size validation ──────────────────────────────────────────
  const oversizedFile = files.find(f => f.size > MAX_FILE_SIZE_BYTES);
  if (oversizedFile) {
    return {
      success: false,
      error: `File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`,
      oversized: true,
    };
  }

  const formData = new FormData();

  // Append files (some endpoints take 'file', some take 'files')
  const singleFileEndpoints = [
    'extract-pages', 'split', 'lock', 'strip-metadata',
    'extract-text', 'pdf-to-images', 'extract-images', 'compress'
  ];

  if (singleFileEndpoints.includes(tool)) {
    formData.append('file', files[0]);
  } else {
    files.forEach(f => formData.append('files', f));
  }

  // Append tool-specific extra options
  if (tool === 'extract-pages') {
    formData.append('start_page', options.startPage);
    formData.append('end_page', options.endPage);
  } else if (tool === 'lock') {
    formData.append('password', options.password);
  } else if (tool === 'compress') {
    formData.append('level', options.compressionLevel);
  }

  // --- Settings-driven parameters ---

  // Render quality: only for pdf-to-images
  if (tool === 'pdf-to-images' && options.matrixScale != null) {
    formData.append('matrix_scale', options.matrixScale);
  }

  // PDF-producing endpoints that support strip_metadata and output_dir
  const pdfOutputEndpoints = ['merge', 'extract-pages', 'images-to-pdf', 'lock', 'compress'];
  if (pdfOutputEndpoints.includes(tool)) {
    formData.append('strip_metadata', settings.stripMetadata ? 'true' : 'false');
    if (settings.outputDirectory && settings.outputDirectory.trim()) {
      formData.append('output_dir', settings.outputDirectory.trim());
    }
  }

  try {
    const response = await axios.post(`${API_BASE}/${tool}`, formData, {
      responseType: 'blob', // Works for both file responses and JSON responses
    });

    // Check if the backend returned a JSON "saved to disk" response
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      const text = await response.data.text();
      const json = JSON.parse(text);
      if (json.saved) {
        return { success: true, saved: true, path: json.path, filename: json.filename };
      }
      if (json.error) {
        throw new Error(json.error);
      }
    }

    // Normal file download flow — extract filename from Content-Disposition header
    const disposition = response.headers['content-disposition'];
    let filename = '';
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/i);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    // Determine extension from MIME type
    const type = response.data.type || '';
    const ext = type.includes('zip') ? 'zip' :
      type.includes('text') ? 'txt' : 'pdf';

    if (options.outputName && options.outputName.trim() !== '') {
      // Prioritize the custom name the user typed
      filename = `${options.outputName.trim()}.${ext}`;
    } else if (!filename) {
      filename = `${tool}_result.${ext}`;
    } else if (!filename.includes('.')) {
      filename = `${filename}.${ext}`;
    }

    if (response.data.type === 'application/json') {
      const text = await response.data.text();
      const err = JSON.parse(text);
      throw new Error(err.error || 'Server returned an error');
    }

    return { success: true, blob: response.data, filename };
  } catch (error) {
    console.error('API Error:', error);
    // Handle HTTP 413 Payload Too Large returned by the backend middleware
    if (error.response && error.response.status === 413) {
      return {
        success: false,
        error: `File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`,
        oversized: true,
      };
    }
    return { success: false, error: error.message };
  }
};

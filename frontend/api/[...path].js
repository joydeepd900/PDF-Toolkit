// Vercel Serverless Proxy — catches all /api/* requests and forwards them
// to the backend server. The backend URL is read from the BACKEND_URL
// environment variable (set in Vercel Dashboard), so it never appears in
// client-side code or the git repository.

export default async function handler(req, res) {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    return res.status(500).json({
      error: 'BACKEND_URL environment variable is not configured.',
    });
  }

  // Extract the sub-path after /api/
  // req.query.path is an array like ['merge'] or ['pick-folder']
  const pathSegments = req.query.path || [];
  const subPath = pathSegments.join('/');
  const targetUrl = `${backendUrl}/${subPath}`;

  try {
    // Build the fetch options, forwarding method, headers, and body
    const fetchOptions = {
      method: req.method,
      headers: {},
    };

    // Forward relevant headers (skip host and connection-related ones)
    const skipHeaders = new Set([
      'host', 'connection', 'keep-alive', 'transfer-encoding',
    ]);
    for (const [key, value] of Object.entries(req.headers)) {
      if (!skipHeaders.has(key.toLowerCase())) {
        fetchOptions.headers[key] = value;
      }
    }

    // Forward the request body for non-GET/HEAD methods
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // Vercel parses the body by default; we need the raw body for
      // multipart/form-data (file uploads). Disable body parsing via
      // the config export below, then pipe the raw body through.
      fetchOptions.body = req;
      // Enable streaming the request body
      fetchOptions.duplex = 'half';
    }

    const backendResponse = await fetch(targetUrl, fetchOptions);

    // Forward the backend's status code
    res.status(backendResponse.status);

    // Forward response headers
    backendResponse.headers.forEach((value, key) => {
      // Skip headers that Vercel manages
      const skip = ['transfer-encoding', 'connection', 'keep-alive'];
      if (!skip.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Stream the response body back to the client
    const arrayBuffer = await backendResponse.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(502).json({ error: 'Failed to reach backend server.' });
  }
}

// Disable Vercel's default body parsing so multipart/form-data
// (file uploads) is forwarded as-is to the backend.
export const config = {
  api: {
    bodyParser: false,
  },
};

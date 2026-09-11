import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Health Check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'LimoPOS',
    time: new Date().toISOString(),
    host: 'Hostinger Node.js'
  });
});

// Serve Static Frontend Assets from 'dist'
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Fallback for all other frontend routes (Compatible with Express 4 & Express 5)
app.use((req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>LimoPOS - Building Assets...</title>
          <meta http-equiv="refresh" content="5">
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; text-align: center; }
            .card { background: white; padding: 2rem 3rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; }
            h2 { color: #2563eb; margin-bottom: 0.5rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>LimoPOS is Initializing</h2>
            <p>Please run <code>npm run build</code> in Hostinger, or the build is currently in progress.</p>
            <p><small>This page will automatically refresh every 5 seconds...</small></p>
          </div>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[LimoPOS] Server successfully started on port ${PORT}`);
  console.log(`[LimoPOS] Local access: http://localhost:${PORT}`);
});

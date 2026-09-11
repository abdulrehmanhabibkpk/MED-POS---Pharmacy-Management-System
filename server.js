import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), host: 'Hostinger Node.js' });
});

// Serve Static Frontend Assets from 'dist'
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA Fallback for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LimoPOS is running on port ${PORT}`);
  console.log(`Open in browser: http://localhost:${PORT}`);
});

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAllSources, saveToDisk } from './data-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory cached state
let cachedData = null;
let lastSyncTime = null;
let isSyncing = false;

async function syncAll(force = false) {
  if (isSyncing) return cachedData;
  isSyncing = true;
  try {
    console.log(`[Sync Engine] Starting full multi-stream sync at ${new Date().toISOString()}...`);
    const data = await fetchAllSources();
    cachedData = data;
    lastSyncTime = new Date().toISOString();
    saveToDisk(data, projectRoot);
    console.log(`[Sync Engine] Sync completed successfully! ${data.orders.length} records in catalog.`);
    return data;
  } catch (err) {
    console.error('[Sync Engine Error]', err);
    throw err;
  } finally {
    isSyncing = false;
  }
}

// Initial sync on server start
syncAll().catch(err => console.error('Initial sync error:', err.message));

// Background recurring sync every 15 minutes
setInterval(() => {
  syncAll().catch(err => console.error('Background sync error:', err.message));
}, 15 * 60 * 1000);

// ═══ API ENDPOINTS ═══

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Windows Full-Stack Node/Electron Service',
    uptimeSeconds: Math.floor(process.uptime()),
    lastSyncTime,
    isSyncing,
    totalRecords: cachedData ? cachedData.orders.length : 0,
    activeSources: cachedData ? cachedData.meta.sources.filter(s => s.status === 'active').length : 0
  });
});

// Full state payload
app.get('/api/data', async (req, res) => {
  try {
    if (!cachedData) {
      await syncAll();
    }
    res.json(cachedData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve application data', details: err.message });
  }
});

// Orders query with search, filter, pagination
app.get('/api/orders', (req, res) => {
  if (!cachedData) {
    return res.status(503).json({ error: 'Data initializing, please retry shortly' });
  }

  const { search, brand, limit = 100, offset = 0 } = req.query;
  let list = cachedData.orders;

  if (brand && brand !== 'ALL') {
    list = list.filter(o => o.brand.toLowerCase() === brand.toString().toLowerCase());
  }

  if (search) {
    const q = search.toString().toLowerCase();
    list = list.filter(o =>
      o.product.toLowerCase().includes(q) ||
      o.clientName.toLowerCase().includes(q) ||
      o.rep.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    );
  }

  const total = list.length;
  const paginated = list.slice(parseInt(offset, 10) || 0, (parseInt(offset, 10) || 0) + (parseInt(limit, 10) || 100));

  res.json({
    total,
    offset: parseInt(offset, 10) || 0,
    limit: parseInt(limit, 10) || 100,
    orders: paginated
  });
});

// Data Sources health & metadata
app.get('/api/sources', (req, res) => {
  if (!cachedData) {
    return res.status(503).json({ error: 'Data initializing' });
  }
  res.json({
    sources: cachedData.meta.sources,
    lastSyncTime,
    endpoint: cachedData.sources.endpoint
  });
});

// Manual on-demand live refresh
app.post('/api/sync', async (req, res) => {
  try {
    const data = await syncAll(true);
    res.json({
      status: 'success',
      message: 'Multi-source synchronization complete',
      recordsCount: data.orders.length,
      syncedAt: lastSyncTime
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Serve frontend static assets in production
const distPath = path.join(projectRoot, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <html>
          <body style="font-family:sans-serif; background:#0B0F17; color:#fff; text-align:center; padding:50px;">
            <h2>AMAYA Intelligence Hub Backend Server is Online</h2>
            <p>Port: ${PORT} | Status: Ready</p>
            <p>Run <code>npm run build</code> or launch the frontend dev server.</p>
          </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` AMAYA Executive Full-Stack Windows Server Running `);
  console.log(` Local URL: http://localhost:${PORT}             `);
  console.log(` API Health: http://localhost:${PORT}/api/health `);
  console.log(`====================================================`);
});

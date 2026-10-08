import { useState, useEffect, useCallback } from 'react';
import './index.css';
import { loadAppData, triggerLiveSync, fmtCurrency, fmtNum, fmtDate } from './data';
import type { AppData, PageId } from './types';

import { KpiGrid } from './components/KpiSection';
import { BrandPieChart, TopProductsBarChart, PaymentMethodsBar } from './components/Charts';
import { OrdersPage } from './components/OrdersPage';
import { ProductsPage } from './components/ProductsPage';
import { ClientsPage } from './components/ClientsPage';
import { ApiPage } from './components/ApiPage';

const PAGES: { id: PageId; label: string; emoji: string }[] = [
  { id: 'overview', label: 'Executive Dashboard', emoji: '🏠' },
  { id: 'orders',   label: 'Live Order Ledger',   emoji: '📦' },
  { id: 'products', label: 'Products & Brands',   emoji: '📊' },
  { id: 'clients',  label: 'Client Directory',    emoji: '🏪' },
  { id: 'api',      label: 'Live Data Streams',   emoji: '⚡' },
];

declare global {
  interface Window {
    electronAPI?: {
      isDesktopApp: boolean;
      platform: string;
      onTriggerSync: (cb: () => void) => void;
    };
  }
}

function QuickOverviewTables({ data }: { data: AppData }) {
  const topProds = (data.meta.topProducts || []).slice(0, 5);
  const topClients = (data.meta.topClients || []).slice(0, 5);

  return (
    <div className="grid-2 mt-18">
      <div className="panel fade-up d-4">
        <div className="panel-hd">
          <div className="panel-title">Top Revenue Products <span>top 5</span></div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Units</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProds.map(p => (
                <tr key={p.name}>
                  <td className="highlight">{p.name}</td>
                  <td className="num">{fmtNum(p.qty)}</td>
                  <td className="highlight text-mono">{fmtCurrency(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel fade-up d-5">
        <div className="panel-hd">
          <div className="panel-title">Top Store Partners <span>top 5</span></div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Store</th>
                <th>Transactions</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {topClients.map(c => (
                <tr key={c.name}>
                  <td className="highlight">{c.name}</td>
                  <td className="num">{fmtNum(c.count)}</td>
                  <td className="highlight text-mono">{fmtCurrency(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadMsg, setLoadMsg] = useState('Initialising multi-stream data engine…');
  const [isSyncing, setIsSyncing] = useState(false);
  const [page, setPage] = useState<PageId>('overview');

  const load = useCallback(async (isManualSync = false) => {
    if (isManualSync) {
      setIsSyncing(true);
      await triggerLiveSync();
    }
    setError(null);
    try {
      setLoadMsg('Connecting to live data pipeline & Google Sheets…');
      await new Promise(r => setTimeout(r, 60));
      setLoadMsg('Processing 16,000+ orders, deposits & transactions…');
      const d = await loadAppData();
      setLoadMsg('Rendering interface…');
      await new Promise(r => setTimeout(r, 100));
      setData(d);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    load();

    // Listen to electron shortcut sync if running inside desktop app
    if (window.electronAPI && window.electronAPI.onTriggerSync) {
      window.electronAPI.onTriggerSync(() => {
        load(true);
      });
    }
  }, [load]);

  if (error) {
    return (
      <div className="loading-screen">
        <div style={{ color: 'var(--red)', fontWeight: 700, fontSize: 16 }}>Failed to load Live Data Pipeline</div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 450, textAlign: 'center', lineHeight: 1.5 }}>{error}</div>
        <button className="btn-refresh" onClick={() => load(true)} style={{ marginTop: 12 }}>Retry Live Connection</button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="loading-screen">
        <img src={`${import.meta.env.BASE_URL}brand/amaya-rw-dark.png`} className="loading-logo" alt="AMAYA"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <div className="loader-ring" />
        <div className="loading-title">AMAYA Executive Intelligence Hub</div>
        <div className="loading-sub">{loadMsg}</div>
        <div className="loading-bar-wrap"><div className="loading-bar" /></div>
      </div>
    );
  }

  const { meta, orders, sources } = data;
  const activeSourcesCount = meta.sources ? meta.sources.filter(s => s.status === 'active').length : 3;

  return (
    <>
      {/* ═══ NAVBAR ═══ */}
      <nav className="navbar">
        <a className="nav-brand" href="#">
          <img src={`${import.meta.env.BASE_URL}brand/amaya-mark.png`} alt="AMAYA"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className="nav-brand-text">
            <div className="nav-brand-name">AMAYA Industries</div>
            <div className="nav-brand-sub">Windows Full-Stack Hub</div>
          </div>
        </a>

        <div className="nav-tabs">
          {PAGES.map(p => (
            <button
              key={p.id}
              className={`nav-tab${page === p.id ? ' active' : ''}`}
              onClick={() => setPage(p.id)}
            >
              {p.emoji} {p.label}
            </button>
          ))}
        </div>

        <div className="nav-right">
          <div className="live-badge">
            <span style={{ color: '#10b981' }}>●</span> {activeSourcesCount} LIVE FEEDS
          </div>
          <button className="btn-refresh" onClick={() => load(true)} disabled={isSyncing}>
            {isSyncing ? '⟳ Syncing…' : '⟳ Sync Live Feeds'}
          </button>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <div className="hero">
        <div>
          <h1 className="hero-title">Executive <span className="grad">Intelligence</span> Hub</h1>
          <p className="hero-sub">Multi-Stream Enterprise Integration — Real-time analytics from Google Apps Script & Live Google Sheets</p>
          <div className="hero-pills">
            <span className="pill pill-green">{fmtCurrency(meta.totalRevenue)} Revenue</span>
            <span className="pill pill-blue">{fmtNum(meta.totalOrders)} Unified Records</span>
            <span className="pill pill-cyan">{fmtNum(meta.totalItems)} Units / Items</span>
            <span className="pill pill-purple">{activeSourcesCount} Active Data Feeds</span>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-ts">
            Pipeline Sync {fmtDate(meta.builtAt)}<br />
            <span className="text-mono" style={{ color: 'var(--cyan)', fontSize: 10 }}>
              Windows Full-Stack Node / Electron Architecture
            </span>
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="main">

        {/* ── OVERVIEW ── */}
        {page === 'overview' && (
          <>
            <KpiGrid meta={meta} />
            <div className="grid-2">
              <BrandPieChart meta={meta} />
              <PaymentMethodsBar meta={meta} />
            </div>
            <TopProductsBarChart meta={meta} />
            <QuickOverviewTables data={data} />
          </>
        )}

        {/* ── ORDERS ── */}
        {page === 'orders' && <OrdersPage orders={orders} meta={meta} />}

        {/* ── PRODUCTS ── */}
        {page === 'products' && <ProductsPage meta={meta} />}

        {/* ── CLIENTS ── */}
        {page === 'clients' && <ClientsPage meta={meta} />}

        {/* ── API ── */}
        {page === 'api' && <ApiPage meta={meta} sources={sources} onRefresh={() => load(true)} />}

      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="footer">
        <span>
          AMAYA Executive Intelligence Hub · Windows Desktop & Web Service · Sync: {fmtDate(meta.builtAt)} ·{' '}
          <a href="https://github.com/deskamarx/all" target="_blank" rel="noopener">GitHub Repository</a>
        </span>
        <span>
          <a href={meta.endpoint} target="_blank" rel="noopener">Apps Script Stream ↗</a>
        </span>
      </footer>
    </>
  );
}

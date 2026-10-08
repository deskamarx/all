import { useState, useEffect, useCallback } from 'react';
import './index.css';
import { loadAppData, fmtNum, fmtDate } from './data';
import type { AppData, PageId } from './types';

import { KpiGrid, StateChart, TopTabs } from './components/KpiSection';
import { StatePieChart, EventsTrend } from './components/Charts';
import { ImeiPage } from './components/ImeiPage';
import { StockPage } from './components/StockPage';
import { SourcesPage } from './components/SourcesPage';
import { ConflictsPage } from './components/ConflictsPage';

const PAGES: { id: PageId; label: string; emoji: string }[] = [
  { id: 'overview',  label: 'Overview',     emoji: '🏠' },
  { id: 'imei',      label: 'IMEI Tracker', emoji: '🔍' },
  { id: 'stock',     label: 'Stock & Flow', emoji: '📊' },
  { id: 'sources',   label: 'Data Sources', emoji: '🔗' },
  { id: 'conflicts', label: 'Conflicts',    emoji: '⚠️' },
];

function Alerts({ data }: { data: AppData }) {
  const { meta } = data;
  const sc = meta.stateCounts ?? {};
  const d = meta.derived ?? {};
  const alerts = [
    meta.conflicts > 500 && { type: 'danger' as const, icon: '🔴', title: 'Critical: High Conflict Count', body: `${fmtNum(meta.conflicts)} IMEI conflicts — immediate review required. Check Conflicts tab.` },
    meta.repeatIds > 5000 && { type: 'warn' as const, icon: '⚠️', title: 'High Duplicate Rate', body: `${fmtNum(meta.repeatIds)} duplicate IMEIs may indicate data-entry errors or unlogged stock transfers.` },
    d.assetsWithoutTerminalState > 30000 && { type: 'warn' as const, icon: '📦', title: 'Large Unclassified Pool', body: `${fmtNum(d.assetsWithoutTerminalState)} assets have no terminal state — they may still be in the pipeline.` },
    meta.errorTokens > 0 && { type: 'info' as const, icon: 'ℹ️', title: 'Invalid Data Tokens', body: `${fmtNum(meta.errorTokens)} error tokens detected. Some rows may contain malformed IMEI numbers.` },
    ((sc['Sold Delivered'] ?? 0) / meta.assets) > 0.05 && { type: 'ok' as const, icon: '✅', title: 'Healthy Sales Rate', body: `${((sc['Sold Delivered']??0)/meta.assets*100).toFixed(1)}% of inventory sold & delivered. Operations are progressing.` },
  ].filter(Boolean) as Array<{ type: 'danger'|'warn'|'info'|'ok'; icon: string; title: string; body: string }>;

  return (
    <div className="panel fade-up d-5">
      <div className="panel-hd">
        <div className="panel-title">⚡ Attention Required</div>
      </div>
      <div className="alert-list">
        {alerts.map((a, i) => (
          <div key={i} className={`alert-item ${a.type}`}>
            <div className="alert-icon">{a.icon}</div>
            <div className="alert-body">
              <span className="alert-title">{a.title}</span>
              {a.body}
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="alert-item ok">
            <div className="alert-icon">✅</div>
            <div className="alert-body"><span className="alert-title">All Clear</span>No critical issues detected.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewSourcesSnippet({ data }: { data: AppData }) {
  const src = data.sources.sources;
  const catColor: Record<string, string> = { Finance: '#10b981', Logistics: '#3b82f6', Operations: '#8b5cf6' };

  return (
    <div className="panel fade-up d-6" style={{ marginTop: 0 }}>
      <div className="panel-hd">
        <div className="panel-title">Connected Spreadsheets <span>{src.length} sources</span></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {src.length === 0 ? (
          <div style={{ padding: '20px 14px', textAlign: 'center', color: 'var(--text-3)', fontSize: 12, background: 'rgba(255,255,255,0.015)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
            No spreadsheets connected. Go to the Data Sources tab to configure new sheets.
          </div>
        ) : (
          src.map(s => (
            <div key={s.id} className="source-card" style={{ padding: '10px 14px' }}>
              <div className="source-dot" style={{ background: s.color ?? catColor[s.category] ?? '#64748b' }} />
              <div className="source-info">
                <div className="source-name" style={{ fontSize: 12 }}>{s.name}</div>
                <div className="source-url">{s.url}</div>
              </div>
              <div className="source-actions">
                <span className={`pill pill-${s.category === 'Finance' ? 'green' : 'blue'}`} style={{ fontSize: 10 }}>{s.category}</span>
                <span className="pill pill-cyan" style={{ fontSize: 10 }}>{s.responsible}</span>
                <a className="source-link" href={s.url} target="_blank" rel="noopener noreferrer">Open ↗</a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadMsg, setLoadMsg] = useState('Initialising data engine…');
  const [page, setPage] = useState<PageId>('overview');

  const load = useCallback(async () => {
    setData(null);
    setError(null);
    try {
      setLoadMsg('Loading metadata…');
      await new Promise(r => setTimeout(r, 80));
      setLoadMsg('Loading asset registry…');
      await new Promise(r => setTimeout(r, 80));
      setLoadMsg('Loading event stream…');
      const d = await loadAppData();
      setLoadMsg('Building interface…');
      await new Promise(r => setTimeout(r, 200));
      setData(d);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) {
    return (
      <div className="loading-screen">
        <div style={{ color: 'var(--red)', fontWeight: 700, fontSize: 15 }}>Failed to load data</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', maxWidth: 400, textAlign: 'center' }}>{error}</div>
        <button className="btn-refresh" onClick={load} style={{ marginTop: 8 }}>Retry</button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="loading-screen">
        <img src={`${import.meta.env.BASE_URL}brand/amaya-rw-dark.png`} className="loading-logo" alt="AMAYA"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <div className="loader-ring" />
        <div className="loading-title">AMAYA Intelligence Hub</div>
        <div className="loading-sub">{loadMsg}</div>
        <div className="loading-bar-wrap"><div className="loading-bar" /></div>
      </div>
    );
  }

  const { meta, assets, sources: srcConfig } = data;
  const srcCount = (srcConfig.sources?.length ?? 0) + Object.keys(meta.sources ?? {}).length;

  return (
    <>
      {/* ═══ NAVBAR ═══ */}
      <nav className="navbar">
        <a className="nav-brand" href="#">
          <img src={`${import.meta.env.BASE_URL}brand/amaya-mark.png`} alt="AMAYA"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className="nav-brand-text">
            <div className="nav-brand-name">AMAYA Industries</div>
            <div className="nav-brand-sub">Intelligence Hub</div>
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
          <div className="live-badge">● LIVE</div>
          <button className="btn-refresh" onClick={load}>⟳ Refresh</button>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <div className="hero">
        <div>
          <h1 className="hero-title">Business <span className="grad">Intelligence</span> Hub</h1>
          <p className="hero-sub">AMAYA Industries — Real-time operational insights from {srcCount} connected spreadsheets</p>
          <div className="hero-pills">
            <span className="pill pill-blue">{fmtNum(meta.assets)} Assets</span>
            <span className="pill pill-green">{((meta.stateCounts?.['Sold Delivered']??0)/meta.assets*100).toFixed(1)}% Sold</span>
            <span className="pill pill-cyan">{fmtNum(meta.events)} Events</span>
            <span className="pill pill-red">{fmtNum(meta.conflicts ?? 0)} Conflicts</span>
            <span className="pill pill-amber">{fmtNum(meta.repeatIds ?? 0)} Duplicates</span>
            <span className="pill pill-purple">{srcCount} Sources</span>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-ts">
            Data built {fmtDate(meta.builtAt)}<br />
            <span className="text-mono" style={{ color: 'var(--cyan)', fontSize: 10 }}>
              v{meta.dataVersion} · seq {meta.dataSeq}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="main">

        {/* ── OVERVIEW ── */}
        {page === 'overview' && (
          <>
            <KpiGrid meta={meta} sourcesCount={srcCount} />
            <div className="grid-2">
              <StateChart meta={meta} />
              <TopTabs meta={meta} onViewAll={() => setPage('stock')} />
            </div>
            <div className="grid-2">
              <StatePieChart meta={meta} />
              <Alerts data={data} />
            </div>
            <EventsTrend meta={meta} />
            <OverviewSourcesSnippet data={data} />
          </>
        )}

        {/* ── IMEI ── */}
        {page === 'imei' && <ImeiPage assets={assets} meta={meta} />}

        {/* ── STOCK ── */}
        {page === 'stock' && <StockPage meta={meta} />}

        {/* ── SOURCES ── */}
        {page === 'sources' && <SourcesPage config={srcConfig} />}

        {/* ── CONFLICTS ── */}
        {page === 'conflicts' && <ConflictsPage meta={meta} assets={assets} />}

      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="footer">
        <span>
          AMAYA Industries Intelligence Hub · Data: {fmtDate(meta.builtAt)} ·{' '}
          <a href="https://github.com/deskamarx/all" target="_blank" rel="noopener">GitHub</a>
        </span>
        <span>
          <a href={`${import.meta.env.BASE_URL}data/sources.json`} target="_blank" rel="noopener">sources.json</a>
          {' · '}
          <a href={`${import.meta.env.BASE_URL}data/meta.json`} target="_blank" rel="noopener">meta.json</a>
        </span>
      </footer>
    </>
  );
}

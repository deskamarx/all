import type { FC } from 'react';
import { fmtNum, fmtPct } from '../data';
import type { AppMeta } from '../types';

interface Props {
  meta: AppMeta;
  sourcesCount: number;
}

const STATE_COLORS: Record<string, string> = {
  'Sold Delivered': '#10b981',
  'Stock Transfer': '#3b82f6',
  'Return':         '#f59e0b',
  'Service':        '#8b5cf6',
  'Unknown':        '#475569',
  'Bad Bin':        '#ef4444',
  'Pending Hold':   '#f59e0b',
};

export const KpiGrid: FC<Props> = ({ meta, sourcesCount }) => {
  const sc = meta.stateCounts ?? {};
  const kpis = [
    { label: 'Total Assets',       value: fmtNum(meta.assets),          sub: 'Unique IMEIs tracked',              color: '#3b82f6', icon: '📦', pct: 100 },
    { label: 'Sold & Delivered',   value: fmtNum(sc['Sold Delivered']??0), sub: fmtPct(sc['Sold Delivered']??0, meta.assets)+' of total', color: '#10b981', icon: '✅', pct: ((sc['Sold Delivered']??0)/meta.assets)*100 },
    { label: 'In Stock / Transit', value: fmtNum(sc['Stock Transfer']??0), sub: fmtPct(sc['Stock Transfer']??0, meta.assets)+' of total', color: '#06b6d4', icon: '🔄', pct: ((sc['Stock Transfer']??0)/meta.assets)*100 },
    { label: 'Under Service',      value: fmtNum(sc['Service']??0),     sub: 'Repair & maintenance',               color: '#8b5cf6', icon: '🔧', pct: ((sc['Service']??0)/meta.assets)*100 },
    { label: 'Total Events',       value: fmtNum(meta.events),          sub: `Across ${meta.derived?.tabsWithEvents??0} workbooks`, color: '#3b82f6', icon: '📊', pct: 100 },
    { label: 'IMEI Conflicts',     value: fmtNum(meta.conflicts??0),    sub: 'Needs manual review',                color: '#ef4444', icon: '⚠️', pct: Math.min(((meta.conflicts??0)/meta.assets)*100*20,100) },
    { label: 'Duplicate IMEIs',    value: fmtNum(meta.repeatIds??0),    sub: 'Same IMEI multi-source',             color: '#f59e0b', icon: '🔁', pct: Math.min(((meta.repeatIds??0)/meta.assets)*100*3,100) },
    { label: 'Review Queue',       value: fmtNum(meta.reviewQueue??0),  sub: 'Awaiting resolution',                color: '#f59e0b', icon: '📋', pct: Math.min(((meta.reviewQueue??0)/meta.assets)*100*10,100) },
    { label: 'Error Tokens',       value: fmtNum(meta.errorTokens??0),  sub: 'Invalid data markers',               color: '#ef4444', icon: '🚫', pct: Math.min(((meta.errorTokens??0)/meta.assets)*100*50,100) },
    { label: 'Data Sources',       value: String(sourcesCount),          sub: 'Connected spreadsheets',             color: '#06b6d4', icon: '🔗', pct: 100 },
  ];

  return (
    <div className="grid-kpi">
      {kpis.map((k, i) => (
        <div key={k.label} className={`kpi-card fade-up d-${Math.min(i+1,8)}`}>
          <div className="kpi-icon">{k.icon}</div>
          <div className="kpi-label">{k.label}</div>
          <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
          <div className="kpi-sub">{k.sub}</div>
          <div className="kpi-accent-bar" style={{
            background: `linear-gradient(90deg, ${k.color}aa, ${k.color}44)`,
            width: `${Math.max(k.pct, 4)}%`,
            maxWidth: '100%',
          }} />
        </div>
      ))}
    </div>
  );
};

export const StateChart: FC<{ meta: AppMeta }> = ({ meta }) => {
  const sc = meta.stateCounts ?? {};
  const states = meta.states ?? Object.keys(sc);
  const max = Math.max(...states.map(s => sc[s] ?? 0));

  return (
    <div className="panel fade-up d-2">
      <div className="panel-hd">
        <div className="panel-title">Asset States <span>by count</span></div>
      </div>
      <div className="state-list">
        {states.map(s => {
          const count = sc[s] ?? 0;
          const color = STATE_COLORS[s] ?? '#64748b';
          return (
            <div key={s} className="state-row">
              <div className="state-name">{s}</div>
              <div className="state-track">
                <div className="state-fill" style={{ width: `${(count/max)*100}%`, background: color }} />
              </div>
              <div className="state-val">{fmtNum(count)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TopTabs: FC<{ meta: AppMeta; onViewAll: () => void }> = ({ meta, onViewAll }) => {
  const tabs = (meta.topTabs ?? []).slice(0, 14);
  const maxCount = tabs[0]?.[1] ?? 1;

  return (
    <div className="panel fade-up d-3">
      <div className="panel-hd">
        <div className="panel-title">Top Workbooks <span>by event count</span></div>
        <button className="panel-btn" onClick={onViewAll}>View all →</button>
      </div>
      <div className="tab-list">
        {tabs.map(([name, count], i) => (
          <div key={name} className="tab-row">
            <span className="tab-rank">{i+1}</span>
            <span className="tab-name" title={name}>{name}</span>
            <div className="tab-bar-track">
              <div className="tab-bar-fill" style={{ width: `${(count/maxCount)*100}%` }} />
            </div>
            <span className="tab-count">{fmtNum(count)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

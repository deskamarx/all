import type { FC } from 'react';
import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area,
} from 'recharts';
import type { AppMeta } from '../types';
import { fmtNum, fmtPct } from '../data';

const STATE_COLORS: Record<string, string> = {
  'Sold Delivered': '#10b981',
  'Stock Transfer': '#3b82f6',
  'Return':         '#f59e0b',
  'Service':        '#8b5cf6',
  'Unknown':        '#475569',
  'Bad Bin':        '#ef4444',
  'Pending Hold':   '#f59e0b',
};

const TOOLTIP_STYLE = {
  backgroundColor: '#0c1120',
  border: '1px solid rgba(59,130,246,0.2)',
  borderRadius: 8,
  fontSize: 12,
  color: '#eef2ff',
};

/* ── Donut / Pie ── */
export const StatePieChart: FC<{ meta: AppMeta }> = ({ meta }) => {
  const sc = meta.stateCounts ?? {};
  const data = Object.entries(sc)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, color: STATE_COLORS[name] ?? '#64748b' }))
    .sort((a, b) => b.value - a.value);
  const total = meta.assets;

  return (
    <div className="panel fade-up d-4">
      <div className="panel-hd">
        <div className="panel-title">Distribution <span>asset states</span></div>
      </div>
      <div className="donut-wrap">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={data} dataKey="value" cx="50%" cy="50%"
              innerRadius={50} outerRadius={80} paddingAngle={2}
            >
              {data.map(d => <Cell key={d.name} fill={d.color} opacity={0.85} />)}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v: any) => [fmtNum(Number(v) || 0), '']}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-legend">
          {data.map(d => (
            <div key={d.name} className="legend-row">
              <div className="legend-dot" style={{ background: d.color }} />
              <div className="legend-label">{d.name}</div>
              <div className="legend-val">{fmtNum(d.value)}</div>
              <div className="legend-pct">{fmtPct(d.value, total)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Bar chart: top tabs ── */
export const TopTabsBar: FC<{ meta: AppMeta }> = ({ meta }) => {
  const data = (meta.topTabs ?? []).slice(0, 8).map(([name, value]) => ({
    name: name.replace(/^\d+_/, '').slice(0, 18),
    value,
  }));

  return (
    <div className="panel fade-up d-5">
      <div className="panel-hd">
        <div className="panel-title">Event Volume <span>top 8 workbooks</span></div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name" tick={{ fill: '#475569', fontSize: 10 }}
            angle={-40} textAnchor="end" interval={0}
          />
          <YAxis tick={{ fill: '#475569', fontSize: 10 }}
            tickFormatter={v => fmtNum(v as number)} />
          <Tooltip contentStyle={TOOLTIP_STYLE}
            formatter={(v: any) => [fmtNum(Number(v) || 0), 'Events']} />
          <Bar dataKey="value" radius={[4,4,0,0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={`hsl(${210 + i*12}, 80%, ${55 - i*3}%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ── Area chart: cumulative events simulated ── */
export const EventsTrend: FC<{ meta: AppMeta }> = ({ meta }) => {
  const tabs = meta.topTabs ?? [];
  // Build a simulated cumulative series from top tabs
  const data = useMemo(() => {
    let cum = 0;
    return tabs.slice(0, 12).map(([name, count]) => {
      cum += count;
      return { name: name.replace(/^\d+_/, '').slice(0, 12), events: count, cumulative: cum };
    });
  }, [tabs]);

  return (
    <div className="panel fade-up d-3" style={{ gridColumn: '1 / -1' }}>
      <div className="panel-hd">
        <div className="panel-title">Event Flow <span>cumulative across workbooks</span></div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 40 }}>
          <defs>
            <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }}
            angle={-35} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: '#475569', fontSize: 10 }}
            tickFormatter={v => fmtNum(v as number)} />
          <Tooltip contentStyle={TOOLTIP_STYLE}
            formatter={(v: any) => [fmtNum(Number(v) || 0), '']} />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
          <Area type="monotone" dataKey="events" name="Events"
            stroke="#3b82f6" fill="url(#gradBlue)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="cumulative" name="Cumulative"
            stroke="#06b6d4" fill="url(#gradCyan)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
